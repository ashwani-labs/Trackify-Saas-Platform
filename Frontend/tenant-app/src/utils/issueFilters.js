export const FILTER_ALL = 'ALL';
export const ASSIGNEE_UNASSIGNED = 'UNASSIGNED';
export const SPRINT_BACKLOG = 'BACKLOG';

export const DEFAULT_ISSUE_FILTERS = {
  status: FILTER_ALL,
  priority: FILTER_ALL,
  assigneeId: FILTER_ALL,
  sprintId: FILTER_ALL,
};

export function hasActiveIssueFilters(filters) {
  return (
    filters.status !== FILTER_ALL ||
    filters.priority !== FILTER_ALL ||
    filters.assigneeId !== FILTER_ALL ||
    filters.sprintId !== FILTER_ALL
  );
}

function matchesStatus(issue, statusFilter) {
  return !statusFilter || statusFilter === FILTER_ALL || issue.status === statusFilter;
}

function matchesPriority(issue, priorityFilter) {
  return !priorityFilter || priorityFilter === FILTER_ALL || issue.priority === priorityFilter;
}

function matchesAssignee(issue, assigneeFilter) {
  if (!assigneeFilter || assigneeFilter === FILTER_ALL) return true;
  if (assigneeFilter === ASSIGNEE_UNASSIGNED) return !issue.assigneeId;
  return issue.assigneeId === Number(assigneeFilter);
}

function matchesSprint(issue, sprintFilter) {
  if (!sprintFilter || sprintFilter === FILTER_ALL) return true;
  if (sprintFilter === SPRINT_BACKLOG) return !issue.sprintId;
  return issue.sprintId === Number(sprintFilter);
}

export function applyIssueFilters(issues, filters) {
  return issues.filter(
    (issue) =>
      matchesStatus(issue, filters.status) &&
      matchesPriority(issue, filters.priority) &&
      matchesAssignee(issue, filters.assigneeId) &&
      matchesSprint(issue, filters.sprintId)
  );
}

export function shouldShowSprintSection(sprintId, filters) {
  if (filters.sprintId === FILTER_ALL) return true;
  if (filters.sprintId === SPRINT_BACKLOG) return false;
  return Number(filters.sprintId) === sprintId;
}

export function shouldShowBacklogSection(filters) {
  return filters.sprintId === FILTER_ALL || filters.sprintId === SPRINT_BACKLOG;
}
