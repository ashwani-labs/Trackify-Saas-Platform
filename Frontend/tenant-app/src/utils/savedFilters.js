const STORAGE_KEY = 'trackify-saved-issue-filters';

export const loadSavedFilters = (projectId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[projectId] || [];
  } catch {
    return [];
  }
};

export const saveFilterPreset = (projectId, name, filters) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  const all = raw ? JSON.parse(raw) : {};
  const existing = all[projectId] || [];
  const next = [
    { id: `${Date.now()}`, name, filters, createdAt: Date.now() },
    ...existing.filter((preset) => preset.name !== name),
  ].slice(0, 8);
  all[projectId] = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return next;
};

export const deleteFilterPreset = (projectId, presetId) => {
  const raw = localStorage.getItem(STORAGE_KEY);
  const all = raw ? JSON.parse(raw) : {};
  all[projectId] = (all[projectId] || []).filter((preset) => preset.id !== presetId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[projectId] || [];
};
