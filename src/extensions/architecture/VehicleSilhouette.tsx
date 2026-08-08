'use client';

import { VEHICLE_LAYOUT_BOUNDS, ZONE_UI_LABELS } from './vehicleZoneLayout';

/** Clean engineering-style top-view vehicle outline — homepage only. */
export function VehicleSilhouette() {
  const { width, height } = VEHICLE_LAYOUT_BOUNDS;
  const cx = width / 2;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <pattern id="vv-arch-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(0,212,255,0.035)" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="vv-body-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(0,212,255,0.04)" />
          <stop offset="50%" stopColor="rgba(15,23,42,0.2)" />
          <stop offset="100%" stopColor="rgba(0,212,255,0.03)" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#vv-arch-grid)" />

      {/* Vehicle body — smooth symmetrical top view */}
      <path
        d={`
          M ${width * 0.2} ${height * 0.2}
          C ${width * 0.2} ${height * 0.1} ${width * 0.35} ${height * 0.06} ${cx} ${height * 0.06}
          C ${width * 0.65} ${height * 0.06} ${width * 0.8} ${height * 0.1} ${width * 0.8} ${height * 0.2}
          L ${width * 0.86} ${height * 0.42}
          C ${width * 0.88} ${height * 0.52} ${width * 0.86} ${height * 0.62} ${width * 0.82} ${height * 0.72}
          L ${width * 0.78} ${height * 0.88}
          C ${width * 0.72} ${height * 0.94} ${width * 0.6} ${height * 0.96} ${cx} ${height * 0.96}
          C ${width * 0.4} ${height * 0.96} ${width * 0.28} ${height * 0.94} ${width * 0.22} ${height * 0.88}
          L ${width * 0.18} ${height * 0.72}
          C ${width * 0.14} ${height * 0.62} ${width * 0.12} ${height * 0.52} ${width * 0.14} ${height * 0.42}
          Z
        `}
        fill="url(#vv-body-fill)"
        stroke="rgba(56,189,248,0.18)"
        strokeWidth="1.2"
      />

      {/* Wheel wells — subtle */}
      <ellipse cx={width * 0.26} cy={height * 0.38} rx="36" ry="14" fill="none" stroke="rgba(100,116,139,0.12)" strokeWidth="1" />
      <ellipse cx={width * 0.74} cy={height * 0.38} rx="36" ry="14" fill="none" stroke="rgba(100,116,139,0.12)" strokeWidth="1" />
      <ellipse cx={width * 0.26} cy={height * 0.72} rx="36" ry="14" fill="none" stroke="rgba(100,116,139,0.12)" strokeWidth="1" />
      <ellipse cx={width * 0.74} cy={height * 0.72} rx="36" ry="14" fill="none" stroke="rgba(100,116,139,0.12)" strokeWidth="1" />

      {/* Zone labels */}
      {ZONE_UI_LABELS.map((zone) => (
        <text
          key={zone.label}
          x={zone.x + zone.width / 2}
          y={zone.y}
          textAnchor="middle"
          fill="rgba(148,163,184,0.22)"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.12em"
        >
          {zone.label}
        </text>
      ))}

      <text x={cx} y={28} textAnchor="middle" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="ui-monospace, monospace">
        FRONT ↑
      </text>
      <text x={cx} y={height - 8} textAnchor="middle" fill="rgba(148,163,184,0.4)" fontSize="10" fontFamily="ui-monospace, monospace">
        REAR ↓
      </text>
    </svg>
  );
}
