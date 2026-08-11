'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ECUNodeData } from '@/components/ECUNode';
import { AsilBadge, NetworkBadge } from '@/components/ui/Badges';
import { useHomepageNodeVisual } from './HomepageInteractionContext';

/** Homepage-only ECU module — engineering architecture card styling. */
function HomeECUNodeComponent({ data, id }: NodeProps) {
  const nodeData = data as ECUNodeData & { dimmed?: boolean };
  const { ecu, selected, highlighted, activeInFlow, dimmed } = nodeData;
  const { hoverDimmed, hoverHighlighted } = useHomepageNodeVisual(ecu.id);
  const isGateway = id === 'gateway' || ecu.id === 'gateway';
  const title = isGateway ? ecu.name : ecu.shortName;
  const networks = isGateway ? ecu.networks : ecu.networks.slice(0, 4);
  const visualDimmed = dimmed || hoverDimmed;
  const visualHighlighted = highlighted || hoverHighlighted;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: visualDimmed ? 0.28 : 1,
        scale: activeInFlow ? 1.04 : selected ? 1.02 : 1,
      }}
      transition={{ duration: 0.2, type: 'spring', stiffness: 320 }}
      className={cn(
        'hp-ecu-module relative cursor-pointer overflow-hidden rounded-md border transition-all duration-200',
        isGateway && 'hp-ecu-gateway',
        selected
          ? 'border-cyan-400/70 shadow-[0_0_16px_rgba(0,212,255,0.25)]'
          : visualHighlighted
            ? 'border-cyan-500/45 shadow-[0_0_10px_rgba(0,212,255,0.12)]'
            : 'border-slate-600/55',
        activeInFlow && 'border-cyan-400 animate-pulse-glow'
      )}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-cyan-500/40 !border-cyan-400/25" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-cyan-500/40 !border-cyan-400/25" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-cyan-500/40 !border-cyan-400/25" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-cyan-500/40 !border-cyan-400/25" />

      <div className={cn('hp-ecu-module-header', activeInFlow && 'hp-ecu-module-header-active')}>
        <span className="hp-ecu-module-title">{title}</span>
        <AsilBadge level={ecu.asil} />
      </div>

      <div className="hp-ecu-module-body">
        <p className="hp-ecu-module-desc">{isGateway ? 'Network routing hub' : ecu.name}</p>
        <div className="hp-ecu-module-networks">
          {networks.map((n) => (
            <NetworkBadge key={n} type={n} />
          ))}
        </div>
        {ecu.autosar && (
          <div className="hp-ecu-module-autosar">
            <span className="hp-ecu-autosar-dot" />
            <span>AUTOSAR</span>
          </div>
        )}
      </div>

      {activeInFlow && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-md border-2 border-cyan-400/45"
          animate={{ opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

export const HomeECUNode = memo(HomeECUNodeComponent);
