'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { getFailureScenarios } from '@/lib/simulation-loader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

export function FailureSimulation() {
  const failures = getFailureScenarios();
  const activeFailureId = useAppStore((s) => s.activeFailureId);
  const setActiveFailureId = useAppStore((s) => s.setActiveFailureId);

  const active = failures.find((f) => f.id === activeFailureId);

  return (
    <div className="flex h-full min-h-0">
      <div className="w-64 shrink-0 border-r border-cyan-500/10 overflow-y-auto custom-scrollbar p-3">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Failure Injection
        </h3>
        <div className="space-y-1">
          {failures.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFailureId(f.id)}
              className={cn(
                'w-full text-left px-2 py-1.5 rounded-md text-xs transition-all',
                activeFailureId === f.id
                  ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
              )}
            >
              <span className="text-[9px] text-slate-600 uppercase">{f.category}</span>
              <p className="font-medium">{f.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-y-auto custom-scrollbar">
        {active ? (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3 max-w-2xl"
          >
            <h2 className="text-lg font-semibold text-red-400">{active.name}</h2>
            <p className="text-xs text-slate-400">{active.description}</p>

            <div className="grid grid-cols-0 gap-2">
              <FailureStep label="1. Fault Detection" value={active.detectionStep} color="amber" />
              <FailureStep label="2. DEM Action" value={active.demAction} color="orange" />
              <FailureStep label="3. DTC Logged" value={active.dtcCode} color="red" mono />
              <FailureStep label="4. Recovery" value={active.recovery} color="cyan" />
              <FailureStep label="5. Warning Lamp" value={active.warningLamp} color="yellow" />
              <FailureStep label="6. Fallback Mode" value={active.fallbackMode} color="purple" />
            </div>

            <GlassPanel className="p-3">
              <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Failure Animation Sequence</h4>
              <div className="flex items-center gap-2">
                {['Detect', 'DEM', 'DTC', 'Recover', 'Warn'].map((step, i) => (
                  <motion.div
                    key={step}
                    className="flex items-center gap-1"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  >
                    <span className="text-[9px] px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                      {step}
                    </span>
                    {i < 4 && <span className="text-slate-600">→</span>}
                  </motion.div>
                ))}
              </div>
            </GlassPanel>

            <div className="flex flex-wrap gap-1">
              {active.involvedEcus.map((ecu) => (
                <span key={ecu} className="text-[10px] px-1.5 py-0.5 bg-slate-800/60 text-slate-400 rounded">
                  {ecu}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">
            Select a failure scenario to simulate
          </div>
        )}
      </div>
    </div>
  );
}

function FailureStep({
  label,
  value,
  color,
  mono,
}: {
  label: string;
  value: string;
  color: string;
  mono?: boolean;
}) {
  const colors: Record<string, string> = {
    amber: 'border-amber-500/20 bg-amber-500/5',
    orange: 'border-orange-500/20 bg-orange-500/5',
    red: 'border-red-500/20 bg-red-500/5',
    cyan: 'border-cyan-500/20 bg-cyan-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
  };

  return (
    <GlassPanel className={cn('p-2 border', colors[color])}>
      <span className="text-[9px] text-slate-500 uppercase">{label}</span>
      <p className={cn('text-xs text-slate-300 mt-0.5', mono && 'font-mono text-red-400')}>{value}</p>
    </GlassPanel>
  );
}
