import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useRepositoryDetails } from '../hooks/useRepositoryDetails';
import { useScan } from '../hooks/useScan';
import { useScanPolling } from '../hooks/useScanPolling';
import { ErrorState, EmptyState } from '../components/ui/States';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import RepositoryHeader from '../components/repository/RepositoryHeader';
import ScanStatusCard from '../components/dashboard/ScanStatusCard';
import FileExplorer from '../components/repository/FileExplorer';

export default function RepositoryPage() {
  const { repoId } = useParams();
  
  const {
    repository,
    latestScan,
    files,
    fileTree,
    issues,
    recommendations,
    isLoading,
    error,
    refresh,
    selectedFile,
    setSelectedFile
  } = useRepositoryDetails(repoId);

  const { activeScan, startScan, retryScan, isStartingScan, clearActiveScan } = useScan();

  useScanPolling({
    onScanComplete: (completedRepoId) => {
      if (completedRepoId === repoId) {
        refresh();
      }
    }
  });

  // If startScan immediately returns a completed status (idempotent), refresh the page.
  useEffect(() => {
    if (activeScan?.repoId === repoId && activeScan?.status === 'completed') {
      refresh();
      clearActiveScan();
    }
  }, [activeScan?.repoId, activeScan?.status, repoId, refresh, clearActiveScan]);

  const handleRunScan = () => {
    startScan(repoId);
  };

  const handleForceRescan = () => {
    startScan(repoId, { force: true });
  };

  const handleRetryScan = () => {
    if (activeScan?.scanId) {
      retryScan(activeScan.scanId);
    }
  };

  if (isLoading && !repository) {
    return (
      <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-500">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="flex-1 flex gap-6 mt-4">
          <Skeleton className="w-[320px] h-full min-h-[500px] rounded-xl hidden lg:block" />
          <Skeleton className="flex-1 h-full min-h-[500px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center py-24 animate-in fade-in duration-300">
        <ErrorState 
          title="Repository unavailable"
          description={error}
          action={<Button variant="secondary" onClick={() => window.location.href='/dashboard'}>Back to dashboard</Button>}
        />
      </div>
    );
  }

  const isScanActive = activeScan?.repoId === repoId && ['queued', 'running'].includes(activeScan.status);
  const isScanFailed = activeScan?.repoId === repoId && activeScan.status === 'failed';
  const showScanStatus = isScanActive || isScanFailed;

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 pb-12">
      <RepositoryHeader 
        repository={repository} 
        latestScan={latestScan}
        isScanActive={isScanActive}
        isStartingScan={isStartingScan}
        onRunScan={handleRunScan}
        onForceRescan={handleForceRescan}
      />

      {showScanStatus && (
        <div className="mb-8">
          <ScanStatusCard 
            status={activeScan.status}
            progress={activeScan.progress}
            progressMessage={activeScan.progressMessage}
            error={activeScan.error}
            onRetry={isScanFailed ? handleRetryScan : undefined}
          />
        </div>
      )}

      {(!latestScan || latestScan.status !== 'completed') ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center py-24">
           <EmptyState 
             icon={Play}
             title="This repository has no health report yet"
             description="Run a scan to inspect files, prioritize issues, and see recommendations."
             action={
               <Button variant="primary" onClick={handleRunScan} disabled={isStartingScan || isScanActive} leftIcon={Play}>
                 Run first scan
               </Button>
             }
           />
        </div>
      ) : (
        <FileExplorer 
          files={files}
          fileTree={fileTree}
          issues={issues}
          recommendations={recommendations}
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
        />
      )}
    </div>
  );
}
