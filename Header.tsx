import { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, LogOut, User, LayoutDashboard, Wallet, Calendar, Search, HandHeart } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n, LANGUAGES, Lang } from '@/lib/i18n';
import { Link, useRouter } from '@/lib/router';
import { Avatar } from './ui';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const navLinks = user ? (
    profile?.role === 'customer' ? (
      <>
        <NavLink to="/search" label={t('findWorkers')} icon={<Search size={16} />} />
        <NavLink to="/bookings" label={t('myBookings')} icon={<Calendar size={16} />} />
        <NavLink to="/wallet" label={t('wallet')} icon={<Wallet size={16} />} />
      </>
    ) : profile?.role === 'worker' ? (
      <>
        <NavLink to="/worker/dashboard" label={t('dashboard')} icon={<LayoutDashboard size={16} />} />
        <NavLink to="/bookings" label={t('jobs')} icon={<Calendar size={16} />} />
        <NavLink to="/wallet" label={t('earnings')} icon={<Wallet size={16} />} />
      </>
    ) : profile?.role === 'admin' ? (
      <>
        <NavLink to="/admin" label={t('adminPanel')} icon={<LayoutDashboard size={16} />} />
        <NavLink to="/admin/workers" label={t('manageWorkers')} icon={<User size={16} />} />
        <NavLink to="/admin/bookings" label={t('manageBookings')} icon={<Calendar size={16} />} />
      </>
    ) : null
  ) : (
    <>
      <NavLink to="/" label={t('home')} />
      <NavLink to="/search" label={t('findWorkers')} />
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30">
            <HandHeart size={22} />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-bold tracking-tight text-slate-900">Sewamitra</span>
            <span className="hidden text-[10px] font-medium text-teal-600 sm:block">{t('tagline')}</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">{navLinks}</nav>

        <div className="flex items-center gap-2">
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <Globe size={18} />
              <span className="hidden text-xs font-semibold sm:inline">{LANGUAGES.find((l) => l.code === lang)?.native}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code as Lang);
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                      lang === l.code ? 'bg-teal-50 font-semibold text-teal-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{l.native}</span>
                    <span className="text-xs text-slate-400">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-slate-100"
              >
                <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size={34} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{profile?.full_name}</p>
                    <p className="text-xs capitalize text-slate-500">{profile?.role}</p>
                  </div>
                  <div className="my-1 border-t border-slate-100" />
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <User size={16} /> {t('profile')}
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut size={16} /> {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                {t('login')}
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 transition hover:bg-teal-700"
              >
                {t('signup')}
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">{navLinks}</div>
          {!user && (
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {t('login')}
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-teal-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                {t('signup')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {icon}
      {label}
    </Link>
  );
}
