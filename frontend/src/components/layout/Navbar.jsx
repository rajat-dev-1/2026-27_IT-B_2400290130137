import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import GithubIcon from '../ui/GithubIcon';
import { toast } from 'sonner';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleConnect = () => {
    login();
  };

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (window.location.pathname !== '/') {
      navigate('/#how-it-works');
    }
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-ink/80 backdrop-blur-md border-border py-3 shadow-sm" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-ivory font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">CodeHealth AI</span>
        </Link>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <a 
            href="#how-it-works" 
            onClick={scrollToHowItWorks}
            className="hidden sm:block text-sm font-medium text-sage hover:text-ivory transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
          >
            How it works
          </a>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleConnect}
            className="hidden sm:flex"
            leftIcon={GithubIcon}
          >
            Connect GitHub
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleConnect}
            className="flex sm:hidden px-3"
          >
            <GithubIcon className="h-4 w-4" aria-label="Connect GitHub" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
