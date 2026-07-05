import { describe, it, expect } from 'vitest';
import {
  applyTenantTheme,
  getTenantTheme,
  DEFAULT_TENANT_THEME,
  TENANT_THEME_LIST,
} from '../themes/tenantThemes.js';

describe('tenantThemes', () => {
  it('exposes six preset themes', () => {
    expect(TENANT_THEME_LIST).toHaveLength(6);
  });

  it('falls back to default theme for unknown ids', () => {
    expect(getTenantTheme('unknown').id).toBe(DEFAULT_TENANT_THEME);
  });

  it('applies css variables for a theme', () => {
    applyTenantTheme('emerald');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#059669');
    expect(document.documentElement.dataset.tenantTheme).toBe('emerald');
  });
});
