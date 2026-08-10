'use client';

import { VEHICLE_LAYOUT_BOUNDS, type VehicleZone } from '@/extensions/architecture/vehicleZoneLayout';

const ZONE_BANDS: Array<{
  zone: VehicleZone;
  label: string;
  yStart: number;
  yEnd: number;
}> = [
  { zone: 'front', label: 'FRONT — Perception & Lighting', yStart: 0.1, yEnd: 0.22 },
  { zone: 'cabin', label: 'CABIN — Body & Comfort', yStart: 0.22, yEnd: 0.58 },
  { zone: 'powertrain', label: 'POWERTRAIN', yStart: 0.58, yEnd: 0.74 },
  { zone: 'chassis', label: 'CHASSIS', yStart: 0.74, yEnd: 0.9 },
];

/** Enhanced top-view vehicle outline for homepage presentation only. */
export function HomeVehicleSilhouette() {
  const { width, height } = VEHICLE_LAYOUT_BOUNDS;
  const cx = width * 0.5;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <pattern id="hp-vv-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(0,212,255,0.035)" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="hp-body-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(15,23,42,0.2)" />
          <stop offset="50%" stopColor="rgba(15,23,42,0.42)" />
          <stop offset="100%" stopColor="rgba(15,23,42,0.28)" />
        </linearGradient>
        <linearGradient id="hp-body-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(100,116,139,0.15)" />
          <stop offset="50%" stopColor="rgba(0,212,255,0.22)" />
          <stop offset="100%" stopColor="rgba(100,116,139,0.15)" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#hp-vv-grid)" />

      {/* Vehicle body — cleaner sedan top-view */}
      <path
        d={`
          M ${width * 0.24} ${height * 0.2}
          Q ${cx} ${height * 0.09} ${width * 0.76} ${height * 0.2}
          L ${width * 0.86} ${height * 0.38}
          Q ${width * 0.9} ${height * 0.5} ${width * 0.87} ${height * 0.62}
          L ${width * 0.8} ${height * 0.86}
          Q ${cx} ${height * 0.93} ${width * 0.2} ${height * 0.86}
          L ${width * 0.13} ${height * 0.62}
          Q ${width * 0.1} ${height * 0.5} ${width * 0.14} ${height * 0.38}
          Z
        `}
        fill="url(#hp-body-fill)"
        stroke="url(#hp-body-stroke)"
        strokeWidth="1.5"
      />

      {/* Cabin glass hint */}
      <path
        d={`
          M ${width * 0.28} ${height * 0.28}
          Q ${cx} ${height * 0.24} ${width * 0.72} ${height * 0.28}
          L ${width * 0.7} ${height * 0.48}
          Q ${cx} ${height * 0.52} ${width * 0.3} ${height * 0.48}
          Z
        `}
        fill="rgba(0,212,255,0.03)"
        stroke="rgba(0,212,255,0.08)"
        strokeWidth="1"
        strokeDasharray="4 6"
      />

      {/* Wheel wells */}
      {[
        { x: width * 0.22, y: height * 0.34 },
        { x: width * 0.78, y: height * 0.34 },
        { x: width * 0.22, y: height * 0.72 },
        { x: width * 0.78, y: height * 0.72 },
      ].map((w, i) => (
        <ellipse
          key={i}
          cx={w.x}
          cy={w.y}
          rx={width * 0.045}
          ry={height * 0.04}
          fill="rgba(15,23,42,0.55)"
          stroke="rgba(100,116,139,0.2)"
          strokeWidth="1"
        />
      ))}

      {/* Zone bands */}
      {ZONE_BANDS.map((band) => (
        <g key={band.zone}>
          <line
            x1={width * 0.11}
            y1={height * band.yStart}
            x2={width * 0.89}
            y2={height * band.yStart}
            stroke="rgba(0,212,255,0.07)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <text
            x={width * 0.125}
            y={height * (band.yStart + (band.yEnd - band.yStart) * 0.35)}
            fill="rgba(148,163,184,0.28)"
            fontSize="8"
            fontFamily="ui-monospace, monospace"
            letterSpacing="0.08em"
          >
            {band.label}
          </text>
        </g>
      ))}

      {/* Direction markers */}
      <g fill="rgba(148,163,184,0.4)" fontFamily="ui-monospace, monospace" fontSize="10">
        <text x={cx} y={height * 0.075} textAnchor="middle">FRONT</text>
        <path
          d={`M ${cx} ${height * 0.095} L ${cx - 6} ${height * 0.11} L ${cx + 6} ${height * 0.11} Z`}
          fill="rgba(0,212,255,0.35)"
        />
        <text x={cx} y={height * 0.965} textAnchor="middle">REAR</text>
        <path
          d={`M ${cx} ${height * 0.945} L ${cx - 6} ${height * 0.93} L ${cx + 6} ${height * 0.93} Z`}
          fill="rgba(100,116,139,0.35)"
        />
      </g>
    </svg>
  );
}
