'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { autosarLayers } from '@/lib/data';
import { GlassPanel } from './ui/GlassPanel';
import { cn } from '@/lib/utils';

const layerColors = [
  'from-cyan-500/20 to-cyan-600/10',
  'from-blue-500/20 to-blue-600/10',
  'from-indigo-500/20 to-indigo-600/10',
  'from-purple-500/20 to-purple-600/10',
  'from-violet-500/20 to-violet-600/10',
  'from-fuchsia-500/20 to-fuchsia-600/10',
  'from-pink-500/20 to-pink-600/10',
  'from-rose-500/20 to-rose-600/10',
  'from-orange-500/20 to-orange-600/10',
];

export function AutosarExplorer() {
  const selectedAutosarLayerId = useAppStore((s) => s.selectedAutosarLayerId);
  const selectAutosarLayer = useAppStore((s) => s.selectAutosarLayer);

  const sortedLayers = [...autosarLayers].sort((a, b) => a.order - b.order);

  return (
    <div className="relative w-full h-full engineering-bg flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-slate-100">AUTOSAR Classic Platform</h2>
          <p className="text-xs text-slate-500 mt-1">Software Stack Architecture — Click any layer to inspect</p>
        </div>

        <div className="space-y-1">
          {sortedLayers.map((layer, index) => {
            const isSelected = selectedAutosarLayerId === layer.id;
            const isAbove = sortedLayers.findIndex((l) => l.id === selectedAutosarLayerId) > index;

            return (
              <div key={layer.id} className="relative">
                <motion.div
                  onClick={() => selectAutosarLayer(layer.id)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlassPanel
                    highlighted={isSelected}
                    className={cn(
                      'p-3 transition-all duration-300',
                      `bg-gradient-to-r ${layerColors[index % layerColors.length]}`,
                      isSelected && 'neon-cyan'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">{layer.name}</h3>
                        <p className="text-[10px] font-mono text-cyan-400/60">{layer.shortName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <motion.span
                            className="w-2 h-2 rounded-full bg-cyan-400"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">L{index}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-[10px] text-slate-400 mt-2 leading-relaxed"
                      >
                        {layer.purpose}
                      </motion.p>
                    )}
                  </GlassPanel>
                </motion.div>

                {/* Flow arrow between layers */}
                {index < sortedLayers.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <motion.div
                      className="flex flex-col items-center"
                      animate={isSelected || isAbove ? { opacity: 1 } : { opacity: 0.3 }}
                    >
                      <div className="w-px h-3 bg-gradient-to-b from-cyan-500/50 to-cyan-500/20" />
                      <motion.div
                        className="text-[8px] text-cyan-500/50"
                        animate={{ y: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ▼
                      </motion.div>
                      {(isSelected || isAbove) && (
                        <motion.div
                          className="w-1 h-1 rounded-full bg-cyan-400"
                          animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Physical layer label */}
        <div className="text-center mt-4">
          <span className="text-[10px] text-slate-600 font-mono">▼ Physical Layer ▼</span>
        </div>
      </div>
    </div>
  );
}
