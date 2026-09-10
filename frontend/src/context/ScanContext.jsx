import { createContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { scanApi } from '../services/scanApi';

export const ScanContext = createContext();

export function ScanProvider({ children }) {
  const [activeScan, setActiveScan] = useState(null);
  const [isStartingScan, setIsStartingScan] = useState(false);
  const [scanError, setScanError] = useState(null);

  const startScan = useCallback(async (repoId, options = {}) => {
    if (!repoId) return;

    if (
      activeScan &&
      activeScan.repoId === repoId &&
      ['queued', 'running'].includes(activeScan.status)
    ) {
      toast('A scan is already in progress for this repository.', { id: 'scan-duplicate' });
      return;
    }

    setIsStartingScan(true);
    setScanError(null);

    try {
      const data = await scanApi.startScan(repoId, options);
      setActiveScan(data);
      
      if (data.status === 'completed' && !options.force) {
        toast('This commit has already been scanned.', { id: 'scan-already-completed' });
      } else if (data.status === 'failed' && !options.force) {
        toast.error('Previous scan failed. Please retry.', { id: 'scan-failed' });
      } else {
        toast(options.force ? 'New scan run queued.' : 'Repository scan queued.', { id: 'scan-queued' });
      }
    } catch (error) {
      const apiErr = error?.response?.data?.error;
      if (import.meta.env.DEV) {
        console.error('[scan] startScan failed', {
          code: apiErr?.code,
          requestId: apiErr?.details?.requestId,
          status: error?.response?.status,
        });
      }
      const msg = 'We could not queue this scan. Try again in a moment.';
      setScanError(msg);
      toast.error(msg, { id: 'scan-start-error' });
    } finally {
      setIsStartingScan(false);
    }
  }, [activeScan]);

  const retryScan = useCallback(async (scanId) => {
    if (!scanId || activeScan?.status !== 'failed') return;

    setIsStartingScan(true);
    setScanError(null);

    try {
      const data = await scanApi.retryScan(scanId);
      setActiveScan(data);
      toast('Scan retry queued.', { id: 'scan-retry-queued' });
    } catch (error) {
      const apiErr = error?.response?.data?.error;
      if (import.meta.env.DEV) {
        console.error('[scan] retryScan failed', {
          code: apiErr?.code,
          requestId: apiErr?.details?.requestId,
          status: error?.response?.status,
        });
      }
      const msg = 'We could not queue the retry. Please try again.';
      setScanError(msg);
      toast.error(msg, { id: 'scan-retry-error' });
    } finally {
      setIsStartingScan(false);
    }
  }, [activeScan]);

  const clearActiveScan = useCallback(() => {
    setActiveScan(null);
    setScanError(null);
  }, []);

  const updateActiveScan = useCallback((data) => {
    setActiveScan(data);
  }, []);

  const value = {
    activeScan,
    isStartingScan,
    scanError,
    startScan,
    retryScan,
    clearActiveScan,
    updateActiveScan,
  };

  return (
    <ScanContext.Provider value={value}>
      {children}
    </ScanContext.Provider>
  );
}
