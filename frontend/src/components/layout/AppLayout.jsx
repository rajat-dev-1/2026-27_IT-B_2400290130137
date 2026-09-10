import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, HelpCircle, X, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Close drawer on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Determine topbar title/breadcrumb based on route
  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Overview';
    if (location.pathname.startsWith('/repositories/')) return `Workspace / ${location.pathname.split('/').pop()}`;
    if (location.pathname === '/design-system') return 'Design System';
    return 'Workspace';
  };

  return (
    <div className="min-h-screen bg-ink flex w-full font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex w-[260px] shrink-0" />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar className="w-full h-full" onNavClick={() => setIsMobileMenuOpen(false)} />
        <button 
          className="absolute top-4 -right-12 p-2 text-sage hover:text-ivory bg-moss-surface border border-border rounded-md shadow-lg"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 shrink-0 border-b border-border/50 bg-ink flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-sage hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-medium text-sage flex items-center gap-2">
               {getPageTitle()}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-sage hover:text-ivory transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" title="Help">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="text-sage hover:text-ivory transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" title="Log out" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </button>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-8 w-8 shrink-0 rounded bg-moss-surface border border-border/80 shadow-sm" />
            ) : (
              <div className="h-8 w-8 shrink-0 rounded bg-moss-surface flex items-center justify-center text-xs font-bold text-ivory border border-border/80 shadow-sm">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1440px] mx-auto p-4 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
      
    </div>
  );
}
