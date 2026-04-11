import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateIssue,
  optimisticStatusUpdate,
} from '../../features/issues/issueSlice';
import IssueCard from './IssueCard';
import Skeleton from '../common/Skeleton';
import styles from './KanbanBoard.module.css';

const COLUMNS = [
  { status: 'TODO',        label: 'To Do',      colorClass: 'colTodo' },
  { status: 'IN_PROGRESS', label: 'In Progress', colorClass: 'colInProgress' },
  { status: 'DONE',        label: 'Done',        colorClass: 'colDone' },
];

const KanbanBoard = ({ projectId, onCreateIssue }) => {
  const dispatch = useDispatch();
  const { issues, isLoading } = useSelector((state) => state.issues);
  const dragOverColumn = useRef(null);

  const issuesByStatus = (status) => issues.filter((i) => i.status === status);

  const handleDragOver = (e, status) => {
    e.preventDefault();
    dragOverColumn.current = status;
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const issueId = Number(e.dataTransfer.getData('issueId'));
    const currentStatus = e.dataTransfer.getData('currentStatus');

    if (currentStatus === newStatus) return;

    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    // Optimistic update for instant feel
    dispatch(optimisticStatusUpdate({ id: issueId, status: newStatus }));

    // Persist to backend
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
      <div className={styles.board}>
        {COLUMNS.map(({ status, label, colorClass }) => (
          <div key={status} className={styles.column}>
            <div className={`${styles.columnHeader} ${styles[colorClass]}`}>
              <Skeleton type="text" className={styles.columnLabel} />
            </div>
            <div className={styles.cardList}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} type="card" style={{ marginBottom: '1rem' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.board}>
      {COLUMNS.map(({ status, label, colorClass }) => {
        const columnIssues = issuesByStatus(status);
        return (
          <div
            key={status}
            className={styles.column}
            onDragOver={(e) => handleDragOver(e, status)}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className={`${styles.columnHeader} ${styles[colorClass]}`}>
              <span className={styles.columnLabel}>{label}</span>
              <span className={styles.columnCount}>{columnIssues.length}</span>
            </div>

            {/* Issue Cards */}
            <div className={styles.cardList}>
              {columnIssues.length === 0 ? (
                <div className={styles.emptyColumn}>
                  <p>Drop issues here</p>
                </div>
              ) : (
                columnIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))
              )}
            </div>

            {/* Add Issue Button at bottom of TODO column only */}
            {status === 'TODO' && (
              <button
                className={styles.addIssueBtn}
                onClick={() => onCreateIssue()}
              >
                + Add Issue
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
