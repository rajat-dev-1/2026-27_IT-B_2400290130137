import { jest } from '@jest/globals';
import { SCAN_STATUS } from '../shared/constants/scanStatus.js';

// Mock dependencies
jest.unstable_mockModule('../worker/src/config/database.js', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  }
}));

const { processScanLifecycle } = await import('../worker/src/services/scanLifecycleProcessor.js');
const { db } = await import('../worker/src/config/database.js');

describe('Scan Lifecycle Processor', () => {
  let mockJob;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJob = {
      id: 'job-123',
      data: {
        scanId: '8f7b5832-7212-4ebf-bf01-eb471da92fa4',
        repoId: '1f7b5832-7212-4ebf-bf01-eb471da92fa5',
        userId: '2f7b5832-7212-4ebf-bf01-eb471da92fa6',
        commitSHA: 'abc123def456',
        trigger: 'manual'
      },
      attemptsMade: 1,
      updateProgress: jest.fn(),
      discard: jest.fn()
    };
  });

  test('invalid job payload fails safely', async () => {
    mockJob.data.scanId = 'not-a-uuid'; // invalid
    await expect(processScanLifecycle(mockJob)).rejects.toThrow('Invalid job payload');
    expect(db.select).not.toHaveBeenCalled();
  });

  test('completed scan job is idempotently skipped', async () => {
    db.where.mockResolvedValueOnce([{ status: SCAN_STATUS.COMPLETED }]);

    await processScanLifecycle(mockJob);

    expect(db.where).toHaveBeenCalledTimes(1); // Only the select call
    expect(db.update).not.toHaveBeenCalled();
  });

  test('valid job transitions queued -> running -> completed', async () => {
    db.where.mockResolvedValueOnce([{ 
      status: SCAN_STATUS.QUEUED, 
      attemptCount: 0,
      startedAt: null
    }]);

    await processScanLifecycle(mockJob);

    // Expect multiple update calls for progress
    expect(db.update).toHaveBeenCalled();
    
    // First update should be to running
    expect(db.set).toHaveBeenNthCalledWith(1, expect.objectContaining({
      status: SCAN_STATUS.RUNNING,
      progress: 5
    }));

    // Last update should be to completed
    expect(db.set).toHaveBeenLastCalledWith(expect.objectContaining({
      status: SCAN_STATUS.COMPLETED,
      progress: 100
    }));

    // Check progress updates
    expect(mockJob.updateProgress).toHaveBeenCalledWith(5);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(20);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(45);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(75);
    expect(mockJob.updateProgress).toHaveBeenCalledWith(100);
  });

  test('processor failure records safe error data', async () => {
    db.where.mockResolvedValueOnce([{ 
      status: SCAN_STATUS.QUEUED, 
      attemptCount: 0,
      errorLog: []
    }]);

    // Force an error during update
    db.update.mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });

    await expect(processScanLifecycle(mockJob)).rejects.toThrow('Database connection lost');

    // It should have tried to write the error log
    expect(db.update).toHaveBeenCalledTimes(2); // First failed update, second error log update
    expect(db.set).toHaveBeenLastCalledWith(expect.objectContaining({
      errorLog: expect.arrayContaining([
        expect.objectContaining({ stage: 'queue-lifecycle' })
      ])
    }));
  });
});
