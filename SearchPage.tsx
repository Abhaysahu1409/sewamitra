import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase, WorkerWithProfile, SERVICE_CATEGORIES } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { WorkerCard } from '@/components/WorkerCard';
import { Button, Input, Select, EmptyState, LoadingSpinner } from '@/components/ui';
import { getServiceIcon } from '@/lib/serviceIcons';

const SAMPLE_WORKERS: WorkerWithProfile[] = [
  { id: 's1', user_id: 'sample-ramesh', skills: ['Plumbing', 'Carpentry'], experience_years: 8, hourly_rate: 350, bio: 'Experienced plumber and carpenter serving Pune for 8 years.', id_verified: 'verified', available: true, total_jobs: 142, rating_avg: 4.8, rating_count: 89, created_at: '', profile: { id: 'sample-ramesh', role: 'worker', full_name: 'Ramesh Patil', phone: '', city: 'Pune', area: 'Kothrud', language: 'hi', avatar_url: '', created_at: '' } },
  { id: 's2', user_id: 'sample-sunita', skills: ['Cleaning'], experience_years: 5, hourly_rate: 200, bio: 'Professional home and office cleaning specialist.', id_verified: 'verified', available: true, total_jobs: 230, rating_avg: 4.9, rating_count: 156, created_at: '', profile: { id: 'sample-sunita', role: 'worker', full_name: 'Sunita Devi', phone: '', city: 'Pune', area: 'Hadapsar', language: 'hi', avatar_url: '', created_at: '' } },
  { id: 's3', user_id: 'sample-arjun', skills: ['Electrical'], experience_years: 12, hourly_rate: 500, bio: 'Licensed electrician with 12 years of experience in residential and commercial wiring.', id_verified: 'verified', available: true, total_jobs: 310, rating_avg: 4.7, rating_count: 201, created_at: '', profile: { id: 'sample-arjun', role: 'worker', full_name: 'Arjun Reddy', phone: '', city: 'Pune', area: 'Baner', language: 'te', avatar_url: '', created_at: '' } },
  { id: 's4', user_id: 'sample-mohan', skills: ['Painting', 'Carpentry'], experience_years: 15, hourly_rate: 400, bio: 'Master painter and carpenter. Specializes in interior and exterior painting.', id_verified: 'verified', available: false, total_jobs: 180, rating_avg: 4.6, rating_count: 112, created_at: '', profile: { id: 'sample-mohan', role: 'worker', full_name: 'Mohan Lal', phone: '', city: 'Pune', area: 'Aundh', language: 'hi', avatar_url: '', created_at: '' } },
  { id: 's5', user_id: 'sample-priya', skills: ['Gardening'], experience_years: 6, hourly_rate: 250, bio: 'Passionate gardener offering landscaping and plant care services.', id_verified: 'pending', available: true, total_jobs: 78, rating_avg: 4.9, rating_count: 45, created_at: '', profile: { id: 'sample-priya', role: 'worker', full_name: 'Priya Nair', phone: '', city: 'Pune', area: 'Kothrud', language: 'ta', avatar_url: '', created_at: '' } },
  { id: 's6', user_id: 'sample-vijay', skills: ['Driving'], experience_years: 10, hourly_rate: 300, bio: 'Safe and reliable driver for local and outstation trips.', id_verified: 'verified', available: true, total_jobs: 450, rating_avg: 4.8, rating_count: 320, created_at: '', profile: { id: 'sample-vijay', role: 'worker', full_name: 'Vijay Singh', phone: '', city: 'Pune', area: 'Camp', language: 'hi', avatar_url: '', created_at: '' } },
  { id: 's7', user_id: 'sample-deepak', skills: ['Plumbing'], experience_years: 3, hourly_rate: 180, bio: 'Young and energetic plumber, quick service guaranteed.', id_verified: 'pending', available: true, total_jobs: 42, rating_avg: 4.5, rating_count: 28, created_at: '', profile: { id: 'sample-deepak', role: 'worker', full_name: 'Deepak Yadav', phone: '', city: 'Pune', area: 'Hadapsar', language: 'hi', avatar_url: '', created_at: '' } },
  { id: 's8', user_id: 'sample-meera', skills: ['Cleaning', 'Cooking'], experience_years: 7, hourly_rate: 220, bio: 'Expert in deep cleaning and regular maintenance cleaning.', id_verified: 'verified', available: true, total_jobs: 198, rating_avg: 4.7, rating_count: 134, created_at: '', profile: { id: 'sample-meera', role: 'worker', full_name: 'Meera Joshi', phone: '', city: 'Pune', area: 'Baner', language: 'mr', avatar_url: '', created_at: '' } },
];

export function SearchPage() {
  const { t } = useI18n();
  const [workers, setWorkers] = useState<WorkerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [maxRate, setMaxRate] = useState(1000);
  const [showFilters, setShowFilters] = useState(false);
  const [usingSample, setUsingSample] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const q = params.get('q') || '';
    setQuery(q);
  }, []);

  const loadWorkers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('worker_details')
      .select('*, profile:profiles!user_id(*)')
      .order('rating_avg', { ascending: false });

    if (error || !data || data.length === 0) {
      setWorkers(SAMPLE_WORKERS);
      setUsingSample(true);
    } else {
      setWorkers(data as unknown as WorkerWithProfile[]);
      setUsingSample(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  const filtered = workers
    .filter((w) => {
      if (serviceFilter && !w.skills.includes(serviceFilter)) return false;
      if (cityFilter && !w.profile?.city?.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      if (Number(w.hourly_rate) > maxRate) return false;
      if (query) {
        const q = query.toLowerCase();
        const match =
          w.profile?.full_name?.toLowerCase().includes(q) ||
          w.skills.some((s) => s.toLowerCase().includes(q)) ||
          w.profile?.city?.toLowerCase().includes(q) ||
          w.profile?.area?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return Number(b.rating_avg) - Number(a.rating_avg);
      if (sortBy === 'price_low') return Number(a.hourly_rate) - Number(b.hourly_rate);
      if (sortBy === 'price_high') return Number(b.hourly_rate) - Number(a.hourly_rate);
      if (sortBy === 'experience') return b.experience_years - a.experience_years;
      return 0;
    });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900">{t('findWorkers')}</h1>
          <p className="mt-1 text-sm text-slate-500">Search verified local workers for any service</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="pl-12"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto"
            >
              <SlidersHorizontal size={18} /> Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">{t('selectService')}</label>
                <Select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                  <option value="">All Services</option>
                  {SERVICE_CATEGORIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">City</label>
                <Input value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder="e.g. Pune" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Max Rate: ₹{maxRate}/hr</label>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={50}
                  value={maxRate}
                  onChange={(e) => setMaxRate(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Sort By</label>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="rating">Top Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="experience">Most Experienced</option>
                </Select>
              </div>
            </div>
          )}

          {/* Quick service chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map((s) => {
              const Icon = getServiceIcon(s);
              return (
                <button
                  key={s}
                  onClick={() => setServiceFilter(serviceFilter === s ? '' : s)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    serviceFilter === s
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon size={14} /> {s}
                </button>
              );
            })}
            {serviceFilter && (
              <button onClick={() => setServiceFilter('')} className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {usingSample && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <strong>Demo Mode:</strong> Showing sample worker data for demonstration. Sign up as a worker to see real profiles appear here.
          </div>
        )}

        <p className="mb-4 text-sm text-slate-500">
          {loading ? 'Searching...' : `${filtered.length} worker${filtered.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <LoadingSpinner size={32} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={48} />}
            title={t('noResults')}
            subtitle="Try adjusting your filters or search query"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((w) => (
              <WorkerCard key={w.user_id} worker={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


