'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { SimulationStep } from '@/types/simulation';

export function SimulationTimeline({ steps }: { steps: SimulationStep[] }) {
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);

  const handleStepClick = (index: number) => {
    useAppStore.setState({
      currentStepIndex: index,
      activeFlowStage: index,
      isSimulationRunning: index >= 0,
      simulationPaused: true,
      simulationAutoPlay: false,
    });
  };

  return (
    <div className="border-t border-cyan-500/10 bg-slate-900/60 px-3 py-2">
      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
        {steps.map((step, index) => {
          const isCurrent = currentStepIndex === index;
          const isCompleted = currentStepIndex > index;
          const isFuture = currentStepIndex < index;

          return (
            <motion.button
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[9px] transition-all border',
                isCurrent && 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 neon-cyan',
                isCompleted && 'bg-emerald-500/10 text-emerald-400/80 border-emerald-500/20',
                isFuture && 'bg-slate-800/30 text-slate-600 border-slate-700/30',
                currentStepIndex < 0 && 'bg-slate-800/30 text-slate-600 border-slate-700/30'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold',
                isCurrent && 'bg-cyan-500/30',
                isCompleted && 'bg-emerald-500/20',
                isFuture && 'bg-slate-700/50'
              )}>
                {isCompleted ? '✓' : index + 1}
              </span>
              <span className="max-w-[80px] truncate hidden sm:inline">{step.title}</span>
            </motion.button>
          );
        })}
      </div>
      {currentStepIndex >= 0 && (
        <div className="mt-1.5 h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
            animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}
    </div>
  );
}
