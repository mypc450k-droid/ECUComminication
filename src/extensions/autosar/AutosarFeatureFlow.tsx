'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { getExplainWhy } from '@/lib/simulation-loader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';
import type { SimulationFeature } from '@/types/simulation';

const LAYERS = [
  { id: 'app-layer', key: 'swc', label: 'Application SWC' },
  { id: 'rte', key: 'rte', label: 'RTE' },
  { id: 'com', key: 'com', label: 'COM' },
  { id: 'pdur', key: 'pdur', label: 'PduR' },
  { id: 'canif', key: 'canif', label: 'CanIf' },
  { id: 'candrv', key: 'canif', label: 'CanDrv' },
  { id: 'mcal', key: 'mcal', label: 'MCAL' },
  { id: 'can-controller', key: 'can', label: 'CAN Controller' },
  { id: 'transceiver', key: 'can', label: 'Transceiver' },
  { id: 'bus', key: 'can', label: 'CAN Bus' },
  { id: 'rx-ecu', key: 'ecu', label: 'Destination ECU' },
];

const RX_LAYERS = [
  { id: 'rx-candrv', key: 'canif', label: 'CanDrv RX' },
  { id: 'rx-canif', key: 'canif', label: 'CanIf RX' },
  { id: 'rx-com', key: 'com', label: 'COM RX' },
  { id: 'rx-rte', key: 'rte', label: 'RTE RX' },
  { id: 'rx-swc', key: 'swc', label: 'Receiver SWC' },
];

export function AutosarFeatureFlow({ feature }: { feature: SimulationFeature }) {
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const openExplainWhy = useAppStore((s) => s.openExplainWhy);
  const activeLayer = currentStepIndex >= 0
    ? Math.floor((currentStepIndex / feature.steps.length) * LAYERS.length)
    : -1;

  return (
    <div className="flex h-full">
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
        <div className="max-w-lg w-full">
          <h3 className="text-center text-sm font-semibold text-slate-200 mb-1">{feature.name} — AUTOSAR Execution Flow</h3>
          <p className="text-center text-[10px] text-slate-500 mb-4">Transmit path ↓ then receive path ↑</p>

          <div className="space-y-1">
            {LAYERS.map((layer, i) => {
              const isActive = i === activeLayer;
              const explain = getExplainWhy(layer.key);
              return (
                <LayerBlock
                  key={layer.id}
                  label={layer.label}
                  isActive={isActive}
                  purpose={explain?.purpose}
                  onWhy={() => openExplainWhy(layer.key)}
                />
              );
            })}
          </div>

          <p className="text-center text-[9px] text-slate-600 my-3">— Receive Path —</p>

          <div className="space-y-1">
            {RX_LAYERS.map((layer, i) => {
              const isActive = i === Math.max(0, activeLayer - 3);
              const explain = getExplainWhy(layer.key);
              return (
                <LayerBlock
                  key={layer.id}
                  label={layer.label}
                  isActive={isActive}
                  purpose={explain?.purpose}
                  onWhy={() => openExplainWhy(layer.key)}
                  reverse
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-64 border-l border-cyan-500/10 p-3 overflow-y-auto custom-scrollbar">
        <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Layer Detail</h4>
        {activeLayer >= 0 && LAYERS[activeLayer] && (
          <LayerDetail layerKey={LAYERS[activeLayer].key} feature={feature} />
        )}
      </div>
    </div>
  );
}

function LayerBlock({
  label,
  isActive,
  purpose,
  onWhy,
  reverse,
}: {
  label: string;
  isActive: boolean;
  purpose?: string;
  onWhy: () => void;
  reverse?: boolean;
}) {
  return (
    <motion.div animate={{ scale: isActive ? 1.02 : 1 }}>
      <GlassPanel
        highlighted={isActive}
        className={cn('p-2.5 transition-all', isActive && 'neon-cyan', reverse && 'border-purple-500/20')}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">{label}</span>
          <button onClick={onWhy} className="text-[9px] text-indigo-400 hover:text-indigo-300">WHY?</button>
        </div>
        {isActive && purpose && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-slate-400 mt-1">
            {purpose.slice(0, 120)}...
          </motion.p>
        )}
      </GlassPanel>
      <div className="flex justify-center py-0.5 text-[7px] text-cyan-500/30">▼</div>
    </motion.div>
  );
}

function LayerDetail({ layerKey, feature }: { layerKey: string; feature: SimulationFeature }) {
  const explain = getExplainWhy(layerKey);
  if (!explain) return null;
  return (
    <div className="space-y-2 text-[10px] text-slate-400">
      <p><span className="text-slate-500">Input:</span> {feature.driverInput}</p>
      <p><span className="text-slate-500">Output:</span> {feature.physicalOutput}</p>
      <p><span className="text-slate-500">Files:</span> {layerKey}.c, {layerKey}_Cfg.h</p>
      <p><span className="text-slate-500">OEM:</span> {explain.oemExample.slice(0, 80)}...</p>
      <p><span className="text-slate-500">Debug:</span> {explain.debuggingMethod.slice(0, 80)}...</p>
    </div>
  );
}
