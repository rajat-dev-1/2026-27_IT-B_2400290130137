import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-ink py-12 px-4 mt-24">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link to="/" className="flex items-center gap-2 text-ivory font-semibold mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 -ml-1">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>CodeHealth AI</span>
          </Link>
          <p className="text-sm text-sage max-w-xs">
            Explainable repository health for developers.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <a href="#" className="text-sm font-medium text-sage hover:text-ivory transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1">GitHub</a>
          <a href="#" className="text-sm font-medium text-sage hover:text-ivory transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1">Portfolio</a>
          <a href="mailto:placeholder@example.com" className="text-sm font-medium text-sage hover:text-ivory transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1">Contact</a>
        </div>

      </div>
      
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-border/50 flex items-center justify-center md:justify-start">
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} CodeHealth AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
