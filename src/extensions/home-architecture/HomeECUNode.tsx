'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { ECU } from '@/types';
import { AsilBadge, NetworkBadge } from '@/components/ui/Badges';

export interface HomeECUNodeData {
  ecu: ECU;
  selected: boolean;
  highlighted: boolean;
  activeInFlow: boolean;
  [key: string]: unknown;
}

function HomeECUNodeComponent({ data }: NodeProps) {
  const { ecu, selected, highlighted, activeInFlow } = data as HomeECUNodeData;

  return (
    <div
      className={cn(
        'vv-home-ecu relative w-[114px] rounded-lg overflow-hidden cursor-pointer',
        'border bg-slate-900/88 backdrop-blur-md transition-all duration-200',
        'shadow-[0_4px_20px_rgba(0,0,0,0.45)]',
        selected
          ? 'border-cyan-400/75 shadow-[0_0_20px_rgba(0,212,255,0.28)] scale-[1.02]'
          : highlighted
            ? 'border-cyan-500/45 shadow-[0_0_12px_rgba(0,212,255,0.15)]'
            : 'border-slate-600/45 hover:border-cyan-500/35 hover:shadow-[0_0_10px_rgba(0,212,255,0.1)]',
        activeInFlow && 'vv-home-ecu-active'
      )}
    >
      <Handle type="target" position={Position.Top} className="!w-1 !h-1 !opacity-0 !min-w-0 !min-h-0" />
      <Handle type="source" position={Position.Bottom} className="!w-1 !h-1 !opacity-0 !min-w-0 !min-h-0" />
      <Handle type="target" position={Position.Left} id="left" className="!w-1 !h-1 !opacity-0 !min-w-0 !min-h-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-1 !h-1 !opacity-0 !min-w-0 !min-h-0" />

      <div
        className={cn(
          'px-2 py-1 border-b border-slate-700/35 flex items-center justify-between gap-1',
          activeInFlow ? 'bg-cyan-500/12' : 'bg-slate-800/85'
        )}
      >
        <span className="text-[10px] font-bold text-slate-100 truncate">{ecu.shortName}</span>
        <AsilBadge level={ecu.asil} />
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[8px] text-slate-500 leading-tight line-clamp-2 min-h-[18px]">{ecu.name}</p>
        <div className="flex flex-wrap gap-0.5 mt-1">
          {ecu.networks.slice(0, 3).map((n) => (
            <NetworkBadge key={n} type={n} />
          ))}
        </div>
        {ecu.autosar && (
          <div className="mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 vv-home-autosar-dot" />
            <span className="text-[7px] text-emerald-400/75 font-mono">AUTOSAR</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const HomeECUNode = memo(HomeECUNodeComponent);
