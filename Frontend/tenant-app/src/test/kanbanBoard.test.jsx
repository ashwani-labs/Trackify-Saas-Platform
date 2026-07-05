import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import KanbanBoard from '../components/kanban/KanbanBoard';
import issueReducer from '../features/issues/issueSlice';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const updateIssueMock = vi.fn();

vi.mock('../features/issues/issueSlice', async (importOriginal) => {
  const actual = await importOriginal();
  const fulfilled = { type: 'issues/update/fulfilled', match: (a) => a.type === 'issues/update/fulfilled' };

  return {
    ...actual,
    updateIssue: Object.assign(
      (payload) => async (dispatch) => {
        updateIssueMock(payload);
        const result = { ...payload.data, id: payload.id };
        dispatch({ type: fulfilled.type, payload: result });
        return result;
      },
      { fulfilled, pending: { type: 'issues/update/pending' }, rejected: { type: 'issues/update/rejected' } }
    ),
  };
});

const sampleIssues = [
  {
    id: 1,
    title: 'Fix login bug',
    status: 'TODO',
    priority: 'HIGH',
    projectId: 10,
    issueKey: 'APO-1',
  },
  {
    id: 2,
    title: 'Update docs',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    projectId: 10,
    issueKey: 'APO-2',
  },
];

function renderBoard(issues = sampleIssues) {
  const store = configureStore({
    reducer: { issues: issueReducer },
    preloadedState: {
      issues: {
        issues,
        comments: {},
        activity: {},
        selectedIssue: null,
        isActivityLoading: false,
        filters: {
          status: 'ALL',
          priority: 'ALL',
          assigneeId: 'ALL',
          sprintId: 'ALL',
          search: '',
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
      },
    },
  });

  return render(
    <Provider store={store}>
      <KanbanBoard onCreateIssue={vi.fn()} />
    </Provider>
  );
}

describe('KanbanBoard', () => {
  beforeEach(() => {
    updateIssueMock.mockClear();
  });

  it('renders columns with issue counts', () => {
    renderBoard();
    expect(screen.getByRole('region', { name: /to do column/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /in progress column/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /done column/i })).toBeInTheDocument();
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByText('Update docs')).toBeInTheDocument();
  });

  it('highlights drop target while dragging over a column', () => {
    renderBoard();
    const inProgressColumn = screen.getByRole('region', { name: /in progress column/i });

    fireEvent.dragOver(inProgressColumn, {
      dataTransfer: { dropEffect: 'move' },
    });

    expect(inProgressColumn.className).toContain('kanban-column--drag-over');
  });

  it('updates priority optimistically when changed on the card', async () => {
    const user = userEvent.setup();
    renderBoard();

    const prioritySelect = screen.getAllByLabelText(/priority for fix login bug/i)[0];
    await user.selectOptions(prioritySelect, 'MEDIUM');

    expect(updateIssueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        data: expect.objectContaining({ priority: 'MEDIUM' }),
      })
    );
  });
});
