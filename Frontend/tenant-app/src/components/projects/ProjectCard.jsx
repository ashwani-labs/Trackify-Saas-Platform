import { ArrowRight, Clock, Layers, Activity } from 'lucide-react';
import { Badge } from '@trackify/shared';

const formatRelativeTime = (isoDate) => {
  if (!isoDate) return null;
  const then = new Date(isoDate).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
};

const getHealthBadge = (project) => {
  const total = project.totalIssues ?? 0;
  const done = project.doneCount ?? 0;
  const inProgress = project.inProgressCount ?? 0;

  if (total === 0) {
    return { label: 'New', variant: 'primary' };
  }
  if (done === total) {
    return { label: 'Complete', variant: 'success' };
  }
  if (inProgress > 0) {
    return { label: 'Active', variant: 'warning' };
  }
  return { label: 'Planning', variant: 'primary' };
};

const ProjectCard = ({ project, onOpen }) => {
  const health = getHealthBadge(project);
  const total = project.totalIssues ?? 0;
  const done = project.doneCount ?? 0;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const updatedLabel = project.updatedAt || project.createdAt;
  const activityTime = formatRelativeTime(project.lastActivityAt);

  return (
    <div
      className="card project-card"
      onClick={() => onOpen(project.id)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(project.id)}
      role="button"
      tabIndex={0}
    >
      <div className="project-card__top">
        <div className="project-card__identity">
          <div className="project-card__avatar">{project.name.charAt(0).toUpperCase()}</div>
          <span className="project-card__key">{project.key}</span>
        </div>
        <div className="project-card__top-meta">
          <Badge variant={health.variant}>{health.label}</Badge>
          <Layers size={16} className="project-card__icon" aria-hidden />
        </div>
      </div>

      <div>
        <h3 className="project-card__title">{project.name}</h3>
        <p className="project-card__desc">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="project-card__stats" aria-label="Issue status breakdown">
        <span className="project-card__stat project-card__stat--todo">
          To do <strong>{project.todoCount ?? 0}</strong>
        </span>
        <span className="project-card__stat project-card__stat--progress">
          In progress <strong>{project.inProgressCount ?? 0}</strong>
        </span>
        <span className="project-card__stat project-card__stat--done">
          Done <strong>{project.doneCount ?? 0}</strong>
        </span>
      </div>

      {total > 0 && (
        <div className="project-card__progress" aria-hidden>
          <div className="project-card__progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {project.lastActivitySummary && (
        <p className="project-card__activity" title={project.lastActivitySummary}>
          <Activity size={12} aria-hidden />
          <span className="project-card__activity-text">{project.lastActivitySummary}</span>
          {activityTime && <span className="project-card__activity-time">{activityTime}</span>}
        </p>
      )}

      <div className="project-card__footer">
        <span className="project-card__date">
          <Clock size={12} aria-hidden />
          {total > 0 ? (
            <>
              {total} issue{total !== 1 ? 's' : ''}
              {project.memberCount > 0 && <> · {project.memberCount} members</>}
            </>
          ) : (
            <>Updated {new Date(updatedLabel).toLocaleDateString()}</>
          )}
        </span>
        <ArrowRight size={16} className="project-card__arrow" aria-hidden />
      </div>
    </div>
  );
};

export default ProjectCard;
