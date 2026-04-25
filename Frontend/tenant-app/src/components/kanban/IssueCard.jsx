import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedIssue } from '../../features/issues/issueSlice';
import { MoreHorizontal, MessageSquare, Paperclip } from 'lucide-react';

const PRIORITY_COLORS = {
  HIGH:   'var(--danger)',
  MEDIUM: 'var(--warning)',
  LOW:    'var(--success)',
};

const IssueCard = ({ issue, onDragStart }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setSelectedIssue(issue));
  };

  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div
      className={`issue-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        e.dataTransfer.setData('issueId', String(issue.id));
        e.dataTransfer.setData('currentStatus', issue.status);
        onDragStart && onDragStart(issue.id);
        
        // This makes sure the card looks transparent during drag
        setTimeout(() => e.target.style.opacity = '0.5', 0);
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        e.target.style.opacity = '1';
      }}
      onClick={handleClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>
          {issue.projectHeaderName ? `${issue.projectHeaderName}-${issue.id}` : `ISSUE-${issue.id}`}
        </span>
        <button className="theme-toggle" style={{ width: '20px', height: '20px' }}>
          <MoreHorizontal size={14} />
        </button>
      </div>

      <h4 className="issue-title">{issue.title}</h4>

      {issue.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {issue.description}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}>
             <MessageSquare size={12} /> 2
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}>
             <Paperclip size={12} /> 1
           </div>
        </div>
        
        <span className="issue-badge" style={{ 
          color: PRIORITY_COLORS[issue.priority] || 'var(--text-muted)',
          backgroundColor: `${PRIORITY_COLORS[issue.priority] || 'var(--text-muted)'}15`
        }}>
          {issue.priority}
        </span>
      </div>
    </div>
  );
};

export default IssueCard;
