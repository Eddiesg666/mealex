import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { signInWithGoogle, useAuthState, useCheckFirstTimeUser } from '../utilities/firebase';
import { ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitialLoading } = useAuthState();
  const isFirstTime = useCheckFirstTimeUser(user?.uid ?? "");

  // Navigate away from landing once authenticated
  useEffect(() => {
    if (!isInitialLoading && isAuthenticated) {
      // If first time user, go to profile creation
      if (isFirstTime) {
        navigate({ to: '/profile' });
      } else {
        // Otherwise go to home
        navigate({ to: '/' });
      }
    }
  }, [isAuthenticated, isInitialLoading, isFirstTime, navigate]);

  const handleSignIn = () => {
    signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">MealEx</h1>
        <p className="text-slate-500">Network with peers over meals</p>
      </div>

      <div className="max-w-md text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Find your meal companions
        </h2>
        <p className="text-slate-600 mb-8">
          Discover peers by major and interests. Build meaningful connections over shared meals.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={handleSignIn}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition cursor-pointer hover:bg-blue-700"
        >
          Sign In with Google
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;