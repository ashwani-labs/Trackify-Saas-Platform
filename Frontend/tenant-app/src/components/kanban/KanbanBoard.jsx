import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateIssue, optimisticStatusUpdate } from '../../features/issues/issueSlice';
import IssueCard from './IssueCard';
import { Plus } from 'lucide-react';
import { Button } from '@trackify/shared';

const COLUMNS = [
  { status: 'TODO', label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'DONE', label: 'Done' },
];

const KanbanBoard = ({ filteredIssues, onCreateIssue }) => {
  const dispatch = useDispatch();
  const { issues: allIssues, isLoading } = useSelector((state) => state.issues);
  const issues = filteredIssues ?? allIssues;
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const issuesByStatus = (status) => issues.filter((i) => i.status === status);

  const handleDragOver = (e, status) => {
    e.preventDefault();
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const issueId = Number(e.dataTransfer.getData('issueId'));
    const currentStatus = e.dataTransfer.getData('currentStatus');

    if (currentStatus === newStatus) return;

    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    dispatch(optimisticStatusUpdate({ id: issueId, status: newStatus }));

    dispatch(
      updateIssue({
        id: issueId,
        data: {
          title: issue.title,
          description: issue.description,
          status: newStatus,
          priority: issue.priority,
          assigneeId: issue.assigneeId,
          projectId: issue.projectId,
        },
      })
    );
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

  return (
    <div className="kanban-board">
      {COLUMNS.map(({ status, label }) => {
        const columnIssues = issuesByStatus(status);
        return (
          <div
            key={status}
            className={`kanban-column ${dragOverColumn === status ? 'kanban-column--drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="column-header">
              <span className="column-title">
                {label}
                <span className="column-count">{columnIssues.length}</span>
              </span>
            </div>

            <div className="kanban-list">
              {columnIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}

              {status === 'TODO' && (
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
