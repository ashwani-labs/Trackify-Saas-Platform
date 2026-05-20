import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedIssue } from '../../features/issues/issueSlice';
import { Badge } from '@trackify/shared';

const PRIORITY_VARIANT = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

const IssueCard = ({ issue }) => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = React.useState(false);

  const handleClick = () => {
    dispatch(setSelectedIssue(issue));
  };

  const issueKey = issue.projectHeaderName
    ? `${issue.projectHeaderName}-${issue.id}`
    : `ISSUE-${issue.id}`;

  return (
    <div
      className={`issue-card ${isDragging ? 'issue-card--dragging' : ''}`}
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        e.dataTransfer.setData('issueId', String(issue.id));
        e.dataTransfer.setData('currentStatus', issue.status);
        setTimeout(() => {
          e.target.style.opacity = '0.5';
        }, 0);
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        e.target.style.opacity = '1';
      }}
      onClick={handleClick}
    >
      <h4 className="issue-title">{issue.title}</h4>

      <div className="issue-meta">
        <span className="issue-key">{issueKey}</span>
        <div className="issue-footer">
          <Badge variant={PRIORITY_VARIANT[issue.priority] || 'primary'} className="badge--priority">
            {issue.priority}
          </Badge>
          <div className="avatar-sm">{(issue.assigneeName || 'U').charAt(0).toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
