'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { autosarLayers } from '@/lib/data';
import { getExplainWhy } from '@/lib/simulation-loader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

const layerColors = [
  'border-cyan-500/30',
  'border-blue-500/30',
  'border-indigo-500/30',
  'border-purple-500/30',
  'border-violet-500/30',
  'border-fuchsia-500/30',
  'border-pink-500/30',
  'border-rose-500/30',
  'border-orange-500/30',
];

export function AutosarExplorerEnhancement() {
  const selectedAutosarLayerId = useAppStore((s) => s.selectedAutosarLayerId);
  const selectAutosarLayer = useAppStore((s) => s.selectAutosarLayer);
  const [demoIndex, setDemoIndex] = useState(0);

  const sortedLayers = [...autosarLayers].sort((a, b) => a.order - b.order);
  const selectedLayer = sortedLayers.find((l) => l.id === selectedAutosarLayerId);
  const activeIndex = selectedLayer
    ? sortedLayers.findIndex((l) => l.id === selectedLayer.id)
    : demoIndex;

  useEffect(() => {
    if (selectedAutosarLayerId) return;
    const interval = setInterval(() => {
      setDemoIndex((p) => (p + 1) % sortedLayers.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [selectedAutosarLayerId, sortedLayers.length]);

  const highlightId = selectedAutosarLayerId || sortedLayers[activeIndex]?.id;

  return (
    <div className="relative w-full h-full min-h-0 engineering-bg flex flex-col">
      <div className="shrink-0 px-4 py-2 border-b border-cyan-500/10 bg-slate-900/50">
        <h2 className="text-sm font-semibold text-slate-100">AUTOSAR Classic Platform</h2>
        <p className="text-[10px] text-slate-500">All layers visible — click to inspect • auto-highlight when idle</p>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-h-0 p-4 overflow-y-auto custom-scrollbar">
          <div className="flex flex-wrap gap-2 items-start justify-center max-w-4xl mx-auto">
            {sortedLayers.map((layer, index) => {
              const isActive = highlightId === layer.id;
              return (
                <motion.button
                  key={layer.id}
                  type="button"
                  onClick={() => selectAutosarLayer(layer.id)}
                  className="shrink-0 text-left"
                  animate={{ scale: isActive ? 1.04 : 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <GlassPanel
                    highlighted={isActive}
                    className={cn(
                      'p-2.5 w-[140px] transition-all',
                      layerColors[index % layerColors.length],
                      isActive && 'neon-cyan'
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] font-semibold text-slate-100 leading-tight">{layer.name}</p>
                      <span className="text-[9px] font-mono text-slate-500">L{index}</span>
                    </div>
                    <p className="text-[9px] font-mono text-cyan-400/70 mt-0.5">{layer.shortName}</p>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[8px] text-slate-400 mt-1 line-clamp-3 leading-relaxed"
                      >
                        {layer.purpose}
                      </motion.p>
                    )}
                  </GlassPanel>
                </motion.button>
              );
            })}
          </div>

          <p className="text-center text-[9px] text-slate-600 mt-4 font-mono">▼ Physical Layer ▼</p>
        </div>

        <div className="w-72 shrink-0 border-l border-cyan-500/10 p-3 overflow-y-auto custom-scrollbar bg-slate-900/30">
          {(() => {
            const layer = sortedLayers.find((l) => l.id === highlightId);
            if (!layer) return null;
            const explain = getExplainWhy(layer.shortName.toLowerCase().replace(/\s+/g, '') || 'autosar');
            return (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-cyan-300/90">{layer.name}</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">{layer.purpose}</p>
                <GlassPanel className="p-2.5 space-y-2">
                  <p className="text-[9px] text-slate-500 uppercase">Responsibilities</p>
                  <ul className="space-y-1">
                    {layer.responsibilities.map((r) => (
                      <li key={r} className="text-[10px] text-slate-300 flex gap-1">
                        <span className="text-cyan-500/50">▸</span>{r}
                      </li>
                    ))}
                  </ul>
                </GlassPanel>
                <GlassPanel className="p-2.5">
                  <p className="text-[9px] text-slate-500 uppercase mb-1">Inputs / Outputs</p>
                  <p className="text-[10px] text-slate-400"><span className="text-slate-600">In:</span> {layer.inputs.join(', ')}</p>
                  <p className="text-[10px] text-slate-400 mt-1"><span className="text-slate-600">Out:</span> {layer.outputs.join(', ')}</p>
                </GlassPanel>
                <p className="text-[10px] text-slate-500">{explain.debuggingMethod.slice(0, 100)}…</p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
