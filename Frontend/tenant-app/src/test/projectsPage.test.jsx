import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProjectsPage from '../pages/ProjectsPage';
import { ROLES } from '@trackify/shared';

vi.mock('../features/projects/projectSlice', () => ({
  fetchProjects: vi.fn(() => ({ type: 'projects/fetch' })),
  clearProjectError: vi.fn(() => ({ type: 'projects/clearError' })),
}));

function renderProjectsPage({ projects = [], role = ROLES.ADMIN } = {}) {
  const store = configureStore({
    reducer: {
      projects: () => ({
        projects,
        currentPage: 0,
        totalPages: 1,
        isLoading: false,
        error: null,
      }),
      auth: () => ({
        user: { role },
      }),
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    </Provider>
  );
}

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders project cards when projects exist', () => {
    renderProjectsPage({
      projects: [
        {
          id: 1,
          name: 'Apollo Mission',
          key: 'APO',
          totalIssues: 5,
          doneCount: 2,
          inProgressCount: 1,
        },
      ],
    });

    expect(screen.getByText('Apollo Mission')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apollo mission/i })).toBeInTheDocument();
  });

  it('shows empty state when there are no projects', () => {
    renderProjectsPage({ projects: [] });
    expect(screen.getByText('No projects yet')).toBeInTheDocument();
  });
});
