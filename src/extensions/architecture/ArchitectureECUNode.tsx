'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import type { ECU } from '@/types';
import { AsilBadge, NetworkBadge } from '@/components/ui/Badges';
import type { NodeVisualRole } from './vehicleZoneLayout';
import { ZONE_TEAL } from './vehicleZoneLayout';

export interface ArchitectureECUNodeData {
  ecu: ECU;
  selected: boolean;
  highlighted: boolean;
  activeInFlow: boolean;
  dimmed?: boolean;
  visualRole?: NodeVisualRole;
  [key: string]: unknown;
}

function ArchitectureECUNodeComponent({ data }: NodeProps) {
  const {
    ecu,
    selected,
    highlighted,
    activeInFlow,
    dimmed,
    visualRole = 'standard',
  } = data as ArchitectureECUNodeData;

  if (visualRole === 'sensor') {
    return (
      <SensorNode
        ecu={ecu}
        selected={selected}
        highlighted={highlighted}
        activeInFlow={activeInFlow}
        dimmed={dimmed}
      />
    );
  }

  if (visualRole === 'gateway') {
    return (
      <GatewayHexNode
        ecu={ecu}
        selected={selected}
        highlighted={highlighted}
        activeInFlow={activeInFlow}
        dimmed={dimmed}
      />
    );
  }

  if (visualRole === 'telematics') {
    return (
      <HubRectNode
        ecu={ecu}
        selected={selected}
        highlighted={highlighted}
        activeInFlow={activeInFlow}
        dimmed={dimmed}
        variant="telematics"
      />
    );
  }

  if (visualRole === 'compute') {
    return (
      <HubRectNode
        ecu={ecu}
        selected={selected}
        highlighted={highlighted}
        activeInFlow={activeInFlow}
        dimmed={dimmed}
        variant="compute"
      />
    );
  }

  if (visualRole === 'zonal') {
    return (
      <ZonalNode
        ecu={ecu}
        selected={selected}
        highlighted={highlighted}
        activeInFlow={activeInFlow}
        dimmed={dimmed}
      />
    );
  }

  return (
    <StandardNode
      ecu={ecu}
      selected={selected}
      highlighted={highlighted}
      activeInFlow={activeInFlow}
      dimmed={dimmed}
    />
  );
}

function NodeHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!w-1 !h-1 !opacity-0 !min-w-0 !min-h-0" />
      <Handle type="source" position={Position.Bottom} className="!w-1 !h-1 !opacity-0 !min-w-0 !min-h-0" />
      <Handle type="target" position={Position.Left} id="left" className="!w-1 !h-1 !opacity-0 !min-w-0 !min-h-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-1 !h-1 !opacity-0 !min-w-0 !min-h-0" />
    </>
  );
}

function SensorNode({
  ecu,
  selected,
  highlighted,
  activeInFlow,
  dimmed,
}: {
  ecu: ECU;
  selected: boolean;
  highlighted: boolean;
  activeInFlow: boolean;
  dimmed?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center cursor-pointer transition-all duration-200',
        dimmed && 'opacity-25'
      )}
    >
      <NodeHandles />
      <div
        className={cn(
          'w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all',
          'bg-[#26A69A]/20 border-[#26A69A]',
          selected && 'ring-2 ring-cyan-400/60 scale-110',
          highlighted && 'shadow-[0_0_12px_rgba(38,166,154,0.5)]',
          activeInFlow && 'vv-zone-node-pulse'
        )}
        style={{ boxShadow: highlighted ? `0 0 14px ${ZONE_TEAL}60` : undefined }}
      >
        <span className="text-[8px] font-bold text-white/90 text-center leading-tight px-1">
          {ecu.shortName}
        </span>
      </div>
      <span className="text-[7px] text-slate-500 mt-1 max-w-[64px] text-center truncate">
        {ecu.name.split(' ')[0]}
      </span>
    </div>
  );
}

function GatewayHexNode({
  ecu,
  selected,
  highlighted,
  activeInFlow,
  dimmed,
}: {
  ecu: ECU;
  selected: boolean;
  highlighted: boolean;
  activeInFlow: boolean;
  dimmed?: boolean;
}) {
  return (
    <div className={cn('relative', dimmed && 'opacity-25')}>
      <NodeHandles />
      <div
        className={cn(
          'w-[108px] h-[88px] flex flex-col items-center justify-center cursor-pointer',
          'bg-white/95 text-slate-900 transition-all duration-200',
          selected && 'ring-2 ring-cyan-400 scale-105',
          activeInFlow && 'vv-zone-node-pulse',
          highlighted && 'shadow-[0_0_20px_rgba(255,255,255,0.35)]'
        )}
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      >
        <span className="text-[9px] font-bold uppercase tracking-wide">Central</span>
        <span className="text-[10px] font-bold">{ecu.shortName}</span>
        <span className="text-[7px] text-slate-600 mt-0.5">Gateway</span>
      </div>
    </div>
  );
}

function HubRectNode({
  ecu,
  selected,
  highlighted,
  activeInFlow,
  dimmed,
  variant,
}: {
  ecu: ECU;
  selected: boolean;
  highlighted: boolean;
  activeInFlow: boolean;
  dimmed?: boolean;
  variant: 'compute' | 'telematics';
}) {
  const isTelematics = variant === 'telematics';
  return (
    <div className={cn('relative', dimmed && 'opacity-25')}>
      <NodeHandles />
      <div
        className={cn(
          'w-[104px] px-2 py-2 rounded-md cursor-pointer text-center border transition-all',
          isTelematics
            ? 'bg-[#e53935] border-red-400 text-white'
            : 'bg-slate-500/80 border-slate-400/50 text-white',
          selected && 'ring-2 ring-cyan-400 scale-105',
          activeInFlow && 'vv-zone-node-pulse',
          highlighted && 'shadow-lg'
        )}
      >
        <p className="text-[8px] uppercase tracking-wider opacity-80">
          {isTelematics ? 'Telematics' : 'Vehicle compute'}
        </p>
        <p className="text-[10px] font-bold truncate">{ecu.shortName}</p>
      </div>
    </div>
  );
}

function ZonalNode({
  ecu,
  selected,
  highlighted,
  activeInFlow,
  dimmed,
}: {
  ecu: ECU;
  selected: boolean;
  highlighted: boolean;
  activeInFlow: boolean;
  dimmed?: boolean;
}) {
  return (
    <div className={cn('relative', dimmed && 'opacity-25')}>
      <NodeHandles />
      <div
        className={cn(
          'w-[100px] px-2 py-2 rounded-md cursor-pointer text-center border-2 transition-all',
          'bg-[#26A69A] border-[#2eb8aa] text-white',
          selected && 'ring-2 ring-cyan-300 scale-105',
          activeInFlow && 'vv-zone-node-pulse',
          highlighted && 'shadow-[0_0_16px_rgba(38,166,154,0.45)]'
        )}
      >
        <p className="text-[7px] uppercase tracking-wider opacity-90">Zonal gateway</p>
        <p className="text-[10px] font-bold truncate">{ecu.shortName}</p>
      </div>
    </div>
  );
}

function StandardNode({
  ecu,
  selected,
  highlighted,
  activeInFlow,
  dimmed,
}: {
  ecu: ECU;
  selected: boolean;
  highlighted: boolean;
  activeInFlow: boolean;
  dimmed?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative w-[108px] rounded-md overflow-hidden cursor-pointer border bg-slate-900/92 backdrop-blur-sm transition-all',
        dimmed && 'opacity-25',
        selected
          ? 'border-cyan-400/70 shadow-[0_0_14px_rgba(0,212,255,0.25)]'
          : highlighted
            ? 'border-[#26A69A]/50'
            : 'border-slate-600/40 hover:border-[#26A69A]/40',
        activeInFlow && 'vv-zone-node-pulse'
      )}
    >
      <NodeHandles />
      <div className="px-2 py-1 border-b border-slate-700/40 bg-slate-800/90 flex justify-between gap-1">
        <span className="text-[10px] font-bold text-slate-100 truncate">{ecu.shortName}</span>
        <AsilBadge level={ecu.asil} />
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[8px] text-slate-500 line-clamp-2 leading-tight">{ecu.name}</p>
        <div className="flex flex-wrap gap-0.5 mt-1">
          {ecu.networks.slice(0, 2).map((n) => (
            <NetworkBadge key={n} type={n} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const ArchitectureECUNode = memo(ArchitectureECUNodeComponent);
