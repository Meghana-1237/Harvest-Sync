import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LandingPage from './pages/LandingPage';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import TransporterDashboard from './pages/TransporterDashboard';
import ProfileSetupModal from './components/ProfileSetupModal';
import Layout from './components/Layout';
import { Toaster } from '@/components/ui/sonner';
import { AppRole } from './backend';

const queryClient = new QueryClient();

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <LandingPage />
      </Layout>
    );
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return (
      <Layout>
        <ProfileSetupModal open={true} />
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {userProfile.appRole === AppRole.Farmer && <FarmerDashboard />}
      {userProfile.appRole === AppRole.Buyer && <BuyerDashboard />}
      {userProfile.appRole === AppRole.Transporter && <TransporterDashboard />}
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}
