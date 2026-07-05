import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../features/notifications/notificationSlice';
import { setSelectedIssue } from '../../features/issues/issueSlice';

const NOTIFICATION_TYPE_LABELS = {
  ISSUE_ASSIGNED: 'Assignment',
  ISSUE_COMMENT: 'Comment',
  ISSUE_STATUS_CHANGED: 'Status update',
  USER_APPROVAL: 'User approval',
};

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);

  const { items, unreadCount, loading } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications({ page: 0, size: 15 }));
    }
  }, [open, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleSelect = useCallback(
    async (notification) => {
      if (!notification.read) {
        await dispatch(markNotificationRead(notification.id));
      }
      setOpen(false);

      if (notification.referenceType === 'ISSUE' && notification.projectId) {
        const issueKey = notification.metadata?.issueKey || notification.issueKey;
        if (issueKey) {
          navigate(`/projects/${notification.projectId}/issue/${issueKey}`);
          return;
        }
        navigate(`/projects/${notification.projectId}`);
        if (notification.referenceId) {
          dispatch(
            setSelectedIssue({
              id: notification.referenceId,
              projectId: notification.projectId,
              title: notification.title,
            })
          );
        }
        return;
      }

      if (notification.referenceType === 'PROJECT' && notification.referenceId) {
        navigate(`/projects/${notification.referenceId}`);
        return;
      }

      if (notification.referenceType === 'USER') {
        navigate('/pending-users');
      }
    },
    [dispatch, navigate]
  );

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  return (
    <div className="notification-bell" ref={panelRef}>
      <button
        type="button"
        className="theme-toggle notification-bell__trigger"
        onClick={handleOpen}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="search-results notification-panel" role="dialog" aria-label="Notifications">
          <div className="notification-panel__header">
            <span className="search-results__section" style={{ margin: 0 }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {loading && <div className="search-results__empty">Loading…</div>}

          {!loading && items.length === 0 && (
            <div className="search-results__empty">No notifications yet</div>
          )}

          {!loading &&
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`search-result ${!n.read ? 'notification-item--unread' : ''}`}
                onClick={() => handleSelect(n)}
              >
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div className="search-result__title">{n.title}</div>
                  {NOTIFICATION_TYPE_LABELS[n.type] && (
                    <div className="notification-item__type">
                      {NOTIFICATION_TYPE_LABELS[n.type]}
                    </div>
                  )}
                  {n.message && <div className="search-result__meta">{n.message}</div>}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
