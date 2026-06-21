import { useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  onUndo: () => void;
  onRedo: () => void;
  onShowOriginalStart: () => void;
  onShowOriginalEnd: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onShowOriginalStart,
  onShowOriginalEnd,
  enabled = true,
}: UseKeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        onRedo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        onRedo();
      }

      if (e.key === 'Shift' && !e.repeat) {
        onShowOriginalStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        onShowOriginalEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onUndo, onRedo, onShowOriginalStart, onShowOriginalEnd, enabled]);
};
