'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, startCommunicationTicker, stopCommunicationTicker } from '@/lib/store';
import { NetworkBadge } from './ui/Badges';
import { PacketLane } from './simulation/PacketLane';
import { cn } from '@/lib/utils';

export function CommunicationMonitor({ embedded = false }: { embedded?: boolean }) {
  const messages = useAppStore((s) => s.communicationMessages);
  const bottomPanelExpanded = useAppStore((s) => s.bottomPanelExpanded);
  const toggleBottomPanel = useAppStore((s) => s.toggleBottomPanel);

  useEffect(() => {
    startCommunicationTicker();
    return () => stopCommunicationTicker();
  }, []);

  return (
    <div className={cn(
      'border-t border-cyan-500/10 bg-slate-900/60 transition-all duration-300',
      embedded ? 'h-full' : bottomPanelExpanded ? 'h-44' : 'h-8'
    )}>
      <div
        className="flex items-center justify-between px-4 h-8 border-b border-cyan-500/10 cursor-pointer hover:bg-cyan-500/5"
        onClick={toggleBottomPanel}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
              Live Communication Monitor
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {messages.length} messages
          </span>
        </div>
        <motion.span
          animate={{ rotate: bottomPanelExpanded ? 180 : 0 }}
          className="text-[10px] text-slate-500"
        >
          ▼
        </motion.span>
      </div>

      <AnimatePresence>
        {bottomPanelExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[calc(100%-32px)] overflow-hidden flex flex-col"
          >
            <PacketLane messages={messages} />
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-900/90 z-10">
                  <tr className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-1.5 w-20">Time</th>
                    <th className="px-3 py-1.5 w-16">Network</th>
                    <th className="px-3 py-1.5 w-20">ID</th>
                    <th className="px-3 py-1.5 w-24">Source</th>
                    <th className="px-3 py-1.5">Signal</th>
                    <th className="px-3 py-1.5 w-24">Destination</th>
                    <th className="px-3 py-1.5 w-16">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                      <motion.tr
                        key={msg.id}
                        data-packet-id={msg.id}
                        initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(0,212,255,0.1)' }}
                        animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-slate-800/50 hover:bg-cyan-500/5"
                      >
                        <td className="px-4 py-1.5 text-[10px] font-mono text-slate-500">
                          {msg.timestamp}
                        </td>
                        <td className="px-3 py-1.5">
                          <NetworkBadge type={msg.network} />
                        </td>
                        <td className="px-3 py-1.5 text-[10px] font-mono text-cyan-400/80">
                          {msg.canId}
                        </td>
                        <td className="px-3 py-1.5 text-[10px] text-slate-400">
                          {msg.source}
                        </td>
                        <td className="px-3 py-1.5">
                          <div className="flex items-center gap-2">
                            {i === 0 && (
                              <motion.span
                                className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            )}
                            <span className="text-[10px] text-slate-300">{msg.signal}</span>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-[10px] text-slate-400">
                          {msg.destination}
                        </td>
                        <td className="px-3 py-1.5">
                          <span className={cn(
                            'text-[10px] font-medium',
                            msg.status === 'success' && 'status-success',
                            msg.status === 'error' && 'status-error',
                            msg.status === 'pending' && 'status-pending'
                          )}>
                            {msg.status === 'success' ? '✓ Success' : msg.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-20 text-xs text-slate-600">
                  Waiting for bus traffic...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
