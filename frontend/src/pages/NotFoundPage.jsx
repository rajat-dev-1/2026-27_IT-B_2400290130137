import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-border mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-ivory mb-2">This path does not lead to a repository.</h2>
      <p className="text-sage mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        Back to home
      </Button>
    </div>
  );
}
