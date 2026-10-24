import { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, Star, AlertCircle, Play, Check } from 'lucide-react';
import { supabase, Booking, Profile, WorkerDetail } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Card, Badge, Button, Modal, Textarea, StarRating, Avatar, EmptyState, LoadingSpinner } from '@/components/ui';
import { formatCurrency, formatDate, statusColor } from '@/lib/format';
import { getServiceIcon } from '@/lib/serviceIcons';

type BookingWithDetails = Booking & {
  worker?: Profile;
  worker_detail?: WorkerDetail;
  customer?: Profile;
  has_review?: boolean;
};

export function BookingsPage() {
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewOpen, setReviewOpen] = useState<BookingWithDetails | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const loadBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const col = profile?.role === 'worker' ? 'worker_id' : 'customer_id';
    const { data, error } = await supabase
      .from('bookings')
      .select('*, worker:profiles!worker_id(*), customer:profiles!customer_id(*), worker_detail:worker_details!worker_id(*)')
      .eq(col, user.id)
      .order('created_at', { ascending: false });

    if (error || !data) {
      setBookings([]);
    } else {
      const bookingsData = data as unknown as BookingWithDetails[];
      if (profile?.role === 'customer') {
        const bookingIds = bookingsData.map((b) => b.id);
        if (bookingIds.length > 0) {
          const { data: reviews } = await supabase.from('reviews').select('booking_id').in('booking_id', bookingIds);
          const reviewedIds = new Set(reviews?.map((r) => r.booking_id) || []);
          bookingsData.forEach((b) => { b.has_review = reviewedIds.has(b.id); });
        }
      }
      setBookings(bookingsData);
    }
    setLoading(false);
  }, [user, profile]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <EmptyState icon={<AlertCircle size={48} />} title="Please log in to view bookings" />
      </div>
    );
  }

  const updateStatus = async (bookingId: string, status: Booking['status']) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (!error) {
      if (status === 'completed' && profile?.role === 'worker') {
        const booking = bookings.find((b) => b.id === bookingId);
        if (booking) {
          await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'earning',
            direction: 'credit',
            amount: Number(booking.price) * 0.85,
            booking_id: bookingId,
            description: `Earning from ${booking.service_type} service`,
          });
          const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
          if (wallet) {
            await supabase.from('wallets').update({ balance: Number(wallet.balance) + Number(booking.price) * 0.85 }).eq('user_id', user.id);
          }
        }
      }
      loadBookings();
    }
  };

  const submitReview = async () => {
    if (!reviewOpen || !user) return;
    const { error } = await supabase.from('reviews').insert({
      booking_id: reviewOpen.id,
      customer_id: user.id,
      worker_id: reviewOpen.worker_id,
      rating,
      comment,
    });
    if (!error) {
      const { data: reviews } = await supabase.from('reviews').select('rating').eq('worker_id', reviewOpen.worker_id);
      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
        await supabase.from('worker_details')
          .update({ rating_avg: avg, rating_count: reviews.length })
          .eq('user_id', reviewOpen.worker_id);
      }
      setReviewOpen(null);
      setRating(5);
      setComment('');
      loadBookings();
    }
  };

  const filtered = bookings.filter((b) => filter === 'all' || b.status === filter);

  const statusLabels: Record<string, string> = {
    pending: t('statusPending'),
    accepted: t('statusAccepted'),
    in_progress: t('statusInProgress'),
    completed: t('statusCompleted'),
    cancelled: t('statusCancelled'),
  };

  const filters = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {profile?.role === 'worker' ? t('jobs') : t('myBookings')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t('bookingHistory')} · {t('jobStatus')}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === f ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {f === 'all' ? 'All' : statusLabels[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner size={32} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar size={48} />}
            title="No bookings yet"
            subtitle={profile?.role === 'customer' ? 'Search and book a worker to get started' : 'No jobs assigned yet'}
          />
        ) : (
          <div className="mt-4 space-y-4">
            {filtered.map((b) => {
              const Icon = getServiceIcon(b.service_type);
              const otherParty = profile?.role === 'worker' ? b.customer : b.worker;
              return (
                <Card key={b.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Icon size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900">{b.service_type}</h3>
                          <p className="text-sm text-slate-500">
                            {profile?.role === 'worker' ? 'Customer: ' : 'Worker: '}
                            {otherParty?.full_name || 'Unknown'}
                          </p>
                        </div>
                        <Badge className={statusColor(b.status)}>{statusLabels[b.status]}</Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(b.scheduled_date)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {b.scheduled_time}</span>
                        <span>{b.is_group ? `Group (${b.group_size} workers)` : 'Individual'}</span>
                        <span className="font-semibold text-slate-700">{formatCurrency(Number(b.price))}</span>
                      </div>

                      {b.notes && <p className="mt-2 text-xs text-slate-400">Note: {b.notes}</p>}

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile?.role === 'worker' && b.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(b.id, 'accepted')}>
                              <Check size={14} /> {t('acceptJob')}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'cancelled')}>
                              <XCircle size={14} /> {t('cancel')}
                            </Button>
                          </>
                        )}
                        {profile?.role === 'worker' && b.status === 'accepted' && (
                          <Button size="sm" onClick={() => updateStatus(b.id, 'in_progress')}>
                            <Play size={14} /> {t('startJob')}
                          </Button>
                        )}
                        {profile?.role === 'worker' && b.status === 'in_progress' && (
                          <Button size="sm" onClick={() => updateStatus(b.id, 'completed')}>
                            <CheckCircle2 size={14} /> {t('completeJob')}
                          </Button>
                        )}
                        {profile?.role === 'customer' && (b.status === 'pending' || b.status === 'accepted') && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'cancelled')}>
                            <XCircle size={14} /> {t('cancelBooking')}
                          </Button>
                        )}
                        {profile?.role === 'customer' && b.status === 'completed' && !b.has_review && (
                          <Button size="sm" onClick={() => setReviewOpen(b)}>
                            <Star size={14} /> {t('leaveReview')}
                          </Button>
                        )}
                        {profile?.role === 'customer' && b.status === 'completed' && b.has_review && (
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">
                            <CheckCircle2 size={12} /> Review submitted
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal open={!!reviewOpen} onClose={() => setReviewOpen(null)} title={t('leaveReview')}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={reviewOpen?.worker?.full_name || 'Worker'} size={48} />
            <div>
              <p className="font-semibold text-slate-900">{reviewOpen?.worker?.full_name}</p>
              <p className="text-sm text-slate-500">{reviewOpen?.service_type} · {formatDate(reviewOpen?.scheduled_date || '')}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="mb-2 text-sm font-medium text-slate-700">Rate your experience</p>
            <StarRating rating={rating} size={36} interactive onChange={setRating} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Your review</label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." rows={4} />
          </div>
          <Button onClick={submitReview} className="w-full" size="lg">
            {t('submitReview')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
