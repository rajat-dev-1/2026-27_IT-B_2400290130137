export function formatDuration(ms) {
  if (!ms) return '0s';
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Example format: "Today, 10:42 AM" (Simplified)
  // For production, consider using a library like date-fns, but native Intl works fine.
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}
