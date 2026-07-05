import { describe, it, expect } from 'vitest';
import { groupNotifications, getGroupTitle } from '../utils/groupNotifications';

describe('groupNotifications', () => {
  it('groups multiple comments on the same issue', () => {
    const items = [
      {
        id: 1,
        type: 'ISSUE_COMMENT',
        issueKey: 'ALP-12',
        projectId: 5,
        read: false,
        createdAt: '2026-07-01T10:00:00Z',
        message: 'First',
      },
      {
        id: 2,
        type: 'ISSUE_COMMENT',
        issueKey: 'ALP-12',
        projectId: 5,
        read: true,
        createdAt: '2026-07-01T11:00:00Z',
        message: 'Second',
      },
    ];

    const grouped = groupNotifications(items);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].kind).toBe('group');
    expect(grouped[0].items).toHaveLength(2);
    expect(getGroupTitle(grouped[0])).toBe('2 comments on ALP-12');
  });

  it('keeps unrelated notifications separate', () => {
    const items = [
      { id: 1, type: 'USER_APPROVAL', createdAt: '2026-07-01T10:00:00Z', title: 'Approval' },
      {
        id: 2,
        type: 'ISSUE_COMMENT',
        issueKey: 'ALP-1',
        createdAt: '2026-07-01T09:00:00Z',
      },
    ];

    const grouped = groupNotifications(items);
    expect(grouped).toHaveLength(2);
    expect(grouped.every((entry) => entry.kind === 'single')).toBe(true);
  });
});
