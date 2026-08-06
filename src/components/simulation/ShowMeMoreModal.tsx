'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { getShowMeMore } from '@/lib/simulation-loader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

export function ShowMeMoreModal() {
  const showMeMoreKey = useAppStore((s) => s.showMeMoreKey);
  const closeShowMeMore = useAppStore((s) => s.closeShowMeMore);

  const content = showMeMoreKey ? getShowMeMore(showMeMoreKey) : null;

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeShowMeMore}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <GlassPanel className="p-5 glass-panel-highlight max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">{content.title}</h2>
                  <p className="text-xs text-purple-400/70 mt-0.5">Show Me More</p>
                </div>
                <button onClick={closeShowMeMore} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailBlock title="Architecture" content={content.architecture} />
                <DetailBlock title="State Machine" content={content.stateMachine} />
                <DetailBlock title="DBC Signal" content={content.dbcSignal} mono />
                <DetailBlock title="ASIL Level" content={content.asilLevel} />
                <DetailBlock title="ISO 26262 Impact" content={content.iso26262Impact} />
              </div>

              <ListSection title="Signals" items={content.signals} />
              <ListSection title="Requirements" items={content.requirements} />
              <ListSection title="CAN Frames" items={content.canFrames} mono />
              <ListSection title="AUTOSAR Mapping" items={content.autosarMapping} />
              <ListSection title="Hardware Connections" items={content.hardwareConnections} />
              <ListSection title="Software Connections" items={content.softwareConnections} />
              <ListSection title="Diagnostics" items={content.diagnostics} />
              <ListSection title="Failure Modes" items={content.failureModes} />
              <ListSection title="OEM Usage" items={content.oemUsage} />
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailBlock({ title, content, mono }: { title: string; content: string; mono?: boolean }) {
  return (
    <div className="p-2 bg-slate-800/40 rounded border border-slate-700/30">
      <h4 className="text-[9px] text-slate-500 uppercase tracking-wider">{title}</h4>
      <p className={cn('text-xs text-slate-300 mt-1', mono && 'font-mono text-cyan-400/80')}>{content}</p>
    </div>
  );
}

function ListSection({ title, items, mono }: { title: string; items: string[]; mono?: boolean }) {
  return (
    <div className="mt-3">
      <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</h4>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item} className={cn('text-xs text-slate-400', mono && 'font-mono text-cyan-400/70')}>
            ▸ {item}
          </li>
        ))}
      </ul>
    </div>
  );
}