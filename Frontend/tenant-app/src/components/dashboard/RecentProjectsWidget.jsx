import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@trackify/shared';

const RecentProjectsWidget = ({ projects = [], isLoading }) => {
  const navigate = useNavigate();

  return (
    <div className="card dashboard-widget">
      <div className="dashboard-widget__header">
        <h3 className="dashboard-widget__title">Recent Projects</h3>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/projects')}
        >
          View all
        </button>
      </div>

      {isLoading ? (
        <div className="dashboard-widget__body">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton dashboard-widget__skeleton" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create a project to start tracking work."
          className="dashboard-widget__empty"
        />
      ) : (
        <ul className="dashboard-project-list">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                className="dashboard-project-list__item"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="project-avatar project-avatar--sm">
                  {project.name?.charAt(0).toUpperCase()}
                </div>
                <div className="dashboard-project-list__main">
                  <span className="dashboard-project-list__name">{project.name}</span>
                  <span className="dashboard-project-list__meta">
                    {project.totalIssues ?? 0} issues · {project.memberCount ?? 0} members
                  </span>
                  {project.lastActivitySummary && (
                    <span className="dashboard-project-list__activity">
                      {project.lastActivitySummary}
                    </span>
                  )}
                </div>
                <div className="dashboard-project-list__stats">
                  <span>{project.inProgressCount ?? 0} active</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentProjectsWidget;
