export const SCAN_STATUS = Object.freeze({
  QUEUED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
});

export const ACTIVE_SCAN_STATUSES = ['queued', 'running'];
export const TERMINAL_SCAN_STATUSES = ['completed', 'failed'];
