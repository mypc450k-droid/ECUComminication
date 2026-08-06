'use client';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { LearningMode } from '@/types/simulation';

const modes: { id: LearningMode; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'expert', label: 'Expert' },
];

export function LearningModeSelector() {
  const learningMode = useAppStore((s) => s.learningMode);
  const setLearningMode = useAppStore((s) => s.setLearningMode);

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-cyan-500/10">
      <span className="text-[9px] text-slate-600 mr-1">Mode:</span>
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => setLearningMode(m.id)}
          className={cn(
            'px-2 py-0.5 text-[9px] font-medium rounded transition-all',
            learningMode === m.id
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
