'use client';

import { memo } from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

const PULSE_COUNT = 3;
const PULSE_DURATION_S = 1.75;

function HomeSmoothStepEdgeComponent({
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
  interactionWidth,
}: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isTraceEdge = Boolean(data?.isTraceEdge);
  const traceReverse = Boolean(data?.traceReverse);
  const hopIndex =
    typeof data?.traceHopIndex === 'number' ? data.traceHopIndex : 0;
  const pulseColor = (style?.stroke as string) ?? '#00D4FF';

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        labelX={labelX}
        labelY={labelY}
        style={style}
        markerEnd={markerEnd}
        interactionWidth={interactionWidth}
      />
      {isTraceEdge && (
        <g className="hp-trace-pulse-layer" aria-hidden>
          {Array.from({ length: PULSE_COUNT }, (_, pulseIndex) => {
            const stagger =
              hopIndex * 0.42 + pulseIndex * (PULSE_DURATION_S / PULSE_COUNT);
            return (
              <circle
                key={pulseIndex}
                r={3.5}
                className="hp-trace-pulse-dot"
                fill={pulseColor}
              >
                <animateMotion
                  dur={`${PULSE_DURATION_S}s`}
                  repeatCount="indefinite"
                  begin={`${stagger}s`}
                  path={path}
                  keyPoints={traceReverse ? '1;0' : '0;1'}
                  keyTimes="0;1"
                  calcMode="linear"
                />
              </circle>
            );
          })}
        </g>
      )}
    </>
  );
}

export const HomeSmoothStepEdge = memo(HomeSmoothStepEdgeComponent);
