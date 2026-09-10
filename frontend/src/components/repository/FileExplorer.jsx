import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import Card from '../ui/Card';
import FileTree from './FileTree';
import RepositoryTabs from './RepositoryTabs';
import FileDetailsPanel from './FileDetailsPanel';
import RecommendationPanel from './RecommendationPanel';
import IssueFilters from './IssueFilters';
import IssueList from './IssueList';
import Button from '../ui/Button';

export default function FileExplorer({ files, fileTree, issues, recommendations, selectedFile, onSelectFile }) {
  const [activeTab, setActiveTab] = useState('Issues'); // Issues, File Details, Recommendations
  const [isMobileExplorerOpen, setIsMobileExplorerOpen] = useState(false);
  const [filters, setFilters] = useState({ severity: 'all', type: 'all', priority: 'all' });

  // Switch to File Details when a file is selected (desktop experience)
  useEffect(() => {
    if (selectedFile) {
      setActiveTab('File Details');
    }
  }, [selectedFile]);

  const handleSelectFile = (file) => {
    onSelectFile(file);
    setIsMobileExplorerOpen(false);
  };

  const filteredIssues = issues.filter(issue => {
    if (filters.severity !== 'all' && issue.severity !== filters.severity) return false;
    if (filters.type !== 'all' && issue.type !== filters.type) return false;
    if (filters.priority !== 'all' && issue.priority !== filters.priority) return false;
    return true;
  });

  // Default Sort logic: P1 -> P2 -> P3, then severity, then priorityScore
  const sortedIssues = [...filteredIssues].sort((a, b) => {
     const pWeight = { 'P1': 3, 'P2': 2, 'P3': 1 };
     const sWeight = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
     
     if (pWeight[a.priority] !== pWeight[b.priority]) {
       return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
     }
     if (sWeight[a.severity] !== sWeight[b.severity]) {
       return (sWeight[b.severity] || 0) - (sWeight[a.severity] || 0);
     }
     return (b.priorityScore || 0) - (a.priorityScore || 0);
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative border border-border/50 rounded-xl overflow-hidden bg-slate/30">
      
      {/* Mobile Explorer Toggle */}
      <div className="lg:hidden p-4 border-b border-border/50 bg-slate flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={() => setIsMobileExplorerOpen(true)} leftIcon={Menu}>
          Explore files
        </Button>
        {selectedFile && (
          <span className="text-xs text-sage truncate ml-4 font-mono">{selectedFile.path.split('/').pop()}</span>
        )}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileExplorerOpen && (
        <div 
          className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileExplorerOpen(false)}
        />
      )}

      {/* Left Panel: File Explorer */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-[70] w-[80vw] max-w-[340px] bg-slate border-r border-border transform transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:w-[340px] lg:flex-shrink-0 flex flex-col",
        isMobileExplorerOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-moss-surface/50">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ivory">Files</span>
            <span className="text-xs text-sage">{files.length} analyzed</span>
          </div>
          <button 
            className="lg:hidden p-1.5 text-sage hover:text-ivory bg-moss-surface rounded-md border border-border"
            onClick={() => setIsMobileExplorerOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {fileTree.length > 0 ? (
            <FileTree 
              nodes={fileTree} 
              selectedFile={selectedFile} 
              onSelectFile={handleSelectFile} 
            />
          ) : (
            <div className="p-4 text-center text-sm text-sage">File details are not available for this scan.</div>
          )}
        </div>
      </div>

      {/* Right Panel: Analysis Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-ink">
        <div className="border-b border-border/50 overflow-x-auto hide-scrollbar">
          <RepositoryTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            counts={{ issues: issues.length, recommendations: recommendations.length }} 
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 lg:px-8">
          {activeTab === 'Issues' && (
            <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold text-ivory">Priority issues</h2>
                  <span className="text-sm text-sage">Start with the changes that have the highest maintainability impact.</span>
                </div>
                <IssueFilters filters={filters} setFilters={setFilters} />
              </div>
              <IssueList issues={sortedIssues} totalIssuesCount={issues.length} />
            </div>
          )}

          {activeTab === 'File Details' && (
             <div className="max-w-4xl mx-auto h-full">
               <FileDetailsPanel selectedFile={selectedFile} issues={issues} />
             </div>
          )}

          {activeTab === 'Recommendations' && (
             <div className="max-w-4xl mx-auto h-full">
               <RecommendationPanel recommendations={recommendations} />
             </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
