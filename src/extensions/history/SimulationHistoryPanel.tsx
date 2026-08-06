'use client';

import { useExtensionStore } from '../store/extensionStore';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function SimulationHistoryPanel() {
  const history = useExtensionStore((s) => s.simulationHistory);
  const bookmarks = useExtensionStore((s) => s.historyBookmarks);
  const clearHistory = useExtensionStore((s) => s.clearHistory);
  const addBookmark = useExtensionStore((s) => s.addBookmark);
  const exportHistoryJson = useExtensionStore((s) => s.exportHistoryJson);
  const exportHistoryCsv = useExtensionStore((s) => s.exportHistoryCsv);
  const setActiveFlowStage = useAppStore((s) => s.setActiveFlowStage);

  if (history.length === 0) return null;

  const jumpTo = (stepIndex: number) => {
    useAppStore.setState({
      currentStepIndex: stepIndex,
      activeFlowStage: stepIndex,
      isSimulationRunning: true,
    });
  };

  return (
    <div className="border-t border-cyan-500/10 bg-slate-900/50 max-h-24 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-1 border-b border-cyan-500/5">
        <span className="text-[9px] font-semibold text-slate-500 uppercase">Simulation History</span>
        <div className="flex gap-2">
          <button onClick={() => download(exportHistoryCsv(), 'history.csv')} className="text-[8px] text-slate-600 hover:text-cyan-400">CSV</button>
          <button onClick={() => download(exportHistoryJson(), 'history.json')} className="text-[8px] text-slate-600 hover:text-cyan-400">JSON</button>
          <button onClick={clearHistory} className="text-[8px] text-slate-600 hover:text-red-400">Clear</button>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto custom-scrollbar px-2 py-1 flex gap-1">
        {history.slice(0, 30).map((entry) => (
          <button
            key={entry.id}
            onClick={() => jumpTo(entry.stepIndex)}
            className={cn(
              'flex-shrink-0 px-2 py-1 rounded text-[8px] border transition-colors',
              bookmarks.includes(entry.stepIndex)
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : 'border-slate-700/30 bg-slate-800/30 text-slate-500 hover:text-cyan-400'
            )}
            onContextMenu={(e) => {
              e.preventDefault();
              addBookmark(entry.stepIndex);
            }}
          >
            <span className="font-mono text-cyan-500/60">#{entry.stepIndex + 1}</span>
            <span className="ml-1 truncate max-w-[80px]">{entry.stepTitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function download(content: string, name: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
