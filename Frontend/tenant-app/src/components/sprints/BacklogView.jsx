import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateIssue, fetchBacklogIssuesPaged } from '../../features/issues/issueSlice';
import { startSprint, completeSprint } from '../../features/sprints/sprintSlice';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';
import {
  applyIssueFilters,
  shouldShowBacklogSection,
  shouldShowSprintSection,
} from '../../utils/issueFilters';

const IssueListItem = ({ issue, sprints, dispatch }) => {
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
  const { list: sprints } = useSelector((s) => s.sprints);
  const { filters, backlogIssues, backlogPage, backlogTotalPages, backlogTotalElements, isBacklogLoading } =
    useSelector((s) => s.issues);

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
      if (window.confirm('Are you sure you want to complete this sprint?')) {
        await dispatch(completeSprint({ id: sprintId, projectId })).unwrap();
        toast.success('Sprint completed!');
      }
    } catch (e) {
      toast.error(e.message || 'Cannot complete sprint');
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
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
                <IssueListItem key={issue.id} issue={issue} sprints={sprints} dispatch={dispatch} />
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
