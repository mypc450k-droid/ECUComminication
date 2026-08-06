'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useExtensionStore } from '../store/extensionStore';
import { getFailureScenarios, getFailureById } from '@/lib/simulation-loader';
import { FailureSimulation } from '@/components/simulation/FailureSimulation';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

const FAILURE_CHAIN = [
  'Transmit', 'Errors', 'TEC++', 'REC++', 'Bus Off', 'CanSM', 'DEM', 'DTC', 'Cluster Warning', 'Fallback', 'Recovery',
];

export function FailureSimulatorPro() {
  const failures = getFailureScenarios();
  const activeFailureId = useAppStore((s) => s.activeFailureId);
  const setActiveFailureId = useAppStore((s) => s.setActiveFailureId);
  const failureSimStep = useExtensionStore((s) => s.failureSimStep);
  const failureSimRunning = useExtensionStore((s) => s.failureSimRunning);
  const failureSimAuto = useExtensionStore((s) => s.failureSimAuto);
  const setFailureSimStep = useExtensionStore((s) => s.setFailureSimStep);
  const setFailureSimRunning = useExtensionStore((s) => s.setFailureSimRunning);
  const setFailureSimAuto = useExtensionStore((s) => s.setFailureSimAuto);

  const active = activeFailureId ? getFailureById(activeFailureId) : null;

  useEffect(() => {
    if (!activeFailureId && failures.length > 0) {
      setActiveFailureId(failures[0].id);
    }
  }, [activeFailureId, failures, setActiveFailureId]);

  useEffect(() => {
    if (!failureSimRunning || !failureSimAuto) return;
    const interval = setInterval(() => {
      const next = failureSimStep + 1;
      if (next >= FAILURE_CHAIN.length) {
        setFailureSimStep(0);
      } else {
        setFailureSimStep(next);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [failureSimRunning, failureSimAuto, failureSimStep, setFailureSimStep]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 px-3 py-2 border-b border-cyan-500/10 bg-slate-900/40">
        <button
          type="button"
          onClick={() => {
            setFailureSimRunning(true);
            setFailureSimStep(0);
          }}
          className="px-2 py-1 text-[9px] rounded bg-red-500/20 text-red-400 border border-red-500/30"
        >
          ▶ Run Failure Simulation
        </button>
        <button
          type="button"
          onClick={() => setFailureSimStep(Math.max(0, failureSimStep - 1))}
          className="px-2 py-1 text-[9px] text-slate-500 border border-slate-700/50 rounded"
        >
          ◀ Step
        </button>
        <button
          type="button"
          onClick={() => setFailureSimStep(Math.min(FAILURE_CHAIN.length - 1, failureSimStep + 1))}
          className="px-2 py-1 text-[9px] text-slate-500 border border-slate-700/50 rounded"
        >
          Step ▶
        </button>
        <button
          type="button"
          onClick={() => setFailureSimAuto(!failureSimAuto)}
          className={cn(
            'px-2 py-1 text-[9px] rounded border',
            failureSimAuto ? 'border-cyan-500/30 text-cyan-400' : 'border-slate-700/50 text-slate-500'
          )}
        >
          Auto
        </button>
        <button
          type="button"
          onClick={() => { setFailureSimStep(0); setFailureSimRunning(false); }}
          className="px-2 py-1 text-[9px] text-slate-500 border border-slate-700/50 rounded"
        >
          ↺ Replay
        </button>
      </div>

      {failureSimRunning && (
        <div className="shrink-0 px-3 py-2 border-b border-red-500/10">
          <div className="flex items-center gap-1 flex-wrap">
            {FAILURE_CHAIN.map((step, i) => (
              <motion.div
                key={step}
                className={cn(
                  'px-2 py-1 text-[9px] rounded border transition-all',
                  i === failureSimStep
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 neon-cyan'
                    : i < failureSimStep
                      ? 'bg-emerald-500/10 text-emerald-400/70 border-emerald-500/20'
                      : 'bg-slate-800/30 text-slate-600 border-slate-700/30'
                )}
                animate={i === failureSimStep ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {step}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {active && (
        <GlassPanel className="shrink-0 mx-3 mt-2 p-2 border-red-500/20">
          <p className="text-[10px] text-red-300 font-medium">
            {active.name}
            {failureSimRunning ? ` — Step: ${FAILURE_CHAIN[failureSimStep]}` : ' — select Run to animate failure chain'}
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2">{active.description}</p>
        </GlassPanel>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <FailureSimulation />
      </div>
    </div>
  );
}
