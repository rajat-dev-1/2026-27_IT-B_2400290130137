import { cn } from '../../utils/cn';

export default function RepositoryTabs({ activeTab, setActiveTab, counts }) {
  const tabs = [
    { id: 'Issues', label: 'Issues', count: counts.issues },
    { id: 'File Details', label: 'File details', count: null },
    { id: 'Recommendations', label: 'Recommendations', count: counts.recommendations },
  ];

  return (
    <div
      className="flex items-center px-4 pt-2 bg-slate/50 hide-scrollbar overflow-x-auto"
      role="tablist"
      aria-label="Repository analysis sections"
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const panelId = `tabpanel-${tab.id.toLowerCase().replace(/\s+/g, '-')}`;
        const tabId = `tab-${tab.id.toLowerCase().replace(/\s+/g, '-')}`;
        return (
          <button
            key={tab.id}
            id={tabId}
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-sm whitespace-nowrap',
              isActive
                ? 'border-primary text-ivory'
                : 'border-transparent text-sage hover:text-ivory hover:border-border'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== null && tab.count !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] rounded-full font-bold',
                  isActive ? 'bg-primary-soft text-primary' : 'bg-ink border border-border text-muted'
                )}
                aria-label={`${tab.count} ${tab.label.toLowerCase()}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
