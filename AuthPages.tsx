import { useState, useEffect } from 'react';
import { HandHeart, Mail, Lock, ArrowRight, AlertCircle, User, Phone, MapPin, Wrench, Home } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n, LANGUAGES } from '@/lib/i18n';
import { useRouter, Link } from '@/lib/router';
import { Button, Input, Select } from '@/components/ui';

export function LoginPage() {
  const { signIn } = useAuth();
  const { t } = useI18n();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30">
            <HandHeart size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your Sewamitra account</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-11"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Signing in...' : t('login')} <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-center text-sm text-slate-500">
              New to Sewamitra?{' '}
              <Link to="/signup" className="font-semibold text-teal-600 hover:text-teal-700">
                {t('signup')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
          <p className="font-semibold">Demo Note:</p>
          <p className="mt-1">Sign up with any email and password to create an account. Email confirmation is disabled for the hackathon demo.</p>
        </div>
      </div>
    </div>
  );
}

export function SignupPage() {
  const { signUp } = useAuth();
  const { t } = useI18n();
  const { navigate } = useRouter();

  const [role, setRole] = useState<'customer' | 'worker'>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (params.get('role') === 'worker') setRole('worker');
  }, []);

  const minLength = 6;
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passedChecks];
  const strengthColor = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'][passedChecks];
  const canSubmit = password.length >= minLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) {
      setError(`Password must be at least ${minLength} characters long.`);
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role, phone, city, area, language);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30">
            <HandHeart size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Join Sewamitra</h1>
          <p className="mt-1 text-sm text-slate-500">Create your account in minutes</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                  role === 'customer' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Home size={22} className={role === 'customer' ? 'text-teal-600' : 'text-slate-400'} />
                <div>
                  <p className="text-sm font-bold text-slate-900">Hire Workers</p>
                  <p className="text-xs text-slate-500">Find & book services</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole('worker')}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                  role === 'worker' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Wrench size={22} className={role === 'worker' ? 'text-teal-600' : 'text-slate-400'} />
                <div>
                  <p className="text-sm font-bold text-slate-900">Offer Services</p>
                  <p className="text-xs text-slate-500">Work as a professional</p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="pl-11" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-11" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="pl-11" />
                </div>
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i <= passedChecks ? strengthColor : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs font-medium" style={{ color: passedChecks >= 3 ? '#059669' : passedChecks >= 2 ? '#3b82f6' : '#ef4444' }}>
                      {strengthLabel}
                    </p>
                    <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-500">
                      <li className={password.length >= minLength ? 'text-emerald-600' : ''}>{password.length >= minLength ? '✓' : '○'} At least {minLength} characters (required)</li>
                      <li className={passwordChecks.upper ? 'text-emerald-600' : ''}>{passwordChecks.upper ? '✓' : '○'} One uppercase letter (optional)</li>
                      <li className={passwordChecks.number ? 'text-emerald-600' : ''}>{passwordChecks.number ? '✓' : '○'} One number (optional)</li>
                      <li className={passwordChecks.special ? 'text-emerald-600' : ''}>{passwordChecks.special ? '✓' : '○'} One special character (optional)</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="pl-11" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Preferred Language</label>
                <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.native} ({l.label})</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
                <Input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Pune" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Area / Locality</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input required value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Kothrud" className="pl-11" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading || !canSubmit} className="w-full" size="lg">
              {loading ? 'Creating account...' : t('signup')} <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
