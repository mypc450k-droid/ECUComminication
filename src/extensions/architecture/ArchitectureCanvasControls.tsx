'use client';

import { useCallback } from 'react';
import { useReactFlow, Controls, MiniMap } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { VEHICLE_LAYOUT_BOUNDS } from './vehicleZoneLayout';

export function ArchitectureCanvasControls({ showMinimap }: { showMinimap: boolean }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleFit = useCallback(() => {
    fitView({
      padding: 0.18,
      duration: 400,
      minZoom: 0.45,
      maxZoom: 1.2,
    });
  }, [fitView]);

  return (
    <>
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5">
        <div className="flex flex-col rounded-lg border border-cyan-500/15 bg-slate-900/92 shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => zoomIn({ duration: 200 })}
            className="px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border-b border-cyan-500/10"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomOut({ duration: 200 })}
            className="px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border-b border-cyan-500/10"
            title="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={handleFit}
            className="px-2 py-1.5 text-[8px] font-semibold text-cyan-400/90 hover:bg-cyan-500/10 uppercase tracking-wide"
            title="Fit to screen"
          >
            Fit
          </button>
        </div>
        <button
          type="button"
          onClick={handleFit}
          className={cn(
            'px-3 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider',
            'border border-cyan-500/25 bg-slate-900/90 text-cyan-300/90',
            'hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-colors shadow-lg'
          )}
        >
          Fit to Screen
        </button>
      </div>

      {showMinimap && (
        <MiniMap
          position="bottom-right"
          className="!bg-slate-900/85 !border-cyan-500/15 !rounded-lg"
          style={{ width: 140, height: 88 }}
          nodeColor={() => '#334155'}
          nodeStrokeColor={() => 'rgba(0,212,255,0.35)'}
          nodeStrokeWidth={2}
          maskColor="rgba(0,0,0,0.55)"
          pannable
          zoomable
        />
      )}

      <Controls position="top-left" showInteractive={false} className="!hidden" />
    </>
  );
}

export function ArchitectureMiniMapVehicleOutline() {
  const { width, height } = VEHICLE_LAYOUT_BOUNDS;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full opacity-30" aria-hidden>
      <path
        d={`M ${width * 0.2} ${height * 0.2} L ${width * 0.8} ${height * 0.2} L ${width * 0.86} ${height * 0.5} L ${width * 0.78} ${height * 0.88} L ${width * 0.22} ${height * 0.88} L ${width * 0.14} ${height * 0.5} Z`}
        fill="none"
        stroke="rgba(0,212,255,0.3)"
        strokeWidth="2"
      />
    </svg>
  );
}
