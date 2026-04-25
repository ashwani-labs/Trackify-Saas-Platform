import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateIssue,
  optimisticStatusUpdate,
} from '../../features/issues/issueSlice';
import IssueCard from './IssueCard';
import { Plus } from 'lucide-react';

const COLUMNS = [
  { status: 'TODO',        label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'DONE',        label: 'Done' },
];

const KanbanBoard = ({ projectId, filteredIssues, onCreateIssue }) => {
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

    dispatch(updateIssue({
      id: issueId,
      data: {
        title: issue.title,
        description: issue.description,
        status: newStatus,
        priority: issue.priority,
        assigneeId: issue.assigneeId,
        projectId: issue.projectId,
      },
    }));
  };

  if (isLoading && issues.length === 0) {
    return (
      <div className="kanban-board">
        {COLUMNS.map(({ status, label }) => (
          <div key={status} className="kanban-column">
             <div className="skeleton" style={{ height: '300px', width: '100%' }}></div>
          </div>
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
            className={`kanban-column ${dragOverColumn === status ? 'drag-over' : ''}`}
            data-status={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            style={{
              transition: 'all 0.2s ease',
              transform: dragOverColumn === status ? 'scale(1.02)' : 'scale(1)',
              borderColor: dragOverColumn === status ? 'var(--primary)' : 'var(--border-main)',
              boxShadow: dragOverColumn === status ? '0 0 0 2px rgba(99,102,241,0.2)' : 'none'
            }}
          >
            <div className="kanban-header">
              <span className="column-title">{label}</span>
              <span className="column-count">{columnIssues.length}</span>
            </div>

            <div className="kanban-list">
              {columnIssues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem', border: '1px dashed var(--border-main)', borderRadius: 'var(--radius-md)' }}>
                  Empty
                </div>
              ) : (
                columnIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))
              )}
              
              {status === 'TODO' && (
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: 'auto', borderStyle: 'dashed' }}
                  onClick={() => onCreateIssue()}
                >
                  <Plus size={16} /> Add Issue
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
