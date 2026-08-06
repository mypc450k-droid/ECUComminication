'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { NetworkBadge } from '@/components/ui/Badges';
import { cn } from '@/lib/utils';
import type { SimulationStep } from '@/types/simulation';

export function StepDetailPanel({ step }: { step: SimulationStep | null }) {
  const learningMode = useAppStore((s) => s.learningMode);
  const openExplainWhy = useAppStore((s) => s.openExplainWhy);
  const openShowMeMore = useAppStore((s) => s.openShowMeMore);

  if (!step) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-slate-500">Press Next or Play to begin the guided simulation</p>
        <p className="text-[10px] text-slate-600 mt-1">Each click advances one engineering step</p>
      </div>
    );
  }

  const explanation =
    learningMode === 'beginner'
      ? step.beginnerExplanation
      : learningMode === 'expert'
        ? `${step.engineeringExplanation}\n\nExecution: ${step.executionTimeMs}ms${step.canId ? ` | CAN: ${step.canId}` : ''}${step.payload ? ` | Payload: ${step.payload}` : ''}`
        : step.engineeringExplanation;

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-3 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono text-cyan-400/70">
            Step {step.stepNumber}
          </span>
          <h3 className="text-sm font-semibold text-slate-100 mt-0.5">{step.title}</h3>
        </div>
        <span className="text-[9px] font-mono text-slate-600 px-1.5 py-0.5 bg-slate-800/60 rounded uppercase">
          {step.type}
        </span>
      </div>

      <GlassPanel className="p-3 glass-panel-highlight">
        <p className="text-xs text-slate-300 leading-relaxed">{explanation}</p>
      </GlassPanel>

      {(step.canId || step.signalName || step.sender || step.receiver) && (
        <div className="grid grid-cols-2 gap-2">
          {step.canId && (
            <InfoCell label="CAN ID" value={step.canId} mono />
          )}
          {step.signalName && (
            <InfoCell label="Signal" value={step.signalName} />
          )}
          {step.sender && (
            <InfoCell label="Sender" value={step.sender} />
          )}
          {step.receiver && (
            <InfoCell label="Receiver" value={step.receiver} />
          )}
          {step.payload && (
            <InfoCell label="Payload" value={step.payload} mono />
          )}
          {step.frameCount && (
            <InfoCell label="Frames" value={String(step.frameCount)} />
          )}
          {step.cycleTimeMs && (
            <InfoCell label="Cycle Time" value={`${step.cycleTimeMs}ms`} />
          )}
          {step.lengthBytes && (
            <InfoCell label="Length" value={`${step.lengthBytes} bytes`} />
          )}
          <InfoCell label="Exec Time" value={`${step.executionTimeMs}ms`} />
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {step.network && <NetworkBadge type={step.network} />}
        {step.ecuId && (
          <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
            ECU: {step.ecuId}
          </span>
        )}
        {step.ecuState && (
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800/60 text-slate-400 rounded">
            State: {step.ecuState}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {step.explainWhyKey && (
          <button
            onClick={() => openExplainWhy(step.explainWhyKey!)}
            className="flex-1 py-2 text-[10px] font-medium rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
          >
            ? Explain Why
          </button>
        )}
        {step.showMeMoreKey && (
          <button
            onClick={() => openShowMeMore(step.showMeMoreKey!)}
            className="flex-1 py-2 text-[10px] font-medium rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
          >
            + Show Me More
          </button>
        )}
      </div>
    </motion.div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-2 py-1.5 bg-slate-800/40 rounded border border-slate-700/30">
      <span className="text-[8px] text-slate-600 uppercase tracking-wider">{label}</span>
      <p className={cn('text-[10px] text-slate-300 mt-0.5', mono && 'font-mono text-cyan-400/80')}>
        {value}
      </p>
    </div>
  );
}
