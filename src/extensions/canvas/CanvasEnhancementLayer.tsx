'use client';

import { useAppStore } from '@/lib/store';
import { useExtensionStore } from '../store/extensionStore';
import { SignalFlowParticles } from './SignalFlowParticles';

export function CanvasEnhancementLayer({ children }: { children: React.ReactNode }) {
  const canvasZoomSlider = useExtensionStore((s) => s.canvasZoomSlider);
  const setCanvasZoomSlider = useExtensionStore((s) => s.setCanvasZoomSlider);
  const setCanvasZoom = useAppStore((s) => s.setCanvasZoom);
  const resetCanvas = useAppStore((s) => s.resetCanvas);
  const showGrid = useAppStore((s) => s.showGrid);
  const toggleGrid = useAppStore((s) => s.toggleGrid);

  const handleZoomSlider = (value: number) => {
    setCanvasZoomSlider(value);
    setCanvasZoom(value / 100);
  };

  return (
    <div className="relative h-full w-full">
      {children}
      <SignalFlowParticles />

      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 glass-panel rounded-lg px-2 py-1.5">
        <button onClick={toggleGrid} className="text-[9px] text-slate-500 hover:text-cyan-400" title="Grid">▦</button>
        <button onClick={resetCanvas} className="text-[9px] text-slate-500 hover:text-cyan-400" title="Fit All">⊞</button>
        <input
          type="range"
          min={30}
          max={200}
          value={canvasZoomSlider}
          onChange={(e) => handleZoomSlider(Number(e.target.value))}
          className="w-16 h-1 accent-cyan-500"
          title="Zoom"
        />
        <span className="text-[8px] font-mono text-slate-600">{canvasZoomSlider}%</span>
      </div>

      <div className="absolute top-3 right-14 z-20 text-[8px] text-slate-600 glass-panel px-2 py-1 rounded">
        Wheel: Zoom • Right-drag: Pan • Dbl-click: Focus
      </div>
    </div>
  );
}
