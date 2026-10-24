import { AuthProvider, useAuth } from '@/lib/auth';
import { I18nProvider } from '@/lib/i18n';
import { RouterProvider, useRouter } from '@/lib/router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage, SignupPage } from '@/pages/AuthPages';
import { SearchPage } from '@/pages/SearchPage';
import { WorkerDetailPage } from '@/pages/WorkerDetailPage';
import { BookingsPage } from '@/pages/BookingsPage';
import { WalletPage } from '@/pages/WalletPage';
import { WorkerDashboardPage } from '@/pages/WorkerDashboardPage';
import { AdminPage } from '@/pages/AdminPage';
import { ProfilePage } from '@/pages/ProfilePage';

function Routes() {
  const { path } = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full border-2 border-slate-200 border-t-teal-600 h-10 w-10" />
      </div>
    );
  }

  const cleanPath = path.split('?')[0];
  const segments = cleanPath.split('/').filter(Boolean);

  if (cleanPath === '/' || cleanPath === '') return <LandingPage />;
  if (cleanPath === '/login') return <LoginPage />;
  if (cleanPath === '/signup') return <SignupPage />;
  if (cleanPath === '/search') return <SearchPage />;
  if (cleanPath === '/bookings') return user ? <BookingsPage /> : <LoginPage />;
  if (cleanPath === '/wallet') return user ? <WalletPage /> : <LoginPage />;
  if (cleanPath === '/profile') return user ? <ProfilePage /> : <LoginPage />;
  if (cleanPath === '/worker/dashboard') return user ? <WorkerDashboardPage /> : <LoginPage />;
  if (cleanPath === '/admin' || cleanPath === '/admin/workers' || cleanPath === '/admin/bookings') {
    return user ? <AdminPage /> : <LoginPage />;
  }
  if (segments[0] === 'worker' && segments[1]) return <WorkerDetailPage workerId={segments[1]} />;

  return <LandingPage />;
}

function AppContent() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Routes />
      </main>
      <Footer />
      <VoiceAssistant />
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
