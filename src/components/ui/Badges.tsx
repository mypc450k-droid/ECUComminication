'use client';

import { cn } from '@/lib/utils';
import type { AsilLevel } from '@/types';

const asilStyles: Record<AsilLevel, string> = {
  D: 'asil-d',
  C: 'asil-c',
  B: 'asil-b',
  A: 'asil-a',
  QM: 'asil-qm',
};

export function AsilBadge({ level }: { level: AsilLevel }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase',
        asilStyles[level]
      )}
    >
      ASIL {level}
    </span>
  );
}

export function NetworkBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    CAN_HS: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    CAN_LS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    LIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Ethernet: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    FlexRay: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  const labels: Record<string, string> = {
    CAN_HS: 'CAN HS',
    CAN_LS: 'CAN LS',
    LIN: 'LIN',
    Ethernet: 'ETH',
    FlexRay: 'FlexRay',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border',
        colors[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      )}
    >
      {labels[type] || type}
    </span>
  );
}

export function StatusDot({ status }: { status: 'success' | 'error' | 'pending' | 'active' | 'idle' }) {
  const colors = {
    success: 'bg-emerald-400 shadow-emerald-400/50',
    error: 'bg-red-400 shadow-red-400/50',
    pending: 'bg-amber-400 shadow-amber-400/50',
    active: 'bg-cyan-400 shadow-cyan-400/50 animate-pulse',
    idle: 'bg-slate-500',
  };

  return (
    <span
      className={cn('inline-block w-2 h-2 rounded-full shadow-[0_0_6px]', colors[status])}
    />
  );
}
