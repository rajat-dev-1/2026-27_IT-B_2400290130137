import { useRouteError } from 'react-router-dom';
import { ErrorState } from './States';
import Button from './Button';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-ink">
      <ErrorState 
        title="Something went wrong" 
        description={error?.message || "An unexpected error occurred in the application."} 
        action={
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        }
      />
    </div>
  );
}
