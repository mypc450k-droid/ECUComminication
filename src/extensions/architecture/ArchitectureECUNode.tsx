'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { ECU } from '@/types';
import { AsilBadge, NetworkBadge } from '@/components/ui/Badges';

export interface ArchitectureECUNodeData {
  ecu: ECU;
  selected: boolean;
  highlighted: boolean;
  activeInFlow: boolean;
  dimmed?: boolean;
  [key: string]: unknown;
}

/** Homepage-only ECU card — does not affect simulation canvas nodes. */
function ArchitectureECUNodeComponent({ data }: NodeProps) {
  const { ecu, selected, highlighted, activeInFlow, dimmed } = data as ArchitectureECUNodeData;

  return (
    <div
      className={cn(
        'vv-architecture-ecu relative w-[118px] rounded-md overflow-hidden cursor-pointer',
        'border bg-slate-900/95 backdrop-blur-sm transition-all duration-200',
        'shadow-[0_2px_12px_rgba(0,0,0,0.35)]',
        dimmed && 'opacity-30',
        selected
          ? 'border-cyan-400/70 shadow-[0_0_18px_rgba(0,212,255,0.25)] scale-[1.02]'
          : highlighted
            ? 'border-cyan-500/45 shadow-[0_0_10px_rgba(0,212,255,0.12)]'
            : 'border-slate-600/40 hover:border-cyan-500/35 hover:shadow-[0_0_8px_rgba(0,212,255,0.08)]',
        activeInFlow && 'border-cyan-400 vv-architecture-ecu-active'
      )}
    >
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-cyan-500/40 !border-cyan-400/20 !min-w-0 !min-h-0" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-cyan-500/40 !border-cyan-400/20 !min-w-0 !min-h-0" />
      <Handle type="target" position={Position.Left} id="left" className="!w-1.5 !h-1.5 !bg-cyan-500/40 !border-cyan-400/20 !min-w-0 !min-h-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-1.5 !h-1.5 !bg-cyan-500/40 !border-cyan-400/20 !min-w-0 !min-h-0" />

      <div
        className={cn(
          'px-2 py-1 border-b border-slate-700/40',
          activeInFlow ? 'bg-cyan-500/15' : 'bg-slate-800/90'
        )}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold text-slate-100 truncate">{ecu.shortName}</span>
          <AsilBadge level={ecu.asil} />
        </div>
      </div>

      <div className="px-2 py-1.5">
        <p className="text-[8px] text-slate-500 leading-tight line-clamp-2 min-h-[20px]">{ecu.name}</p>
        <div className="flex flex-wrap gap-0.5 mt-1">
          {ecu.networks.slice(0, 3).map((n) => (
            <NetworkBadge key={n} type={n} />
          ))}
        </div>
        {ecu.autosar && (
          <div className="mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400/90 vv-architecture-autosar-dot" />
            <span className="text-[7px] text-emerald-400/75 font-mono">AUTOSAR</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const ArchitectureECUNode = memo(ArchitectureECUNodeComponent);
