'use client';

import { useAppStore } from '@/lib/store';
import { getSimulationFeature } from '@/lib/simulation-loader';
import { SimulationAreaExtension } from '@/extensions/layout/SimulationAreaExtension';
import { SimulationPlaybackExtension } from '@/extensions/playback/SimulationPlaybackExtension';
import { FailureSimulatorPro } from '@/extensions/failure/FailureSimulatorPro';
import { AutosarFeatureFlow } from '@/extensions/autosar/AutosarFeatureFlow';
import { FeatureTabs } from './FeatureTabs';
import { LearningModeSelector } from './LearningModeSelector';
import { SimulationTimeline } from './SimulationTimeline';
import { NetworkVisualizer } from './NetworkVisualizer';
import { Topology3DView } from './Topology3DView';
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
    <div className="flex flex-col h-full min-h-0">
      <FeatureTabs />
      <LearningModeSelector />

      {featureTab === 'simulation' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-3 py-2 border-b border-cyan-500/10 shrink-0">
            <GlassPanel className="px-3 py-2">
              <h2 className="text-sm font-semibold text-slate-100">{feature.name}</h2>
              <p className="text-[10px] text-slate-500">{feature.description}</p>
            </GlassPanel>
          </div>
          <SimulationPlaybackExtension />
          <SimulationAreaExtension feature={feature} currentStep={currentStep} />
          <SimulationTimeline steps={feature.steps} />
        </div>
      )}

      {featureTab === 'failure' && (
        <div className="flex-1 min-h-0">
          <FailureSimulatorPro />
        </div>
      )}
      {featureTab === 'network' && (
        <div className="flex-1 min-h-0">
          <NetworkVisualizer />
        </div>
      )}
      {featureTab === 'autosar-stack' && (
        <div className="flex-1 min-h-0">
          <AutosarFeatureFlow feature={feature} />
        </div>
      )}
      {featureTab === 'topology3d' && (
        <div className="flex-1 min-h-0">
          <Topology3DView />
        </div>
      )}

      <ExplainWhyModal />
      <ShowMeMoreModal />
    </div>
  );
}
