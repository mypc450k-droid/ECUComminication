'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { autosarLayers } from '@/lib/data';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

const stackLayers = [
  { id: 'app-layer', label: 'Application', group: 'Application' },
  { id: 'rte', label: 'RTE', group: 'Services' },
  { id: 'com', label: 'COM', group: 'Services' },
  { id: 'pdur', label: 'PduR', group: 'Services' },
  { id: 'canif', label: 'CanIf', group: 'ECU Abstraction' },
  { id: 'candrv', label: 'CanDrv', group: 'ECU Abstraction' },
  { id: 'mcal', label: 'MCAL', group: 'MCAL' },
  { id: 'can-controller', label: 'CAN Controller', group: 'Hardware' },
  { id: 'transceiver', label: 'Transceiver', group: 'Hardware' },
];

export function AutosarStackVisualizer() {
  const selectedAutosarLayerId = useAppStore((s) => s.selectedAutosarLayerId);
  const selectAutosarLayer = useAppStore((s) => s.selectAutosarLayer);
  const openExplainWhy = useAppStore((s) => s.openExplainWhy);

  const selected = autosarLayers.find((l) => l.id === selectedAutosarLayerId);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-1">
          <h3 className="text-center text-sm font-semibold text-slate-200 mb-4">AUTOSAR Classic Platform Stack</h3>
          {stackLayers.map((layer, i) => {
            const isSelected = selectedAutosarLayerId === layer.id;
            const fullLayer = autosarLayers.find((l) => l.id === layer.id);
            return (
              <div key={layer.id}>
                <motion.button
                  onClick={() => selectAutosarLayer(layer.id)}
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlassPanel
                    highlighted={isSelected}
                    className={cn(
                      'p-3 transition-all',
                      isSelected && 'neon-cyan'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-slate-100">{layer.label}</span>
                        <span className="text-[9px] text-slate-600 ml-2">{layer.group}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const key = layer.id === 'app-layer' ? 'swc' : layer.id === 'canif' || layer.id === 'candrv' ? 'canif' : layer.id;
                          openExplainWhy(key);
                        }}
                        className="text-[9px] text-indigo-400 hover:text-indigo-300"
                      >
                        ? Why
                      </button>
                    </div>
                    {isSelected && fullLayer && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-slate-400 mt-2"
                      >
                        {fullLayer.purpose}
                      </motion.p>
                    )}
                  </GlassPanel>
                </motion.button>
                {i < stackLayers.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <motion.span
                      className="text-[8px] text-cyan-500/40"
                      animate={{ y: [0, 2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ▼
                    </motion.span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="w-72 border-l border-cyan-500/10 p-4 overflow-y-auto custom-scrollbar">
          <h3 className="text-sm font-semibold text-slate-100">{selected.name}</h3>
          <p className="text-[10px] text-cyan-400/70 font-mono">{selected.shortName}</p>

          <div className="mt-3 space-y-2">
            <Detail title="Purpose" content={selected.purpose} />
            <Detail title="APIs" content={selected.relatedModules.join(', ')} />
            <Detail title="Typical Files" content={`${selected.shortName}.c, ${selected.shortName}.h, ${selected.shortName}_Cfg.h`} />
            <Detail title="Configuration" content={selected.configuration.join('; ')} />
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h4 className="text-[9px] text-slate-500 uppercase tracking-wider">{title}</h4>
      <p className="text-[10px] text-slate-400 mt-0.5">{content}</p>
    </div>
  );
}
