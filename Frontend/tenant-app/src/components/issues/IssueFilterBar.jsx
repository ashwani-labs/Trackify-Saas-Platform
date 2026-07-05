import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setFilters, clearFilters } from '../../features/issues/issueSlice';
import { SlidersHorizontal, X, BookmarkPlus } from 'lucide-react';
import { hasActiveIssueFilters, SPRINT_BACKLOG } from '../../utils/issueFilters';
import { loadSavedFilters, saveFilterPreset, deleteFilterPreset } from '../../utils/savedFilters';
import { Button, Select } from '@trackify/shared';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'ALL', label: 'All Priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const IssueFilterBar = () => {
  const dispatch = useDispatch();
  const { id: projectId } = useParams();
  const { filters } = useSelector((s) => s.issues);
  const { list: sprints } = useSelector((s) => s.sprints);
  const { members } = useSelector((s) => s.projects);
  const [savedFilters, setSavedFilters] = useState(() => loadSavedFilters(projectId));
  const [presetName, setPresetName] = useState('');

  const assigneeOptions = useMemo(() => {
    const options = [{ value: 'ALL', label: 'All Assignees' }, { value: 'UNASSIGNED', label: 'Unassigned' }];
    return options.concat(
      [...members]
        .map((member) => ({
          value: String(member.userId),
          label: member.userName || member.userEmail || 'Unknown',
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );
  }, [members]);

  const sprintOptions = useMemo(() => {
    const options = [
      { value: 'ALL', label: 'All Sprints' },
      { value: SPRINT_BACKLOG, label: 'Backlog only' },
    ];
    return options.concat(
      [...sprints]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((sprint) => ({ value: String(sprint.id), label: `${sprint.name} (${sprint.status})` }))
    );
  }, [sprints]);

  const hasActiveFilters = hasActiveIssueFilters(filters);

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name || !projectId) return;
    const next = saveFilterPreset(projectId, name, filters);
    setSavedFilters(next);
    setPresetName('');
  };

  const handleApplyPreset = (preset) => {
    dispatch(setFilters(preset.filters));
  };

  const handleDeletePreset = (presetId) => {
    if (!projectId) return;
    setSavedFilters(deleteFilterPreset(projectId, presetId));
  };

  return (
    <div className="issue-filter-bar" role="group" aria-label="Issue filters">
      <SlidersHorizontal size={18} className="issue-filter-bar__icon" aria-hidden />

      <Select
        className="issue-filter-bar__select"
        value={filters.status || 'ALL'}
        onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
        aria-label="Filter by status"
        options={STATUS_OPTIONS}
      />

      <Select
        className="issue-filter-bar__select"
        value={filters.priority || 'ALL'}
        onChange={(e) => dispatch(setFilters({ priority: e.target.value }))}
        aria-label="Filter by priority"
        options={PRIORITY_OPTIONS}
      />

      <Select
        className="issue-filter-bar__select"
        value={filters.assigneeId || 'ALL'}
        onChange={(e) => dispatch(setFilters({ assigneeId: e.target.value }))}
        aria-label="Filter by assignee"
        options={assigneeOptions}
      />

      <Select
        className="issue-filter-bar__select"
        value={filters.sprintId || 'ALL'}
        onChange={(e) => dispatch(setFilters({ sprintId: e.target.value }))}
        aria-label="Filter by sprint"
        options={sprintOptions}
      />

      {savedFilters.length > 0 && (
        <Select
          className="issue-filter-bar__select"
          value=""
          onChange={(e) => {
            const preset = savedFilters.find((item) => item.id === e.target.value);
            if (preset) handleApplyPreset(preset);
          }}
          aria-label="Saved filter views"
          options={[
            { value: '', label: 'Saved views…' },
            ...savedFilters.map((preset) => ({ value: preset.id, label: preset.name })),
          ]}
        />
      )}

      <div className="issue-filter-bar__save">
        <input
          type="text"
          className="input issue-filter-bar__preset-input"
          placeholder="View name"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          aria-label="Saved view name"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<BookmarkPlus size={14} />}
          onClick={handleSavePreset}
          disabled={!presetName.trim()}
        >
          Save view
        </Button>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          className="btn btn-secondary issue-filter-bar__clear"
          onClick={() => dispatch(clearFilters())}
        >
          <X size={14} aria-hidden /> Clear filters
        </button>
      )}

      {savedFilters.map((preset) => (
        <button
          key={preset.id}
          type="button"
          className="issue-filter-bar__preset-chip"
          onClick={() => handleDeletePreset(preset.id)}
          title="Remove saved view"
        >
          {preset.name} ×
        </button>
      ))}
    </div>
  );
};

export default IssueFilterBar;
