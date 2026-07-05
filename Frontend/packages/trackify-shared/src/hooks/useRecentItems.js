import { useCallback, useEffect, useState } from 'react';

const DEFAULT_KEY = 'trackify-recent';
const DEFAULT_LIMIT = 5;

export function useRecentItems(storageKey = DEFAULT_KEY, limit = DEFAULT_LIMIT) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const trackVisit = useCallback(
    (item) => {
      if (!item?.id || !item?.path || !item?.label) return;
      setItems((prev) => {
        const filtered = prev.filter((entry) => entry.id !== item.id || entry.path !== item.path);
        return [{ ...item, visitedAt: Date.now() }, ...filtered].slice(0, limit);
      });
    },
    [limit]
  );

  const clearRecent = useCallback(() => setItems([]), []);

  return { items, trackVisit, clearRecent };
}
