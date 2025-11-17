import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ProfilesProvider, useProfiles } from '../contexts/ProfilesContext';
import { useAuthState } from '../utilities/firebase';
import { useEffect, useRef } from 'react';

function RootComponent() {
  return (
    <ProfilesProvider>
      <RootLayout />
    </ProfilesProvider>
  );
}

// Separate component so it has access to ProfilesContext
function RootLayout() {
  const { isAuthenticated, isInitialLoading, user } = useAuthState();
  const { getProfileById, isLoading: profilesLoading } = useProfiles();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirectedToProfileRef = useRef(false);

  useEffect(() => {
    // Don't redirect while loading
    if (isInitialLoading || profilesLoading) return;

    // Redirect to landing if not authenticated
    if (!isAuthenticated && location.pathname !== '/landing') {
      navigate({ to: '/landing' });
      hasRedirectedToProfileRef.current = false;
      return;
    }

    // Reset redirect flag on logout
    if (!isAuthenticated) {
      hasRedirectedToProfileRef.current = false;
      return;
    }

    // Reset redirect flag when user goes home
    if (location.pathname === '/') {
      hasRedirectedToProfileRef.current = false;
    }

    // Redirect first-time users to profile creation
    if (
      isAuthenticated &&
      user &&
      !getProfileById(user.uid) &&
      location.pathname !== '/profile' &&
      location.pathname !== '/' &&
      !location.pathname.startsWith('/profilepage/') &&
      !hasRedirectedToProfileRef.current
    ) {
      hasRedirectedToProfileRef.current = true;
      navigate({ to: '/profile' });
    }
  }, [isAuthenticated, isInitialLoading, user, profilesLoading, navigate, location.pathname, getProfileById]);

  return (
    <div>
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="h-screen flex items-center justify-center text-6xl">
      I looked for that page, I really did! 😭
    </div>
  )
});