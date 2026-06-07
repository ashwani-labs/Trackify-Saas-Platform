import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import IssueFilterBar from '../components/issues/IssueFilterBar';
import issueReducer from '../features/issues/issueSlice';

function renderFilterBar(overrides = {}) {
  const store = configureStore({
    reducer: {
      issues: issueReducer,
      sprints: () => ({
        list: [
          { id: 1, name: 'Sprint 1', status: 'ACTIVE' },
          { id: 2, name: 'Sprint 2', status: 'PLANNED' },
        ],
      }),
      projects: () => ({
        members: [
          { userId: 10, userName: 'Alice', userEmail: 'alice@example.com' },
          { userId: 20, userName: 'Bob', userEmail: 'bob@example.com' },
        ],
      }),
    },
    preloadedState: {
      issues: {
        issues: [],
        comments: {},
        activity: {},
        selectedIssue: null,
        isActivityLoading: false,
        filters: {
          status: 'ALL',
          priority: 'ALL',
          assigneeId: 'ALL',
          sprintId: 'ALL',
        },
        backlogIssues: [],
        backlogPage: 0,
        backlogTotalPages: 0,
        backlogTotalElements: 0,
        isBacklogLoading: false,
        isLoading: false,
        isCommentLoading: false,
        isAttachmentLoading: false,
        error: null,
        ...overrides.issues,
      },
    },
  });

  return render(
    <Provider store={store}>
      <IssueFilterBar />
    </Provider>
  );
}

describe('IssueFilterBar', () => {
  it('renders all quick filter controls', () => {
    renderFilterBar();

    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by assignee')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by sprint')).toBeInTheDocument();
  });

  it('lists assignees and sprints in dropdowns', () => {
    renderFilterBar();

    expect(screen.getByRole('option', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Sprint 1 (ACTIVE)' })).toBeInTheDocument();
  });

  it('shows clear button when a filter is active', () => {
    renderFilterBar({
      issues: {
        filters: {
          status: 'TODO',
          priority: 'ALL',
          assigneeId: 'ALL',
          sprintId: 'ALL',
        },
      },
    });

    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', () => {
    renderFilterBar({
      issues: {
        filters: {
          status: 'TODO',
          priority: 'HIGH',
          assigneeId: '10',
          sprintId: '1',
        },
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByLabelText('Filter by status')).toHaveValue('ALL');
    expect(screen.getByLabelText('Filter by priority')).toHaveValue('ALL');
    expect(screen.getByLabelText('Filter by assignee')).toHaveValue('ALL');
    expect(screen.getByLabelText('Filter by sprint')).toHaveValue('ALL');
  });
});
