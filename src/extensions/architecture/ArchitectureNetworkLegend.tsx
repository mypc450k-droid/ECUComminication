'use client';

import { networks } from '@/lib/data';

/** Homepage-only network legend styling. */
export function ArchitectureNetworkLegend() {
  return (
    <div className="absolute top-3 left-3 glass-panel rounded-lg px-3 py-2 z-20 max-w-[200px]">
      <h4 className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
        Networks
      </h4>
      <div className="space-y-1.5">
        {networks.map((net) => (
          <div key={net.id} className="flex items-center gap-2">
            <span
              className="w-3 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: net.color, boxShadow: `0 0 6px ${net.color}40` }}
            />
            <span className="text-[9px] text-slate-400 flex-1 truncate">{net.name}</span>
            <span className="text-[8px] font-mono text-slate-600 shrink-0">{net.baudRate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
