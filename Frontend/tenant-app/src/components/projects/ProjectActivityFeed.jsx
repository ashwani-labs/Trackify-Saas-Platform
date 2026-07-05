import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRightLeft,
  CheckCircle2,
  MessageSquare,
  Play,
  UserPlus,
} from 'lucide-react';
import { EmptyState, Alert } from '@trackify/shared';
import IssueActivityTimeline from '../issues/IssueActivityTimeline';

const EVENT_CONFIG = {
  STATUS_CHANGED: { label: 'Status changed', icon: ArrowRightLeft, tone: 'primary' },
  ASSIGNEE_CHANGED: { label: 'Assignee changed', icon: UserPlus, tone: 'accent' },
  COMMENT_ADDED: { label: 'Comment added', icon: MessageSquare, tone: 'muted' },
  SPRINT_STARTED: { label: 'Sprint started', icon: Play, tone: 'warning' },
  SPRINT_COMPLETED: { label: 'Sprint completed', icon: CheckCircle2, tone: 'success' },
};

const DEFAULT_EVENT = { label: 'Activity', icon: Activity, tone: 'muted' };

const formatRelativeTime = (isoDate) => {
  if (!isoDate) return '';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleString();
};

const ProjectActivityFeed = ({
  projectId,
  events = [],
  isLoading = false,
  error = null,
  totalElements = 0,
}) => {
  if (error) {
    return (
      <div className="card project-activity">
        <Alert>
          {typeof error === 'string' ? error : error?.message || 'Failed to load activity'}
        </Alert>
      </div>
    );
  }

  if (isLoading && events.length === 0) {
    return (
      <div className="card project-activity">
        <IssueActivityTimeline events={[]} isLoading />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="card project-activity">
        <EmptyState
          icon={<Activity size={40} />}
          title="No project activity yet"
          description="Issue updates, comments, and sprint events across this project will appear here."
          className="project-activity__empty"
        />
      </div>
    );
  }

  return (
    <div className="card project-activity">
      <header className="project-activity__header">
        <h2 className="project-activity__title">
          <Activity size={18} aria-hidden />
          Project activity
        </h2>
        {totalElements > 0 && (
          <span className="project-activity__count">{totalElements} events</span>
        )}
      </header>

      <ol className="activity-timeline project-activity__timeline">
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          const config = EVENT_CONFIG[event.eventType] || DEFAULT_EVENT;
          const Icon = config.icon;

          return (
            <li
              key={event.id}
              className={`activity-timeline__item activity-timeline__item--${config.tone}${isLast ? ' activity-timeline__item--last' : ''}`}
            >
              <div className="activity-timeline__marker" aria-hidden>
                <span className={`activity-timeline__dot activity-timeline__dot--${config.tone}`}>
                  <Icon size={12} />
                </span>
                {!isLast && <span className="activity-timeline__line" />}
              </div>
              <div className="activity-timeline__content">
                <div className="activity-timeline__header">
                  <span className="activity-timeline__type">{config.label}</span>
                  <time
                    className="activity-timeline__time"
                    dateTime={event.createdAt}
                    title={event.createdAt ? new Date(event.createdAt).toLocaleString() : undefined}
                  >
                    {formatRelativeTime(event.createdAt)}
                  </time>
                </div>
                <p className="activity-timeline__summary">
                  {event.issueKey && (
                    <Link
                      to={`/projects/${projectId}/issue/${event.issueKey}`}
                      className="project-activity__issue-key"
                    >
                      {event.issueKey}
                    </Link>
                  )}
                  {event.issueKey && ' — '}
                  {event.summary}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ProjectActivityFeed;
