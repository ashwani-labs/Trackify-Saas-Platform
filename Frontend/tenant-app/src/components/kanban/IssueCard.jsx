import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedIssue } from '../../features/issues/issueSlice';
import { GripVertical } from 'lucide-react';

const PRIORITY_OPTIONS = ['HIGH', 'MEDIUM', 'LOW'];

const PRIORITY_CLASS = {
  HIGH: 'issue-card__priority--high',
  MEDIUM: 'issue-card__priority--medium',
  LOW: 'issue-card__priority--low',
};

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE'];

const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const IssueCard = ({
  issue,
  isDragging,
  onDragStart,
  onDragEnd,
  onPriorityChange,
  onStatusChange,
}) => {
  const dispatch = useDispatch();
  const skipClickRef = useRef(false);

  const issueKey =
    issue.issueKey ||
    (issue.projectHeaderName ? `${issue.projectHeaderName}-${issue.id}` : `ISSUE-${issue.id}`);

  const handleClick = () => {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }
    dispatch(setSelectedIssue(issue));
  };

  const handleDragStart = (e) => {
    skipClickRef.current = true;
    onDragStart?.(issue.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('issueId', String(issue.id));
    e.dataTransfer.setData('currentStatus', issue.status);

    const card = e.currentTarget.closest('.issue-card');
    if (card) {
      e.dataTransfer.setDragImage(card, 24, 20);
    }
  };

  const handleDragEnd = () => {
    onDragEnd?.();
    window.setTimeout(() => {
      skipClickRef.current = false;
    }, 0);
  };

  return (
    <article
      className={`issue-card ${isDragging ? 'issue-card--dragging' : ''}`}
      onClick={handleClick}
    >
      <div className="issue-card__top">
        <button
          type="button"
          className="issue-card__drag-handle"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          aria-label={`Drag ${issue.title}`}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} aria-hidden />
        </button>

        <h4 className="issue-title">{issue.title}</h4>
      </div>

      <div className="issue-meta">
        <span className="issue-key">{issueKey}</span>
        {issue.labels?.length > 0 && (
          <div className="issue-card__labels">
            {issue.labels.map((label) => (
              <span key={label} className="issue-card__label">
                {label}
              </span>
            ))}
          </div>
        )}
        <div className="issue-footer">
          <label className="issue-card__priority-label">
            <span className="sr-only">Status for {issue.title}</span>
            <select
              className="issue-card__status"
              value={issue.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onStatusChange?.(issue, e.target.value)}
              aria-label={`Status for ${issue.title}`}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="issue-card__priority-label">
            <span className="sr-only">Priority for {issue.title}</span>
            <select
              className={`issue-card__priority ${PRIORITY_CLASS[issue.priority] || ''}`}
              value={issue.priority}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onPriorityChange?.(issue, e.target.value)}
              aria-label={`Priority for ${issue.title}`}
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <div
            className="avatar-sm"
            title={issue.assigneeName || 'Unassigned'}
            aria-label={issue.assigneeName ? `Assigned to ${issue.assigneeName}` : 'Unassigned'}
          >
            {(issue.assigneeName || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </article>
  );
};

export default IssueCard;
