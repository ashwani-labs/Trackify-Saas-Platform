import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, EmptyState } from '@trackify/shared';

const PRIORITY_VARIANT = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  URGENT: 'HIGH',
};

const MyOpenIssuesWidget = ({ issues = [], isLoading }) => {
  const navigate = useNavigate();

  const handleOpen = (issue) => {
    const key = issue.issueKey || `ISSUE-${issue.id}`;
    navigate(`/projects/${issue.projectId}/issue/${encodeURIComponent(key)}`);
  };

  return (
    <div className="card dashboard-widget">
      <div className="dashboard-widget__header">
        <h3 className="dashboard-widget__title">My Open Issues</h3>
        <span className="dashboard-widget__meta">{issues.length} shown</span>
      </div>

      {isLoading ? (
        <div className="dashboard-widget__body">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton dashboard-widget__skeleton" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          title="No open issues assigned"
          description="Issues assigned to you will appear here."
          className="dashboard-widget__empty"
        />
      ) : (
        <ul className="dashboard-issue-list">
          {issues.map((issue) => (
            <li key={issue.id}>
              <button
                type="button"
                className="dashboard-issue-list__item"
                onClick={() => handleOpen(issue)}
              >
                <div className="dashboard-issue-list__main">
                  <span className="dashboard-issue-list__key">
                    {issue.issueKey || `ISSUE-${issue.id}`}
                  </span>
                  <span className="dashboard-issue-list__title">{issue.title}</span>
                  <span className="dashboard-issue-list__project">{issue.projectName}</span>
                </div>
                <Badge variant={PRIORITY_VARIANT[issue.priority] || 'primary'}>
                  {issue.status?.replace('_', ' ')}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyOpenIssuesWidget;
