'use client';

import { Group, Panel, Separator } from 'react-resizable-panels';
import { useExtensionStore } from '../store/extensionStore';
import { percentSize } from '../layout/panelSizing';
import { InteractiveEngineeringCanvas } from '../canvas/InteractiveEngineeringCanvas';
import { AutosarFeatureFlow } from '../autosar/AutosarFeatureFlow';
import { SignalTransmissionPanel } from '../canvas/SignalTransmissionPanel';
import { SimulationPlaybackExtension } from '../playback/SimulationPlaybackExtension';
import { SimulationTimeline } from '@/components/simulation/SimulationTimeline';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useAppStore } from '@/lib/store';
import type { SimulationFeature, SimulationStep } from '@/types/simulation';

interface IntegratedSimulationViewProps {
  feature: SimulationFeature;
  currentStep: SimulationStep | null;
}

export function IntegratedSimulationView({ feature, currentStep }: IntegratedSimulationViewProps) {
  const openExplainWhy = useAppStore((s) => s.openExplainWhy);
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-3 py-2 border-b border-cyan-500/10 shrink-0">
        <GlassPanel className="px-3 py-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              {feature.name} — System + AUTOSAR
            </h2>
            <p className="text-[10px] text-slate-500">
              Synchronized vehicle signal flow and AUTOSAR stack at the same simulation step
            </p>
          </div>
          {currentStep && (
            <div className="text-right shrink-0">
              <p className="text-[10px] text-cyan-400/80 font-mono">
                Step {currentStep.stepNumber} / {feature.steps.length}
              </p>
              <p className="text-[9px] text-slate-500 max-w-[200px] truncate">{currentStep.title}</p>
            </div>
          )}
        </GlassPanel>
      </div>

      <SimulationPlaybackExtension />

      <Group orientation="horizontal" className="flex-1 min-h-0">
        <Panel id="integrated-vehicle" defaultSize={percentSize(52)} minSize="30">
          <div className="h-full flex flex-col border-r border-cyan-500/10 min-h-0">
            <div className="shrink-0 px-3 py-1.5 bg-slate-900/50 border-b border-cyan-500/10">
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Vehicle Signal Flow
              </h3>
            </div>
            <div className="flex-1 min-h-0">
              <InteractiveEngineeringCanvas feature={feature} mode="simulation" />
            </div>
          </div>
        </Panel>

        <Separator className="w-2 shrink-0 bg-slate-800/50 hover:bg-cyan-500/20 active:bg-cyan-500/30 cursor-col-resize transition-colors" />

        <Panel id="integrated-autosar" defaultSize={percentSize(48)} minSize="25">
          <div className="h-full flex flex-col min-h-0">
            <div className="shrink-0 px-3 py-1.5 bg-slate-900/50 border-b border-cyan-500/10">
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                AUTOSAR Signal Flow
              </h3>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <AutosarFeatureFlow feature={feature} compact />
            </div>
          </div>
        </Panel>
      </Group>

      {currentStep && (
        <SignalTransmissionPanel
          feature={feature}
          currentStep={currentStep}
          stepsCount={feature.steps.length}
          onExplainWhy={
            currentStep.explainWhyKey
              ? () => openExplainWhy(currentStep.explainWhyKey!)
              : undefined
          }
        />
      )}

      <SimulationTimeline steps={feature.steps} />
    </div>
  );
}
