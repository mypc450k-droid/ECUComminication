'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExtensionStore } from '../store/extensionStore';
import { getStagesForStep, getActiveStageIndex } from '../lib/signalTransmissionStages';
import { cn } from '@/lib/utils';
import type { SimulationFeature, SimulationStep } from '@/types/simulation';

const networkColors: Record<string, string> = {
  CAN_HS: '#00D4FF',
  CAN_LS: '#4A9EFF',
  LIN: '#7B68EE',
  Ethernet: '#00FF88',
  FlexRay: '#FF6B35',
};

interface SignalTransmissionPanelProps {
  feature: SimulationFeature;
  currentStep: SimulationStep;
  stepsCount: number;
  onExplainWhy?: () => void;
}

export function SignalTransmissionPanel({
  feature,
  currentStep,
  stepsCount,
  onExplainWhy,
}: SignalTransmissionPanelProps) {
  const layout = useExtensionStore((s) => s.signalPanelLayout);
  const setSignalPanelLayout = useExtensionStore((s) => s.setSignalPanelLayout);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origBottom: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const signalStages = getStagesForStep(currentStep, feature);
  const activeStageIdx = getActiveStageIndex(currentStep);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const container = containerRef.current?.parentElement;
      const maxW = container ? container.clientWidth - 8 : 800;
      const maxH = container ? container.clientHeight - 8 : 500;

      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setSignalPanelLayout({
          x: Math.max(0, Math.min(maxW - layout.width, dragRef.current.origX + dx)),
          y: Math.max(8, Math.min(maxH - 80, dragRef.current.origBottom - dy)),
        });
      }
      if (resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        setSignalPanelLayout({
          width: Math.max(320, Math.min(maxW, resizeRef.current.origW + dx)),
          height: Math.max(140, Math.min(maxH, resizeRef.current.origH + dy)),
        });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [layout.width, layout.height, setSignalPanelLayout]);

  const onDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: layout.x,
      origBottom: layout.y,
    };
  };

  const onResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: layout.width,
      origH: layout.height,
    };
  };

  if (layout.collapsed) {
    return (
      <button
        type="button"
        onClick={() => setSignalPanelLayout({ collapsed: false })}
        className="absolute bottom-3 left-3 z-30 glass-panel px-3 py-1.5 text-[10px] text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10"
      >
        ▲ Signal Transmission — Step {currentStep.stepNumber}/{stepsCount}
      </button>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      key={currentStep.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute z-30 glass-panel-highlight rounded-lg border border-cyan-500/25 shadow-xl flex flex-col pointer-events-auto"
      style={{
        left: layout.x,
        bottom: layout.y,
        width: layout.width,
        height: layout.height,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className="flex items-center justify-between px-2 py-1.5 border-b border-cyan-500/15 bg-slate-900/80 cursor-grab active:cursor-grabbing shrink-0 select-none"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono text-cyan-400 shrink-0">
            Step {currentStep.stepNumber}/{stepsCount}
          </span>
          <span className="text-[11px] font-semibold text-slate-100 truncate">{currentStep.title}</span>
          {currentStep.network && (
            <span
              className="text-[8px] px-1.5 py-0.5 rounded font-mono shrink-0"
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
        <div className="flex gap-1 shrink-0">
          {onExplainWhy && (
            <button type="button" onClick={onExplainWhy} className="text-[9px] text-indigo-400 px-1">? Why</button>
          )}
          <button
            type="button"
            onClick={() => setSignalPanelLayout({ collapsed: true })}
            className="text-[9px] text-slate-500 hover:text-slate-300 px-1"
          >
            −
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2">
        <div className="flex flex-wrap gap-2">
          {signalStages.map((stage, si) => {
            const isStageActive = si === activeStageIdx;
            const isExpanded = expandedCard === stage.id || isStageActive;
            return (
              <div
                key={stage.id}
                className={cn(
                  'rounded-md border transition-all',
                  isStageActive ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-700/40 bg-slate-900/60',
                  isExpanded ? 'w-full' : 'w-[calc(50%-4px)] min-w-[140px]'
                )}
              >
                <button
                  type="button"
                  onClick={() => setExpandedCard(expandedCard === stage.id ? null : stage.id)}
                  className="w-full text-left px-2 py-1.5"
                >
                  <p className="text-[8px] text-slate-500 uppercase">{stage.layer}</p>
                  <p className="text-[10px] font-semibold text-slate-200">{stage.label}</p>
                  <p className="text-[9px] font-mono text-cyan-400/90 break-all leading-snug mt-0.5">
                    {stage.representation}
                  </p>
                  {stage.apiCall && (
                    <p className="text-[8px] font-mono text-purple-400/80 mt-0.5 break-all">{stage.apiCall}</p>
                  )}
                </button>
                {isExpanded && (
                  <div className="px-2 pb-2 border-t border-slate-700/30 mt-1 pt-1 space-y-1">
                    <p className="text-[9px] text-slate-400 leading-relaxed break-words">{stage.simpleExplanation}</p>
                    <p className="text-[9px] text-slate-500 leading-relaxed break-words">{stage.explanation}</p>
                    {stage.dataFormat && (
                      <p className="text-[8px] font-mono text-amber-400/80 break-all">Format: {stage.dataFormat}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {currentStep.canId && (
          <p className="text-[8px] font-mono text-slate-500 mt-2 break-all leading-relaxed">
            Frame: {currentStep.canId} • Payload: {currentStep.payload || '—'} • Route: {currentStep.sender || '—'} → {currentStep.receiver || '—'}
          </p>
        )}
      </div>

      <div
        onMouseDown={onResizeStart}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        title="Resize panel"
      >
        <svg viewBox="0 0 16 16" className="w-4 h-4 text-slate-600">
          <path d="M14 14L14 8M14 14L8 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </motion.div>
  );
}
