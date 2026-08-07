'use client';

import { motion } from 'framer-motion';
import { useExtensionStore } from '../store/extensionStore';
import { useAppStore } from '@/lib/store';
import { getExplainWhy } from '@/lib/simulation-loader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { NetworkBadge } from '@/components/ui/Badges';
import { DetachedInspectorShell } from './DetachedInspectorShell';
import { SignalEvolutionView } from './SignalEvolutionView';
import { cn } from '@/lib/utils';
import type { SimulationStep, SimulationFeature } from '@/types/simulation';

interface StepInspectorProProps {
  step: SimulationStep | null;
  feature: SimulationFeature;
}

export function StepInspectorPro({ step, feature }: StepInspectorProProps) {
  const learningMode = useAppStore((s) => s.learningMode);
  const stepInspector = useExtensionStore((s) => s.stepInspector);
  const setStepInspector = useExtensionStore((s) => s.setStepInspector);
  const signalEvolutionOpen = useExtensionStore((s) => s.signalEvolutionOpen);
  const openExplainWhy = useAppStore((s) => s.openExplainWhy);

  if (stepInspector.minimized) {
    return (
      <button
        type="button"
        onClick={() => setStepInspector({ minimized: false })}
        className="p-2 text-[10px] text-cyan-400 border-b border-cyan-500/10 hover:bg-cyan-500/5 w-full"
      >
        ▲ Expand Step Inspector
      </button>
    );
  }

  const explainWhy = step?.explainWhyKey ? getExplainWhy(step.explainWhyKey) : null;
  const interviewQ = explainWhy?.interviewQuestions[0] || feature.knowledge?.interviewQuestions[0];
  const oemExample = explainWhy?.oemExample || Object.values(feature.knowledge?.oemNotes || {})[0];

  const inspectorBody = (
    <div className="space-y-3 p-4">
      {step ? (
        <motion.div key={step.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <InspectorRow label="Step Number" value={`${step.stepNumber} / ${feature.steps.length}`} />
          <InspectorRow label="Component" value={step.title} highlight />
          <InspectorRow label="Purpose" value={step.beginnerExplanation} />
          <InspectorRow label="Input" value={step.sender || feature.driverInput} />
          <InspectorRow label="Processing" value={step.engineeringExplanation} />
          <InspectorRow label="Output" value={step.receiver || feature.physicalOutput} />
          {step.signalName && <InspectorRow label="Generated Signal" value={step.signalName} mono />}
          {oemExample && <InspectorRow label="OEM Example" value={oemExample} />}
          <InspectorRow label="Timing" value={`${step.executionTimeMs} ms`} mono />
          {step.network && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[9px] text-slate-600 uppercase shrink-0">Network</span>
              <NetworkBadge type={step.network} />
            </div>
          )}
          {step.autosarLayerId && (
            <InspectorRow label="AUTOSAR Module" value={step.autosarLayerId} mono />
          )}
          {interviewQ && <InspectorRow label="Interview Question" value={interviewQ} />}
          {explainWhy && <InspectorRow label="Debug Tip" value={explainWhy.debuggingMethod} />}
          <InspectorRow label="ISO26262 Note" value="ASIL decomposition applies to communication path integrity and actuator control." />

          {learningMode === 'expert' && step.payload && (
            <GlassPanel className="p-3">
              <span className="text-[8px] text-slate-600 uppercase">PDU / Frame</span>
              <pre className="text-[10px] font-mono text-cyan-400/90 mt-1 overflow-x-auto whitespace-pre-wrap break-all">
                {`CanIf_Transmit(PduId=${step.canId || '0x245'})\nPayload: ${step.payload}\nDLC: ${step.lengthBytes || 8}`}
              </pre>
            </GlassPanel>
          )}

          {step.explainWhyKey && (
            <button
              type="button"
              onClick={() => openExplainWhy(step.explainWhyKey!)}
              className="w-full text-left text-[10px] px-3 py-2 rounded-md border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
            >
              Explain Why this step?
            </button>
          )}
        </motion.div>
      ) : (
        <p className="text-xs text-slate-500 text-center py-8">Press Play or step through simulation to inspect</p>
      )}

      {signalEvolutionOpen && step && (
        <div className="border-t border-cyan-500/10 pt-3">
          <SignalEvolutionView step={step} embedded />
        </div>
      )}
    </div>
  );

  if (stepInspector.detached) {
    return (
      <DetachedInspectorShell
        title="Step Inspector"
        pinned={stepInspector.pinned}
        maximized={stepInspector.maximized}
        onClose={() => setStepInspector({ detached: false })}
        onPin={() => setStepInspector({ pinned: !stepInspector.pinned })}
        onMaximize={() => setStepInspector({ maximized: !stepInspector.maximized })}
      >
        {inspectorBody}
      </DetachedInspectorShell>
    );
  }

  return (
    <div className="flex flex-col min-h-0 bg-slate-900/40 flex-1">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-cyan-500/10 bg-slate-900/60 shrink-0">
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
          Step Inspector {stepInspector.pinned && '📌'}
        </span>
        <div className="flex gap-1">
          <ToolBtn onClick={() => setStepInspector({ maximized: !stepInspector.maximized })} title="Maximize">⬜</ToolBtn>
          <ToolBtn onClick={() => setStepInspector({ minimized: true })} title="Minimize">—</ToolBtn>
          <ToolBtn onClick={() => setStepInspector({ pinned: !stepInspector.pinned })} title="Pin">📌</ToolBtn>
          <ToolBtn onClick={() => setStepInspector({ detached: true, maximized: false })} title="Detach">↗</ToolBtn>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {inspectorBody}
      </div>
    </div>
  );
}

function InspectorRow({ label, value, highlight, mono }: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <span className="text-[8px] text-slate-600 uppercase tracking-wider">{label}</span>
      <p className={cn(
        'text-[11px] leading-relaxed break-words',
        highlight ? 'text-cyan-300 font-semibold' : 'text-slate-300',
        mono && 'font-mono text-cyan-400/80 text-[10px]'
      )}>
        {value}
      </p>
    </div>
  );
}

function ToolBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={title} className="text-[10px] text-slate-600 hover:text-cyan-400 px-1">
      {children}
    </button>
  );
}
