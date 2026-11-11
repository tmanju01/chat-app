import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  onTrigger: () => void,
  options: { ctrlOrMeta?: boolean } = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchesKey = event.key.toLowerCase() === key.toLowerCase();
      if (!matchesKey) return;

      if (options.ctrlOrMeta && !(event.ctrlKey || event.metaKey)) {
        return;
      }

      event.preventDefault();
      onTrigger();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, onTrigger, options.ctrlOrMeta]);
}

