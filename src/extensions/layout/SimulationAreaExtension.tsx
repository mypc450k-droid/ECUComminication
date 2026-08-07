'use client';

import { Group, Panel, Separator } from 'react-resizable-panels';
import { useExtensionStore } from '../store/extensionStore';
import { percentSize } from './panelSizing';
import { InteractiveEngineeringCanvas } from '../canvas/InteractiveEngineeringCanvas';
import { StepInspectorPro } from '../panels/StepInspectorPro';
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
  const setStepInspector = useExtensionStore((s) => s.setStepInspector);

  const stepPanelMax = stepInspector.maximized ? 60 : panelLayout.stepPanelWidth;

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <Group orientation="horizontal" className="flex-1 min-h-0 h-full w-full">
        <Panel id="sim-canvas" minSize="25" defaultSize={percentSize(100 - stepPanelMax)}>
          <CanvasEnhancementLayer>
            <InteractiveEngineeringCanvas feature={feature} mode="simulation" />
          </CanvasEnhancementLayer>
        </Panel>

        {!panelLayout.stepPanelCollapsed && (
          <>
            <Separator className="w-2 shrink-0 bg-slate-800/50 hover:bg-cyan-500/20 active:bg-cyan-500/30 cursor-col-resize transition-colors" />
            <Panel
              id="step-inspector"
              defaultSize={percentSize(stepPanelMax)}
              minSize="15"
              maxSize="60"
              onResize={(size) => setPanelSize('stepPanelWidth', size.asPercentage)}
            >
              <div className="h-full flex flex-col border-l border-cyan-500/10 bg-slate-900/40 min-h-0">
                {stepInspector.detached ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center gap-2">
                    <p className="text-[10px] text-slate-400">Step Inspector is floating</p>
                    <p className="text-[9px] text-slate-600">Drag the header to reposition • Click outside to close</p>
                    <button
                      type="button"
                      onClick={() => setStepInspector({ detached: false })}
                      className="text-[10px] px-3 py-1 rounded border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      Reattach to panel
                    </button>
                  </div>
                ) : (
                  <>
                    <StepInspectorPro step={currentStep} feature={feature} />
                    <SmartKnowledgePanel feature={feature} />
                  </>
                )}
              </div>
            </Panel>
          </>
        )}
      </Group>

      {/* Detached inspector portal — mounted outside panel layout */}
      {stepInspector.detached && (
        <StepInspectorPro step={currentStep} feature={feature} />
      )}

      <SimulationHistoryPanel />
    </div>
  );
}
