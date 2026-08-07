'use client';

import { useRef, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useExtensionStore } from '../store/extensionStore';
import { getEcuById } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  layoutStepsForCanvas,
  layoutEcuPositions,
  getStagesForStep,
  getActiveStageIndex,
} from '../lib/signalTransmissionStages';
import type { SimulationFeature, SimulationStep, ECUState } from '@/types/simulation';

const GRID = 40;
const networkColors: Record<string, string> = {
  CAN_HS: '#00D4FF',
  CAN_LS: '#4A9EFF',
  LIN: '#7B68EE',
  Ethernet: '#00FF88',
  FlexRay: '#FF6B35',
};

const ecuStateColors: Record<ECUState, string> = {
  sleeping: 'border-slate-600',
  booting: 'border-amber-500/50',
  running: 'border-emerald-500/50',
  waiting: 'border-blue-500/50',
  transmitting: 'border-cyan-500/50',
  receiving: 'border-purple-500/50',
  error: 'border-red-500/50',
  diagnostic: 'border-orange-500/50',
  update: 'border-pink-500/50',
};

const ecuStateGlow: Record<ECUState, string> = {
  sleeping: 'bg-slate-600',
  booting: 'bg-amber-400',
  running: 'bg-emerald-400',
  waiting: 'bg-blue-400',
  transmitting: 'bg-cyan-400',
  receiving: 'bg-purple-400',
  error: 'bg-red-400',
  diagnostic: 'bg-orange-400',
  update: 'bg-pink-400',
};

const stepTypeColors: Record<string, string> = {
  input: '#f59e0b',
  switch: '#f59e0b',
  lin: '#7B68EE',
  ecu: '#10b981',
  gateway: '#6366f1',
  can: '#00D4FF',
  bus: '#00D4FF',
  autosar: '#818cf8',
  mcal: '#a78bfa',
  driver: '#fb923c',
  hardware: '#f472b6',
  output: '#34d399',
  swc: '#22d3ee',
  port: '#38bdf8',
  rte: '#60a5fa',
  com: '#4ade80',
  pdur: '#a3e635',
  canif: '#2dd4bf',
  candrv: '#14b8a6',
  controller: '#06b6d4',
};

interface InteractiveEngineeringCanvasProps {
  feature: SimulationFeature;
  mode?: 'simulation' | 'failure';
  failureEcus?: string[];
  failureActive?: boolean;
}

export function InteractiveEngineeringCanvas({
  feature,
  mode = 'simulation',
  failureEcus = [],
  failureActive = false,
}: InteractiveEngineeringCanvasProps) {
  const canvasZoom = useAppStore((s) => s.canvasZoom);
  const canvasPan = useAppStore((s) => s.canvasPan);
  const setCanvasZoom = useAppStore((s) => s.setCanvasZoom);
  const setCanvasPan = useAppStore((s) => s.setCanvasPan);
  const resetCanvas = useAppStore((s) => s.resetCanvas);
  const showGrid = useAppStore((s) => s.showGrid);
  const toggleGrid = useAppStore((s) => s.toggleGrid);
  const snapToGrid = useAppStore((s) => s.snapToGrid);
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const openExplainWhy = useAppStore((s) => s.openExplainWhy);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);

  const canvasViewMode = useExtensionStore((s) => s.canvasViewMode);
  const setCanvasViewMode = useExtensionStore((s) => s.setCanvasViewMode);
  const ecuCanvasPositions = useExtensionStore((s) => s.ecuCanvasPositions);
  const setEcuPosition = useExtensionStore((s) => s.setEcuPosition);
  const failureSimStep = useExtensionStore((s) => s.failureSimStep);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingEcu, setDraggingEcu] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const steps = useMemo(() => layoutStepsForCanvas(feature.steps), [feature.steps]);
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const featureId = selectedFeatureId || feature.id;
  const storedEcu = ecuCanvasPositions[featureId];

  const ecuPositions = useMemo(() => {
    const raw = layoutEcuPositions(feature.involvedEcus, steps, storedEcu);
    return raw.map((ecu) => {
      const ecuData = getEcuById(ecu.id);
      return { ...ecu, name: ecuData?.shortName || ecu.id };
    });
  }, [feature.involvedEcus, steps, storedEcu]);

  const showEcu = canvasViewMode === 'ecu' || canvasViewMode === 'both';
  const showSignal = canvasViewMode === 'signal' || canvasViewMode === 'both';

  const snap = (v: number) => (snapToGrid ? Math.round(v / GRID) * GRID : v);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setCanvasZoom(canvasZoom + (e.deltaY > 0 ? -0.1 : 0.1));
    },
    [canvasZoom, setCanvasZoom]
  );

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (draggingEcu) return;
    if (e.button === 2 || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingEcu) {
      const scale = canvasZoom;
      const newX = snap((e.clientX - dragOffset.x - canvasPan.x) / scale);
      const newY = snap((e.clientY - dragOffset.y - canvasPan.y) / scale);
      setEcuPosition(featureId, draggingEcu, { x: newX, y: newY });
      return;
    }
    if (isPanning) {
      setCanvasPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingEcu(null);
  };

  const startEcuDrag = (e: React.MouseEvent, ecuId: string, x: number, y: number) => {
    e.stopPropagation();
    e.preventDefault();
    const scale = canvasZoom;
    setDraggingEcu(ecuId);
    setDragOffset({
      x: e.clientX - (x * scale + canvasPan.x),
      y: e.clientY - (y * scale + canvasPan.y),
    });
  };

  const signalStages = currentStep ? getStagesForStep(currentStep, feature) : [];
  const activeStageIdx = currentStep ? getActiveStageIndex(currentStep) : 0;

  return (
    <div className="relative flex-1 overflow-hidden engineering-bg h-full" ref={containerRef}>
      {/* View mode toolbar */}
      <div className="absolute top-2 left-2 z-30 flex items-center gap-1 glass-panel rounded-md p-1">
        {(['both', 'signal', 'ecu'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setCanvasViewMode(m)}
            className={cn(
              'px-2 py-0.5 text-[9px] rounded transition-colors',
              canvasViewMode === m ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {m === 'both' ? 'ECU + Signal' : m === 'signal' ? 'Signal Path' : 'ECU Only'}
          </button>
        ))}
      </div>

      <div className="absolute top-2 right-2 z-30 flex items-center gap-1 glass-panel rounded-md p-1">
        <button type="button" onClick={() => setCanvasZoom(canvasZoom - 0.2)} className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-cyan-300">−</button>
        <span className="text-[9px] font-mono text-slate-500 w-8 text-center">{Math.round(canvasZoom * 100)}%</span>
        <button type="button" onClick={() => setCanvasZoom(canvasZoom + 0.2)} className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-cyan-300">+</button>
        <button type="button" onClick={resetCanvas} className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-cyan-300">⟲</button>
        <button type="button" onClick={toggleGrid} className={cn('px-1.5 py-0.5 text-[10px]', showGrid ? 'text-cyan-400' : 'text-slate-500')}>▦</button>
      </div>

      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          style={{
            transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
            transformOrigin: '0 0',
          }}
          className="relative min-h-[700px] min-w-[1000px] transition-transform duration-75"
        >
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
                backgroundSize: `${GRID}px ${GRID}px`,
                minWidth: 1000,
                minHeight: 700,
              }}
            />
          )}

          {/* Signal path edges */}
          {showSignal && (
            <svg className="absolute inset-0 pointer-events-none" style={{ minWidth: 1000, minHeight: 700 }}>
              {steps.map((step, i) => {
                const next = steps[i + 1];
                if (!next?.canvasPosition || !step.canvasPosition) return null;
                const from = step.canvasPosition;
                const to = next.canvasPosition;
                const isPast = currentStepIndex > i;
                const isActive = currentStepIndex === i;
                const color = stepTypeColors[step.type] || '#334155';
                return (
                  <g key={`edge-${step.id}`}>
                    <line
                      x1={from.x + 50}
                      y1={from.y + 22}
                      x2={to.x + 50}
                      y2={to.y + 22}
                      stroke={isActive ? color : isPast ? '#10b981' : '#334155'}
                      strokeWidth={isActive ? 2.5 : 1}
                      strokeOpacity={isActive ? 1 : isPast ? 0.6 : 0.25}
                      strokeDasharray={isActive ? undefined : '4 4'}
                    />
                    {isActive && (
                      <>
                        <motion.circle
                          r={5}
                          fill={color}
                          initial={{ offsetDistance: '0%' }}
                          animate={{ offsetDistance: '100%' }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                          style={{
                            offsetPath: `path('M ${from.x + 50} ${from.y + 22} L ${to.x + 50} ${to.y + 22}')`,
                            filter: `drop-shadow(0 0 6px ${color})`,
                          }}
                        />
                        <motion.circle
                          r={3}
                          fill="#fff"
                          initial={{ offsetDistance: '0%' }}
                          animate={{ offsetDistance: '100%' }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear', delay: 0.25 }}
                          style={{
                            offsetPath: `path('M ${from.x + 50} ${from.y + 22} L ${to.x + 50} ${to.y + 22}')`,
                          }}
                        />
                      </>
                    )}
                  </g>
                );
              })}

              {/* ECU chain edges when both modes */}
              {showEcu && ecuPositions.map((from, i) => {
                const to = ecuPositions[i + 1];
                if (!to) return null;
                const isFailureEcu = mode === 'failure' && failureEcus.includes(from.id);
                const isActive =
                  currentStep &&
                  (currentStep.ecuId === from.id || currentStep.ecuId === to.id);
                return (
                  <line
                    key={`ecu-edge-${from.id}`}
                    x1={from.x + 60}
                    y1={from.y + 30}
                    x2={to.x + 60}
                    y2={to.y + 30}
                    stroke={isFailureEcu && failureActive ? '#ef4444' : isActive ? '#00d4ff' : '#334155'}
                    strokeWidth={isActive || (isFailureEcu && failureActive) ? 2 : 1}
                    strokeOpacity={0.7}
                  />
                );
              })}
            </svg>
          )}

          {/* Signal step nodes */}
          {showSignal &&
            steps.map((step, i) => {
              if (!step.canvasPosition) return null;
              const isActive = currentStepIndex === i;
              const isPast = currentStepIndex > i;
              const color = stepTypeColors[step.type] || '#64748b';
              return (
                <motion.div
                  key={step.id}
                  className={cn(
                    'absolute w-[100px] rounded-md border backdrop-blur-sm px-1.5 py-1 cursor-default select-none',
                    isActive ? 'z-20 neon-cyan' : 'z-10',
                    isPast ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-slate-900/70 border-slate-700/50'
                  )}
                  style={{
                    left: step.canvasPosition.x,
                    top: step.canvasPosition.y,
                    borderColor: isActive ? color : undefined,
                    boxShadow: isActive ? `0 0 12px ${color}40` : undefined,
                  }}
                  animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={{ duration: 1.2, repeat: isActive ? Infinity : 0 }}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[8px] font-mono text-slate-500">#{step.stepNumber}</span>
                  </div>
                  <p className="text-[9px] font-semibold text-slate-200 leading-tight truncate">{step.title}</p>
                  <p className="text-[7px] text-slate-500 font-mono truncate">{step.type}</p>
                </motion.div>
              );
            })}

          {/* Draggable ECU nodes */}
          {showEcu &&
            ecuPositions.map((ecu) => {
              const isHighlighted = currentStep?.ecuId === ecu.id;
              const isFailure = mode === 'failure' && failureEcus.includes(ecu.id);
              const state: ECUState = isFailure && failureActive
                ? 'error'
                : isHighlighted
                  ? currentStep?.ecuState || 'running'
                  : 'waiting';
              return (
                <motion.div
                  key={ecu.id}
                  className={cn(
                    'absolute w-[120px] rounded-lg border backdrop-blur-sm bg-slate-900/85 p-2 shadow-lg cursor-grab active:cursor-grabbing',
                    ecuStateColors[state],
                    isHighlighted && 'neon-cyan',
                    isFailure && failureActive && 'border-red-500/60 shadow-red-500/20'
                  )}
                  style={{ left: ecu.x, top: ecu.y, zIndex: 25 }}
                  onMouseDown={(e) => startEcuDrag(e, ecu.id, ecu.x, ecu.y)}
                  animate={
                    isFailure && failureActive
                      ? { scale: [1, 1.04, 1], boxShadow: ['0 0 0px #ef4444', '0 0 16px #ef444440', '0 0 0px #ef4444'] }
                      : isHighlighted
                        ? { scale: [1, 1.03, 1] }
                        : { scale: 1 }
                  }
                  transition={{ duration: 1.2, repeat: isHighlighted || (isFailure && failureActive) ? Infinity : 0 }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full shadow-[0_0_6px]', ecuStateGlow[state])} />
                    <span className="text-[11px] font-bold text-slate-200">{ecu.name}</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono">{state}</span>
                  <span className="text-[7px] text-slate-600 block mt-0.5">drag to reposition</span>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* Live signal transmission ribbon */}
      <AnimatePresence>
        {currentStep && mode === 'simulation' && (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="absolute bottom-3 left-3 right-3 z-30 glass-panel-highlight rounded-lg border border-cyan-500/20 p-2 max-h-[140px]"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400">
                  Step {currentStep.stepNumber}/{steps.length}
                </span>
                <span className="text-xs font-semibold text-slate-100">{currentStep.title}</span>
                {currentStep.network && (
                  <span
                    className="text-[8px] px-1.5 py-0.5 rounded font-mono"
                    style={{
                      color: networkColors[currentStep.network],
                      backgroundColor: `${networkColors[currentStep.network]}15`,
                      border: `1px solid ${networkColors[currentStep.network]}40`,
                    }}
                  >
                    {currentStep.network}
                  </span>
                )}
              </div>
              {currentStep.explainWhyKey && (
                <button
                  type="button"
                  onClick={() => openExplainWhy(currentStep.explainWhyKey!)}
                  className="text-[9px] text-indigo-400 hover:text-indigo-300"
                >
                  ? Why
                </button>
              )}
            </div>

            <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
              {signalStages.map((stage, si) => {
                const isStageActive = si === activeStageIdx;
                return (
                  <motion.div
                    key={stage.id}
                    className={cn(
                      'shrink-0 rounded border px-2 py-1 min-w-[120px] max-w-[160px]',
                      isStageActive
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-slate-700/40 bg-slate-900/50'
                    )}
                    animate={isStageActive ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 1, repeat: isStageActive ? Infinity : 0 }}
                  >
                    <p className="text-[8px] text-slate-500 uppercase">{stage.layer}</p>
                    <p className="text-[9px] font-semibold text-slate-200 truncate">{stage.label}</p>
                    <p className="text-[8px] font-mono text-cyan-400/90 truncate">{stage.representation}</p>
                  </motion.div>
                );
              })}
            </div>

            {currentStep.canId && (
              <p className="text-[8px] font-mono text-slate-500 mt-1 truncate">
                Frame: {currentStep.canId} • {currentStep.payload || '—'} • {currentStep.sender || '—'} → {currentStep.receiver || '—'}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failure propagation banner */}
      {mode === 'failure' && failureActive && (
        <motion.div
          className="absolute top-12 left-1/2 -translate-x-1/2 z-30 glass-panel border border-red-500/30 px-4 py-2 rounded-lg"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <p className="text-[10px] text-red-300 font-medium">
            Failure propagation step {failureSimStep + 1} — signal path disrupted on involved ECUs
          </p>
        </motion.div>
      )}

      {/* Mini map */}
      <div className="absolute bottom-2 left-2 w-28 h-20 glass-panel rounded border border-cyan-500/10 overflow-hidden opacity-70 z-20">
        <div className="relative w-full h-full p-1">
          {steps.map((step) =>
            step.canvasPosition ? (
              <div
                key={step.id}
                className="absolute w-1.5 h-1.5 rounded-full bg-cyan-500/50"
                style={{
                  left: `${(step.canvasPosition.x / 1000) * 100}%`,
                  top: `${(step.canvasPosition.y / 700) * 100}%`,
                }}
              />
            ) : null
          )}
          {ecuPositions.map((ecu) => (
            <div
              key={ecu.id}
              className="absolute w-2 h-2 rounded-sm bg-emerald-500/60"
              style={{ left: `${(ecu.x / 1000) * 100}%`, top: `${(ecu.y / 700) * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-14 left-2 z-20 text-[8px] text-slate-600 glass-panel px-2 py-1 rounded">
        Drag ECU blocks • Right-drag pan • Wheel zoom
      </div>
    </div>
  );
}
