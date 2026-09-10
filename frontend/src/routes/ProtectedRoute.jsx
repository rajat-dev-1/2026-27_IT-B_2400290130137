import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen, ErrorState } from '../components/ui/States';
import Button from '../components/ui/Button';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, authError, refreshSession } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-ink">
        <LoadingScreen title="Verifying session…" description="Please wait." />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-ink p-4">
        <ErrorState 
          title="Session unavailable" 
          description={authError}
          action={
            <Button variant="secondary" onClick={refreshSession}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
