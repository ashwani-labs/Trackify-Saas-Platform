import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTenantWorkspaceBaseUrl,
  getTenantRegisterUrl,
  copyToClipboard,
} from '../utils/workspaceUrl';

describe('workspaceUrl', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.stubGlobal('location', {
      protocol: 'http:',
      hostname: 'apexconsulting.lvh.me',
      port: '5174',
    });
  });

  afterEach(() => {
    vi.stubGlobal('location', originalLocation);
  });

  it('builds register url from current host when subdomain matches', () => {
    expect(getTenantWorkspaceBaseUrl('apexconsulting')).toBe('http://apexconsulting.lvh.me:5174');
    expect(getTenantRegisterUrl('apexconsulting')).toBe(
      'http://apexconsulting.lvh.me:5174/register'
    );
  });

  it('copies text with clipboard api', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(copyToClipboard('http://example.com/register')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('http://example.com/register');
  });
});
