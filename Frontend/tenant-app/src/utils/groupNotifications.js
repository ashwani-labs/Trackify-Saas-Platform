const GROUPABLE_TYPES = new Set(['ISSUE_COMMENT', 'ISSUE_STATUS_CHANGED', 'ISSUE_ASSIGNED']);

const getIssueKey = (notification) =>
  notification.metadata?.issueKey || notification.issueKey || null;

/**
 * Collapse related notifications (e.g. multiple comments on the same issue).
 * Returns items shaped as { kind: 'single', notification } or { kind: 'group', ... }.
 */
export function groupNotifications(notifications) {
  const singles = [];
  const groupMap = new Map();

  for (const notification of notifications) {
    const issueKey = getIssueKey(notification);
    const canGroup = issueKey && GROUPABLE_TYPES.has(notification.type);
    const groupKey = canGroup ? `${issueKey}:${notification.type}` : null;

    if (!groupKey) {
      singles.push({ kind: 'single', notification, sortAt: notification.createdAt });
      continue;
    }

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        kind: 'group',
        issueKey,
        type: notification.type,
        projectId: notification.projectId,
        referenceId: notification.referenceId,
        referenceType: notification.referenceType,
        items: [],
        sortAt: notification.createdAt,
        hasUnread: false,
      });
    }

    const group = groupMap.get(groupKey);
    group.items.push(notification);
    if (notification.createdAt > group.sortAt) {
      group.sortAt = notification.createdAt;
    }
    if (!notification.read) {
      group.hasUnread = true;
    }
  }

  const grouped = [...groupMap.values()].map((group) =>
    group.items.length === 1
      ? { kind: 'single', notification: group.items[0], sortAt: group.sortAt }
      : group
  );

  return [...singles, ...grouped].sort(
    (a, b) =>
      new Date(b.sortAt || b.notification?.createdAt) -
      new Date(a.sortAt || a.notification?.createdAt)
  );
}

export function getGroupTitle(group) {
  const count = group.items.length;
  const key = group.issueKey;

  switch (group.type) {
    case 'ISSUE_COMMENT':
      return `${count} comments on ${key}`;
    case 'ISSUE_STATUS_CHANGED':
      return `${count} status updates on ${key}`;
    case 'ISSUE_ASSIGNED':
      return `${count} assignment updates on ${key}`;
    default:
      return `${count} updates on ${key}`;
  }
}
