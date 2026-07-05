import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  updateIssue,
  optimisticStatusUpdate,
  optimisticPriorityUpdate,
} from '../../features/issues/issueSlice';
import IssueCard from './IssueCard';
import { Plus } from 'lucide-react';
import { Button } from '@trackify/shared';

const COLUMNS = [
  { status: 'TODO', label: 'To Do', accent: 'todo' },
  { status: 'IN_PROGRESS', label: 'In Progress', accent: 'progress' },
  { status: 'DONE', label: 'Done', accent: 'done' },
];

const buildUpdatePayload = (issue, overrides) => ({
  title: issue.title,
  description: issue.description,
  status: overrides.status ?? issue.status,
  priority: overrides.priority ?? issue.priority,
  assigneeId: issue.assigneeId,
  projectId: issue.projectId,
});

const KanbanBoard = ({ filteredIssues, onCreateIssue }) => {
  const dispatch = useDispatch();
  const { issues: allIssues, isLoading } = useSelector((state) => state.issues);
  const issues = filteredIssues ?? allIssues;
  const [draggingIssueId, setDraggingIssueId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const issuesByStatus = useCallback((status) => issues.filter((i) => i.status === status), [issues]);

  const handleDragStart = (issueId) => {
    setDraggingIssueId(issueId);
  };

  const handleDragEnd = () => {
    setDraggingIssueId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e, status) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverColumn((prev) => (prev === status ? null : prev));
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    setDraggingIssueId(null);

    const issueId = Number(e.dataTransfer.getData('issueId'));
    const previousStatus = e.dataTransfer.getData('currentStatus');

    if (!issueId || previousStatus === newStatus) return;

    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    const columnLabel = COLUMNS.find((c) => c.status === newStatus)?.label || newStatus;

    dispatch(optimisticStatusUpdate({ id: issueId, status: newStatus }));

    try {
      await dispatch(
        updateIssue({
          id: issueId,
          data: buildUpdatePayload(issue, { status: newStatus }),
        })
      ).unwrap();
      toast.success(`Moved to ${columnLabel}`);
    } catch (err) {
      dispatch(optimisticStatusUpdate({ id: issueId, status: previousStatus }));
      toast.error(typeof err === 'string' ? err : 'Failed to move issue');
    }
  };

  const handlePriorityChange = async (issue, priority) => {
    if (issue.priority === priority) return;

    const previousPriority = issue.priority;
    dispatch(optimisticPriorityUpdate({ id: issue.id, priority }));

    try {
      await dispatch(
        updateIssue({
          id: issue.id,
          data: buildUpdatePayload(issue, { priority }),
        })
      ).unwrap();
    } catch (err) {
      dispatch(optimisticPriorityUpdate({ id: issue.id, priority: previousPriority }));
      toast.error(typeof err === 'string' ? err : 'Failed to update priority');
    }
  };

  if (isLoading && issues.length === 0) {
    return (
      <div className="kanban-board">
        {COLUMNS.map(({ status }) => (
          <div key={status} className="kanban-column skeleton" style={{ height: '500px' }} />
        ))}
      </div>
    );
  }

  const isDragging = draggingIssueId !== null;

  return (
    <div className={`kanban-board ${isDragging ? 'kanban-board--dragging' : ''}`}>
      {COLUMNS.map(({ status, label, accent }) => {
        const columnIssues = issuesByStatus(status);
        const isDropTarget = dragOverColumn === status;

        return (
          <div
            key={status}
            className={[
              'kanban-column',
              `kanban-column--${accent}`,
              isDropTarget ? 'kanban-column--drag-over' : '',
              isDragging && columnIssues.length === 0 ? 'kanban-column--empty-drop' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={(e) => handleDragLeave(e, status)}
            onDrop={(e) => handleDrop(e, status)}
            role="region"
            aria-label={`${label} column, ${columnIssues.length} issues`}
          >
            <div className="column-header">
              <span className="column-title">
                {label}
                <span className="column-count">{columnIssues.length}</span>
              </span>
            </div>

            <div className="kanban-list">
              {columnIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  isDragging={draggingIssueId === issue.id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onPriorityChange={handlePriorityChange}
                />
              ))}

              {isDragging && columnIssues.length === 0 && (
                <div className="kanban-drop-placeholder" aria-hidden>
                  Drop here
                </div>
              )}

              {status === 'TODO' && !isDragging && (
                <Button
                  variant="ghost"
                  className="kanban-add-btn"
                  leftIcon={<Plus size={16} />}
                  onClick={() => onCreateIssue()}
                >
                  Create issue
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
