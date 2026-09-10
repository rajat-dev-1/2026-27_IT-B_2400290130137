import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScanPolling } from '../../src/hooks/useScanPolling';

// Mock dependencies
vi.mock('../../src/hooks/useScan', () => ({
  useScan: vi.fn(),
}));
vi.mock('../../src/services/scanApi', () => ({
  scanApi: {
    getScanStatus: vi.fn(),
  },
}));
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import { useScan } from '../../src/hooks/useScan';
import { scanApi } from '../../src/services/scanApi';
import { toast } from 'sonner';

describe('useScanPolling', () => {
  let updateActiveScan;

  beforeEach(() => {
    vi.useFakeTimers();
    updateActiveScan = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not poll when activeScan is null', () => {
    useScan.mockReturnValue({ activeScan: null, updateActiveScan });
    renderHook(() => useScanPolling({ onScanComplete: vi.fn() }));
    vi.advanceTimersByTime(8000);
    expect(scanApi.getScanStatus).not.toHaveBeenCalled();
  });

  it('does not poll when scan is in a terminal state', () => {
    useScan.mockReturnValue({
      activeScan: { scanId: 'scan-1', status: 'completed', repoId: 'repo-1' },
      updateActiveScan,
    });
    renderHook(() => useScanPolling({ onScanComplete: vi.fn() }));
    vi.advanceTimersByTime(8000);
    expect(scanApi.getScanStatus).not.toHaveBeenCalled();
  });

  it('polls at 4-second intervals for a queued scan', async () => {
    useScan.mockReturnValue({
      activeScan: { scanId: 'scan-1', status: 'queued', repoId: 'repo-1' },
      updateActiveScan,
    });
    scanApi.getScanStatus.mockResolvedValue({ scanId: 'scan-1', status: 'queued', repoId: 'repo-1' });

    renderHook(() => useScanPolling({ onScanComplete: vi.fn() }));
    // Initial poll
    await act(async () => { await Promise.resolve(); });
    expect(scanApi.getScanStatus).toHaveBeenCalledTimes(1);

    // After 4 more seconds
    await act(async () => { vi.advanceTimersByTime(4000); await Promise.resolve(); });
    expect(scanApi.getScanStatus).toHaveBeenCalledTimes(2);

    // After another 4 seconds
    await act(async () => { vi.advanceTimersByTime(4000); await Promise.resolve(); });
    expect(scanApi.getScanStatus).toHaveBeenCalledTimes(3);
  });

  it('calls onScanComplete exactly once when scan completes', async () => {
    const onScanComplete = vi.fn();
    useScan.mockReturnValue({
      activeScan: { scanId: 'scan-1', status: 'running', repoId: 'repo-1' },
      updateActiveScan,
    });
    scanApi.getScanStatus.mockResolvedValue({ scanId: 'scan-1', status: 'completed', repoId: 'repo-1' });

    renderHook(() => useScanPolling({ onScanComplete }));
    await act(async () => { await Promise.resolve(); });

    expect(onScanComplete).toHaveBeenCalledOnce();
    expect(onScanComplete).toHaveBeenCalledWith('repo-1');
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('health report'),
      expect.objectContaining({ id: 'scan-complete' })
    );
  });

  it('fires error toast and updates scan state when failed', async () => {
    useScan.mockReturnValue({
      activeScan: { scanId: 'scan-1', status: 'running', repoId: 'repo-1' },
      updateActiveScan,
    });
    scanApi.getScanStatus.mockResolvedValue({ scanId: 'scan-1', status: 'failed', repoId: 'repo-1' });

    const onScanComplete = vi.fn();
    renderHook(() => useScanPolling({ onScanComplete }));
    await act(async () => { await Promise.resolve(); });

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('could not complete'),
      expect.objectContaining({ id: 'scan-failed' })
    );
    expect(onScanComplete).not.toHaveBeenCalled();
  });

  it('clears interval on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    useScan.mockReturnValue({
      activeScan: { scanId: 'scan-1', status: 'running', repoId: 'repo-1' },
      updateActiveScan,
    });
    scanApi.getScanStatus.mockResolvedValue({ scanId: 'scan-1', status: 'running', repoId: 'repo-1' });

    const { unmount } = renderHook(() => useScanPolling({ onScanComplete: vi.fn() }));
    await act(async () => { await Promise.resolve(); });
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
