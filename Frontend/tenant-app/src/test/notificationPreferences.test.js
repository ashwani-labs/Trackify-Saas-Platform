import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  isNotificationTypeEnabled,
} from '../utils/notificationPreferences';

describe('notificationPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('defaults all notification types to enabled', () => {
    const prefs = loadNotificationPreferences();
    expect(prefs.ISSUE_ASSIGNED).toBe(true);
    expect(prefs.ISSUE_COMMENT).toBe(true);
    expect(isNotificationTypeEnabled('ISSUE_ASSIGNED')).toBe(true);
  });

  it('persists disabled types', () => {
    saveNotificationPreferences({
      ...loadNotificationPreferences(),
      ISSUE_COMMENT: false,
    });
    expect(isNotificationTypeEnabled('ISSUE_COMMENT')).toBe(false);
    expect(isNotificationTypeEnabled('ISSUE_ASSIGNED')).toBe(true);
  });
});
