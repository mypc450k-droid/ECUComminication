'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore, startCommunicationTicker, stopCommunicationTicker } from '@/lib/store';
import { useExtensionStore } from '../store/extensionStore';
import { CommunicationMonitor } from '@/components/CommunicationMonitor';
import { PacketInspectorModal } from '../panels/PacketInspectorModal';
import { packetFromMessage } from '../lib/signalEvolution';
import { cn } from '@/lib/utils';

export function CommunicationMonitorPro() {
  const messages = useAppStore((s) => s.communicationMessages);
  const commMonitorPaused = useExtensionStore((s) => s.commMonitorPaused);
  const setCommPaused = useExtensionStore((s) => s.setCommPaused);
  const commFilters = useExtensionStore((s) => s.commFilters);
  const setCommFilters = useExtensionStore((s) => s.setCommFilters);
  const commViewMode = useExtensionStore((s) => s.commViewMode);
  const setCommViewMode = useExtensionStore((s) => s.setCommViewMode);
  const openPacketInspector = useExtensionStore((s) => s.openPacketInspector);

  useEffect(() => {
    if (commMonitorPaused) {
      stopCommunicationTicker();
    } else {
      startCommunicationTicker();
    }
    return () => stopCommunicationTicker();
  }, [commMonitorPaused]);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (commFilters.network && m.network !== commFilters.network) return false;
      if (commFilters.source && !m.source.toLowerCase().includes(commFilters.source.toLowerCase())) return false;
      if (commFilters.destination && !m.destination.toLowerCase().includes(commFilters.destination.toLowerCase())) return false;
      if (commFilters.signal && !m.signal.toLowerCase().includes(commFilters.signal.toLowerCase())) return false;
      if (commFilters.search) {
        const q = commFilters.search.toLowerCase();
        if (!m.canId.toLowerCase().includes(q) && !m.signal.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [messages, commFilters]);

  const handleExportCsv = () => {
    const header = 'time,network,canId,source,signal,destination,status';
    const rows = filtered.map((m) =>
      `${m.timestamp},${m.network},${m.canId},${m.source},${m.signal},${m.destination},${m.status}`
    ).join('\n');
    downloadFile(`${header}\n${rows}`, 'comm-monitor.csv', 'text/csv');
  };

  const handleExportJson = () => {
    downloadFile(JSON.stringify(filtered, null, 2), 'comm-monitor.json', 'application/json');
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-3 py-1 border-b border-cyan-500/10 bg-slate-900/60 flex-wrap">
        <button
          onClick={() => setCommPaused(!commMonitorPaused)}
          className={cn(
            'px-2 py-0.5 text-[9px] rounded border',
            commMonitorPaused ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
          )}
        >
          {commMonitorPaused ? '⏸ Paused' : '● Live'}
        </button>
        <input
          placeholder="Search frames..."
          value={commFilters.search}
          onChange={(e) => setCommFilters({ search: e.target.value })}
          className="px-2 py-0.5 text-[9px] bg-slate-800/60 border border-slate-700/50 rounded text-slate-300 w-24"
        />
        <select
          value={commFilters.network}
          onChange={(e) => setCommFilters({ network: e.target.value })}
          className="px-1 py-0.5 text-[9px] bg-slate-800/60 border border-slate-700/50 rounded text-slate-400"
        >
          <option value="">All Networks</option>
          <option value="CAN_HS">CAN HS</option>
          <option value="LIN">LIN</option>
          <option value="Ethernet">Ethernet</option>
        </select>
        {(['decoded', 'hex', 'dbc'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setCommViewMode(mode)}
            className={cn(
              'px-1.5 py-0.5 text-[9px] rounded',
              commViewMode === mode ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-600'
            )}
          >
            {mode}
          </button>
        ))}
        <button onClick={handleExportCsv} className="px-1.5 py-0.5 text-[9px] text-slate-500 hover:text-cyan-400">CSV</button>
        <button onClick={handleExportJson} className="px-1.5 py-0.5 text-[9px] text-slate-500 hover:text-cyan-400">JSON</button>
        <span className="text-[9px] text-slate-600 ml-auto">{filtered.length} frames</span>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden" onClick={(e) => {
        const row = (e.target as HTMLElement).closest('[data-packet-id]');
        if (row) {
          const id = row.getAttribute('data-packet-id');
          const msg = filtered.find((m) => m.id === id);
          if (msg) openPacketInspector(packetFromMessage(msg));
        }
      }}>
        <CommunicationMonitor embedded />
      </div>

      <PacketInspectorModal />
    </div>
  );
}

function downloadFile(content: string, name: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
