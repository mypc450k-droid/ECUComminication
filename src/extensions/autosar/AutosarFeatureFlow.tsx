'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { getExplainWhy } from '@/lib/simulation-loader';
import { getStagesForStep } from '../lib/signalTransmissionStages';
import {
  AUTOSAR_LAYER_PIPELINE,
  AUTOSAR_RX_PIPELINE,
  resolveAutosarLayerId,
  resolveAutosarLayerIndex,
} from '../lib/autosarLayerMapping';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';
import type { SimulationFeature } from '@/types/simulation';

export function AutosarFeatureFlow({ feature }: { feature: SimulationFeature }) {
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const featureTab = useAppStore((s) => s.featureTab);
  const openExplainWhy = useAppStore((s) => s.openExplainWhy);
  const [demoTx, setDemoTx] = useState(0);
  const [demoRx, setDemoRx] = useState(0);

  const currentStep = currentStepIndex >= 0 ? feature.steps[currentStepIndex] : null;
  const layerId = resolveAutosarLayerId(currentStep);
  const simTxIdx = resolveAutosarLayerIndex(layerId, AUTOSAR_LAYER_PIPELINE);
  const simRxIdx = resolveAutosarLayerIndex(layerId, AUTOSAR_RX_PIPELINE);

  useEffect(() => {
    if (featureTab !== 'autosar-stack' || currentStepIndex >= 0) return;
    const interval = setInterval(() => {
      setDemoTx((p) => (p + 1) % AUTOSAR_LAYER_PIPELINE.length);
      setDemoRx((p) => (p + 1) % AUTOSAR_RX_PIPELINE.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [featureTab, currentStepIndex]);

  const activeTx = simTxIdx >= 0 ? simTxIdx : demoTx;
  const activeRx = simRxIdx >= 0 ? simRxIdx : demoRx;
  const isLive = currentStepIndex >= 0;

  const signalStages = currentStep ? getStagesForStep(currentStep, feature) : [];

  const activeLayerMeta = useMemo(() => {
    if (simTxIdx >= 0) return AUTOSAR_LAYER_PIPELINE[simTxIdx];
    if (simRxIdx >= 0) return AUTOSAR_RX_PIPELINE[simRxIdx];
    return AUTOSAR_LAYER_PIPELINE[activeTx];
  }, [simTxIdx, simRxIdx, activeTx]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 py-2 border-b border-cyan-500/10 bg-slate-900/50">
        <h3 className="text-sm font-semibold text-slate-100">{feature.name} — AUTOSAR Signal Path</h3>
        <p className="text-[10px] text-slate-500">
          {isLive
            ? `Live sync: Step ${currentStep?.stepNumber} — ${currentStep?.title}`
            : 'Preview mode: layers auto-cycle until simulation plays'}
        </p>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Pipeline — horizontal scroll, all layers visible */}
        <div className="flex-1 min-h-0 flex flex-col p-3 gap-3 overflow-hidden">
          <PipelineSection
            title="Transmit Path (Sender ECU)"
            layers={AUTOSAR_LAYER_PIPELINE}
            activeIndex={activeTx}
            isLive={isLive}
            onWhy={openExplainWhy}
          />
          <PipelineSection
            title="Receive Path (Destination ECU)"
            layers={AUTOSAR_RX_PIPELINE}
            activeIndex={activeRx}
            isLive={isLive}
            reverse
            onWhy={openExplainWhy}
          />

          {/* Live signal strip */}
          {currentStep && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="shrink-0 rounded-lg border border-cyan-500/20 bg-slate-900/60 p-2"
            >
              <p className="text-[9px] text-slate-500 uppercase mb-1">Real-time signal at this layer</p>
              <div className="flex gap-2 overflow-x-auto custom-scrollbar">
                {signalStages.map((s, i) => (
                  <div
                    key={s.id}
                    className={cn(
                      'shrink-0 rounded px-2 py-1 border min-w-[100px]',
                      i === 0 ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-slate-700/40'
                    )}
                  >
                    <p className="text-[8px] text-slate-500">{s.layer}</p>
                    <p className="text-[9px] font-mono text-cyan-300 truncate">{s.representation}</p>
                  </div>
                ))}
              </div>
              {currentStep.canId && (
                <p className="text-[8px] font-mono text-slate-500 mt-1">
                  PDU {currentStep.canId} • {currentStep.payload || '—'} • {currentStep.sender} → {currentStep.receiver}
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Layer detail — feature-specific */}
        <div className="w-72 shrink-0 border-l border-cyan-500/10 p-3 overflow-y-auto custom-scrollbar bg-slate-900/30">
          <LayerDetailPanel
            layerKey={activeLayerMeta.key}
            layerLabel={activeLayerMeta.label}
            feature={feature}
            step={currentStep}
            signalStages={signalStages}
          />
        </div>
      </div>
    </div>
  );
}

function PipelineSection({
  title,
  layers,
  activeIndex,
  isLive,
  reverse,
  onWhy,
}: {
  title: string;
  layers: readonly { id: string; key: string; label: string; short: string }[];
  activeIndex: number;
  isLive: boolean;
  reverse?: boolean;
  onWhy: (key: string) => void;
}) {
  return (
    <div className="shrink-0">
      <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
      <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
        {layers.map((layer, i) => {
          const isActive = i === activeIndex;
          const explain = getExplainWhy(layer.key);
          return (
            <div key={layer.id} className="flex items-center shrink-0">
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <GlassPanel
                  highlighted={isActive}
                  className={cn(
                    'px-2.5 py-2 min-w-[72px] max-w-[100px]',
                    isActive && 'neon-cyan',
                    reverse && 'border-purple-500/20'
                  )}
                >
                  <p className="text-[8px] text-slate-500 font-mono">{layer.short}</p>
                  <p className="text-[10px] font-semibold text-slate-200 leading-tight">{layer.label}</p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[8px] text-slate-400 mt-1 line-clamp-2"
                    >
                      {explain.purpose.slice(0, 60)}…
                    </motion.p>
                  )}
                  <button
                    type="button"
                    onClick={() => onWhy(layer.key)}
                    className="text-[8px] text-indigo-400 hover:text-indigo-300 mt-1"
                  >
                    WHY?
                  </button>
                </GlassPanel>
              </motion.div>
              {i < layers.length - 1 && (
                <motion.span
                  className={cn('text-[10px] px-0.5', reverse ? 'text-purple-500/40' : 'text-cyan-500/40')}
                  animate={isActive ? { opacity: [0.3, 1, 0.3] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {reverse ? '◀' : '▶'}
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LayerDetailPanel({
  layerKey,
  layerLabel,
  feature,
  step,
  signalStages,
}: {
  layerKey: string;
  layerLabel: string;
  feature: SimulationFeature;
  step: import('@/types/simulation').SimulationStep | null;
  signalStages: ReturnType<typeof getStagesForStep>;
}) {
  const explain = getExplainWhy(layerKey);

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-[10px] font-semibold text-slate-500 uppercase">Layer Detail</h4>
        <p className="text-sm font-semibold text-cyan-300/90 mt-1">{layerLabel}</p>
        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{explain.purpose}</p>
      </div>

      <GlassPanel className="p-2.5 space-y-1.5">
        <p className="text-[9px] text-slate-500 uppercase">Feature: {feature.name}</p>
        <DetailRow label="Driver Input" value={feature.driverInput} />
        <DetailRow label="Physical Output" value={feature.physicalOutput} />
        {step && (
          <>
            <DetailRow label="Current Step" value={`${step.stepNumber}. ${step.title}`} />
            <DetailRow label="Engineering" value={step.engineeringExplanation} />
            {step.signalName && <DetailRow label="Signal" value={step.signalName} mono />}
            {step.canId && <DetailRow label="CAN Frame" value={`${step.canId} ${step.payload || ''}`} mono />}
            {step.sender && <DetailRow label="Route" value={`${step.sender} → ${step.receiver || '—'}`} />}
          </>
        )}
      </GlassPanel>

      {signalStages.length > 0 && (
        <GlassPanel className="p-2.5">
          <p className="text-[9px] text-slate-500 uppercase mb-2">Signal at this stage</p>
          {signalStages.map((s) => (
            <div key={s.id} className="mb-2 last:mb-0">
              <p className="text-[8px] text-slate-600">{s.layer} — {s.label}</p>
              <p className="text-[10px] font-mono text-cyan-400 break-all">{s.representation}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{s.explanation}</p>
            </div>
          ))}
        </GlassPanel>
      )}

      <GlassPanel className="p-2.5 space-y-1">
        <DetailRow label="OEM" value={explain.oemExample.slice(0, 120)} />
        <DetailRow label="Debug" value={explain.debuggingMethod.slice(0, 120)} mono />
      </GlassPanel>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-[8px] text-slate-600 uppercase">{label}</span>
      <p className={cn('text-[10px] text-slate-300 break-words leading-relaxed', mono && 'font-mono text-cyan-400/90')}>
        {value}
      </p>
    </div>
  );
}
