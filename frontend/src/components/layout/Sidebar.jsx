import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderGit2, ShieldCheck, FileCode2, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useRepositories } from '../../hooks/useRepositories';

export default function Sidebar({ className, onNavClick }) {
  const { user } = useAuth();
  const { repositories, selectedRepository } = useRepositories();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: selectedRepository ? `/repositories/${selectedRepository.id}` : "#", icon: FolderGit2, label: "Repositories" },
  ];

  return (
    <aside className={cn("flex flex-col bg-pine h-full border-r border-border", className)}>
      <div className="p-4 flex items-center gap-2 text-ivory font-semibold mb-4">
        <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
        <span className="truncate">CodeHealth AI</span>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive 
                ? "bg-primary-soft text-primary" 
                : "text-sage hover:text-ivory hover:bg-moss-surface"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="mt-8 mb-2 px-3 text-xs font-semibold text-muted uppercase tracking-wider">
          Workspace
        </div>
        <div className="space-y-1">
          {repositories.map((repo) => (
            <NavLink key={repo.id} to={`/repositories/${repo.id}`} onClick={onNavClick} className="flex items-center justify-between px-3 py-2 text-sm font-medium text-sage hover:text-ivory hover:bg-moss-surface rounded-md transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 min-w-0">
                <FileCode2 className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="truncate">{repo.name}</span>
              </div>
              {repo.isPrivate && <Lock className="h-3 w-3 shrink-0 text-muted ml-2" />}
            </NavLink>
          ))}
          {repositories.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted">No repositories</div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2 text-sm">
             <span className="text-sage font-medium">Settings</span>
             <span className="text-[10px] text-muted border border-border px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Soon</span>
          </div>
          
          <div className="flex items-center gap-3 px-2">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-8 w-8 shrink-0 rounded bg-moss-surface border border-border" />
            ) : (
              <div className="h-8 w-8 shrink-0 rounded bg-moss-surface flex items-center justify-center text-xs font-bold text-ivory border border-border">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-ivory truncate">{user?.username || 'User'}</span>
              <span className="text-xs text-sage truncate">Personal workspace</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
