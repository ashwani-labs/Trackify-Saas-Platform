import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters } from '../../features/issues/issueSlice';
import { SlidersHorizontal, X } from 'lucide-react';
import { hasActiveIssueFilters, SPRINT_BACKLOG } from '../../utils/issueFilters';

const STATUS_OPTIONS = ['ALL', 'TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITY_OPTIONS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const STATUS_LABELS = {
  ALL: 'All Status',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};
const PRIORITY_LABELS = {
  ALL: 'All Priority',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const IssueFilterBar = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((s) => s.issues);
  const { list: sprints } = useSelector((s) => s.sprints);
  const { members } = useSelector((s) => s.projects);

  const assigneeOptions = useMemo(() => {
    return [...members]
      .map((member) => ({
        id: member.userId,
        name: member.userName || member.userEmail || 'Unknown',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members]);

  const sprintOptions = useMemo(() => {
    return [...sprints].sort((a, b) => a.name.localeCompare(b.name));
  }, [sprints]);

  const hasActiveFilters = hasActiveIssueFilters(filters);

  return (
    <div className="issue-filter-bar" role="group" aria-label="Issue filters">
      <SlidersHorizontal size={18} className="issue-filter-bar__icon" aria-hidden />

      <select
        className="input-field issue-filter-bar__select"
        value={filters.status || 'ALL'}
        onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        className="input-field issue-filter-bar__select"
        value={filters.priority || 'ALL'}
        onChange={(e) => dispatch(setFilters({ priority: e.target.value }))}
        aria-label="Filter by priority"
      >
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>

      <select
        className="input-field issue-filter-bar__select"
        value={filters.assigneeId || 'ALL'}
        onChange={(e) => dispatch(setFilters({ assigneeId: e.target.value }))}
        aria-label="Filter by assignee"
      >
        <option value="ALL">All Assignees</option>
        <option value="UNASSIGNED">Unassigned</option>
        {assigneeOptions.map((assignee) => (
          <option key={assignee.id} value={String(assignee.id)}>
            {assignee.name}
          </option>
        ))}
      </select>

      <select
        className="input-field issue-filter-bar__select"
        value={filters.sprintId || 'ALL'}
        onChange={(e) => dispatch(setFilters({ sprintId: e.target.value }))}
        aria-label="Filter by sprint"
      >
        <option value="ALL">All Sprints</option>
        <option value={SPRINT_BACKLOG}>Backlog only</option>
        {sprintOptions.map((sprint) => (
          <option key={sprint.id} value={String(sprint.id)}>
            {sprint.name} ({sprint.status})
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          className="btn btn-secondary issue-filter-bar__clear"
          onClick={() => dispatch(clearFilters())}
        >
          <X size={14} aria-hidden /> Clear filters
        </button>
      )}
    </div>
  );
};

export default IssueFilterBar;
