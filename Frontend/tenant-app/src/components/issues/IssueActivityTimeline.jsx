import {
  Activity,
  ArrowRightLeft,
  CheckCircle2,
  MessageSquare,
  Play,
  UserPlus,
} from 'lucide-react';
import { EmptyState } from '@trackify/shared';

const EVENT_CONFIG = {
  STATUS_CHANGED: {
    label: 'Status changed',
    icon: ArrowRightLeft,
    tone: 'primary',
  },
  ASSIGNEE_CHANGED: {
    label: 'Assignee changed',
    icon: UserPlus,
    tone: 'accent',
  },
  COMMENT_ADDED: {
    label: 'Comment added',
    icon: MessageSquare,
    tone: 'muted',
  },
  SPRINT_STARTED: {
    label: 'Sprint started',
    icon: Play,
    tone: 'warning',
  },
  SPRINT_COMPLETED: {
    label: 'Sprint completed',
    icon: CheckCircle2,
    tone: 'success',
  },
};

const DEFAULT_EVENT = {
  label: 'Activity',
  icon: Activity,
  tone: 'muted',
};

const formatRelativeTime = (isoDate) => {
  if (!isoDate) return '';
  const then = new Date(isoDate).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleString();
};

const ActivityTimelineSkeleton = () => (
  <ul className="activity-timeline" aria-hidden>
    {[0, 1, 2].map((i) => (
      <li key={i} className="activity-timeline__item">
        <div className="skeleton activity-timeline__skeleton-dot" />
        <div className="activity-timeline__content">
          <div className="skeleton" style={{ height: '0.75rem', width: '40%' }} />
          <div className="skeleton" style={{ height: '0.875rem', width: '85%', marginTop: '0.5rem' }} />
        </div>
      </li>
    ))}
  </ul>
);

const IssueActivityTimeline = ({ events = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <section className="issue-activity" aria-label="Issue activity" aria-busy="true">
        <h4 className="issue-activity__title">
          <Activity size={16} aria-hidden />
          Activity
        </h4>
        <ActivityTimelineSkeleton />
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="issue-activity" aria-label="Issue activity">
        <h4 className="issue-activity__title">
          <Activity size={16} aria-hidden />
          Activity
        </h4>
        <EmptyState
          icon={<Activity size={32} />}
          title="No activity yet"
          description="Status changes, assignee updates, and sprint events will appear here."
          className="issue-activity__empty"
        />
      </section>
    );
  }

  return (
    <section className="issue-activity" aria-label="Issue activity">
      <h4 className="issue-activity__title">
        <Activity size={16} aria-hidden />
        Activity
        <span className="issue-activity__count">{events.length}</span>
      </h4>
      <ol className="activity-timeline">
        {events.map((event, index) => {
          const config = EVENT_CONFIG[event.eventType] || DEFAULT_EVENT;
          const Icon = config.icon;
          const isLast = index === events.length - 1;

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
                <p className="activity-timeline__summary">{event.summary}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default IssueActivityTimeline;
