import { useEffect, useState } from 'react';

export function useKeyboardShortcuts({ onSearchFocus, onNavigate } = {}) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let pendingGo = null;

    const handleKeyDown = (e) => {
      const target = e.target;
      const tag = target?.tagName?.toLowerCase();
      const isTyping =
        tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable;

      if (e.key === '?' && !isTyping && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      if (e.key === '/' && !isTyping && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onSearchFocus?.();
        return;
      }

      if (isTyping) return;

      if (e.key === 'g') {
        pendingGo = 'g';
        return;
      }

      if (pendingGo === 'g') {
        pendingGo = null;
        if (e.key === 'd') onNavigate?.('/dashboard');
        if (e.key === 'p') onNavigate?.('/projects');
      }
    };

    const handleKeyUp = () => {
      pendingGo = null;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [onNavigate, onSearchFocus]);

  return { showHelp, setShowHelp };
}
