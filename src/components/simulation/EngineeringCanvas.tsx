'use client';

import { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { getEcuById } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { SimulationStep, ECUState } from '@/types/simulation';

const ecuStateColors: Record<ECUState, string> = {
  sleeping: 'border-slate-600 shadow-slate-600/20',
  booting: 'border-amber-500/50 shadow-amber-500/20',
  running: 'border-emerald-500/50 shadow-emerald-500/20',
  waiting: 'border-blue-500/50 shadow-blue-500/20',
  transmitting: 'border-cyan-500/50 shadow-cyan-500/30',
  receiving: 'border-purple-500/50 shadow-purple-500/30',
  error: 'border-red-500/50 shadow-red-500/30',
  diagnostic: 'border-orange-500/50 shadow-orange-500/20',
  update: 'border-pink-500/50 shadow-pink-500/20',
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

interface EngineeringCanvasProps {
  steps: SimulationStep[];
  involvedEcus: string[];
}

export function EngineeringCanvas({ steps, involvedEcus }: EngineeringCanvasProps) {
  const canvasZoom = useAppStore((s) => s.canvasZoom);
  const canvasPan = useAppStore((s) => s.canvasPan);
  const setCanvasZoom = useAppStore((s) => s.setCanvasZoom);
  const setCanvasPan = useAppStore((s) => s.setCanvasPan);
  const resetCanvas = useAppStore((s) => s.resetCanvas);
  const showGrid = useAppStore((s) => s.showGrid);
  const toggleGrid = useAppStore((s) => s.toggleGrid);
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const openExplainWhy = useAppStore((s) => s.openExplainWhy);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setCanvasZoom(canvasZoom + delta);
    },
    [canvasZoom, setCanvasZoom]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2 || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const ecuPositions = involvedEcus.map((id, i) => {
    const ecu = getEcuById(id);
    const stepForEcu = steps.find((s) => s.ecuId === id);
    return {
      id,
      name: ecu?.shortName || id,
      x: stepForEcu?.canvasPosition?.x ?? 100 + (i % 3) * 200,
      y: stepForEcu?.canvasPosition?.y ?? 100 + Math.floor(i / 3) * 150,
    };
  });

  return (
    <div className="relative flex-1 overflow-hidden engineering-bg" ref={containerRef}>
      {/* Canvas controls */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 glass-panel rounded-md p-1">
        <button onClick={() => setCanvasZoom(canvasZoom - 0.2)} className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-cyan-300">−</button>
        <span className="text-[9px] font-mono text-slate-500 w-8 text-center">{Math.round(canvasZoom * 100)}%</span>
        <button onClick={() => setCanvasZoom(canvasZoom + 0.2)} className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-cyan-300">+</button>
        <button onClick={resetCanvas} className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-cyan-300" title="Reset">⟲</button>
        <button onClick={toggleGrid} className={cn('px-1.5 py-0.5 text-[10px]', showGrid ? 'text-cyan-400' : 'text-slate-500')} title="Grid">▦</button>
      </div>

      {/* Canvas area */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          style={{
            transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
            transformOrigin: 'center center',
          }}
          className="relative w-full h-full min-h-[400px] transition-transform duration-100"
        >
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          )}

          {/* Connection lines between ECUs */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: 600, minWidth: 800 }}>
            {ecuPositions.map((from, i) => {
              const to = ecuPositions[i + 1];
              if (!to) return null;
              const isActive =
                currentStep &&
                (currentStep.ecuId === from.id || currentStep.ecuId === to.id);
              return (
                <g key={`${from.id}-${to.id}`}>
                  <line
                    x1={from.x + 60}
                    y1={from.y + 30}
                    x2={to.x + 60}
                    y2={to.y + 30}
                    stroke={isActive ? '#00d4ff' : '#334155'}
                    strokeWidth={isActive ? 2 : 1}
                    strokeOpacity={isActive ? 0.8 : 0.3}
                  />
                  {isActive && (
                    <motion.circle
                      r={4}
                      fill="#00d4ff"
                      initial={{ offsetDistance: '0%' }}
                      animate={{ offsetDistance: '100%' }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{
                        offsetPath: `path('M ${from.x + 60} ${from.y + 30} L ${to.x + 60} ${to.y + 30}')`,
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* ECU nodes */}
          {ecuPositions.map((ecu) => {
            const isHighlighted = currentStep?.ecuId === ecu.id;
            const state = isHighlighted ? currentStep?.ecuState || 'running' : 'waiting';
            return (
              <motion.div
                key={ecu.id}
                className={cn(
                  'absolute w-[120px] rounded-lg border backdrop-blur-sm bg-slate-900/80 p-2 shadow-lg transition-all duration-300',
                  ecuStateColors[state],
                  isHighlighted && 'neon-cyan scale-105'
                )}
                style={{ left: ecu.x, top: ecu.y }}
                animate={isHighlighted ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 1.5, repeat: isHighlighted ? Infinity : 0 }}
              >
                <div className="flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full shadow-[0_0_6px]', ecuStateGlow[state])} />
                  <span className="text-[11px] font-bold text-slate-200">{ecu.name}</span>
                </div>
                <span className="text-[8px] text-slate-500 font-mono mt-0.5">{state}</span>
              </motion.div>
            );
          })}

          {/* Current step block */}
          {currentStep && (
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-1/2 top-4 -translate-x-1/2 glass-panel-highlight rounded-lg px-4 py-2 max-w-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400">Step {currentStep.stepNumber}</span>
                <span className="text-xs font-semibold text-slate-100">{currentStep.title}</span>
                {currentStep.explainWhyKey && (
                  <button
                    onClick={() => openExplainWhy(currentStep.explainWhyKey!)}
                    className="text-[9px] text-indigo-400 hover:text-indigo-300 ml-auto"
                  >
                    ? Why
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mini map */}
      <div className="absolute bottom-2 left-2 w-24 h-16 glass-panel rounded border border-cyan-500/10 overflow-hidden opacity-60">
        <div className="relative w-full h-full p-1">
          {ecuPositions.map((ecu) => (
            <div
              key={ecu.id}
              className="absolute w-2 h-2 rounded-sm bg-cyan-500/40"
              style={{ left: `${(ecu.x / 800) * 100}%`, top: `${(ecu.y / 600) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
