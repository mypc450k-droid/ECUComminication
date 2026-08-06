'use client';

import { motion } from 'framer-motion';
import { networks, ecus } from '@/lib/data';
import { GlassPanel } from '@/components/ui/GlassPanel';

export function NetworkVisualizer() {
  return (
    <div className="flex h-full p-4 gap-4 overflow-hidden">
      <div className="flex-1 relative engineering-bg rounded-lg border border-cyan-500/10 overflow-hidden">
        <svg viewBox="0 0 900 500" className="w-full h-full">
          {/* Network buses as horizontal lines */}
          {networks.map((net, i) => {
            const y = 80 + i * 90;
            const members = net.ecuIds.slice(0, 8);
            return (
              <g key={net.id}>
                <line
                  x1={50}
                  y1={y}
                  x2={850}
                  y2={y}
                  stroke={net.color}
                  strokeWidth={2}
                  strokeOpacity={0.4}
                />
                <text x={10} y={y + 4} className="text-[10px] fill-slate-500" fontSize={10}>
                  {net.name}
                </text>
                {members.map((ecuId, j) => {
                  const ecu = ecus.find((e) => e.id === ecuId);
                  const x = 100 + j * 100;
                  return (
                    <g key={ecuId}>
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={12}
                        fill={net.color}
                        fillOpacity={0.3}
                        stroke={net.color}
                        strokeWidth={1}
                        animate={{ r: [12, 14, 12] }}
                        transition={{ duration: 2, repeat: Infinity, delay: j * 0.3 }}
                      />
                      <text x={x} y={y + 28} textAnchor="middle" className="fill-slate-400" fontSize={8}>
                        {ecu?.shortName || ecuId}
                      </text>
                      {/* Animated packet */}
                      <motion.circle
                        r={3}
                        fill={net.color}
                        animate={{ cx: [100, 850], cy: y }}
                        transition={{ duration: 3, repeat: Infinity, delay: j * 0.5, ease: 'linear' }}
                        style={{ filter: `drop-shadow(0 0 4px ${net.color})` }}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Gateway node */}
          <rect x={420} y={200} width={60} height={40} rx={4} fill="rgba(0,212,255,0.1)" stroke="#00d4ff" strokeWidth={1} />
          <text x={450} y={225} textAnchor="middle" fill="#00d4ff" fontSize={10}>Gateway</text>
        </svg>
      </div>

      <div className="w-56 space-y-2 overflow-y-auto custom-scrollbar">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Topology</h3>
        {networks.map((net) => (
          <GlassPanel key={net.id} className="p-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: net.color }} />
              <span className="text-xs text-slate-300">{net.name}</span>
            </div>
            <p className="text-[9px] text-slate-600 mt-1">{net.baudRate} — {net.ecuIds.length} nodes</p>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
