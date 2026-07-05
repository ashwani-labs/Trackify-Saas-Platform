import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import IssueDetailPanel from '../components/issues/IssueDetailPanel';

vi.mock('../features/issues/issueSlice', async () => {
  const actual = await vi.importActual('../features/issues/issueSlice');
  return {
    ...actual,
    fetchIssueComments: vi.fn(() => ({ type: 'issues/fetchComments' })),
    fetchIssueActivity: vi.fn(() => ({ type: 'issues/fetchActivity' })),
    clearSelectedIssue: vi.fn(() => ({ type: 'issues/clearSelected' })),
  };
});

function renderPanel(overrides = {}) {
  const store = configureStore({
    reducer: {
      issues: () => ({
        selectedIssue: {
          id: 1,
          issueKey: 'APO-1',
          title: 'Fix login bug',
          description: 'Users cannot sign in on mobile.',
          status: 'TODO',
          priority: 'HIGH',
          projectId: 10,
          attachments: [],
          ...overrides.selectedIssue,
        },
        comments: { 1: overrides.comments || [] },
        activity: { 1: overrides.activity || [] },
        isCommentLoading: false,
        isActivityLoading: false,
        isAttachmentLoading: false,
      }),
      sprints: () => ({ list: [] }),
    },
  });

  return render(
    <Provider store={store}>
      <IssueDetailPanel />
    </Provider>
  );
}

describe('IssueDetailPanel tabs', () => {
  it('renders sticky header with issue key and title', () => {
    renderPanel();
    expect(screen.getByText('APO-1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fix login bug' })).toBeInTheDocument();
  });

  it('shows details tab by default and switches to activity and comments', async () => {
    const user = userEvent.setup();
    renderPanel({
      comments: [{ id: 1, userId: 2, content: 'Looks good', createdAt: '2026-07-01T10:00:00Z' }],
      activity: [{ id: 1, eventType: 'ISSUE_CREATED', createdAt: '2026-07-01T09:00:00Z' }],
    });

    expect(screen.getByRole('tab', { name: /details/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Users cannot sign in on mobile.')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /activity/i }));
    expect(screen.getByRole('tab', { name: /activity/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('Users cannot sign in on mobile.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /comments/i }));
    expect(screen.getByRole('tab', { name: /comments/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Looks good')).toBeInTheDocument();
  });
});
