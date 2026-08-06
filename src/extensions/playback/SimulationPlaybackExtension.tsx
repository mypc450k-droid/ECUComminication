'use client';

import { SimulationControls } from '@/components/simulation/SimulationControls';
import { useExtensionStore } from '../store/extensionStore';
import { useAppStore } from '@/lib/store';
import { useExtendedPlayback } from '../hooks/useSimulationHistory';
import { cn } from '@/lib/utils';
import type { ExtendedPlaybackSpeed } from '../types';

const SPEEDS: ExtendedPlaybackSpeed[] = [0.25, 0.5, 1, 2, 4];

export function SimulationPlaybackExtension() {
  useExtendedPlayback();
  const extendedSpeed = useExtensionStore((s) => s.extendedPlaybackSpeed);
  const setExtendedPlaybackSpeed = useExtensionStore((s) => s.setExtendedPlaybackSpeed);
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const setActiveFlowStage = useAppStore((s) => s.setActiveFlowStage);

  const jumpToStep = (step: number) => {
    useAppStore.setState({
      currentStepIndex: step,
      activeFlowStage: step,
      isSimulationRunning: step >= 0,
    });
  };

  return (
    <div className="border-b border-cyan-500/10">
      <SimulationControls />
      <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900/30">
        <span className="text-[9px] text-slate-600">Extended Speed:</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setExtendedPlaybackSpeed(s)}
            className={cn(
              'px-1.5 py-0.5 text-[9px] font-mono rounded',
              extendedSpeed === s
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-600 hover:text-slate-400'
            )}
          >
            {s}x
          </button>
        ))}

        {selectedFeatureId && currentStepIndex >= 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[9px] text-slate-600">Jump:</span>
            <input
              type="number"
              min={1}
              className="w-12 px-1 py-0.5 text-[9px] font-mono bg-slate-800/60 border border-slate-700/50 rounded text-cyan-400"
              placeholder="Step"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt((e.target as HTMLInputElement).value, 10);
                  if (val > 0) jumpToStep(val - 1);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
