'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ECU } from '@/types';
import { AsilBadge, NetworkBadge } from './ui/Badges';

export interface ECUNodeData {
  ecu: ECU;
  selected: boolean;
  highlighted: boolean;
  activeInFlow: boolean;
  [key: string]: unknown;
}

function ECUNodeComponent({ data }: NodeProps) {
  const nodeData = data as ECUNodeData;
  const { ecu, selected, highlighted, activeInFlow } = nodeData;

  return (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{
      opacity: 1,
      scale: activeInFlow ? 1.08 : selected ? 1.05 : 1,
    }}
    transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    className={cn(
      'relative min-w-[120px] max-w-[140px] rounded-lg overflow-hidden cursor-pointer',
      'border transition-all duration-300',
      selected
        ? 'border-cyan-400/60 shadow-[0_0_20px_rgba(0,212,255,0.3)]'
        : highlighted
          ? 'border-cyan-500/40 shadow-[0_0_12px_rgba(0,212,255,0.15)]'
          : 'border-slate-700/50',
      activeInFlow && 'border-cyan-400 animate-pulse-glow'
    )}
  >
    <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-cyan-500/50 !border-cyan-400/30" />
    <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-cyan-500/50 !border-cyan-400/30" />
    <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-cyan-500/50 !border-cyan-400/30" />
    <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-cyan-500/50 !border-cyan-400/30" />

    {/* Header gradient */}
    <div className={cn(
      'px-2.5 py-1.5 border-b border-slate-700/30',
      activeInFlow
        ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/20'
        : 'bg-gradient-to-r from-slate-800/80 to-slate-900/80'
    )}>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-bold text-slate-100 truncate">{ecu.shortName}</span>
        <AsilBadge level={ecu.asil} />
      </div>
    </div>

    {/* Body */}
    <div className="px-2.5 py-2 bg-slate-900/90 backdrop-blur-sm">
      <p className="text-[9px] text-slate-400 leading-tight line-clamp-2">{ecu.name}</p>
      <div className="flex flex-wrap gap-0.5 mt-1.5">
        {ecu.networks.slice(0, 3).map((n) => (
          <NetworkBadge key={n} type={n} />
        ))}
      </div>
      {ecu.autosar && (
        <div className="mt-1.5 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          <span className="text-[8px] text-emerald-400/70 font-mono">AUTOSAR</span>
        </div>
      )}
    </div>

    {/* Active flow indicator */}
    {activeInFlow && (
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-cyan-400/50 pointer-events-none"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    )}
  </motion.div>
  );
}

export const ECUNode = memo(ECUNodeComponent);
