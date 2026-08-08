'use client';

import { useAppStore } from '@/lib/store';
import { useExtensionStore } from '@/extensions/store/extensionStore';
import { StatusDot } from './ui/Badges';
import { cn } from '@/lib/utils';

export function HeaderBar() {
  const viewMode = useAppStore((s) => s.viewMode);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const presentationMode = useExtensionStore((s) => s.presentationMode);
  const setPresentationMode = useExtensionStore((s) => s.setPresentationMode);
  const focusMode = useExtensionStore((s) => s.focusMode);

  const modeLabels: Record<string, string> = {
    architecture: 'Vehicle Architecture',
    autosar: 'AUTOSAR Explorer',
    feature: 'Feature Simulation',
    network: 'Network Visualizer',
    topology3d: '3D Topology',
  };

  return (
    <header className="flex items-center justify-between px-4 h-12 border-b border-cyan-500/10 bg-slate-900/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 leading-tight">
              VehicleVerse
            </h1>
            <p className="text-[10px] text-cyan-400/70 font-mono leading-tight">
              E/E Architecture Explorer
            </p>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <div className="flex items-center gap-1.5">
          <StatusDot status="active" />
          <span className="text-xs text-slate-400">{modeLabels[viewMode]}</span>
          {selectedFeatureId && (
            <span className="text-xs text-cyan-400 font-medium">
              — {selectedFeatureId.replace(/-/g, ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setPresentationMode(!presentationMode)}
          className={cn(
            'text-[9px] px-2 py-1 rounded border font-mono transition-colors',
            presentationMode
              ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
              : 'border-slate-700/50 text-slate-500 hover:text-slate-300'
          )}
          title="Presentation Mode (P)"
        >
          {presentationMode ? '● Presenting' : 'Present'}
        </button>
        {focusMode && (
          <span className="text-[9px] text-amber-400/80 font-mono">Focus Mode</span>
        )}
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            CAN HS 500k
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            LIN 19.2k
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ETH 100M
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          v1.0.0
        </div>
      </div>
    </header>
  );
}
