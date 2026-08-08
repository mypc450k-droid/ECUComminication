'use client';

import { memo } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { networkColors } from './buildPartnerEdges';

/** CSS-animated edge — no React state updates in animation loop. */
function ArchitectureAnimatedEdgeComponent({
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
  const networkType = (data?.networkType as string) || 'CAN_HS';
  const color = (style?.stroke as string) || networkColors[networkType] || '#64748b';
  const isActive = Boolean(data?.active);
  const isSimulation = Boolean(data?.simulationActive);
  const opacity = (style?.opacity as number) ?? 0.4;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 18,
  });

  const pulseClass = isActive || isSimulation
    ? 'vv-architecture-edge-pulse-strong'
    : 'vv-architecture-edge-pulse-ambient';

  return (
    <g className="vv-architecture-edge-group">
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: color,
          strokeWidth: isActive || isSimulation ? 2 : 1.25,
          opacity,
        }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={isActive || isSimulation ? 2.5 : 1.5}
        strokeLinecap="round"
        strokeDasharray={isActive || isSimulation ? '6 18' : '3 20'}
        className={pulseClass}
        style={{ opacity: isActive || isSimulation ? 0.85 : 0.35 }}
      />
      {(isActive || isSimulation) && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 40"
          className="vv-architecture-edge-dot-trail"
          style={{ opacity: 0.5, filter: `drop-shadow(0 0 4px ${color})` }}
        />
      )}
    </g>
  );
}

export const ArchitectureAnimatedEdge = memo(ArchitectureAnimatedEdgeComponent);
