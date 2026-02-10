import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onEscape?: () => void;
  onNewTask?: () => void;
  onNewInitiative?: () => void;
  onSearch?: () => void;
  onSave?: () => void;
}

/**
 * Hook for global keyboard shortcuts
 * 
 * Shortcuts:
 * - Escape: Close modal/panel
 * - Ctrl/Cmd + K: Focus search
 * - Ctrl/Cmd + S: Save (when in edit mode)
 * - Ctrl/Cmd + N: New item
 */
export function useKeyboardShortcuts({
  onEscape,
  onNewTask,
  onNewInitiative,
  onSearch,
  onSave,
}: KeyboardShortcuts) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    const target = e.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Escape always works
    if (e.key === 'Escape' && onEscape) {
      onEscape();
      return;
    }

    // Ctrl/Cmd shortcuts
    const isMod = e.ctrlKey || e.metaKey;

    if (isMod && e.key === 'k' && onSearch) {
      e.preventDefault();
      onSearch();
      return;
    }

    if (isMod && e.key === 's' && onSave) {
      e.preventDefault();
      onSave();
      return;
    }

    // Skip other shortcuts if typing
    if (isTyping) return;

    if (isMod && e.key === 'n' && onNewInitiative) {
      e.preventDefault();
      onNewInitiative();
      return;
    }

    if (e.key === 't' && onNewTask) {
      e.preventDefault();
      onNewTask();
      return;
    }
  }, [onEscape, onNewTask, onNewInitiative, onSearch, onSave]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Keyboard shortcuts help tooltip content
 */
export const KEYBOARD_SHORTCUTS = [
  { key: 'Esc', description: 'Close modal/panel' },
  { key: '⌘/Ctrl + K', description: 'Focus search' },
  { key: '⌘/Ctrl + N', description: 'New initiative' },
  { key: 'T', description: 'New task (when not typing)' },
  { key: '⌘/Ctrl + S', description: 'Save changes' },
  { key: 'Enter', description: 'Confirm / Add item' },
] as const;
