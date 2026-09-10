import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ErrorState, LoadingScreen } from '../components/ui/States';
import Button from '../components/ui/Button';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSession, isAuthenticated, authError } = useAuth();
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) return;
    refreshSession();
  }, [refreshSession, errorParam]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (errorParam || authError) {
    return (
      <div className="w-full h-full mt-12 md:mt-24 flex items-center justify-center animate-in fade-in zoom-in-95 duration-300">
        <ErrorState 
          title="Authentication Failed" 
          description={authError || "We couldn't connect to your GitHub account. Please try again."}
          action={
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full mt-12 md:mt-24 flex items-center justify-center">
      <LoadingScreen 
        title="Completing secure sign-in…" 
        description="Checking your CodeHealth workspace." 
      />
    </div>
  );
}
