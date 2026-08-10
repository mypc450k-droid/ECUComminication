'use client';

import { HOME_CANVAS, ZONE_LABELS } from './homeLayout';

/** Subtle top-view vehicle outline — homepage background only. */
export function VehicleOutline() {
  const { width, height } = HOME_CANVAS;
  const cx = width / 2;

  const body = `
    M ${width * 0.17} ${height * 0.14}
    C ${width * 0.17} ${height * 0.06} ${width * 0.33} ${height * 0.03} ${cx} ${height * 0.03}
    C ${width * 0.67} ${height * 0.03} ${width * 0.83} ${height * 0.06} ${width * 0.83} ${height * 0.14}
    L ${width * 0.88} ${height * 0.38}
    C ${width * 0.9} ${height * 0.5} ${width * 0.87} ${height * 0.62} ${width * 0.82} ${height * 0.74}
    L ${width * 0.77} ${height * 0.9}
    C ${width * 0.68} ${height * 0.96} ${width * 0.58} ${height * 0.98} ${cx} ${height * 0.98}
    C ${width * 0.42} ${height * 0.98} ${width * 0.32} ${height * 0.96} ${width * 0.23} ${height * 0.9}
    L ${width * 0.18} ${height * 0.74}
    C ${width * 0.13} ${height * 0.62} ${width * 0.1} ${height * 0.5} ${width * 0.12} ${height * 0.38}
    Z
  `;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <pattern id="vv-home-grid" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="#070b12" />
      <rect width={width} height={height} fill="url(#vv-home-grid)" />
      <path d={body} fill="rgba(0,212,255,0.03)" stroke="rgba(0,212,255,0.22)" strokeWidth="1.2" />
      {ZONE_LABELS.map((z) => (
        <text
          key={z.text}
          x={z.x}
          y={z.y}
          textAnchor="middle"
          fill="rgba(148,163,184,0.2)"
          fontSize="8"
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.14em"
        >
          {z.text}
        </text>
      ))}
      <text x={cx} y={16} textAnchor="middle" fill="rgba(148,163,184,0.45)" fontSize="9" fontFamily="ui-monospace, monospace">
        FRONT ↑
      </text>
      <text x={cx} y={height - 6} textAnchor="middle" fill="rgba(148,163,184,0.45)" fontSize="9" fontFamily="ui-monospace, monospace">
        REAR ↓
      </text>
    </svg>
  );
}
