'use client';

import { buildPathSummary } from './homepageGraphUtils';
import { useHomepageInteraction } from './HomepageInteractionContext';

export function HomepageTracePanel() {
  const {
    traceActive,
    tracePick,
    traceSourceId,
    traceDestId,
    tracePathIds,
    exitTrace,
  } = useHomepageInteraction();

  if (!traceActive) return null;

  const pathLabels = tracePathIds.length > 0 ? buildPathSummary(tracePathIds) : [];

  return (
    <div className="hp-trace-panel" aria-live="polite">
      <div className="hp-trace-header">
        <span className="hp-trace-title">TRACE COMMUNICATION</span>
        <button type="button" className="hp-trace-exit" onClick={exitTrace}>EXIT TRACE</button>
      </div>
      {tracePick === 'source' && (
        <p className="hp-trace-hint">Select source ECU</p>
      )}
      {tracePick === 'destination' && traceSourceId && (
        <p className="hp-trace-hint">Select destination ECU</p>
      )}
      {tracePathIds.length === 0 && tracePick === null && traceSourceId && traceDestId && (
        <p className="hp-trace-hint hp-trace-empty">NO COMMUNICATION PATH FOUND</p>
      )}
      {pathLabels.length > 0 && (
        <div className="hp-trace-path">
          {pathLabels.map((label, i) => (
            <div key={`${label}-${i}`} className="hp-trace-step">
              {i > 0 && <span className="hp-trace-arrow">↓</span>}
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
