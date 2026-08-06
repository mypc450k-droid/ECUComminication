'use client';

import { useAppStore } from '@/lib/store';
import { getSimulationFeature } from '@/lib/simulation-loader';
import { FeatureTabs } from './FeatureTabs';
import { SimulationControls } from './SimulationControls';
import { LearningModeSelector } from './LearningModeSelector';
import { EngineeringCanvas } from './EngineeringCanvas';
import { StepDetailPanel } from './StepDetailPanel';
import { SimulationTimeline } from './SimulationTimeline';
import { FailureSimulation } from './FailureSimulation';
import { NetworkVisualizer } from './NetworkVisualizer';
import { Topology3DView } from './Topology3DView';
import { AutosarStackVisualizer } from './AutosarStackVisualizer';
import { KnowledgePanel } from './KnowledgePanel';
import { ExplainWhyModal } from './ExplainWhyModal';
import { ShowMeMoreModal } from './ShowMeMoreModal';
import { GlassPanel } from '@/components/ui/GlassPanel';

export function SimulationEngine() {
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const featureTab = useAppStore((s) => s.featureTab);
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);

  const feature = selectedFeatureId ? getSimulationFeature(selectedFeatureId) : null;

  if (!feature) {
    return (
      <div className="flex items-center justify-center h-full engineering-bg">
        <p className="text-sm text-slate-500">Select a feature from the sidebar</p>
      </div>
    );
  }

  const currentStep = currentStepIndex >= 0 ? feature.steps[currentStepIndex] : null;

  return (
    <div className="flex flex-col h-full">
      <FeatureTabs />
      <LearningModeSelector />

      {featureTab === 'simulation' && (
        <>
          <div className="px-3 py-2 border-b border-cyan-500/10">
            <GlassPanel className="px-3 py-2">
              <h2 className="text-sm font-semibold text-slate-100">{feature.name}</h2>
              <p className="text-[10px] text-slate-500">{feature.description}</p>
            </GlassPanel>
          </div>
          <SimulationControls />
          <div className="flex flex-1 min-h-0">
            <EngineeringCanvas steps={feature.steps} involvedEcus={feature.involvedEcus} />
            <div className="w-72 border-l border-cyan-500/10 bg-slate-900/40 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <StepDetailPanel step={currentStep} />
              </div>
              <KnowledgePanel feature={feature} />
            </div>
          </div>
          <SimulationTimeline steps={feature.steps} />
        </>
      )}

      {featureTab === 'failure' && <FailureSimulation />}
      {featureTab === 'network' && <NetworkVisualizer />}
      {featureTab === 'autosar-stack' && <AutosarStackVisualizer />}
      {featureTab === 'topology3d' && <Topology3DView />}

      <ExplainWhyModal />
      <ShowMeMoreModal />
    </div>
  );
}
