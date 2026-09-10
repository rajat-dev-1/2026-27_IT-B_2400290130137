import { Activity, ShieldAlert, Sparkles, GitBranch } from 'lucide-react';
import Card from '../ui/Card';

export default function CapabilityCards() {
  const capabilities = [
    {
      id: 'health-score',
      icon: Activity,
      title: 'Codebase Health Score',
      description: 'See repository health at a glance. A transparent score based on complexity, duplication, dependencies, and maintainability.',
      visual: (
        <div className="mt-4 flex items-center justify-between p-3 rounded bg-moss-surface border border-border">
          <span className="text-sm font-medium text-sage">Overall Health</span>
          <span className="text-sm font-bold text-primary">78 / 100</span>
        </div>
      )
    },
    {
      id: 'tech-debt',
      icon: ShieldAlert,
      title: 'Technical-Debt Detection',
      description: 'Find friction before it spreads. Surface complex functions, repeated logic, possible unused exports, and aging dependencies.',
      visual: (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-high" />
            <span className="text-xs font-mono text-sage">src/auth/permissions.ts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-xs font-mono text-sage">utils/helpers.js</span>
          </div>
        </div>
      )
    },
    {
      id: 'architect-insights',
      icon: Sparkles,
      title: 'Architect Insights',
      description: 'Understand the reason behind the risk. Get concise, actionable explanations for the issues most worth fixing first.',
      visual: (
        <div className="mt-4 border-l-2 border-ai pl-3 py-1">
          <span className="text-xs font-medium text-ivory block mb-1">Architect Insight</span>
          <span className="text-xs text-sage block leading-relaxed line-clamp-2">Multiple branching paths make this flow harder to test safely.</span>
        </div>
      )
    },
    {
      id: 'github-native',
      icon: GitBranch,
      title: 'GitHub-Native Workflow',
      description: 'Start from the repository you already use. Connect GitHub, choose a repository, and receive a focused health report without changing tools.',
      visual: (
        <div className="mt-4 flex items-center gap-2 p-2 rounded bg-moss-surface border border-border">
          <GitBranch className="h-4 w-4 text-muted" />
          <span className="text-xs font-mono text-sage">main • 8f3a2b1</span>
        </div>
      )
    }
  ];

  return (
    <section className="w-full max-w-5xl mx-auto py-24 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {capabilities.map((cap) => (
          <Card 
            key={cap.id}
            hoverable
            className="flex flex-col h-full bg-slate border-border transition-colors duration-200"
            padding="lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-moss-surface rounded-lg border border-border/50">
                <cap.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-ivory">{cap.title}</h3>
            </div>
            <p className="text-sm text-sage leading-relaxed mb-6 flex-1">
              {cap.description}
            </p>
            <div className="mt-auto">
              {cap.visual}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
