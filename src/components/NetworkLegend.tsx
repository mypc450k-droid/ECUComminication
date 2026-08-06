'use client';

import { networks } from '@/lib/data';

export function NetworkLegend() {
  return (
    <div className="absolute top-3 left-3 glass-panel rounded-lg p-2.5 z-10">
      <h4 className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        Networks
      </h4>
      <div className="space-y-1">
        {networks.map((net) => (
          <div key={net.id} className="flex items-center gap-2">
            <span
              className="w-3 h-1.5 rounded-full"
              style={{ backgroundColor: net.color }}
            />
            <span className="text-[10px] text-slate-400">{net.name}</span>
            <span className="text-[9px] font-mono text-slate-600">{net.baudRate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
