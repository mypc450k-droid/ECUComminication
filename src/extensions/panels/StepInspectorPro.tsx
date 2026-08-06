'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useExtensionStore } from '../store/extensionStore';
import { useAppStore } from '@/lib/store';
import { StepDetailPanel } from '@/components/simulation/StepDetailPanel';
import { getExplainWhy } from '@/lib/simulation-loader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { NetworkBadge } from '@/components/ui/Badges';
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
  const openExplainWhy = useAppStore((s) => s.openExplainWhy);

  if (stepInspector.minimized) {
    return (
      <button
        onClick={() => setStepInspector({ minimized: false })}
        className="p-2 text-[10px] text-cyan-400 border-b border-cyan-500/10 hover:bg-cyan-500/5"
      >
        ▲ Expand Step Inspector
      </button>
    );
  }

  const explainWhy = step?.explainWhyKey ? getExplainWhy(step.explainWhyKey) : null;
  const interviewQ = explainWhy?.interviewQuestions[0] || feature.knowledge?.interviewQuestions[0];
  const oemExample = explainWhy?.oemExample || Object.values(feature.knowledge?.oemNotes || {})[0];

  const content = step ? (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2 p-3"
    >
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
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-600 uppercase">Network</span>
          <NetworkBadge type={step.network} />
        </div>
      )}
      {step.autosarLayerId && (
        <InspectorRow label="AUTOSAR Module" value={step.autosarLayerId} mono />
      )}
      {interviewQ && <InspectorRow label="Interview Question" value={interviewQ} />}
      {explainWhy && (
        <InspectorRow label="Debug Tip" value={explainWhy.debuggingMethod} />
      )}
      <InspectorRow label="ISO26262 Note" value="ASIL decomposition applies to communication path integrity and actuator control." />

      {learningMode === 'expert' && step.payload && (
        <GlassPanel className="p-2 mt-2">
          <span className="text-[8px] text-slate-600 uppercase">PDU / Frame</span>
          <pre className="text-[10px] font-mono text-cyan-400/90 mt-1 overflow-x-auto">
            {`CanIf_Transmit(PduId=${step.canId || '0x245'})\nPayload: ${step.payload}\nDLC: ${step.lengthBytes || 8}`}
          </pre>
        </GlassPanel>
      )}
    </motion.div>
  ) : null;

  const panelClass = stepInspector.detached
    ? 'fixed right-4 top-16 bottom-24 w-[480px] z-40 shadow-2xl rounded-lg border border-cyan-500/20'
    : 'flex-1 min-h-0';

  return (
    <div className={cn('flex flex-col min-h-0 bg-slate-900/40', panelClass)}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-cyan-500/10 bg-slate-900/60">
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
          Step Inspector {stepInspector.pinned && '📌'}
        </span>
        <div className="flex gap-1">
          <ToolBtn onClick={() => setStepInspector({ maximized: !stepInspector.maximized })} title="Maximize">⬜</ToolBtn>
          <ToolBtn onClick={() => setStepInspector({ minimized: true })} title="Minimize">—</ToolBtn>
          <ToolBtn onClick={() => setStepInspector({ pinned: !stepInspector.pinned })} title="Pin">📌</ToolBtn>
          <ToolBtn onClick={() => setStepInspector({ detached: !stepInspector.detached })} title="Detach">↗</ToolBtn>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {content}
        {/* Preserve original panel — hidden visually but keeps same behaviour hooks */}
        <div className="border-t border-cyan-500/5 opacity-90">
          <StepDetailPanel step={step} />
        </div>
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
    <div>
      <span className="text-[8px] text-slate-600 uppercase tracking-wider">{label}</span>
      <p className={cn(
        'text-[11px] leading-relaxed mt-0.5',
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
    <button onClick={onClick} title={title} className="text-[10px] text-slate-600 hover:text-cyan-400 px-1">
      {children}
    </button>
  );
}
