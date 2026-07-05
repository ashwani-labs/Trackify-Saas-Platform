export const DEFAULT_TENANT_THEME = 'indigo';

export const TENANT_THEMES = {
  indigo: {
    id: 'indigo',
    label: 'Indigo',
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    primaryLight: '#e0e7ff',
    accent: '#8b5cf6',
    accentLight: '#ede9fe',
    gradientBrand: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryLight: '#e0f2fe',
    accent: '#06b6d4',
    accentLight: '#cffafe',
    gradientBrand: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald',
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#d1fae5',
    accent: '#10b981',
    accentLight: '#ecfdf5',
    gradientBrand: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    primary: '#e11d48',
    primaryHover: '#be123c',
    primaryLight: '#ffe4e6',
    accent: '#f43f5e',
    accentLight: '#fff1f2',
    gradientBrand: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
  },
  amber: {
    id: 'amber',
    label: 'Amber',
    primary: '#d97706',
    primaryHover: '#b45309',
    primaryLight: '#fef3c7',
    accent: '#f59e0b',
    accentLight: '#fffbeb',
    gradientBrand: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  },
  violet: {
    id: 'violet',
    label: 'Violet',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryLight: '#ede9fe',
    accent: '#a855f7',
    accentLight: '#f3e8ff',
    gradientBrand: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  },
};

export const TENANT_THEME_LIST = Object.values(TENANT_THEMES);

export function getTenantTheme(themeId) {
  return TENANT_THEMES[themeId] || TENANT_THEMES[DEFAULT_TENANT_THEME];
}

export function applyTenantTheme(themeId) {
  const theme = getTenantTheme(themeId);
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-hover', theme.primaryHover);
  root.style.setProperty('--primary-light', theme.primaryLight);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-light', theme.accentLight);
  root.style.setProperty('--brand-primary', theme.primary);
  root.style.setProperty('--gradient-brand', theme.gradientBrand);
  root.dataset.tenantTheme = theme.id;
}

export function clearTenantTheme() {
  const root = document.documentElement;
  [
    '--primary',
    '--primary-hover',
    '--primary-light',
    '--accent',
    '--accent-light',
    '--brand-primary',
    '--gradient-brand',
  ].forEach((token) => root.style.removeProperty(token));
  delete root.dataset.tenantTheme;
}
