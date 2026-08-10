'use client';

import { memo } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

/** White orthogonal backbone — CSS animated pulse, no React state. */
function ZoneBackboneEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  });

  return (
    <g className="vv-zone-backbone-edge">
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: '#ffffff',
          strokeWidth: 2.5,
          opacity: 0.45,
        }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="square"
        strokeDasharray="4 28"
        className="vv-zone-backbone-pulse"
        style={{ opacity: 0.7 }}
      />
    </g>
  );
}

/** Teal peripheral with directional pulse. */
function ZonePeripheralEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const color = (style?.stroke as string) || '#26A69A';
  const isActive = Boolean(data?.active);
  const isSimulation = Boolean(data?.simulationActive);

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  const pulseClass = isActive || isSimulation
    ? 'vv-zone-peripheral-pulse-strong'
    : 'vv-zone-peripheral-pulse';

  return (
    <g>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isActive || isSimulation ? 2.2 : 1.4,
          opacity: (style?.opacity as number) ?? 0.45,
        }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={isActive || isSimulation ? 3 : 2}
        strokeLinecap="round"
        strokeDasharray={isActive || isSimulation ? '5 16' : '3 22'}
        className={pulseClass}
        style={{ opacity: isActive || isSimulation ? 0.9 : 0.5 }}
      />
    </g>
  );
}

export const ZoneBackboneEdge = memo(ZoneBackboneEdgeComponent);
export const ZonePeripheralEdge = memo(ZonePeripheralEdgeComponent);
