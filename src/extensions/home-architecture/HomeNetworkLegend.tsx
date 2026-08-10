'use client';

import { networks } from '@/lib/data';

/** Homepage-only legend — does not modify shared NetworkLegend. */
export function HomeNetworkLegend() {
  return (
    <div className="absolute top-3 left-3 z-20 glass-panel rounded-lg px-3 py-2.5 max-w-[195px]">
      <h4 className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
        Networks
      </h4>
      <div className="space-y-1.5">
        {networks.map((net) => (
          <div key={net.id} className="flex items-center gap-2">
            <span
              className="w-3 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: net.color, boxShadow: `0 0 6px ${net.color}50` }}
            />
            <span className="text-[9px] text-slate-400 flex-1 truncate">{net.name}</span>
            <span className="text-[8px] font-mono text-slate-600 shrink-0">{net.baudRate}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-cyan-500/10 flex items-center gap-2">
        <span className="w-5 h-0.5 bg-cyan-400/50 rounded" />
        <span className="text-[8px] text-slate-500">Gateway trunk</span>
      </div>
    </div>
  );
}
