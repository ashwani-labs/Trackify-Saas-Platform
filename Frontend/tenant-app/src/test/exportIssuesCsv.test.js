import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportIssuesToCsv } from '../utils/exportIssuesCsv';

describe('exportIssuesToCsv', () => {
  let clickSpy;

  beforeEach(() => {
    clickSpy = vi.fn();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      click: clickSpy,
      set href(value) {
        this._href = value;
      },
      set download(value) {
        this._download = value;
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when issue list is empty', () => {
    exportIssuesToCsv([]);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('downloads a CSV for issues', () => {
    exportIssuesToCsv(
      [
        {
          id: 1,
          issueKey: 'APO-1',
          title: 'Fix login',
          status: 'TODO',
          priority: 'HIGH',
          labels: ['bug'],
        },
      ],
      'Apollo'
    );
    expect(clickSpy).toHaveBeenCalled();
  });
});
