'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { SimulationFeature } from '@/types/simulation';

const TABS = [
  'Overview', 'Explain Why', 'Signal Details', 'AUTOSAR', 'CAN/LIN',
  'ISO26262', 'Diagnostics', 'Debugging', 'Interview', 'OEM', 'Real Vehicle', 'Troubleshooting',
] as const;

type Tab = typeof TABS[number];

const DOMAIN_HINTS: Record<string, { autosar: string; canlin: string; iso: string; debug: string }> = {
  adas: {
    autosar: 'ADAS SWC → RTE → COM/SoAd → Ethernet for sensor fusion; CAN for torque/brake requests.',
    canlin: 'Ethernet 100BASE-T1 for radar/camera object lists. CAN HS for actuator commands.',
    iso: 'ASIL-B to ASIL-D for braking/steering overlay functions. Sensor integrity monitored.',
    debug: 'CANoe Ethernet + CAN trace; verify SOME/IP service discovery and radar PDU timing.',
  },
  infotainment: {
    autosar: 'HMI SWC → RTE → COM → Ethernet AVB/SOME/IP → audio amplifier ECU.',
    canlin: 'Ethernet backbone for media streams; CAN for volume/status to cluster.',
    iso: 'QM domain typically; cybersecurity SecOC on external-facing services.',
    debug: 'Wireshark on Ethernet; verify SOME/IP and DoIP diagnostic sessions.',
  },
  safety: {
    autosar: 'CrashHandler SWC ASIL-D → immediate actuator path bypassing normal scheduling.',
    canlin: 'CAN HS emergency broadcast; minimal latency path to cluster and gateway.',
    iso: 'ASIL-D restraint functions with redundant sensor validation.',
    debug: 'Hardware-in-loop crash simulation; verify deployment within 10ms budget.',
  },
  chassis: {
    autosar: 'ABS/ESP SWC ASIL-D → FlexRay or CAN HS safety frames.',
    canlin: 'FlexRay for ABS; CAN HS for ESP coordination; wheel speed cyclic frames.',
    iso: 'ASIL-D for braking; ASIL-B for comfort steering assist.',
    debug: 'FlexRay/CANoe trace; verify valve modulation timing.',
  },
  powertrain: {
    autosar: 'Engine/Torque SWC → COM → CAN torque and status PDUs.',
    canlin: 'CAN HS powertrain domain; OBD diagnostics on same bus.',
    iso: 'ASIL-B torque monitoring; MISRA compliant control algorithms.',
    debug: 'CAN trace 0x180 torque requests; ETAS INCA for calibration.',
  },
  comfort: {
    autosar: 'Climate SWC → LIN master for zone modules; CAN for HVAC status.',
    canlin: 'LIN sub-bus for temperature sensors; CAN for compressor command.',
    iso: 'QM comfort functions; no safety decomposition required.',
    debug: 'LIN trace schedule tables; verify master frame timing.',
  },
  body: {
    autosar: 'SWC → RTE → COM → PduR → CanIf → CanDrv → MCAL',
    canlin: 'CAN HS for cross-ECU commands. LIN 19.2kbps for door modules.',
    iso: 'ASIL-B for anti-pinch and locking; ASIL-A for lighting.',
    debug: 'CANoe trace → compare DBC → verify COM mapping in DaVinci.',
  },
};

export function SmartKnowledgePanel({ feature }: { feature: SimulationFeature }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const learningMode = useAppStore((s) => s.learningMode);
  const openExplainWhyStore = useAppStore((s) => s.openExplainWhy);

  const knowledge = feature.knowledge;
  const domainHints = DOMAIN_HINTS[feature.domain] || DOMAIN_HINTS.body;

  return (
    <div className="border-t border-cyan-500/10 max-h-44 flex flex-col min-h-0 shrink-0">
      <div className="flex gap-0.5 px-2 py-1 overflow-x-auto custom-scrollbar border-b border-cyan-500/5">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
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
        <TabContent
          tab={activeTab}
          feature={feature}
          knowledge={knowledge}
          learningMode={learningMode}
          domainHints={domainHints}
          onExplain={openExplainWhyStore}
        />
      </div>
    </div>
  );
}

function TabContent({
  tab,
  feature,
  knowledge,
  learningMode,
  domainHints,
  onExplain,
}: {
  tab: Tab;
  feature: SimulationFeature;
  knowledge?: SimulationFeature['knowledge'];
  learningMode: string;
  domainHints: { autosar: string; canlin: string; iso: string; debug: string };
  onExplain: (key: string) => void;
}) {
  switch (tab) {
    case 'Overview':
      return (
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 leading-relaxed">{feature.description}</p>
          <p className="text-[9px] text-slate-600">Domain: <span className="text-cyan-400/80">{feature.domain}</span></p>
        </div>
      );
    case 'Explain Why':
      return (
        <div className="space-y-1">
          {['autosar', 'com', 'can', 'gateway', 'rte', 'ecu'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onExplain(key)}
              className="text-[10px] text-indigo-400 hover:underline block"
            >
              Why {key.toUpperCase()}?
            </button>
          ))}
        </div>
      );
    case 'Signal Details':
      return (
        <div className="text-[10px] text-slate-400 space-y-1">
          <p>Networks: {feature.involvedNetworks.join(', ')}</p>
          <p>ECUs: {feature.involvedEcus.join(', ')}</p>
          <p>Steps: {feature.steps.length}</p>
          {feature.signalFlowStages && (
            <p>AUTOSAR sub-path: {feature.signalFlowStages.length} layers</p>
          )}
        </div>
      );
    case 'AUTOSAR':
      return <p className="text-[10px] text-slate-400 leading-relaxed">{domainHints.autosar}</p>;
    case 'CAN/LIN':
      return <p className="text-[10px] text-slate-400 leading-relaxed">{domainHints.canlin}</p>;
    case 'ISO26262':
      return <p className="text-[10px] text-slate-400 leading-relaxed">{domainHints.iso}</p>;
    case 'Diagnostics':
      return <p className="text-[10px] text-slate-400">UDS on CAN/Ethernet, LIN diagnostic master, DTC via DEM, routine control for actuator tests.</p>;
    case 'Debugging':
      return <p className="text-[10px] text-slate-400 font-mono leading-relaxed">{domainHints.debug}</p>;
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
      return <p className="text-[10px] text-slate-400">{knowledge?.realVehicleExample || `${feature.driverInput} → ${feature.physicalOutput}`}</p>;
    case 'Troubleshooting':
      return (
        <ul className="text-[10px] text-slate-400 space-y-0.5">
          <li>• Trace {feature.involvedNetworks[0]} for missing frames</li>
          <li>• Verify supply voltage at actuator ECU</li>
          <li>• Read DTCs via UDS service 0x19</li>
          <li>• Confirm gateway routing for cross-domain features</li>
          {learningMode === 'expert' && <li>• Trace RTE runnable scheduling via OS trace</li>}
        </ul>
      );
    default:
      return null;
  }
}
