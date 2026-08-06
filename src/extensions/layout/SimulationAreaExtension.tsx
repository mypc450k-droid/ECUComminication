'use client';

import { Group, Panel, Separator } from 'react-resizable-panels';
import { useExtensionStore } from '../store/extensionStore';
import { EngineeringCanvas } from '@/components/simulation/EngineeringCanvas';
import { StepInspectorPro } from '../panels/StepInspectorPro';
import { SignalEvolutionView } from '../panels/SignalEvolutionView';
import { SmartKnowledgePanel } from '../panels/SmartKnowledgePanel';
import { CanvasEnhancementLayer } from '../canvas/CanvasEnhancementLayer';
import { SimulationHistoryPanel } from '../history/SimulationHistoryPanel';
import { useSimulationHistoryRecorder } from '../hooks/useSimulationHistory';
import type { SimulationFeature, SimulationStep } from '@/types/simulation';

interface SimulationAreaExtensionProps {
  feature: SimulationFeature;
  currentStep: SimulationStep | null;
}

export function SimulationAreaExtension({ feature, currentStep }: SimulationAreaExtensionProps) {
  useSimulationHistoryRecorder();
  const panelLayout = useExtensionStore((s) => s.panelLayout);
  const setPanelSize = useExtensionStore((s) => s.setPanelSize);
  const stepInspector = useExtensionStore((s) => s.stepInspector);
  const signalEvolutionOpen = useExtensionStore((s) => s.signalEvolutionOpen);

  const stepPanelMax = stepInspector.maximized ? 60 : panelLayout.stepPanelWidth;

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <Group orientation="horizontal" className="flex-1 min-h-0">
        <Panel id="sim-canvas" minSize={25} defaultSize={100 - stepPanelMax}>
          <CanvasEnhancementLayer>
            <EngineeringCanvas steps={feature.steps} involvedEcus={feature.involvedEcus} />
          </CanvasEnhancementLayer>
        </Panel>

        {!panelLayout.stepPanelCollapsed && (
          <>
            <Separator className="w-1.5 bg-slate-800/30 hover:bg-cyan-500/10 cursor-col-resize flex items-center justify-center">
              <div className="w-0.5 h-8 rounded-full bg-slate-600" />
            </Separator>
            <Panel
              id="step-inspector"
              defaultSize={stepPanelMax}
              minSize={15}
              maxSize={60}
              onResize={(size) => setPanelSize('stepPanelWidth', size.asPercentage)}
            >
              <div className="h-full flex flex-col border-l border-cyan-500/10 bg-slate-900/40 min-h-0">
                <StepInspectorPro step={currentStep} feature={feature} />
                {signalEvolutionOpen && currentStep && (
                  <SignalEvolutionView step={currentStep} />
                )}
                <SmartKnowledgePanel feature={feature} />
              </div>
            </Panel>
          </>
        )}
      </Group>
      <SimulationHistoryPanel />
    </div>
  );
}
