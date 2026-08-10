'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { useExtensionStore } from '@/extensions/store/extensionStore';
import { HomeFitViewButton } from './HomeArchitectureChrome';
import { useHomepageInteraction } from './HomepageInteractionContext';

export function HomepagePresentationBar() {
  const viewMode = useAppStore((s) => s.viewMode);
  const presentationMode = useExtensionStore((s) => s.presentationMode);
  const setPresentationMode = useExtensionStore((s) => s.setPresentationMode);
  const togglePanelCollapse = useExtensionStore((s) => s.togglePanelCollapse);

  const { startTrace, openGuidedTour, exitTrace, traceActive } = useHomepageInteraction();
  const collapsedForPresentation = useRef(false);

  useEffect(() => {
    if (viewMode !== 'architecture') return;

    if (!presentationMode) {
      collapsedForPresentation.current = false;
      return;
    }

    if (collapsedForPresentation.current) return;

    const layout = useExtensionStore.getState().panelLayout;
    if (!layout.sidebarCollapsed) togglePanelCollapse('sidebar');
    if (!layout.inspectorCollapsed) togglePanelCollapse('inspector');
    if (!layout.commMonitorCollapsed) togglePanelCollapse('commMonitor');
    collapsedForPresentation.current = true;
  }, [presentationMode, viewMode, togglePanelCollapse]);

  if (!presentationMode || viewMode !== 'architecture') return null;

  return (
    <div className="hp-presentation-bar" aria-label="Presentation controls">
      <HomeFitViewButton inline />
      <button type="button" className="hp-toolbar-btn" onClick={() => traceActive ? exitTrace() : startTrace()}>
        {traceActive ? 'EXIT TRACE' : 'TRACE'}
      </button>
      <button type="button" className="hp-toolbar-btn" onClick={openGuidedTour}>
        GUIDED TOUR
      </button>
      <button
        type="button"
        className="hp-toolbar-btn hp-toolbar-btn-warn"
        onClick={() => setPresentationMode(false)}
      >
        EXIT PRESENTATION
      </button>
    </div>
  );
}
