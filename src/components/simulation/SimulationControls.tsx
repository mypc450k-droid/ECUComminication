'use client';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { PlaybackSpeed } from '@/types/simulation';

const speeds: PlaybackSpeed[] = [0.5, 1, 2];

export function SimulationControls() {
  const prevStep = useAppStore((s) => s.prevStep);
  const nextStep = useAppStore((s) => s.nextStep);
  const playSimulation = useAppStore((s) => s.playSimulation);
  const pauseSimulation = useAppStore((s) => s.pauseSimulation);
  const restartSimulation = useAppStore((s) => s.restartSimulation);
  const skipToEnd = useAppStore((s) => s.skipToEnd);
  const setPlaybackSpeed = useAppStore((s) => s.setPlaybackSpeed);
  const simulationPaused = useAppStore((s) => s.simulationPaused);
  const simulationAutoPlay = useAppStore((s) => s.simulationAutoPlay);
  const playbackSpeed = useAppStore((s) => s.playbackSpeed);
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);

  if (!selectedFeatureId) return null;

  const isPlaying = simulationAutoPlay && !simulationPaused;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-cyan-500/10 bg-slate-900/40">
      <button
        onClick={prevStep}
        disabled={currentStepIndex <= 0}
        className="px-2 py-1 text-[10px] rounded border border-slate-700/50 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ◀ Prev
      </button>

      {isPlaying ? (
        <button
          onClick={pauseSimulation}
          className="px-3 py-1 text-[10px] font-semibold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30"
        >
          ⏸ Pause
        </button>
      ) : (
        <button
          onClick={playSimulation}
          className="px-3 py-1 text-[10px] font-semibold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 neon-cyan"
        >
          ▶ Play
        </button>
      )}

      <button
        onClick={nextStep}
        className="px-2 py-1 text-[10px] rounded border border-slate-700/50 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30"
      >
        Next ▶
      </button>

      <div className="h-4 w-px bg-slate-700" />

      <button
        onClick={restartSimulation}
        className="px-2 py-1 text-[10px] rounded border border-slate-700/50 text-slate-400 hover:text-slate-300"
      >
        ↺ Restart
      </button>

      <button
        onClick={() => {
          playSimulation();
        }}
        className="px-2 py-1 text-[10px] rounded border border-slate-700/50 text-slate-400 hover:text-slate-300"
        title="Auto Play"
      >
        ⟳ Auto
      </button>

      <button
        onClick={skipToEnd}
        className="px-2 py-1 text-[10px] rounded border border-slate-700/50 text-slate-400 hover:text-slate-300"
      >
        Skip ⏭
      </button>

      <div className="h-4 w-px bg-slate-700" />

      <div className="flex items-center gap-1">
        <span className="text-[9px] text-slate-600">Speed:</span>
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setPlaybackSpeed(s)}
            className={cn(
              'px-1.5 py-0.5 text-[9px] font-mono rounded',
              playbackSpeed === s
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
