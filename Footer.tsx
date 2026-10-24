import { HandHeart, Heart } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Link } from '@/lib/router';
import { SERVICE_CATEGORIES } from '@/lib/supabase';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                <HandHeart size={22} />
              </div>
              <div>
                <span className="block text-lg font-bold text-white">Sewamitra</span>
                <span className="text-xs text-teal-400">{t('tagline')}</span>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              A cooperative gig services platform connecting households with skilled local workers.
              Built for SIH26089 — empowering communities through dignified work.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Services</h4>
            <ul className="space-y-2 text-sm">
              {SERVICE_CATEGORIES.slice(0, 5).map((s) => (
                <li key={s}>
                  <Link to="/search" className="text-slate-400 transition hover:text-teal-400">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="text-slate-400 transition hover:text-teal-400">{t('findWorkers')}</Link></li>
              <li><Link to="/signup" className="text-slate-400 transition hover:text-teal-400">{t('becomeWorker')}</Link></li>
              <li><Link to="/login" className="text-slate-400 transition hover:text-teal-400">{t('login')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">© 2026 Sewamitra. SIH26089 — Smart India Hackathon.</p>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            Made with <Heart size={12} className="text-rose-500" /> for India
          </p>
        </div>
      </div>
    </footer>
  );
}
