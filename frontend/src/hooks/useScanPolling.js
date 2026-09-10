import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useScan } from './useScan';
import { scanApi } from '../services/scanApi';

export function useScanPolling({ onScanComplete }) {
  const { activeScan, updateActiveScan } = useScan();
  const consecutiveErrors = useRef(0);
  // Track whether we've already fired the completion callback for the current scan ID
  const completionFiredRef = useRef(null);

  useEffect(() => {
    if (!activeScan || !['queued', 'running'].includes(activeScan.status)) {
      return undefined;
    }

    // Reset completion guard when a new scan starts
    if (completionFiredRef.current !== activeScan.scanId) {
      completionFiredRef.current = null;
    }

    let isSubscribed = true;
    consecutiveErrors.current = 0;

    const poll = async () => {
      // Pause polling if document is hidden to save resources
      if (document.hidden) return;

      try {
        const nextStatus = await scanApi.getScanStatus(activeScan.scanId);

        if (!isSubscribed) return;

        consecutiveErrors.current = 0;
        updateActiveScan(nextStatus);

        if (nextStatus.status === 'completed') {
          // Use stable ID to prevent duplicate toasts on re-renders
          toast.success('Scan complete — your health report is ready.', { id: 'scan-complete' });
          // Only fire onScanComplete once per scan ID
          if (completionFiredRef.current !== nextStatus.scanId) {
            completionFiredRef.current = nextStatus.scanId;
            if (onScanComplete) {
              onScanComplete(nextStatus.repoId);
            }
          }
        } else if (nextStatus.status === 'failed') {
          toast.error('Scan could not complete. You can try again.', { id: 'scan-failed' });
        }
      } catch (error) {
        if (!isSubscribed) return;

        consecutiveErrors.current += 1;
        if (consecutiveErrors.current >= 3) {
          updateActiveScan({
            ...activeScan,
            status: 'failed',
            error: 'We lost contact with the scan status. Please try again.',
          });
          toast.error('We could not reach CodeHealth. Try again.', { id: 'scan-poll-error' });
        }
      }
    };

    poll();
    const intervalId = window.setInterval(poll, 4000);

    return () => {
      isSubscribed = false;
      window.clearInterval(intervalId);
    };
  }, [activeScan?.scanId, activeScan?.status, updateActiveScan, onScanComplete]);
}
