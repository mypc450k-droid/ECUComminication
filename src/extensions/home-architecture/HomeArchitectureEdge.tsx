'use client';

import { memo } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

function HomeTrunkEdgeComponent(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, data } = props;
  const active = Boolean(data?.active || data?.simulationActive);

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  });

  return (
    <g>
      <BaseEdge id={id} path={path} style={{ ...style, stroke: 'rgba(0,212,255,0.3)', strokeWidth: 2 }} />
      <path
        d={path}
        fill="none"
        stroke="rgba(0,212,255,0.55)"
        strokeWidth={active ? 2.5 : 1.8}
        strokeLinecap="square"
        strokeDasharray={active ? '6 20' : '4 24'}
        className={active ? 'vv-home-edge-strong' : 'vv-home-edge-ambient'}
        style={{ opacity: active ? 0.85 : 0.45 }}
      />
    </g>
  );
}

function HomeLinkEdgeComponent(props: EdgeProps) {
  const {
    id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, data,
  } = props;
  const color = (style?.stroke as string) || '#00D4FF';
  const active = Boolean(data?.active || data?.simulationActive);

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <g>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={active ? 2.5 : 1.6}
        strokeLinecap="round"
        strokeDasharray={active ? '5 14' : '3 20'}
        className={active ? 'vv-home-edge-strong' : 'vv-home-edge-ambient'}
        style={{ opacity: active ? 0.9 : 0.42 }}
      />
    </g>
  );
}

export const HomeTrunkEdge = memo(HomeTrunkEdgeComponent);
export const HomeLinkEdge = memo(HomeLinkEdgeComponent);
