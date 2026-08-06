'use client';

import { motion } from 'framer-motion';
import type { CommunicationMessage } from '@/types';

const networkColors: Record<string, string> = {
  CAN_HS: '#00D4FF',
  CAN_LS: '#4A9EFF',
  LIN: '#7B68EE',
  Ethernet: '#00FF88',
  FlexRay: '#FF6B35',
};

interface PacketLaneProps {
  messages: CommunicationMessage[];
}

export function PacketLane({ messages }: PacketLaneProps) {
  const recent = messages.slice(0, 6);

  return (
    <div className="relative h-8 mx-4 mb-1 rounded-md bg-slate-800/40 border border-slate-700/30 overflow-hidden">
      <div className="absolute inset-0 flex items-center">
        {recent.map((msg, i) => {
          const color = networkColors[msg.network] || '#64748b';
          return (
            <motion.div
              key={msg.id}
              className="absolute flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-mono whitespace-nowrap"
              style={{
                backgroundColor: `${color}20`,
                border: `1px solid ${color}40`,
                color: color,
                boxShadow: `0 0 8px ${color}30`,
              }}
              initial={{ left: '-20%', opacity: 0 }}
              animate={{ left: '110%', opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              title={`${msg.canId} ${msg.signal} ${msg.source} → ${msg.destination}`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              {msg.network} {msg.canId}
            </motion.div>
          );
        })}
      </div>
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(10,14,23,0.8) 0%, transparent 10%, transparent 90%, rgba(10,14,23,0.8) 100%)',
        }}
      />
    </div>
  );
}
