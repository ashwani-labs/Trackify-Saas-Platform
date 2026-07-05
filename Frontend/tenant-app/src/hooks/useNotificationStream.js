import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { API_BASE_URL } from '../config/api';
import { setUnreadCount } from '../features/notifications/notificationSlice';

export function useNotificationStream(enabled = true) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled) return undefined;

    const token = localStorage.getItem('tenantToken');
    if (!token) return undefined;

    const url = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
    let source;

    try {
      source = new EventSource(url);
    } catch {
      return undefined;
    }

    source.addEventListener('unread-count', (event) => {
      const count = Number(event.data);
      if (!Number.isNaN(count)) {
        dispatch(setUnreadCount(count));
      }
    });

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [dispatch, enabled]);
}
