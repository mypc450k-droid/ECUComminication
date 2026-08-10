'use client';

import { useCallback } from 'react';
import { useReactFlow, MiniMap } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { VEHICLE_LAYOUT_BOUNDS, ZONE_TEAL } from './vehicleZoneLayout';

export function ArchitectureCanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleFit = useCallback(() => {
    fitView({ padding: 0.16, duration: 450, minZoom: 0.45, maxZoom: 1.15 });
  }, [fitView]);

  return (
    <>
      <div className="absolute bottom-5 left-5 z-20 flex flex-col gap-2">
        <div className="flex flex-col rounded-lg border border-white/10 bg-black/75 shadow-xl overflow-hidden backdrop-blur-sm">
          <button
            type="button"
            onClick={() => zoomIn({ duration: 200 })}
            className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 border-b border-white/10"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomOut({ duration: 200 })}
            className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 border-b border-white/10"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
        <button
          type="button"
          onClick={handleFit}
          className={cn(
            'px-4 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-widest',
            'border border-white/20 bg-black/80 text-white/90 backdrop-blur-sm',
            'hover:bg-white/10 transition-colors shadow-xl'
          )}
        >
          Fit to Screen
        </button>
      </div>

      <MiniMap
        position="bottom-right"
        className="!bg-black/80 !border-white/15 !rounded-lg"
        style={{ width: 148, height: 92 }}
        nodeColor={() => ZONE_TEAL}
        nodeStrokeColor={() => 'rgba(255,255,255,0.4)'}
        nodeStrokeWidth={2}
        maskColor="rgba(0,0,0,0.65)"
        pannable
        zoomable
      />
    </>
  );
}

export function ZoneArchitectureLegend() {
  const { width, height } = VEHICLE_LAYOUT_BOUNDS;
  return (
  <div className="absolute bottom-5 left-[120px] z-20 max-w-[220px] pointer-events-none">
    <p className="text-lg font-semibold text-white/95 tracking-tight">Zone architecture</p>
    <div className="h-px w-full bg-white/25 my-2" />
    <div className="flex items-center gap-2 mt-1">
      <span className="w-3 h-3 rounded-sm bg-[#26A69A] shrink-0" />
      <span className="text-[11px] text-white/70">= ECU, sensor or actuator</span>
    </div>
    <svg viewBox={`0 0 ${width} ${height}`} className="w-0 h-0" aria-hidden>
      <title>Zone layout</title>
    </svg>
  </div>
  );
}
