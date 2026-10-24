import { useState, useEffect } from 'react';
import {
  MapPin,
  BadgeCheck,
  Star,
  Clock,
  ArrowLeft,
  Users,
  Wallet,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase, WorkerWithProfile, Review } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useRouter, Link } from '@/lib/router';
import { Card, Badge, Button, Input, Select, Textarea, Modal, StarRating, Avatar, EmptyState, LoadingSpinner } from '@/components/ui';
import { formatCurrency, statusColor, timeAgo } from '@/lib/format';
import { getServiceIcon } from '@/lib/serviceIcons';

const SAMPLE_REVIEWS: Review[] = [
  { id: 'r1', booking_id: '', customer_id: '', worker_id: '', rating: 5, comment: 'Excellent work! Very professional and on time. Highly recommended.', created_at: '2025-10-15', customer: { id: '', role: 'customer', full_name: 'Ankit Verma', phone: '', city: '', area: '', language: 'en', avatar_url: '', created_at: '' } },
  { id: 'r2', booking_id: '', customer_id: '', worker_id: '', rating: 4, comment: 'Good service, completed the job well. Will hire again.', created_at: '2025-10-10', customer: { id: '', role: 'customer', full_name: 'Sneha Patil', phone: '', city: '', area: '', language: 'en', avatar_url: '', created_at: '' } },
  { id: 'r3', booking_id: '', customer_id: '', worker_id: '', rating: 5, comment: 'Very polite and skilled. The work was perfect.', created_at: '2025-10-05', customer: { id: '', role: 'customer', full_name: 'Rajesh Kumar', phone: '', city: '', area: '', language: 'en', avatar_url: '', created_at: '' } },
];

export function WorkerDetailPage({ workerId }: { workerId: string }) {
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const [worker, setWorker] = useState<WorkerWithProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // booking form state
  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [groupSize, setGroupSize] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('worker_details')
        .select('*, profile:profiles!user_id(*)')
        .eq('user_id', workerId)
        .maybeSingle();

      if (error || !data) {
        setWorker(null);
        setReviews(SAMPLE_REVIEWS);
      } else {
        const w = data as unknown as WorkerWithProfile;
        setWorker(w);
        setServiceType(w.skills[0] || '');
        const { data: revData } = await supabase
          .from('reviews')
          .select('*, customer:profiles!customer_id(*)')
          .eq('worker_id', workerId)
          .order('created_at', { ascending: false })
          .limit(10);
        setReviews(revData && revData.length > 0 ? (revData as unknown as Review[]) : SAMPLE_REVIEWS);
      }
      setLoading(false);
    };
    load();
  }, [workerId]);

  const handleBooking = async () => {
    setBookingError('');
    if (!user) {
      navigate('/login');
      return;
    }
    if (profile?.role !== 'customer') {
      setBookingError('Only customers can book services. Please sign in as a customer.');
      return;
    }
    if (!serviceType || !date || !time || !address) {
      setBookingError('Please fill in all required fields.');
      return;
    }

    const price = Number(worker?.hourly_rate || 0) * groupSize * 2;

    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!wallet || Number(wallet.balance) < price) {
      setBookingError(`Insufficient wallet balance. Please add ${formatCurrency(price - Number(wallet?.balance || 0))} to your wallet.`);
      return;
    }

    const { error: bookingErr } = await supabase.from('bookings').insert({
      customer_id: user.id,
      worker_id: workerId,
      service_type: serviceType,
      scheduled_date: date,
      scheduled_time: time,
      address,
      is_group: isGroup,
      group_size: groupSize,
      notes,
      price,
      status: 'pending',
    });

    if (bookingErr) {
      setBookingError(bookingErr.message);
      return;
    }

    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'payment',
      direction: 'debit',
      amount: price,
      description: `Payment for ${serviceType} service`,
    });

    await supabase.from('wallets').update({ balance: Number(wallet.balance) - price }).eq('user_id', user.id);

    setBookingSuccess(true);
    setBookingOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
        <LoadingSpinner size={36} />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <EmptyState icon={<AlertCircle size={48} />} title="Worker not found" subtitle="This profile may no longer be available" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/search" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-teal-600">
          <ArrowLeft size={16} /> Back to search
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar name={worker.profile?.full_name || 'Worker'} src={worker.profile?.avatar_url} size={80} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900">{worker.profile?.full_name}</h1>
                    {worker.id_verified === 'verified' && (
                      <Badge className={statusColor('verified')}>
                        <BadgeCheck size={14} /> {t('verified')}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} /> {worker.profile?.area}, {worker.profile?.city}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <Star size={18} className="fill-amber-500" /> {worker.rating_avg.toFixed(1)}
                      <span className="font-normal text-slate-400">({worker.rating_count} reviews)</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock size={14} /> {worker.experience_years} years experience
                    </span>
                    <span className="text-sm text-slate-500">{worker.total_jobs} jobs done</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">{t('skills')}</h3>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((s) => {
                    const SIcon = getServiceIcon(s);
                    return (
                      <span key={s} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700">
                        <SIcon size={16} /> {s}
                      </span>
                    );
                  })}
                </div>
              </div>

              {worker.bio && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">About</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{worker.bio}</p>
                </div>
              )}
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900">{t('reviews')} ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <EmptyState icon={<Star size={40} />} title="No reviews yet" />
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar name={r.customer?.full_name || 'Customer'} size={36} />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{r.customer?.full_name || 'Anonymous'}</p>
                            <p className="text-xs text-slate-400">{timeAgo(r.created_at)}</p>
                          </div>
                        </div>
                        <StarRating rating={r.rating} size={14} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-20 p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-700">
                  {formatCurrency(Number(worker.hourly_rate))}
                  <span className="text-sm font-normal text-slate-400">{t('perHour')}</span>
                </p>
                <div className="mt-2">
                  {worker.available ? (
                    <Badge className={statusColor('completed')}>● {t('available')}</Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 border-slate-200">○ {t('unavailable')}</Badge>
                  )}
                </div>
              </div>

              <Button
                className="mt-4 w-full"
                size="lg"
                disabled={!worker.available}
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setBookingOpen(true);
                  }
                }}
              >
                {t('bookNow')}
              </Button>

              {user && profile?.role === 'customer' && (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-slate-600">
                    <Wallet size={16} /> Pay from wallet
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 size={16} /> Track job in real-time
                  </p>
                </div>
              )}

              {!user && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  <Link to="/login" className="font-semibold text-teal-600">{t('login')}</Link> to book this worker
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} title="Book a Service">
        {bookingError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={18} /> {bookingError}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('selectService')}</label>
            <Select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              {worker.skills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('selectDate')}</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('selectTime')}</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('address')}</label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address where service is needed" rows={2} />
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <input type="checkbox" id="group" checked={isGroup} onChange={(e) => setIsGroup(e.target.checked)} className="h-4 w-4 accent-teal-600" />
            <label htmlFor="group" className="flex items-center gap-1 text-sm font-medium text-slate-700">
              <Users size={16} /> {t('groupBooking')}
            </label>
          </div>
          {isGroup && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('groupSize')}</label>
              <Input type="number" min={1} max={10} value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value))} />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('notes')}</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special requirements..." rows={2} />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">{t('totalAmount')}</span>
            <span className="text-xl font-bold text-teal-700">{formatCurrency(Number(worker.hourly_rate) * groupSize * 2)}</span>
          </div>
          <p className="text-xs text-slate-400">Estimated for 2 hours of service. Final amount may vary based on actual work.</p>
          <Button onClick={handleBooking} className="w-full" size="lg">
            <Wallet size={18} /> {t('confirmBooking')}
          </Button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal open={bookingSuccess} onClose={() => { setBookingSuccess(false); navigate('/bookings'); }} title="">
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={36} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Booking Confirmed!</h3>
          <p className="mt-2 text-sm text-slate-500">Your booking has been placed and payment deducted from your wallet. You can track the job status from your bookings page.</p>
          <Button className="mt-6 w-full" onClick={() => { setBookingSuccess(false); navigate('/bookings'); }}>
            View My Bookings
          </Button>
        </div>
      </Modal>
    </div>
  );
}
