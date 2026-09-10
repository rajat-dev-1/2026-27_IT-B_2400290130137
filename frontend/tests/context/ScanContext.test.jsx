import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ScanProvider } from '../../src/context/ScanContext';
import { scanApi } from '../../src/services/scanApi';
import { toast } from 'sonner';
import { useScan } from '../../src/hooks/useScan';
import React from 'react';

vi.mock('../../src/services/scanApi', () => ({
  scanApi: {
    startScan: vi.fn(),
    retryScan: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
  }),
}));

const wrapper = ({ children }) => <ScanProvider>{children}</ScanProvider>;

describe('ScanContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Existing completed scan response does not show queued toast', async () => {
    scanApi.startScan.mockResolvedValueOnce({ scanId: '1', status: 'completed' });
    
    const { result } = renderHook(() => useScan(), { wrapper });
    
    await act(async () => {
      await result.current.startScan('repo-1');
    });

    expect(toast).toHaveBeenCalledWith('This commit has already been scanned.', expect.anything());
    expect(toast).not.toHaveBeenCalledWith('Repository scan queued.', expect.anything());
    expect(result.current.activeScan.status).toBe('completed');
  });

  it('Existing failed scan shows retry action', async () => {
    scanApi.startScan.mockResolvedValueOnce({ scanId: '2', status: 'failed' });
    
    const { result } = renderHook(() => useScan(), { wrapper });
    
    await act(async () => {
      await result.current.startScan('repo-1');
    });

    expect(toast.error).toHaveBeenCalledWith('Previous scan failed. Please retry.', expect.anything());
    expect(result.current.activeScan.status).toBe('failed');
  });

  it('Newly queued scan shows queued toast', async () => {
    scanApi.startScan.mockResolvedValueOnce({ scanId: '3', status: 'queued' });
    
    const { result } = renderHook(() => useScan(), { wrapper });
    
    await act(async () => {
      await result.current.startScan('repo-1');
    });

    expect(toast).toHaveBeenCalledWith('Repository scan queued.', expect.anything());
    expect(result.current.activeScan.status).toBe('queued');
  });
});
