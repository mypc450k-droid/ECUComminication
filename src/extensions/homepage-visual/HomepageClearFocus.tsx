'use client';

import { useAppStore } from '@/lib/store';
import { useExtensionStore } from '@/extensions/store/extensionStore';
import { useHomepageInteraction } from './HomepageInteractionContext';

export function HomepageClearFocus() {
  const { clickFocusId, clearClickFocus, hasInteractionFilter } = useHomepageInteraction();
  const highlightedIds = useAppStore((s) => s.highlightedIds);
  const setHighlightedIds = useAppStore((s) => s.setHighlightedIds);
  const setEcuFocusId = useExtensionStore((s) => s.setEcuFocusId);

  const show = clickFocusId || highlightedIds.length > 0;
  if (!show) return null;

  const onClear = () => {
    clearClickFocus();
    setHighlightedIds([]);
    setEcuFocusId(null);
  };

  return (
    <button type="button" className="hp-clear-focus" onClick={onClear}>
      CLEAR FOCUS
    </button>
  );
}
