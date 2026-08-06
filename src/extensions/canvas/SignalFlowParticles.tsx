'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

const networkColors: Record<string, string> = {
  CAN_HS: '#00D4FF',
  CAN_LS: '#4A9EFF',
  LIN: '#7B68EE',
  Ethernet: '#00FF88',
  FlexRay: '#FF6B35',
};

export function SignalFlowParticles() {
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const isActive = currentStepIndex >= 0 && selectedFeatureId;

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {['CAN_HS', 'LIN', 'Ethernet'].map((net, i) => {
        const color = networkColors[net];
        return (
          <motion.div
            key={net}
            className="absolute flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-mono"
            style={{
              backgroundColor: `${color}15`,
              border: `1px solid ${color}40`,
              color,
              boxShadow: `0 0 10px ${color}40`,
            }}
            initial={{ left: '5%', top: `${20 + i * 25}%`, opacity: 0 }}
            animate={{
              left: ['5%', '70%', '85%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'linear',
            }}
          >
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
            {net}
          </motion.div>
        );
      })}
    </div>
  );
}
