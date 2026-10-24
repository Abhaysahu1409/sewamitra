import { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Users,
  Star,
  Wallet,
  Calendar,
  HandHeart,
  ArrowRight,
  CheckCircle2,
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  PaintRoller,
  Flower2,
  Car,
  Quote,
  Globe,
  Mic,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Link, useRouter } from '@/lib/router';
import { SERVICE_CATEGORIES } from '@/lib/supabase';
import { Button, Card } from '@/components/ui';
import { getServiceColor } from '@/lib/serviceIcons';

const SERVICE_ICON_MAP: Record<string, typeof Wrench> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Cleaning: Sparkles,
  Carpentry: Hammer,
  Painting: PaintRoller,
  Gardening: Flower2,
  Driving: Car,
};

export function LandingPage() {
  const { t } = useI18n();
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/37556463/pexels-photo-37556463.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Worker"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-teal-900/80" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-4 py-1.5 text-sm font-medium text-teal-300 backdrop-blur-sm">
              <HandHeart size={16} /> SIH26089 · Smart India Hackathon
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Sewamitra
            </h1>
            <p className="mt-3 text-xl font-medium text-teal-300 sm:text-2xl">{t('tagline')}</p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              Connect with trusted local workers for plumbing, electrical, cleaning, carpentry,
              painting, gardening, and driving — all in one cooperative platform built for India.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3.5 pl-12 pr-4 text-white placeholder-slate-400 outline-none backdrop-blur-sm transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
                />
              </div>
              <Button type="submit" size="lg" className="shrink-0">
                {t('search')} <ArrowRight size={18} />
              </Button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              {!user && (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    <Users size={18} /> {t('hireWorker')}
                  </Link>
                  <Link
                    to="/signup?role=worker"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                  >
                    <HandHeart size={18} /> {t('becomeWorker')}
                  </Link>
                </>
              )}
              {user && (
                <Link
                  to={profile?.role === 'worker' ? '/worker/dashboard' : '/search'}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  {t('dashboard')} <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { label: 'Active Workers', value: '2,500+', icon: Users },
            { label: 'Services Completed', value: '18,000+', icon: CheckCircle2 },
            { label: 'Avg. Rating', value: '4.7★', icon: Star },
            { label: 'Cities Covered', value: '45+', icon: ShieldCheck },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="mx-auto mb-2 text-teal-600" size={24} />
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Services We Offer</h2>
            <p className="mt-2 text-slate-500">Trusted professionals for every household need</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SERVICE_CATEGORIES.map((service) => {
              const Icon = SERVICE_ICON_MAP[service] || Wrench;
              const color = getServiceColor(service);
              return (
                <Link key={service} to={`/search?q=${encodeURIComponent(service)}`}>
                  <Card className="group flex flex-col items-center gap-3 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-md transition-transform group-hover:scale-110`}>
                      <Icon size={26} />
                    </div>
                    <span className="font-semibold text-slate-800">{service}</span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-2 text-slate-500">Three simple steps to get your work done</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Search, title: 'Search & Discover', desc: 'Find verified workers near you by service, location, and budget. Compare ratings and reviews.' },
              { icon: Calendar, title: 'Book a Service', desc: 'Book individual or group services. Choose your time slot and pay securely from your wallet.' },
              { icon: CheckCircle2, title: 'Track & Review', desc: 'Track job status in real-time. Rate and review workers after completion to build trust.' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <step.icon size={28} />
                </div>
                <div className="absolute left-8 top-16 hidden h-px w-full bg-gradient-to-r from-teal-200 to-transparent md:block" />
                <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Platform Features</h2>
            <p className="mt-2 text-slate-400">Built for a cooperative, inclusive community</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'ID Verification', desc: 'Every worker is identity-verified for your safety and trust.' },
              { icon: Star, title: 'Ratings & Reviews', desc: 'Transparent feedback system helps you choose the right worker.' },
              { icon: Wallet, title: 'Wallet Payments', desc: 'Secure in-app wallet for seamless payments and earnings tracking.' },
              { icon: Users, title: 'Group Bookings', desc: 'Book multiple workers for larger jobs like painting or deep cleaning.' },
              { icon: Mic, title: 'AI Voice Assistant', desc: 'Voice-powered assistant helps you find and book services hands-free.' },
              { icon: Globe, title: 'Multilingual Support', desc: 'Available in English, Hindi, Marathi, Tamil, Telugu, and Bengali.' },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 transition hover:border-teal-500/50">
                <f.icon className="mb-3 text-teal-400" size={24} />
                <h3 className="font-bold text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900">What Our Community Says</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Priya Sharma', role: 'Customer, Pune', text: 'Found a verified plumber within 10 minutes. The booking and payment were so easy. Highly recommend Sewamitra!' },
              { name: 'Ramesh Kumar', role: 'Electrician, Delhi', text: 'As a worker, I get consistent jobs and fair pay. The wallet system means I get paid immediately after completing work.' },
              { name: 'Anita Desai', role: 'Customer, Mumbai', text: 'The voice assistant is amazing — I just spoke my need and it found workers. Multilingual support is a blessing.' },
            ].map((tm, i) => (
              <Card key={i} className="p-6">
                <Quote className="mb-3 text-teal-300" size={28} />
                <p className="text-sm leading-relaxed text-slate-700">"{tm.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-semibold text-white">
                    {tm.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{tm.name}</p>
                    <p className="text-xs text-slate-500">{tm.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-teal-600 to-cyan-700 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Get Started?</h2>
          <p className="mt-3 text-lg text-teal-100">
            Join thousands of customers and workers building a stronger community together.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-teal-700 transition hover:bg-slate-100"
            >
              {t('signup')} <ArrowRight size={18} />
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              {t('findWorkers')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
