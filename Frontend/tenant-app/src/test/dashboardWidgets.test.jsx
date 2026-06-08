import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import MyOpenIssuesWidget from '../components/dashboard/MyOpenIssuesWidget';

function renderWidget(issues = [], isLoading = false) {
  const store = configureStore({
    reducer: { dashboard: dashboardReducer },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <MyOpenIssuesWidget issues={issues} isLoading={isLoading} />
      </MemoryRouter>
    </Provider>
  );
}

describe('MyOpenIssuesWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders assigned issues from dashboard API data', () => {
    renderWidget([
      {
        id: 1,
        issueKey: 'ALP-1',
        title: 'Fix login',
        status: 'TODO',
        priority: 'HIGH',
        projectId: 10,
        projectName: 'Alpha',
      },
    ]);

    expect(screen.getByText('My Open Issues')).toBeInTheDocument();
    expect(screen.getByText('Fix login')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('shows empty state when there are no issues', () => {
    renderWidget([]);

    expect(screen.getByText('No open issues assigned')).toBeInTheDocument();
  });
});
