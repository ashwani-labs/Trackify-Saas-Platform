import { describe, it, expect } from 'vitest';
import {
  applyIssueFilters,
  hasActiveIssueFilters,
  shouldShowBacklogSection,
  shouldShowSprintSection,
  DEFAULT_ISSUE_FILTERS,
} from '../utils/issueFilters';

const sampleIssues = [
  { id: 1, status: 'TODO', priority: 'HIGH', assigneeId: 10, sprintId: 100 },
  { id: 2, status: 'IN_PROGRESS', priority: 'LOW', assigneeId: null, sprintId: null },
  { id: 3, status: 'DONE', priority: 'MEDIUM', assigneeId: 20, sprintId: 200 },
];

describe('issueFilters', () => {
  it('returns all issues when filters are default', () => {
    expect(applyIssueFilters(sampleIssues, DEFAULT_ISSUE_FILTERS)).toHaveLength(3);
  });

  it('filters by status, priority, assignee, and sprint', () => {
    const filtered = applyIssueFilters(sampleIssues, {
      ...DEFAULT_ISSUE_FILTERS,
      status: 'TODO',
      priority: 'HIGH',
      assigneeId: '10',
      sprintId: '100',
    });

    expect(filtered).toEqual([sampleIssues[0]]);
  });

  it('matches unassigned issues', () => {
    const filtered = applyIssueFilters(sampleIssues, {
      ...DEFAULT_ISSUE_FILTERS,
      assigneeId: 'UNASSIGNED',
    });

    expect(filtered).toEqual([sampleIssues[1]]);
  });

  it('matches backlog-only issues', () => {
    const filtered = applyIssueFilters(sampleIssues, {
      ...DEFAULT_ISSUE_FILTERS,
      sprintId: 'BACKLOG',
    });

    expect(filtered).toEqual([sampleIssues[1]]);
  });

  it('detects active filters', () => {
    expect(hasActiveIssueFilters(DEFAULT_ISSUE_FILTERS)).toBe(false);
    expect(hasActiveIssueFilters({ ...DEFAULT_ISSUE_FILTERS, status: 'TODO' })).toBe(true);
  });

  it('controls sprint section visibility', () => {
    expect(shouldShowSprintSection(100, DEFAULT_ISSUE_FILTERS)).toBe(true);
    expect(shouldShowSprintSection(100, { ...DEFAULT_ISSUE_FILTERS, sprintId: '100' })).toBe(
      true
    );
    expect(shouldShowSprintSection(200, { ...DEFAULT_ISSUE_FILTERS, sprintId: '100' })).toBe(
      false
    );
    expect(shouldShowSprintSection(100, { ...DEFAULT_ISSUE_FILTERS, sprintId: 'BACKLOG' })).toBe(
      false
    );
  });

  it('controls backlog section visibility', () => {
    expect(shouldShowBacklogSection(DEFAULT_ISSUE_FILTERS)).toBe(true);
    expect(shouldShowBacklogSection({ ...DEFAULT_ISSUE_FILTERS, sprintId: 'BACKLOG' })).toBe(true);
    expect(shouldShowBacklogSection({ ...DEFAULT_ISSUE_FILTERS, sprintId: '100' })).toBe(false);
  });
});
