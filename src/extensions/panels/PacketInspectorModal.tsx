'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useExtensionStore } from '../store/extensionStore';
import { GlassPanel } from '@/components/ui/GlassPanel';

export function PacketInspectorModal() {
  const packetInspectorOpen = useExtensionStore((s) => s.packetInspectorOpen);
  const selectedPacket = useExtensionStore((s) => s.selectedPacket);
  const closePacketInspector = useExtensionStore((s) => s.closePacketInspector);

  if (!selectedPacket) return null;

  return (
    <AnimatePresence>
      {packetInspectorOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closePacketInspector}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <GlassPanel className="p-5 glass-panel-highlight max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Packet Inspector</h2>
                  <p className="text-[10px] font-mono text-cyan-400">{selectedPacket.canId}</p>
                </div>
                <button onClick={closePacketInspector} className="text-slate-500 hover:text-slate-300">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <Field label="CAN ID" value={selectedPacket.canId} mono />
                <Field label="Extended/Standard" value={selectedPacket.extended ? 'Extended 29-bit' : 'Standard 11-bit'} />
                <Field label="DLC" value={String(selectedPacket.dlc)} mono />
                <Field label="Cycle Time" value={`${selectedPacket.cycleTimeMs} ms`} />
                <Field label="Sender" value={selectedPacket.sender} />
                <Field label="Receiver" value={selectedPacket.receiver} />
                <Field label="Alive Counter" value={String(selectedPacket.aliveCounter)} mono />
                <Field label="Checksum" value={selectedPacket.checksum} mono />
                <Field label="Bus Load" value={selectedPacket.busLoad} />
                <Field label="Timestamp" value={selectedPacket.timestamp} mono />
                <Field label="Priority" value={selectedPacket.priority} />
                <Field label="Arbitration" value={selectedPacket.arbitration} />
                <Field label="Error State" value={selectedPacket.errorState} />
                <Field label="DBC Name" value={selectedPacket.dbcName} mono />
              </div>

              <GlassPanel className="p-3 mb-3">
                <h4 className="text-[9px] text-slate-500 uppercase mb-1">Raw Bytes</h4>
                <pre className="text-[11px] font-mono text-cyan-400/90">{selectedPacket.rawBytes}</pre>
              </GlassPanel>

              <GlassPanel className="p-3 mb-4">
                <h4 className="text-[9px] text-slate-500 uppercase mb-1">Decoded Signals</h4>
                {selectedPacket.decodedSignals.map((s) => (
                  <p key={s} className="text-[10px] text-slate-300 font-mono">• {s}</p>
                ))}
              </GlassPanel>

              {/* Frame travel animation */}
              <div className="relative h-12 rounded-lg bg-slate-800/60 border border-cyan-500/10 overflow-hidden">
                <span className="absolute left-2 top-1 text-[8px] text-slate-600">{selectedPacket.sender}</span>
                <span className="absolute right-2 top-1 text-[8px] text-slate-600">{selectedPacket.receiver}</span>
                <div className="absolute inset-x-8 top-1/2 h-px bg-cyan-500/20" />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.6)]"
                  animate={{ left: ['8%', '85%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-2 py-1.5 bg-slate-800/40 rounded border border-slate-700/30">
      <span className="text-[8px] text-slate-600 uppercase">{label}</span>
      <p className={`text-[10px] text-slate-300 mt-0.5 ${mono ? 'font-mono text-cyan-400/80' : ''}`}>{value}</p>
    </div>
  );
}
