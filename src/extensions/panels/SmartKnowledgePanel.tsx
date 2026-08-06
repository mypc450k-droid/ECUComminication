'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getExplainWhy } from '@/lib/simulation-loader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';
import type { SimulationFeature } from '@/types/simulation';

const TABS = [
  'Overview', 'Explain Why', 'Signal Details', 'AUTOSAR', 'CAN/LIN',
  'ISO26262', 'Diagnostics', 'Debugging', 'Interview', 'OEM', 'Real Vehicle', 'Troubleshooting',
] as const;

type Tab = typeof TABS[number];

export function SmartKnowledgePanel({ feature }: { feature: SimulationFeature }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const learningMode = useAppStore((s) => s.learningMode);
  const openExplainWhy = useAppStore((s) => s.openExplainWhy);

  const knowledge = feature.knowledge;

  return (
    <div className="border-t border-cyan-500/10 max-h-44 flex flex-col min-h-0">
      <div className="flex gap-0.5 px-2 py-1 overflow-x-auto custom-scrollbar border-b border-cyan-500/5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-1.5 py-0.5 text-[8px] rounded whitespace-nowrap transition-colors',
              activeTab === tab
                ? 'bg-cyan-500/15 text-cyan-300'
                : 'text-slate-600 hover:text-slate-400'
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <TabContent tab={activeTab} feature={feature} knowledge={knowledge} learningMode={learningMode} onExplain={openExplainWhy} />
      </div>
    </div>
  );
}

function TabContent({
  tab,
  feature,
  knowledge,
  learningMode,
  onExplain,
}: {
  tab: Tab;
  feature: SimulationFeature;
  knowledge?: SimulationFeature['knowledge'];
  learningMode: string;
  onExplain: (key: string) => void;
}) {
  switch (tab) {
    case 'Overview':
      return <p className="text-[10px] text-slate-400">{feature.description}</p>;
    case 'Explain Why':
      return (
        <div className="space-y-1">
          <button onClick={() => onExplain('autosar')} className="text-[10px] text-indigo-400 hover:underline">Why AUTOSAR?</button>
          <button onClick={() => onExplain('com')} className="text-[10px] text-indigo-400 hover:underline block">Why COM?</button>
          <button onClick={() => onExplain('can')} className="text-[10px] text-indigo-400 hover:underline block">Why CAN?</button>
        </div>
      );
    case 'Signal Details':
      return (
        <div className="text-[10px] text-slate-400 space-y-1">
          <p>Networks: {feature.involvedNetworks.join(', ')}</p>
          <p>ECUs: {feature.involvedEcus.join(', ')}</p>
        </div>
      );
    case 'AUTOSAR':
      return <p className="text-[10px] text-slate-400">SWC → RTE → COM → PduR → CanIf → CanDrv → MCAL → Controller</p>;
    case 'CAN/LIN':
      return <p className="text-[10px] text-slate-400">CAN HS 500kbps for cross-ECU commands. LIN 19.2kbps for door module local I/O.</p>;
    case 'ISO26262':
      return <p className="text-[10px] text-slate-400">ASIL-B typical for body actuators with anti-pinch. Safety goals decomposed across ECU boundaries.</p>;
    case 'Diagnostics':
      return <p className="text-[10px] text-slate-400">UDS on CAN, LIN diagnostic frames, DTC logging via DEM module.</p>;
    case 'Debugging':
      return <p className="text-[10px] text-slate-400 font-mono">CANoe trace → compare DBC → verify COM mapping in DaVinci Configurator.</p>;
    case 'Interview':
      return (
        <ul className="space-y-0.5">
          {(knowledge?.interviewQuestions || []).map((q) => (
            <li key={q} className="text-[10px] text-slate-400">• {q}</li>
          ))}
        </ul>
      );
    case 'OEM':
      return (
        <div className="space-y-1">
          {Object.entries(knowledge?.oemNotes || {}).map(([oem, note]) => (
            <p key={oem} className="text-[10px] text-slate-400"><span className="text-cyan-400/70">{oem}:</span> {note}</p>
          ))}
        </div>
      );
    case 'Real Vehicle':
      return <p className="text-[10px] text-slate-400">{knowledge?.realVehicleExample || feature.physicalOutput}</p>;
    case 'Troubleshooting':
      return (
        <ul className="text-[10px] text-slate-400 space-y-0.5">
          <li>• Check CAN trace for missing frames</li>
          <li>• Verify supply voltage at actuator</li>
          <li>• Read DTCs via UDS 0x19 service</li>
          {learningMode === 'expert' && <li>• Trace RTE runnable scheduling via OS trace</li>}
        </ul>
      );
    default:
      return null;
  }
}
