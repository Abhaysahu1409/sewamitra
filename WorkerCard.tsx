import { MapPin, BadgeCheck, Star, Clock } from 'lucide-react';
import { Link } from '@/lib/router';
import { WorkerWithProfile } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, statusColor } from '@/lib/format';
import { getServiceIcon } from '@/lib/serviceIcons';
import { Card, Badge, Avatar } from './ui';

export function WorkerCard({ worker }: { worker: WorkerWithProfile }) {
  const { t } = useI18n();
  const Icon = getServiceIcon(worker.skills[0] || 'Plumbing');

  return (
    <Link to={`/worker/${worker.user_id}`} className="block">
      <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10 hover:border-teal-200">
        <div className="flex gap-4 p-5">
          <div className="relative shrink-0">
            <Avatar name={worker.profile?.full_name || 'Worker'} src={worker.profile?.avatar_url} size={64} />
            {worker.id_verified === 'verified' && (
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                <BadgeCheck size={18} className="text-teal-600" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-slate-900 group-hover:text-teal-700">
                  {worker.profile?.full_name}
                </h3>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} />
                  {worker.profile?.area}, {worker.profile?.city}
                </p>
              </div>
              {worker.available ? (
                <Badge className={statusColor('completed')}>● {t('available')}</Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-500 border-slate-200">○ {t('unavailable')}</Badge>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {worker.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700"
                >
                  <Icon size={12} /> {s}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                {worker.rating_count > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star size={14} className="fill-amber-500" />
                    {worker.rating_avg.toFixed(1)}
                    <span className="font-normal text-slate-400">({worker.rating_count})</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {worker.experience_years}y exp
                </span>
                <span>{worker.total_jobs} jobs</span>
              </div>
              <p className="font-bold text-teal-700">
                {formatCurrency(Number(worker.hourly_rate))}
                <span className="text-xs font-normal text-slate-400">{t('perHour')}</span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
