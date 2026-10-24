import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Wrench,
  Calendar,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Star,
} from 'lucide-react';
import { supabase, Profile, WorkerDetail, Booking } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Card, Badge, Button, Avatar, EmptyState, LoadingSpinner } from '@/components/ui';
import { formatCurrency, formatDate, statusColor } from '@/lib/format';
import { getServiceIcon } from '@/lib/serviceIcons';

type WorkerWithProfile = WorkerDetail & { profile: Profile };
type BookingWithProfiles = Booking & { customer: Profile; worker: Profile };

export function AdminPage() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const [tab, setTab] = useState<'overview' | 'workers' | 'bookings'>('overview');
  const [workers, setWorkers] = useState<WorkerWithProfile[]>([]);
  const [bookings, setBookings] = useState<BookingWithProfiles[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: wd } = await supabase
      .from('worker_details')
      .select('*, profile:profiles!user_id(*)')
      .order('created_at', { ascending: false });
    if (wd) setWorkers(wd as unknown as WorkerWithProfile[]);

    const { data: bks } = await supabase
      .from('bookings')
      .select('*, customer:profiles!customer_id(*), worker:profiles!worker_id(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (bks) setBookings(bks as unknown as BookingWithProfiles[]);

    const { data: profs } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (profs) setAllProfiles(profs as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const verifyWorker = async (userId: string, status: 'verified' | 'rejected') => {
    await supabase.from('worker_details').update({ id_verified: status }).eq('user_id', userId);
    loadData();
  };

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <EmptyState icon={<ShieldCheck size={48} />} title="Admin access required" subtitle="You need an admin account to view this page" />
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] bg-slate-50"><LoadingSpinner size={32} /></div>;
  }

  const customers = allProfiles.filter((p) => p.role === 'customer');
  const workerProfiles = allProfiles.filter((p) => p.role === 'worker');
  const pendingWorkers = workers.filter((w) => w.id_verified === 'pending');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((s, b) => s + Number(b.price) * 0.15, 0);

  const statusLabels: Record<string, string> = {
    pending: t('statusPending'),
    accepted: t('statusAccepted'),
    in_progress: t('statusInProgress'),
    completed: t('statusCompleted'),
    cancelled: t('statusCancelled'),
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">{t('adminPanel')}</h1>
        <p className="mt-1 text-sm text-slate-500">Manage users, workers, and bookings</p>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 border-b border-slate-200">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'workers', label: t('manageWorkers') },
            { key: 'bookings', label: t('manageBookings') },
          ].map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key as typeof tab)}
              className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                tab === tb.key ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tb.label}
              {tb.key === 'workers' && pendingWorkers.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 text-xs text-amber-700">{pendingWorkers.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Users', value: allProfiles.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
                { label: 'Customers', value: customers.length, icon: Users, color: 'text-teal-600 bg-teal-50' },
                { label: 'Workers', value: workerProfiles.length, icon: Wrench, color: 'text-amber-600 bg-amber-50' },
                { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'text-violet-600 bg-violet-50' },
              ].map((s, i) => (
                <Card key={i} className="p-4">
                  <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                    <s.icon size={18} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </Card>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <TrendingUp size={18} className="text-emerald-600" /> Revenue (15% platform fee)
                </h3>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
                <p className="mt-1 text-xs text-slate-400">From {completedBookings.length} completed bookings</p>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <ShieldCheck size={18} className="text-amber-600" /> Pending Verifications
                </h3>
                {pendingWorkers.length === 0 ? (
                  <p className="text-sm text-slate-400">No pending verifications</p>
                ) : (
                  <div className="space-y-2">
                    {pendingWorkers.slice(0, 3).map((w) => (
                      <div key={w.user_id} className="flex items-center gap-2">
                        <Avatar name={w.profile?.full_name || 'Worker'} size={32} />
                        <span className="flex-1 text-sm text-slate-700">{w.profile?.full_name}</span>
                        <Button size="sm" onClick={() => verifyWorker(w.user_id, 'verified')}>
                          <CheckCircle2 size={14} /> {t('verifyWorker')}
                        </Button>
                      </div>
                    ))}
                    {pendingWorkers.length > 3 && (
                      <button onClick={() => setTab('workers')} className="text-xs font-medium text-teal-600 hover:underline">
                        View all {pendingWorkers.length} pending
                      </button>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Workers */}
        {tab === 'workers' && (
          <div className="mt-6">
            {workers.length === 0 ? (
              <EmptyState icon={<Wrench size={48} />} title="No workers registered yet" />
            ) : (
              <div className="space-y-3">
                {workers.map((w) => (
                  <Card key={w.user_id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar name={w.profile?.full_name || 'Worker'} src={w.profile?.avatar_url} size={48} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{w.profile?.full_name}</h3>
                          <Badge className={statusColor(w.id_verified)}>{w.id_verified}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          {w.profile?.area}, {w.profile?.city} · {w.skills.join(', ')} · {formatCurrency(Number(w.hourly_rate))}/hr
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Star size={12} className="fill-amber-500 text-amber-500" /> {w.rating_avg.toFixed(1)} ({w.rating_count})</span>
                          <span>{w.total_jobs} jobs</span>
                          <span>{w.experience_years}y exp</span>
                        </div>
                      </div>
                      {w.id_verified === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => verifyWorker(w.user_id, 'verified')}>
                            <CheckCircle2 size={14} /> {t('verifyWorker')}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => verifyWorker(w.user_id, 'rejected')}>
                            <XCircle size={14} /> {t('rejectWorker')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          <div className="mt-6">
            {bookings.length === 0 ? (
              <EmptyState icon={<Calendar size={48} />} title="No bookings yet" />
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const Icon = getServiceIcon(b.service_type);
                  return (
                    <Card key={b.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{b.service_type}</h3>
                          <p className="text-xs text-slate-500">
                            {b.customer?.full_name} → {b.worker?.full_name} · {formatDate(b.scheduled_date)} · {formatCurrency(Number(b.price))}
                          </p>
                        </div>
                        <Badge className={statusColor(b.status)}>{statusLabels[b.status]}</Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
