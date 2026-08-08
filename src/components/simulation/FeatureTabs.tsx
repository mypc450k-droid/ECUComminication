'use client';

import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { FeatureTab } from '@/types/simulation';

const tabs: { id: FeatureTab; label: string }[] = [
  { id: 'simulation', label: 'Simulation' },
  { id: 'integrated', label: 'System + AUTOSAR' },
  { id: 'failure', label: 'Failure Injection' },
  { id: 'network', label: 'Network' },
  { id: 'autosar-stack', label: 'AUTOSAR' },
  { id: 'topology3d', label: '3D Topology' },
];

export function FeatureTabs() {
  const featureTab = useAppStore((s) => s.featureTab);
  const setFeatureTab = useAppStore((s) => s.setFeatureTab);

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-cyan-500/10 bg-slate-900/60">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setFeatureTab(tab.id)}
          className={cn(
            'px-3 py-1.5 text-[10px] font-medium rounded-md transition-all',
            featureTab === tab.id
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
