import { useEffect } from 'react';

type ShortcutHandler = () => void;

interface Shortcuts {
  [key: string]: ShortcutHandler;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey || e.metaKey ? 'ctrl' : '',
        e.shiftKey ? 'shift' : '',
        e.altKey ? 'alt' : '',
        e.key.toLowerCase(),
      ].filter(Boolean).join('+');

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
