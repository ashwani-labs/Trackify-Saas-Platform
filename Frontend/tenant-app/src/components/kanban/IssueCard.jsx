import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedIssue } from '../../features/issues/issueSlice';
import { MoreHorizontal, MessageSquare, Paperclip } from 'lucide-react';

const PRIORITY_COLORS = {
  HIGH: 'var(--danger)',
  MEDIUM: 'var(--warning)',
  LOW: 'var(--success)',
};

const IssueCard = ({ issue, onDragStart }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setSelectedIssue(issue));
  };

  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div
      className="issue-card"
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        e.dataTransfer.setData('issueId', String(issue.id));
        e.dataTransfer.setData('currentStatus', issue.status);
        onDragStart && onDragStart(issue.id);
        setTimeout(() => (e.target.style.opacity = '0.5'), 0);
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        e.target.style.opacity = '1';
      }}
      onClick={handleClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <h4 className="issue-title" style={{ fontSize: '0.875rem', fontWeight: '400', marginBottom: '0.75rem', color: '#172B4D' }}>
        {issue.title}
      </h4>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6B778C', textTransform: 'uppercase' }}>
              {issue.projectHeaderName ? `${issue.projectHeaderName}-${issue.id}` : `ISSUE-${issue.id}`}
            </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <span
              className="badge"
              style={{
                fontSize: '0.6rem',
                padding: '1px 4px',
                color: PRIORITY_COLORS[issue.priority] || 'var(--text-muted)',
                backgroundColor: `${PRIORITY_COLORS[issue.priority] || 'var(--text-muted)'}15`,
              }}
            >
              {issue.priority}
            </span>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                 {(issue.assigneeName || 'U').charAt(0).toUpperCase()}
            </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
