import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectActivityFeed from '../components/projects/ProjectActivityFeed';

function renderFeed(props = {}) {
  return render(
    <MemoryRouter>
      <ProjectActivityFeed projectId={10} {...props} />
    </MemoryRouter>
  );
}

describe('ProjectActivityFeed', () => {
  it('renders activity events with issue key links', () => {
    renderFeed({
      events: [
        {
          id: 1,
          eventType: 'STATUS_CHANGED',
          summary: 'Status changed from TODO to IN_PROGRESS',
          issueKey: 'ALP-5',
          createdAt: new Date().toISOString(),
        },
      ],
      totalElements: 1,
    });

    expect(screen.getByText('Project activity')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ALP-5' })).toHaveAttribute(
      'href',
      '/projects/10/issue/ALP-5'
    );
    expect(screen.getByText(/Status changed from TODO to IN_PROGRESS/)).toBeInTheDocument();
  });

  it('shows empty state when there are no events', () => {
    renderFeed({ events: [] });

    expect(screen.getByText('No project activity yet')).toBeInTheDocument();
  });
});
