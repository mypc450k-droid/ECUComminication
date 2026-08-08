'use client';

import { VEHICLE_LAYOUT_BOUNDS } from './vehicleZoneLayout';

/** Clean engineering-style top-view vehicle outline — not decorative. */
export function VehicleSilhouette() {
  const { width, height } = VEHICLE_LAYOUT_BOUNDS;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <pattern id="vv-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#vv-grid)" />

      {/* Vehicle body outline */}
      <path
        d={`
          M ${width * 0.22} ${height * 0.18}
          Q ${width * 0.5} ${height * 0.08} ${width * 0.78} ${height * 0.18}
          L ${width * 0.88} ${height * 0.42}
          Q ${width * 0.9} ${height * 0.55} ${width * 0.85} ${height * 0.72}
          L ${width * 0.78} ${height * 0.88}
          Q ${width * 0.5} ${height * 0.94} ${width * 0.22} ${height * 0.88}
          L ${width * 0.15} ${height * 0.72}
          Q ${width * 0.1} ${height * 0.55} ${width * 0.12} ${height * 0.42}
          Z
        `}
        fill="rgba(15,23,42,0.35)"
        stroke="rgba(100,116,139,0.25)"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />

      {/* Zone dividers */}
      <line x1={width * 0.1} y1={height * 0.22} x2={width * 0.9} y2={height * 0.22} stroke="rgba(0,212,255,0.06)" strokeWidth="1" />
      <line x1={width * 0.1} y1={height * 0.38} x2={width * 0.9} y2={height * 0.38} stroke="rgba(0,212,255,0.04)" strokeWidth="1" />
      <line x1={width * 0.1} y1={height * 0.68} x2={width * 0.9} y2={height * 0.68} stroke="rgba(0,212,255,0.04)" strokeWidth="1" />
      <line x1={width * 0.1} y1={height * 0.82} x2={width * 0.9} y2={height * 0.82} stroke="rgba(0,212,255,0.06)" strokeWidth="1" />

      <text x={width * 0.5} y={height * 0.12} textAnchor="middle" fill="rgba(148,163,184,0.35)" fontSize="10" fontFamily="monospace">
        FRONT
      </text>
      <text x={width * 0.5} y={height * 0.97} textAnchor="middle" fill="rgba(148,163,184,0.35)" fontSize="10" fontFamily="monospace">
        REAR
      </text>
    </svg>
  );
}
