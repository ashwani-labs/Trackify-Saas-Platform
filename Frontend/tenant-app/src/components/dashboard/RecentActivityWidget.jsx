import React from 'react';
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
  STATUS_CHANGED: { icon: ArrowRightLeft, tone: 'primary' },
  ASSIGNEE_CHANGED: { icon: UserPlus, tone: 'accent' },
  COMMENT_ADDED: { icon: MessageSquare, tone: 'muted' },
  SPRINT_STARTED: { icon: Play, tone: 'warning' },
  SPRINT_COMPLETED: { icon: CheckCircle2, tone: 'success' },
};

const DEFAULT_EVENT = { icon: Activity, tone: 'muted' };

const formatRelativeTime = (isoDate) => {
  if (!isoDate) return '';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const RecentActivityWidget = ({ activity = [], isLoading }) => (
  <div className="card dashboard-widget">
    <div className="dashboard-widget__header">
      <h3 className="dashboard-widget__title">Recent Activity</h3>
    </div>

    {isLoading ? (
      <div className="dashboard-widget__body">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton dashboard-widget__skeleton" />
        ))}
      </div>
    ) : activity.length === 0 ? (
      <EmptyState
        title="No recent activity"
        description="Project updates will show up here as your team works."
        className="dashboard-widget__empty"
      />
    ) : (
      <ul className="activity-timeline dashboard-activity">
        {activity.map((event, index) => {
          const config = EVENT_CONFIG[event.eventType] || DEFAULT_EVENT;
          const Icon = config.icon;
          const isLast = index === activity.length - 1;

          return (
            <li
              key={event.id}
              className={`activity-timeline__item ${isLast ? 'activity-timeline__item--last' : ''}`}
            >
              <div className="activity-timeline__marker">
                <span className={`activity-timeline__dot activity-timeline__dot--${config.tone}`}>
                  <Icon size={12} aria-hidden />
                </span>
                {!isLast && <span className="activity-timeline__line" aria-hidden />}
              </div>
              <div className="activity-timeline__content">
                <div className="activity-timeline__header">
                  <span className="activity-timeline__type">
                    {event.eventType?.replace(/_/g, ' ')}
                  </span>
                  <time className="activity-timeline__time" dateTime={event.createdAt}>
                    {formatRelativeTime(event.createdAt)}
                  </time>
                </div>
                <p className="activity-timeline__summary">{event.summary}</p>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

export default RecentActivityWidget;
