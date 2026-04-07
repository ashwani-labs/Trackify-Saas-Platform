import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedIssue } from '../../features/issues/issueSlice';
import styles from './IssueCard.module.css';

const PRIORITY_CONFIG = {
  HIGH:   { label: 'High',   className: styles.priorityHigh },
  MEDIUM: { label: 'Med',    className: styles.priorityMedium },
  LOW:    { label: 'Low',    className: styles.priorityLow },
};

const IssueCard = ({ issue, onDragStart }) => {
  const dispatch = useDispatch();
  const priority = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.MEDIUM;

  const handleClick = () => {
    dispatch(setSelectedIssue(issue));
  };

  return (
    <div
      className={styles.card}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('issueId', String(issue.id));
        e.dataTransfer.setData('currentStatus', issue.status);
        onDragStart && onDragStart(issue.id);
      }}
      onClick={handleClick}
    >
      <p className={styles.title}>{issue.title}</p>

      {issue.description && (
        <p className={styles.description}>
          {issue.description.length > 80
            ? issue.description.slice(0, 80) + '…'
            : issue.description}
        </p>
      )}

      <div className={styles.footer}>
        <span className={styles.issueKey}>
          {issue.projectHeaderName}-{issue.id}
        </span>
        <span className={`${styles.priority} ${priority.className}`}>
          {priority.label}
        </span>
      </div>
    </div>
  );
};

export default IssueCard;
