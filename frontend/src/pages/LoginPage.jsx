import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import GithubIcon from '../components/ui/GithubIcon';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();

  const handleLogin = () => {
    login();
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-center p-4 gap-12 lg:gap-24 animate-in fade-in duration-500 min-h-[80vh]">
      
      <div className="flex-1 w-full max-w-md flex flex-col justify-center">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-sage hover:text-ivory transition-colors w-fit mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm px-1">
          <ArrowLeft className="h-4 w-4" />
          Back to CodeHealth AI
        </Link>
        
        <Card padding="lg" className="flex flex-col shadow-2xl">
          <h2 className="text-2xl font-bold text-ivory mb-3">Start with your GitHub repository</h2>
          <p className="text-sm text-sage mb-8 leading-relaxed">
            Connect GitHub to analyze repository health and prioritize technical debt.
          </p>

          <Button 
            variant="primary" 
            size="lg" 
            className="w-full mb-6" 
                        leftIcon={GithubIcon}
            onClick={handleLogin}
          >
            Continue with GitHub
          </Button>

          <div className="flex items-start gap-3 pt-6 border-t border-border/50">
            <Lock className="h-4 w-4 text-muted shrink-0 mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">
              Repository access is used only to analyze the projects you choose. We never modify your code.
            </p>
          </div>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 w-full max-w-lg items-center justify-center relative">
         <div className="absolute inset-0 bg-moss-surface rounded-full opacity-20 blur-[100px]" />
         <div className="relative w-full aspect-square border border-border/50 rounded-full flex items-center justify-center p-12 bg-ink/50 backdrop-blur-sm">
            <div className="w-full h-full border border-border rounded-full flex flex-col items-center justify-center p-8 bg-slate shadow-xl">
               <div className="text-sm font-medium text-sage mb-1">Codebase Health</div>
               <div className="text-4xl font-bold text-ivory">Analyze</div>
               <div className="mt-4 flex items-center gap-2 text-xs font-mono text-muted">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 Ready to connect
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
