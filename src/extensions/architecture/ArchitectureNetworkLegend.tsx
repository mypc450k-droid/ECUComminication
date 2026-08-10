'use client';

import { networks } from '@/lib/data';

/** Homepage network legend — matches zone architecture palette. */
export function ArchitectureNetworkLegend() {
  return (
    <div className="absolute top-4 left-4 z-20 rounded-lg px-3 py-2.5 bg-black/70 border border-white/10 backdrop-blur-sm max-w-[190px]">
      <h4 className="text-[8px] font-semibold text-white/50 uppercase tracking-widest mb-2">
        Networks
      </h4>
      <div className="space-y-1.5">
        {networks.map((net) => (
          <div key={net.id} className="flex items-center gap-2">
            <span
              className="w-3 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: net.color }}
            />
            <span className="text-[9px] text-white/65 flex-1 truncate">{net.name}</span>
            <span className="text-[8px] font-mono text-white/35 shrink-0">{net.baudRate}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
        <span className="w-6 h-0.5 bg-white/70 rounded" />
        <span className="text-[8px] text-white/45">Backbone trunk</span>
      </div>
    </div>
  );
}
