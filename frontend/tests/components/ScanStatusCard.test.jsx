import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScanStatusCard from '../../src/components/dashboard/ScanStatusCard';

describe('ScanStatusCard', () => {
  it('shows queued state with accessible waiting indicator', () => {
    render(<ScanStatusCard status="queued" />);
    expect(screen.getByText(/scan queued/i)).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows running state with progress percentage', () => {
    render(<ScanStatusCard status="running" progress={42} progressMessage="Analyzing files…" />);
    expect(screen.getByText(/analyzing repository/i)).toBeInTheDocument();
    expect(screen.getByText(/42%/i)).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '42');
    expect(progressbar).toHaveAttribute('aria-label', 'Scan progress');
  });

  it('shows completed success content', () => {
    render(<ScanStatusCard status="completed" />);
    expect(screen.getByText(/health report ready/i)).toBeInTheDocument();
  });

  it('shows failed state with safe error message', () => {
    render(<ScanStatusCard status="failed" error="Analysis worker timed out." onRetry={vi.fn()} />);
    expect(screen.getByText(/this scan needs another try/i)).toBeInTheDocument();
    expect(screen.getByText(/Analysis worker timed out./i)).toBeInTheDocument();
  });

  it('calls onRetry when Retry scan button is clicked', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ScanStatusCard status="failed" onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: /retry scan/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders nothing when status is null', () => {
    const { container } = render(<ScanStatusCard status={null} />);
    expect(container.firstChild).toBeNull();
  });
});
