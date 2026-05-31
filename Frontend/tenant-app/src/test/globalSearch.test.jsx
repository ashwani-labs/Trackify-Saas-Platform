import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GlobalSearch from '../components/common/GlobalSearch';
import { fetchGlobalSearch } from '../features/search/searchApi';

vi.mock('../features/search/searchApi', () => ({
  fetchGlobalSearch: vi.fn(),
}));

function renderSearch() {
  const store = configureStore({
    reducer: {
      issues: () => ({ selectedIssue: null }),
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <GlobalSearch />
      </MemoryRouter>
    </Provider>
  );
}

describe('GlobalSearch keyboard navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchGlobalSearch.mockResolvedValue({
      projects: [{ id: 1, name: 'Alpha Project', description: 'First project' }],
      issues: [{ id: 2, title: 'Fix bug', issueKey: 'ALP-1', projectId: 1, status: 'TODO' }],
      users: [],
    });
  });

  it('renders search combobox with accessible label', () => {
    renderSearch();
    expect(screen.getByRole('combobox', { name: /search projects/i })).toBeInTheDocument();
  });

  it('highlights and selects results with arrow keys and Enter', async () => {
    renderSearch();
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'alpha' } });

    await waitFor(() => {
      expect(fetchGlobalSearch).toHaveBeenCalledWith('alpha');
    });

    await waitFor(() => {
      expect(screen.getByText('Alpha Project')).toBeInTheDocument();
    });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() => {
      const updated = screen.getAllByRole('option');
      expect(updated[1]).toHaveAttribute('aria-selected', 'true');
    });

    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('closes on Escape', async () => {
    renderSearch();
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'alpha' } });

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(input).toHaveValue('');
    });
  });
});
