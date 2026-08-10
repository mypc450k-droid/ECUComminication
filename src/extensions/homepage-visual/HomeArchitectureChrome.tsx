'use client';

import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

function FitViewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

/** Homepage-only chrome: fit-to-screen control and orientation hint. */
export function HomeFitViewButton() {
  const { fitView } = useReactFlow();

  const onFit = useCallback(() => {
    fitView({ padding: 0.05, maxZoom: 0.98, duration: 320 });
  }, [fitView]);

  return (
    <button
      type="button"
      className="hp-fit-btn absolute bottom-3 left-3 z-10"
      onClick={onFit}
      title="Fit architecture to screen"
    >
      <FitViewIcon />
      <span>FIT TO SCREEN</span>
    </button>
  );
}

export function HomeDirectionPill() {
  return (
    <div className="hp-direction-pill absolute top-3 right-3 z-10">
      <span className="hp-arrow" aria-hidden>↑</span>
      <span>VEHICLE TOP VIEW</span>
      <span className="hp-arrow" aria-hidden>↓</span>
    </div>
  );
}
