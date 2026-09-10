import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock all external hooks and contexts
vi.mock('../../src/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../src/hooks/useRepositories', () => ({ useRepositories: vi.fn() }));
vi.mock('../../src/hooks/useScan', () => ({ useScan: vi.fn() }));
vi.mock('../../src/hooks/useScanPolling', () => ({ useScanPolling: vi.fn() }));
vi.mock('../../src/services/repositoryApi', () => ({
  repositoryApi: {
    getLatestScan: vi.fn(),
    getIssues: vi.fn(),
    getRecommendations: vi.fn(),
  },
}));

import { useAuth } from '../../src/hooks/useAuth';
import { useRepositories } from '../../src/hooks/useRepositories';
import { useScan } from '../../src/hooks/useScan';
import { useScanPolling } from '../../src/hooks/useScanPolling';
import { repositoryApi } from '../../src/services/repositoryApi';
import DashboardPage from '../../src/pages/DashboardPage';

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useScan.mockReturnValue({ activeScan: null, startScan: vi.fn(), retryScan: vi.fn(), isStartingScan: false });
    useScanPolling.mockReturnValue(undefined);
    useAuth.mockReturnValue({ user: { username: 'dev' }, isAuthenticated: true });
  });

  it('shows no-repositories empty state when repository list is empty', () => {
    useRepositories.mockReturnValue({
      repositories: [],
      selectedRepository: null,
      selectRepository: vi.fn(),
      isLoadingRepositories: false,
      repositoryError: null,
    });
    renderDashboard();
    expect(screen.getByText(/no repositories available/i)).toBeInTheDocument();
  });

  it('shows no-scan empty state with Run first scan action when repo has no completed scan', async () => {
    const repo = { id: 'repo-1', name: 'codehealth-demo' };
    useRepositories.mockReturnValue({
      repositories: [repo],
      selectedRepository: repo,
      selectRepository: vi.fn(),
      isLoadingRepositories: false,
      repositoryError: null,
    });
    repositoryApi.getLatestScan.mockResolvedValue(null);
    repositoryApi.getIssues.mockResolvedValue([]);
    repositoryApi.getRecommendations.mockResolvedValue([]);

    renderDashboard();

    // Wait for async state to settle
    await screen.findByText(/no scan results yet/i);
    expect(screen.getByRole('button', { name: /run first scan/i })).toBeInTheDocument();
  });

  it('shows ErrorState with retry when repository fetch fails', () => {
    useRepositories.mockReturnValue({
      repositories: [],
      selectedRepository: null,
      selectRepository: vi.fn(),
      isLoadingRepositories: false,
      repositoryError: 'We could not load your repositories. Try again.',
    });
    renderDashboard();
    expect(screen.getByText(/repositories unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });
});
