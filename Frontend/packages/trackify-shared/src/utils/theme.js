export const getInitialTheme = (storageKey, fallback = 'dark') => {
  const stored = localStorage.getItem(storageKey);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return fallback;
};
