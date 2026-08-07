'use client';

import { motion } from 'framer-motion';
import { buildSignalEvolution } from '../lib/signalEvolution';
import { cn } from '@/lib/utils';
import type { SimulationStep } from '@/types/simulation';

const formatColors: Record<string, string> = {
  binary: 'text-purple-400',
  hex: 'text-cyan-400',
  boolean: 'text-emerald-400',
  physical: 'text-amber-400',
  engineering: 'text-blue-400',
  can: 'text-cyan-300',
  decoded: 'text-green-400',
};

export function SignalEvolutionView({ step, embedded }: { step: SimulationStep; embedded?: boolean }) {
  const stages = buildSignalEvolution(step);

  return (
    <div className={cn(
      'border-t border-cyan-500/10',
      embedded ? 'p-0 border-t-0' : 'p-2 max-h-40 overflow-y-auto custom-scrollbar'
    )}>
      <h4 className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Signal Evolution
      </h4>
      <div className="space-y-2">
        {stages.map((stage, i) => (
          <div key={`${stage.layer}-${i}`} className="rounded-md bg-slate-900/40 px-2 py-1.5 border border-slate-800/50">
            <div className="text-[8px] font-mono text-cyan-500/70 mb-1">{stage.layer}</div>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2"
            >
              <span className={cn('text-[10px] font-mono break-all', formatColors[stage.format])}>
                {stage.oldRepresentation}
              </span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="text-cyan-500 text-[8px] shrink-0"
              >
                →
              </motion.span>
              <span className={cn('text-[10px] font-mono break-all', formatColors[stage.format])}>
                {stage.newRepresentation}
              </span>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
