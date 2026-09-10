import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Lock, Code2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function RepositorySelector({ selectedRepo, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const repos = [
    { id: 'codehealth-demo', name: 'codehealth-demo', branch: 'main', language: 'TypeScript', isPrivate: false },
    { id: 'portfolio-v2', name: 'portfolio-v2', branch: 'main', language: 'JavaScript', isPrivate: false },
    { id: 'api-playground', name: 'api-playground', branch: 'dev', language: 'TypeScript', isPrivate: true },
  ];

  const current = repos.find(r => r.id === selectedRepo) || repos[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative z-30" ref={dropdownRef}>
      <button
        className="flex items-center gap-3 bg-slate border border-border hover:bg-moss-surface transition-colors px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full sm:w-auto text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ivory font-mono truncate">{current.name}</span>
            {current.isPrivate && <Lock className="h-3 w-3 text-muted shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-sage font-mono">
            <span>{current.branch}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1"><Code2 className="h-3 w-3" /> {current.language}</span>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted shrink-0 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-moss-surface border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          <div className="p-2 space-y-1">
            {repos.map(repo => (
              <button
                key={repo.id}
                role="option"
                aria-selected={selectedRepo === repo.id}
                className={cn(
                  "w-full flex items-center justify-between text-left px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  selectedRepo === repo.id ? "bg-primary-soft text-primary" : "text-sage hover:text-ivory hover:bg-slate"
                )}
                onClick={() => {
                  onSelect(repo.id);
                  setIsOpen(false);
                }}
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-mono truncate">{repo.name}</span>
                  <span className="text-xs opacity-70 mt-0.5 font-mono">{repo.branch}</span>
                </div>
                {repo.isPrivate && <Lock className="h-3 w-3 shrink-0 ml-2" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
