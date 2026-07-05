import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateIssue, fetchBacklogIssuesPaged } from '../../features/issues/issueSlice';
import { startSprint, completeSprint } from '../../features/sprints/sprintSlice';
import Pagination from '../common/Pagination';
import SprintBurndownChart from './SprintBurndownChart';
import toast from 'react-hot-toast';
import { useConfirmDialog, Button } from '@trackify/shared';
import {
  applyIssueFilters,
  shouldShowBacklogSection,
  shouldShowSprintSection,
} from '../../utils/issueFilters';

const IssueListItem = ({ issue, sprints, dispatch, selected, onToggleSelect }) => {
  const handleSprintChange = (e) => {
    const sprintId = e.target.value === '' ? null : Number(e.target.value);
    dispatch(
      updateIssue({
        id: issue.id,
        data: { sprintId, projectId: issue.projectId },
      })
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-main)',
        gap: '16px',
        transition: 'background 0.15s',
      }}
    >
      {onToggleSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(issue.id)}
          aria-label={`Select issue ${issue.title}`}
        />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
          {issue.projectHeaderName}-{issue.id} : {issue.title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Status: {issue.status} | Priority: {issue.priority}
        </div>
      </div>
      <div>
        <select
          value={issue.sprintId || ''}
          onChange={handleSprintChange}
          style={{
            padding: '6px 10px',
            background: 'var(--bg-input)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
          }}
        >
          <option value="">-- Backlog --</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.status})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      borderBottom: '1px solid var(--border-main)',
      gap: '16px',
    }}
  >
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="skeleton" style={{ height: '14px', width: '60%', borderRadius: '4px' }} />
      <div className="skeleton" style={{ height: '10px', width: '35%', borderRadius: '4px' }} />
    </div>
    <div className="skeleton" style={{ height: '32px', width: '120px', borderRadius: '4px' }} />
  </div>
);

const BacklogView = ({ projectId, issues, onCreateSprint }) => {
  const dispatch = useDispatch();
  const { confirm, dialog } = useConfirmDialog();
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('TODO');
  const { list: sprints } = useSelector((s) => s.sprints);
  const {
    filters,
    backlogIssues,
    backlogPage,
    backlogTotalPages,
    backlogTotalElements,
    isBacklogLoading,
  } = useSelector((s) => s.issues);

  const visibleSprints = useMemo(
    () => sprints.filter((s) => s.status !== 'COMPLETED' && shouldShowSprintSection(s.id, filters)),
    [sprints, filters]
  );

  const filteredBacklogIssues = useMemo(
    () => applyIssueFilters(backlogIssues, filters),
    [backlogIssues, filters]
  );

  const showBacklog = shouldShowBacklogSection(filters);

  useEffect(() => {
    dispatch(fetchBacklogIssuesPaged({ projectId, page: 0, size: 20 }));
  }, [dispatch, projectId]);

  const handlePageChange = (page) => {
    dispatch(fetchBacklogIssuesPaged({ projectId, page, size: 20 }));
  };

  // Issues assigned to sprints (from the full issues list)
  const handleStart = async (sprintId) => {
    try {
      await dispatch(startSprint({ id: sprintId, projectId })).unwrap();
      toast.success('Sprint started!');
    } catch (e) {
      toast.error(e.message || 'Cannot start sprint');
    }
  };

  const handleComplete = async (sprintId) => {
    try {
      const confirmed = await confirm({
        title: 'Complete sprint?',
        message:
          'Incomplete issues will move back to the backlog. You can start a new sprint afterward.',
        confirmLabel: 'Complete sprint',
      });
      if (!confirmed) return;

      await dispatch(completeSprint({ id: sprintId, projectId })).unwrap();
      toast.success('Sprint completed!');
    } catch (e) {
      toast.error(e.message || 'Cannot complete sprint');
    }
  };

  const toggleSelect = (issueId) => {
    setSelectedIds((prev) =>
      prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]
    );
  };

  const handleBulkStatus = async () => {
    if (!selectedIds.length) return;
    await Promise.all(
      selectedIds.map((id) =>
        dispatch(
          updateIssue({
            id,
            data: { status: bulkStatus, projectId },
          })
        )
      )
    );
    toast.success(`Updated ${selectedIds.length} issue(s)`);
    setSelectedIds([]);
  };

  return (
    <div style={{ padding: '24px 0' }}>
      {dialog}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Sprints & Backlog</h2>
        <button
          onClick={onCreateSprint}
          className="btn btn-primary"
          style={{ padding: '8px 16px' }}
        >
          + Create Sprint
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Planned / Active Sprints */}
        {visibleSprints.map((sprint) => {
          const sprintIssues = applyIssueFilters(
            issues.filter((i) => i.sprintId === sprint.id),
            { ...filters, sprintId: 'ALL' }
          );
          return (
            <div key={sprint.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '16px',
                  background: 'var(--bg-input)',
                  borderBottom: '1px solid var(--border-main)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--text-main)',
                    }}
                  >
                    {sprint.name}
                    <span
                      className={`badge badge-${sprint.status === 'ACTIVE' ? 'success' : 'primary'}`}
                      style={{ fontSize: '11px' }}
                    >
                      {sprint.status}
                    </span>
                  </h3>
                  {sprint.goal && (
                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {sprint.goal}
                    </p>
                  )}
                </div>
                <div>
                  {sprint.status === 'PLANNED' && (
                    <button
                      onClick={() => handleStart(sprint.id)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      Start Sprint
                    </button>
                  )}
                  {sprint.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleComplete(sprint.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
              {sprint.status === 'ACTIVE' && (
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-main)' }}>
                  <SprintBurndownChart sprint={sprint} issues={issues} />
                </div>
              )}
              <div style={{ minHeight: '60px' }}>
                {sprintIssues.length === 0 ? (
                  <p
                    style={{
                      padding: '16px',
                      margin: 0,
                      color: 'var(--text-muted)',
                      fontSize: '14px',
                      textAlign: 'center',
                    }}
                  >
                    No issues planned in this sprint.
                  </p>
                ) : (
                  sprintIssues.map((issue) => (
                    <IssueListItem
                      key={issue.id}
                      issue={issue}
                      sprints={sprints}
                      dispatch={dispatch}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Paginated Backlog */}
        {showBacklog && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px',
                background: 'var(--bg-input)',
                borderBottom: '1px solid var(--border-main)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>
                Backlog
                {backlogTotalElements > 0 && (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '400',
                      color: 'var(--text-muted)',
                      marginLeft: '0.75rem',
                    }}
                  >
                    {backlogTotalElements} issue{backlogTotalElements !== 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              {selectedIds.length > 0 && (
                <div className="bulk-actions-bar">
                  <span>{selectedIds.length} selected</span>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="input-field"
                    aria-label="Bulk status"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                  <Button size="sm" onClick={handleBulkStatus}>
                    Apply status
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                    Clear
                  </Button>
                </div>
              )}
            </div>
            <div style={{ minHeight: '100px' }}>
              {isBacklogLoading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </>
              ) : filteredBacklogIssues.length === 0 ? (
                <p
                  style={{
                    padding: '16px',
                    margin: 0,
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  Your backlog is empty.
                </p>
              ) : (
                filteredBacklogIssues.map((issue) => (
                  <IssueListItem
                    key={issue.id}
                    issue={issue}
                    sprints={sprints}
                    dispatch={dispatch}
                    selected={selectedIds.includes(issue.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))
              )}
            </div>
            {backlogTotalPages > 1 && (
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border-main)' }}>
                <Pagination
                  currentPage={backlogPage}
                  totalPages={backlogTotalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BacklogView;
