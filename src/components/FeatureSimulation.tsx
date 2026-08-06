'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { getFeatureById } from '@/lib/data';
import { GlassPanel } from './ui/GlassPanel';
import { cn } from '@/lib/utils';

const stageTypeColors: Record<string, string> = {
  input: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  switch: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  lin: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
  ecu: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
  gateway: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  can: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  autosar: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
  mcal: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
  driver: 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400',
  hardware: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
  output: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  swc: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
  port: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  rte: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
  com: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
  pdur: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
  canif: 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400',
  candrv: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
  controller: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
  bus: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
};

const stageTypeIcons: Record<string, string> = {
  input: '👤',
  switch: '⏻',
  lin: '⬡',
  ecu: '▣',
  gateway: '⇄',
  can: '⟐',
  autosar: '⬢',
  mcal: '⚙',
  driver: '⚡',
  hardware: '◈',
  output: '✦',
  swc: '◉',
  port: '◈',
  rte: '⇌',
  com: '⇒',
  pdur: '⇒',
  canif: '⇒',
  candrv: '⇒',
  controller: '▣',
  bus: '⟐',
};

export function FeatureSimulation() {
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const activeFlowStage = useAppStore((s) => s.activeFlowStage);
  const isSimulationRunning = useAppStore((s) => s.isSimulationRunning);
  const startSimulation = useAppStore((s) => s.startSimulation);
  const stopSimulation = useAppStore((s) => s.stopSimulation);

  const feature = selectedFeatureId ? getFeatureById(selectedFeatureId) : null;

  if (!feature) {
    return (
      <div className="flex items-center justify-center h-full engineering-bg">
        <p className="text-sm text-slate-500">Select a feature from the sidebar</p>
      </div>
    );
  }

  const showSignalFlow = isSimulationRunning && activeFlowStage >= 0;

  return (
    <div className="relative w-full h-full engineering-bg overflow-hidden">
      {/* Feature header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <GlassPanel className="px-4 py-2">
          <h2 className="text-sm font-semibold text-slate-100">{feature.name}</h2>
          <p className="text-[10px] text-slate-500">{feature.description}</p>
        </GlassPanel>

        <motion.button
          onClick={() => isSimulationRunning ? stopSimulation() : startSimulation()}
          className={cn(
            'px-4 py-2 rounded-lg text-xs font-semibold transition-all border',
            isSimulationRunning
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 neon-cyan'
          )}
          whileTap={{ scale: 0.95 }}
        >
          {isSimulationRunning ? '■ Stop' : '▶ Run Simulation'}
        </motion.button>
      </div>

      {/* Flow visualization */}
      <div className="flex h-full pt-20 pb-4 px-6 gap-6">
        {/* Main flow pipeline */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Signal Flow Pipeline
          </h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-1 max-w-2xl">
              {feature.flowStages.map((stage, index) => {
                const isActive = isSimulationRunning && activeFlowStage === index;
                const isPast = isSimulationRunning && activeFlowStage > index;

                return (
                  <div key={stage.id} className="relative">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.02 : 1,
                        opacity: isSimulationRunning && !isActive && !isPast ? 0.4 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <GlassPanel
                        highlighted={isActive}
                        className={cn(
                          'p-3 border transition-all duration-300',
                          isActive && 'neon-cyan animate-pulse-glow',
                          isPast && 'border-emerald-500/20',
                          stageTypeColors[stage.type] || 'border-slate-700/30'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{stageTypeIcons[stage.type] || '●'}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-semibold text-slate-200">{stage.name}</h4>
                              <span className="text-[9px] font-mono text-slate-600 uppercase">{stage.type}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">{stage.description}</p>
                          </div>
                          {isActive && (
                            <motion.div
                              className="w-3 h-3 rounded-full bg-cyan-400"
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                          )}
                          {isPast && (
                            <span className="text-emerald-400 text-xs">✓</span>
                          )}
                        </div>
                      </GlassPanel>
                    </motion.div>

                    {index < feature.flowStages.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <motion.div
                          className="flex flex-col items-center"
                          animate={isActive ? { opacity: 1 } : { opacity: 0.2 }}
                        >
                          <div className="w-px h-2 bg-cyan-500/30" />
                          {isActive && (
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                              animate={{ y: [0, 6, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          )}
                          <div className="text-[7px] text-cyan-500/30">▼</div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AUTOSAR signal flow */}
        <AnimatePresence>
          {showSignalFlow && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 flex flex-col"
            >
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                AUTOSAR Signal Flow
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-0.5">
                  {feature.signalFlowStages.map((stage, index) => {
                    const signalStageIndex = Math.floor(
                      (activeFlowStage / feature.flowStages.length) * feature.signalFlowStages.length
                    );
                    const isActive = index === signalStageIndex;
                    const isPast = index < signalStageIndex;

                    return (
                      <div key={stage.id}>
                        <GlassPanel
                          highlighted={isActive}
                          className={cn(
                            'p-2 border transition-all duration-200',
                            isActive && 'neon-cyan',
                            isPast && 'opacity-60',
                            !isActive && !isPast && 'opacity-30',
                            stageTypeColors[stage.type] || ''
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]">{stageTypeIcons[stage.type] || '●'}</span>
                            <div>
                              <span className="text-[10px] font-medium text-slate-300">{stage.name}</span>
                              <p className="text-[8px] text-slate-600">{stage.description}</p>
                            </div>
                            {isActive && (
                              <motion.span
                                className="ml-auto w-2 h-2 rounded-full bg-cyan-400"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                              />
                            )}
                          </div>
                        </GlassPanel>
                        {index < feature.signalFlowStages.length - 1 && (
                          <div className="flex justify-center">
                            <span className="text-[6px] text-slate-700">▼</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      {isSimulationRunning && (
        <div className="absolute bottom-4 left-6 right-6">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              animate={{
                width: `${((activeFlowStage + 1) / feature.flowStages.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-slate-600">
              Stage {activeFlowStage + 1} / {feature.flowStages.length}
            </span>
            <span className="text-[9px] text-slate-600">
              {feature.flowStages[activeFlowStage]?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
