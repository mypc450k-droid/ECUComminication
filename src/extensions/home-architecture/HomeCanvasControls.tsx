'use client';

import { useCallback } from 'react';
import { useReactFlow, MiniMap } from '@xyflow/react';
import { cn } from '@/lib/utils';

export function HomeCanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const fit = useCallback(() => {
    fitView({ padding: 0.18, duration: 400, minZoom: 0.48, maxZoom: 1.12 });
  }, [fitView]);

  return (
    <>
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
        <div className="rounded-lg border border-cyan-500/15 bg-slate-900/92 backdrop-blur-sm shadow-xl overflow-hidden">
          <button
            type="button"
            onClick={() => zoomIn({ duration: 200 })}
            className="w-full px-3 py-2 text-sm text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border-b border-cyan-500/10"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomOut({ duration: 200 })}
            className="w-full px-3 py-2 text-sm text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border-b border-cyan-500/10"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={fit}
            className="w-full px-2 py-1.5 text-[8px] font-semibold text-cyan-400/90 hover:bg-cyan-500/10 uppercase tracking-wider"
          >
            FIT
          </button>
        </div>
        <button
          type="button"
          onClick={fit}
          className={cn(
            'px-3 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-widest',
            'border border-cyan-500/25 bg-slate-900/90 text-cyan-300/90 backdrop-blur-sm',
            'hover:bg-cyan-500/10 transition-colors shadow-xl'
          )}
        >
          Fit to Screen
        </button>
      </div>
      <MiniMap
        position="bottom-right"
        className="!bg-slate-900/85 !border-cyan-500/15 !rounded-lg"
        style={{ width: 142, height: 90 }}
        nodeColor={() => '#1e3a4f'}
        nodeStrokeColor={() => 'rgba(0,212,255,0.4)'}
        nodeStrokeWidth={2}
        maskColor="rgba(0,0,0,0.6)"
        pannable
        zoomable
      />
    </>
  );
}
