'use client';

import { useAppStore } from '@/lib/store';
import { getEcuById, features } from '@/lib/data';
import { useExtensionStore } from '../store/extensionStore';
import { getConnectedEcuIds } from '../architecture/buildPartnerEdges';
import { ecus } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { ECU } from '@/types';

interface EcuInspectorActionsProps {
  ecu: ECU;
}

export function EcuInspectorActions({ ecu }: EcuInspectorActionsProps) {
  const selectFeature = useAppStore((s) => s.selectFeature);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setHighlightedIds = useAppStore((s) => s.setHighlightedIds);
  const setFeatureTab = useAppStore((s) => s.setFeatureTab);

  const startTraceSignal = useExtensionStore((s) => s.startTraceSignal);
  const clearTraceSignal = useExtensionStore((s) => s.clearTraceSignal);
  const setEcuFocusId = useExtensionStore((s) => s.setEcuFocusId);
  const traceSignalMode = useExtensionStore((s) => s.traceSignalMode);

  const connectedFeatures = features.filter((f) => f.involvedEcus.includes(ecu.id));

  const handleTraceSignal = (signalId: string) => {
    const path = buildSignalTracePath(ecu.id);
    startTraceSignal(signalId, path);
    setHighlightedIds(path);
    setEcuFocusId(ecu.id);
  };

  const handleRunFeature = (featureId: string) => {
    selectFeature(featureId);
    setViewMode('feature');
    setFeatureTab('integrated');
  };

  const handleShowNetwork = () => {
    const connected = getConnectedEcuIds(ecu.id, ecus);
    setHighlightedIds(connected);
    setEcuFocusId(ecu.id);
  };

  const handleShowAutosar = () => {
    setViewMode('autosar');
  };

  const handleClearTrace = () => {
    clearTraceSignal();
    setHighlightedIds([]);
    setEcuFocusId(null);
  };

  return (
    <div className="space-y-2 pt-2 border-t border-cyan-500/10">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</p>
      <div className="grid grid-cols-2 gap-1.5">
        <ActionButton label="Show Network" onClick={handleShowNetwork} />
        <ActionButton label="Show AUTOSAR" onClick={handleShowAutosar} />
        {ecu.signals[0] && (
          <ActionButton
            label="Trace Signal"
            onClick={() => handleTraceSignal(ecu.signals[0].id)}
            active={traceSignalMode}
          />
        )}
        {connectedFeatures[0] && (
          <ActionButton
            label="Run Feature"
            onClick={() => handleRunFeature(connectedFeatures[0].id)}
          />
        )}
      </div>

      {traceSignalMode && (
        <button
          type="button"
          onClick={handleClearTrace}
          className="w-full text-[9px] py-1 rounded border border-slate-700/50 text-slate-500 hover:text-slate-300"
        >
          Clear trace highlight
        </button>
      )}

      {connectedFeatures.length > 0 && (
        <div>
          <p className="text-[9px] text-slate-600 mb-1">Connected Features</p>
          <div className="flex flex-wrap gap-1">
            {connectedFeatures.slice(0, 6).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleRunFeature(f.id)}
                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:border-cyan-500/30 hover:text-cyan-300"
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[9px] text-slate-600 mb-1">Connected ECUs</p>
        <div className="flex flex-wrap gap-1">
          {ecu.communicationPartners.slice(0, 8).map((p) => {
            const partner = getEcuById(p);
            return (
              <span key={p} className="text-[9px] px-1.5 py-0.5 bg-slate-800/40 rounded text-slate-400">
                {partner?.shortName ?? p}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-[9px] py-1.5 px-2 rounded border transition-colors',
        active
          ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
          : 'border-cyan-500/20 text-cyan-400/80 hover:bg-cyan-500/10'
      )}
    >
      {label}
    </button>
  );
}

/** Illustrative trace path through communication partners. */
function buildSignalTracePath(ecuId: string): string[] {
  const ecu = getEcuById(ecuId);
  if (!ecu) return [ecuId];

  const path: string[] = [ecuId];
  if (ecu.communicationPartners.includes('gateway')) {
    path.push('gateway');
  }
  ecu.communicationPartners.forEach((p) => {
    if (p !== 'gateway' && !path.includes(p)) path.push(p);
  });
  return path;
}
