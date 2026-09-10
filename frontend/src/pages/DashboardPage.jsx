import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, CircleDashed } from 'lucide-react';
import { toast } from 'sonner';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { EmptyState, ErrorState } from '../components/ui/States';
import Skeleton from '../components/ui/Skeleton';

import RepositorySelector from '../components/dashboard/RepositorySelector';
import HealthRing from '../components/dashboard/HealthRing';
import ScoreBreakdown from '../components/dashboard/ScoreBreakdown';
import IssueSummary from '../components/dashboard/IssueSummary';
import TopIssues from '../components/dashboard/TopIssues';
import RecentScan from '../components/dashboard/RecentScan';
import ArchitectInsight from '../components/dashboard/ArchitectInsight';
import ScanStatusCard from '../components/dashboard/ScanStatusCard';

import { useRepositories } from '../hooks/useRepositories';
import { useScan } from '../hooks/useScan';
import { useScanPolling } from '../hooks/useScanPolling';
import { repositoryApi } from '../services/repositoryApi';
import { formatDateTime, formatDuration, formatNumber } from '../utils/formatters';

export default function DashboardPage() {
  const { 
    repositories, 
    selectedRepository, 
    selectRepository, 
    isLoadingRepositories, 
    repositoryError 
  } = useRepositories();

  const { activeScan, startScan, retryScan, isStartingScan } = useScan();

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState(null);
  
  const [latestScan, setLatestScan] = useState(null);
  const [issues, setIssues] = useState([]);
  const [insight, setInsight] = useState(null);

  const fetchDashboardData = useCallback(async (repoId) => {
    if (!repoId) return;
    setIsLoadingData(true);
    setDataError(null);
    try {
      const [scanData, issuesData, insightData] = await Promise.all([
        repositoryApi.getLatestScan(repoId).catch(() => null),
        repositoryApi.getIssues(repoId).catch(() => []),
        repositoryApi.getRecommendations(repoId).catch(() => null)
      ]);
      setLatestScan(scanData);
      setIssues(Array.isArray(issuesData) ? issuesData : []);
      // Use the first insight if it's an array, or the object directly
      setInsight(Array.isArray(insightData) ? insightData[0] : insightData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDataError('We could not load all dashboard data.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Fetch data when selected repo changes
  useEffect(() => {
    if (selectedRepository) {
      fetchDashboardData(selectedRepository.id);
    }
  }, [selectedRepository, fetchDashboardData]);

  // Hook to handle polling and refresh
  useScanPolling({
    onScanComplete: (repoId) => {
      if (selectedRepository && selectedRepository.id === repoId) {
        fetchDashboardData(repoId);
      }
    }
  });

  const handleRunScan = () => {
    if (selectedRepository) {
      startScan(selectedRepository.id);
    }
  };

  const handleRetryScan = () => {
    if (activeScan?.scanId) {
      retryScan(activeScan.scanId);
    }
  };

  // Mappers
  const mappedHealth = useMemo(() => {
    if (!latestScan?.scores) return null;
    const scores = latestScan.scores;
    
    // Simple logic to map score to status for UI
    const getStatus = (score) => {
      if (score >= 80) return 'good';
      if (score >= 70) return 'moderate';
      if (score >= 50) return 'attention';
      return 'critical';
    };

    return {
      overall: scores.overall || 0,
      label: scores.overall >= 75 ? 'Healthy foundation' : 'Needs attention',
      previousScore: null, // Backend doesn't provide this in latest scan
      change: 0,
      resolvedIssues: 0,
      categories: [
        { id: 'complexity', label: 'Complexity', score: scores.complexity || 0, status: getStatus(scores.complexity || 0) },
        { id: 'duplication', label: 'Duplication', score: scores.duplication || 0, status: getStatus(scores.duplication || 0) },
        { id: 'dead-code', label: 'Dead code', score: scores.deadCode || 0, status: getStatus(scores.deadCode || 0) },
        { id: 'dependencies', label: 'Dependencies', score: scores.dependencies || 0, status: getStatus(scores.dependencies || 0) },
        { id: 'architecture', label: 'Architecture', score: scores.architecture || 0, status: getStatus(scores.architecture || 0) }
      ]
    };
  }, [latestScan]);

  const mappedIssueCounts = useMemo(() => {
    if (latestScan?.issueCounts) return latestScan.issueCounts;
    // Calculate if not provided
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    issues.forEach(i => {
      if (counts[i.severity] !== undefined) {
        counts[i.severity]++;
      }
    });
    return counts;
  }, [latestScan, issues]);

  const mappedTopIssues = useMemo(() => {
    return issues.slice(0, 5).map(issue => ({
      ...issue,
      // Default to what the UI expects if backend fields differ
      priority: issue.priority || (issue.severity === 'critical' || issue.severity === 'high' ? 'P1' : 'P2'),
      metric: issue.metric || 'Context available',
      estimatedFix: issue.estimatedFix || 'Needs review'
    }));
  }, [issues]);

  const mappedRecentScan = useMemo(() => {
    if (!latestScan) return null;
    return {
      status: latestScan.status,
      duration: formatDuration(latestScan.durationMs),
      started: formatDateTime(latestScan.startedAt) || 'Unknown',
      commit: latestScan.commitSHA || selectedRepository?.commit || 'Unknown',
      branch: selectedRepository?.branch || 'main',
      files: latestScan.metrics?.totalFiles || 0,
      lines: formatNumber(latestScan.metrics?.totalLines || 0),
      issuesFound: issues.length || (Object.values(mappedIssueCounts).reduce((a,b)=>a+b, 0))
    };
  }, [latestScan, selectedRepository, issues, mappedIssueCounts]);

  const mappedInsight = useMemo(() => {
    if (insight) return insight;
    return {
      title: 'Architect Insight will appear when high-priority findings are available.',
      file: '',
      description: 'CodeHealth AI is monitoring your repository architecture.',
      action: 'Run a new scan to update',
      estimatedImpact: 'N/A'
    };
  }, [insight]);

  // View States
  if (isLoadingRepositories && !selectedRepository) {
    return (
      <div className="w-full flex flex-col gap-6 p-4">
        <Skeleton className="h-10 w-64 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-96 rounded-xl" />
          <Skeleton className="lg:col-span-4 h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (repositoryError) {
    return (
      <div className="w-full py-12">
        <ErrorState 
          title="Repositories unavailable" 
          description={repositoryError} 
          action={<Button variant="secondary" onClick={() => window.location.reload()}>Refresh</Button>}
        />
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="w-full py-12">
        <EmptyState 
          icon={Play}
          title="No repositories available" 
          description="Connect or authorize a GitHub repository to begin a health scan." 
        />
      </div>
    );
  }

  const isScanActive = activeScan?.repoId === selectedRepository?.id && ['queued', 'running'].includes(activeScan.status);
  const isScanFailed = activeScan?.repoId === selectedRepository?.id && activeScan.status === 'failed';
  const showScanStatus = isScanActive || isScanFailed;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header Row */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-20">
        <RepositorySelector 
          selectedRepo={selectedRepository?.id} 
          onSelect={selectRepository} 
        />
        <Button 
          variant="primary" 
          onClick={handleRunScan} 
          leftIcon={Play}
          disabled={isStartingScan || isScanActive}
          title={isScanActive ? "A scan is currently running" : "Run a new scan"}
        >
          Run scan
        </Button>
      </header>

      {/* Active Scan Status */}
      {showScanStatus && (
        <ScanStatusCard 
          status={activeScan.status}
          progress={activeScan.progress}
          progressMessage={activeScan.progressMessage}
          error={activeScan.error}
          onRetry={isScanFailed ? handleRetryScan : undefined}
        />
      )}

      {/* Content Loading State */}
      {isLoadingData && !latestScan ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-96 rounded-xl" />
          <Skeleton className="lg:col-span-4 h-96 rounded-xl" />
        </div>
      ) : !latestScan || latestScan.status !== 'completed' || !latestScan.scores ? (
        /* Empty State: No Scan Data */
        <Card className="flex flex-col items-center justify-center text-center py-24 bg-slate/30 border-dashed mt-8">
          <div className="mb-6 relative">
             <CircleDashed className="h-16 w-16 text-muted/50 animate-[spin_10s_linear_infinite]" />
             <Play className="h-6 w-6 text-muted absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-medium text-ivory mb-2">No scan results yet.</h3>
          <p className="text-sm text-sage max-w-md mx-auto mb-8 leading-relaxed">
            Choose a JavaScript or TypeScript repository and run your first health scan.
          </p>
          <Button variant="primary" onClick={handleRunScan} disabled={isStartingScan || isScanActive} leftIcon={Play} size="lg">
            Run first scan
          </Button>
        </Card>
      ) : (
        /* Populated State */
        <>
          {/* Health Area (Row 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12" padding="lg">
              <div className="flex-1 w-full max-w-sm">
                <HealthRing health={mappedHealth} />
              </div>
              <div className="flex-1 w-full flex flex-col justify-center max-w-sm border-t md:border-t-0 md:border-l border-border/50 pt-8 md:pt-0 md:pl-12">
                <h3 className="text-xl font-semibold text-ivory mb-3">
                  {mappedHealth.overall >= 75 ? "A stable codebase with a few high-impact areas to simplify." : "This repository requires attention to improve stability."}
                </h3>
                {mappedHealth.change !== 0 && (
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-primary bg-primary-soft/30 w-fit px-3 py-1.5 rounded-full border border-primary/20">
                      <span className="font-bold">{mappedHealth.change > 0 ? '+' : ''}{mappedHealth.change}</span> health points
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-ivory mt-4">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${mappedIssueCounts.high > 0 ? 'bg-high/10 border-high/20 text-high' : 'bg-muted/10 border-border text-muted'}`}>
                    <span className="font-bold text-xs">{mappedIssueCounts.high}</span>
                  </div>
                  high-priority areas need attention
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-4 h-full" padding="lg">
              <ScoreBreakdown categories={mappedHealth.categories} />
            </Card>
          </div>

          {/* Issue Summary & Insight (Row 3) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 h-full">
              <IssueSummary counts={mappedIssueCounts} />
            </div>
            <div className="lg:col-span-6 h-full">
              <ArchitectInsight insight={mappedInsight} />
            </div>
          </div>

          {/* Details (Row 4) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 h-full">
              {mappedTopIssues.length > 0 ? (
                <TopIssues issues={mappedTopIssues} />
              ) : (
                <Card className="flex flex-col items-center justify-center h-full py-12 border-dashed bg-slate/50" padding="lg">
                  <span className="text-sm text-sage">No priority issues found.</span>
                </Card>
              )}
            </div>
            <div className="xl:col-span-4 h-full">
              <RecentScan scan={mappedRecentScan} />
            </div>
          </div>
        </>
      )}

    </div>
  );
}
