import { useState, useEffect, useCallback } from 'react';
import {
  Wrench,
  Star,
  TrendingUp,
  Calendar,
  BadgeCheck,
  Edit2,
  Save,
  X,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { supabase, WorkerDetail, Booking, SERVICE_CATEGORIES } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Card, Button, Input, Select, Textarea, Badge, EmptyState, LoadingSpinner, Avatar } from '@/components/ui';
import { formatCurrency, formatDate, statusColor } from '@/lib/format';
import { getServiceIcon } from '@/lib/serviceIcons';

export function WorkerDashboardPage() {
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const [detail, setDetail] = useState<WorkerDetail | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>('');
  const [experience, setExperience] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [bio, setBio] = useState('');
  const [available, setAvailable] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: wd } = await supabase.from('worker_details').select('*').eq('user_id', user.id).maybeSingle();
    if (wd) {
      setDetail(wd as WorkerDetail);
      setSkills((wd as WorkerDetail).skills || []);
      setExperience((wd as WorkerDetail).experience_years || 0);
      setHourlyRate(Number((wd as WorkerDetail).hourly_rate || 0));
      setBio((wd as WorkerDetail).bio || '');
      setAvailable((wd as WorkerDetail).available ?? true);
    }
    const { data: bks } = await supabase
      .from('bookings')
      .select('*')
      .eq('worker_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setBookings((bks as Booking[]) || []);

    const { data: txns } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('direction', 'credit');
    const total = (txns || []).reduce((s, tx) => s + Number(tx.amount), 0);
    setEarnings(total);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!user || !detail) return;
    await supabase
      .from('worker_details')
      .update({ skills, experience_years: experience, hourly_rate: hourlyRate, bio, available })
      .eq('user_id', user.id);
    setEditing(false);
    loadData();
  };

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <EmptyState icon={<Wrench size={48} />} title="Please log in as a worker" />
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] bg-slate-50"><LoadingSpinner size={32} /></div>;
  }

  const activeJobs = bookings.filter((b) => b.status === 'accepted' || b.status === 'in_progress' || b.status === 'pending').length;
  const completedJobs = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('welcomeBack')}, {profile?.full_name}</h1>
            <p className="mt-1 text-sm text-slate-500">Worker Dashboard · {t('tagline')}</p>
          </div>
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Edit2 size={16} /> {t('editProfile')}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}><Save size={16} /> {t('save')}</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X size={16} /> {t('cancel')}</Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: t('earnings'), value: formatCurrency(earnings), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Active Jobs', value: activeJobs, icon: Clock, color: 'text-blue-600 bg-blue-50' },
            { label: 'Completed', value: completedJobs, icon: CheckCircle2, color: 'text-teal-600 bg-teal-50' },
            { label: t('ratings'), value: detail ? `${detail.rating_avg.toFixed(1)}★` : '—', icon: Star, color: 'text-amber-600 bg-amber-50' },
          ].map((s, i) => (
            <Card key={i} className="p-4">
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon size={18} />
              </div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Profile section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Avatar name={profile?.full_name || 'Worker'} src={profile?.avatar_url} size={64} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{profile?.full_name}</h2>
                    {detail?.id_verified === 'verified' && (
                      <Badge className={statusColor('verified')}><BadgeCheck size={12} /> {t('verified')}</Badge>
                    )}
                    {detail?.id_verified === 'pending' && (
                      <Badge className={statusColor('pending')}>● {t('pending')}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{profile?.area}, {profile?.city}</p>
                </div>
              </div>

              {detail?.id_verified === 'pending' && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                  Your ID verification is pending. An admin will review your profile shortly. Verified workers get more bookings.
                </div>
              )}

              {/* Skills */}
              <div className="mt-4 border-t border-slate-100 pt-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">{t('skills')}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => {
                    const SIcon = getServiceIcon(s);
                    return (
                      <span key={s} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700">
                        <SIcon size={14} /> {s}
                        {editing && <button onClick={() => removeSkill(s)} className="ml-1 text-rose-400 hover:text-rose-600"><X size={12} /></button>}
                      </span>
                    );
                  })}
                </div>
                {editing && (
                  <div className="mt-3 flex gap-2">
                    <Select value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="flex-1">
                      <option value="">Add a skill...</option>
                      {SERVICE_CATEGORIES.filter((s) => !skills.includes(s)).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => addSkill(newSkill)} disabled={!newSkill}>
                      <Plus size={16} /> Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Editable fields */}
              <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">{t('experience')} (years)</label>
                    {editing ? (
                      <Input type="number" min={0} value={experience} onChange={(e) => setExperience(Number(e.target.value))} />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{experience} years</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">Hourly Rate (₹)</label>
                    {editing ? (
                      <Input type="number" min={0} value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} />
                    ) : (
                      <p className="text-sm font-semibold text-slate-800">{formatCurrency(hourlyRate)}{t('perHour')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Bio</label>
                  {editing ? (
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell customers about your experience and expertise..." rows={3} />
                  ) : (
                    <p className="text-sm text-slate-600">{bio || 'No bio added yet.'}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={available} disabled={!editing} onChange={(e) => setAvailable(e.target.checked)} className="h-4 w-4 accent-teal-600" />
                    {available ? t('available') : t('unavailable')} for work
                  </label>
                </div>
              </div>
            </Card>

            {/* Recent jobs */}
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Jobs</h2>
              {bookings.length === 0 ? (
                <EmptyState icon={<Calendar size={40} />} title="No jobs yet" subtitle="Your assigned jobs will appear here" />
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => {
                    const Icon = getServiceIcon(b.service_type);
                    return (
                      <div key={b.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{b.service_type}</p>
                          <p className="text-xs text-slate-400">{formatDate(b.scheduled_date)} · {b.scheduled_time} · {b.is_group ? `Group (${b.group_size})` : 'Individual'}</p>
                        </div>
                        <Badge className={statusColor(b.status)}>{b.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="mb-3 text-sm font-bold text-slate-700">Quick Actions</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">Verification</span>
                  <Badge className={statusColor(detail?.id_verified || 'pending')}>{detail?.id_verified || 'pending'}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">Total Jobs</span>
                  <span className="font-semibold text-slate-800">{detail?.total_jobs || 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-slate-500">Reviews</span>
                  <span className="font-semibold text-slate-800">{detail?.rating_count || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-2 text-sm font-bold text-slate-700">Platform Fee</h3>
              <p className="text-xs text-slate-500">Sewamitra charges a 15% cooperative fee on each completed job. The rest goes directly to your wallet.</p>
              <div className="mt-3 rounded-lg bg-teal-50 p-3 text-center">
                <p className="text-xs text-teal-600">You keep</p>
                <p className="text-2xl font-bold text-teal-700">85%</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
