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

export function SignalEvolutionView({ step }: { step: SimulationStep }) {
  const stages = buildSignalEvolution(step);

  return (
    <div className="border-t border-cyan-500/10 p-2 max-h-40 overflow-y-auto custom-scrollbar">
      <h4 className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Signal Evolution
      </h4>
      <div className="space-y-1">
        {stages.map((stage, i) => (
          <div key={`${stage.layer}-${i}`}>
            <div className="flex items-center gap-2 text-[9px] text-slate-600">
              <span className="font-mono text-cyan-500/60">{stage.layer}</span>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-2 py-0.5"
            >
              <span className={cn('text-[10px] font-mono truncate max-w-[40%]', formatColors[stage.format])}>
                {stage.oldRepresentation}
              </span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="text-cyan-500 text-[8px]"
              >
                →
              </motion.span>
              <span className={cn('text-[10px] font-mono truncate max-w-[40%]', formatColors[stage.format])}>
                {stage.newRepresentation}
              </span>
            </motion.div>
            {i < stages.length - 1 && (
              <div className="flex justify-center">
                <span className="text-[6px] text-slate-700">▼</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
