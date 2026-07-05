const STORAGE_KEY = 'trackify-notification-prefs';

export const NOTIFICATION_TYPES = [
  { id: 'ISSUE_ASSIGNED', label: 'Issue assignments' },
  { id: 'ISSUE_COMMENT', label: 'Comments on issues' },
  { id: 'ISSUE_STATUS_CHANGED', label: 'Status changes' },
  { id: 'USER_APPROVAL', label: 'User approval requests' },
];

const DEFAULT_PREFS = Object.fromEntries(NOTIFICATION_TYPES.map((t) => [t.id, true]));

export function loadNotificationPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveNotificationPreferences(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function isNotificationTypeEnabled(type) {
  const prefs = loadNotificationPreferences();
  return prefs[type] !== false;
}
