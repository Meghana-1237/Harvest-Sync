import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import LoginButton from './LoginButton';
import { Sprout } from 'lucide-react';

export default function Header() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">HarvestSync</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Welcome, <span className="font-medium text-foreground">{userProfile.name}</span>
              </span>
            )}
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
