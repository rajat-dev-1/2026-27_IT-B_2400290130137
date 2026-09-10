import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IssueFilters from '../../src/components/repository/IssueFilters';

function renderFilters(overrides = {}) {
  const defaults = { severity: 'all', type: 'all', priority: 'all' };
  const setFilters = vi.fn();
  render(<IssueFilters filters={{ ...defaults, ...overrides }} setFilters={setFilters} />);
  return { setFilters };
}

describe('IssueFilters', () => {
  it('renders all three filter selects', () => {
    renderFilters();
    // All three select elements should be present
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(3);
  });

  it('calls setFilters when severity changes', async () => {
    const user = userEvent.setup();
    const { setFilters } = renderFilters();
    const selects = screen.getAllByRole('combobox');
    // Priority first, severity second based on render order
    const severitySelect = selects[1];
    await user.selectOptions(severitySelect, 'critical');
    expect(setFilters).toHaveBeenCalledWith(expect.any(Function));
  });

  it('calls setFilters when type changes', async () => {
    const user = userEvent.setup();
    const { setFilters } = renderFilters();
    const selects = screen.getAllByRole('combobox');
    const typeSelect = selects[2];
    await user.selectOptions(typeSelect, 'complexity');
    expect(setFilters).toHaveBeenCalled();
  });

  it('calls setFilters when priority changes', async () => {
    const user = userEvent.setup();
    const { setFilters } = renderFilters();
    const selects = screen.getAllByRole('combobox');
    const prioritySelect = selects[0];
    await user.selectOptions(prioritySelect, 'P1');
    expect(setFilters).toHaveBeenCalled();
  });

  it('shows Clear button when any filter is active', () => {
    renderFilters({ severity: 'critical' });
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('does not show Clear button when all filters are default', () => {
    renderFilters();
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('calls setFilters with all defaults when Clear is clicked', async () => {
    const user = userEvent.setup();
    const { setFilters } = renderFilters({ severity: 'high' });
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(setFilters).toHaveBeenCalledWith({ severity: 'all', type: 'all', priority: 'all' });
  });
});
