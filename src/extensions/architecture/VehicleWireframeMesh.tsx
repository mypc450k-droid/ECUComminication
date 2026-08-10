'use client';

import { VEHICLE_LAYOUT_BOUNDS } from './vehicleZoneLayout';

/**
 * Wireframe top-view vehicle mesh — zone architecture reference style.
 * Homepage visual layer only.
 */
export function VehicleWireframeMesh() {
  const { width, height } = VEHICLE_LAYOUT_BOUNDS;
  const cx = width / 2;

  const bodyPath = `
    M ${width * 0.18} ${height * 0.22}
    C ${width * 0.18} ${height * 0.09} ${width * 0.34} ${height * 0.05} ${cx} ${height * 0.05}
    C ${width * 0.66} ${height * 0.05} ${width * 0.82} ${height * 0.09} ${width * 0.82} ${height * 0.22}
    L ${width * 0.88} ${height * 0.42}
    C ${width * 0.9} ${height * 0.52} ${width * 0.87} ${height * 0.64} ${width * 0.82} ${height * 0.74}
    L ${width * 0.76} ${height * 0.9}
    C ${width * 0.68} ${height * 0.96} ${width * 0.58} ${height * 0.98} ${cx} ${height * 0.98}
    C ${width * 0.42} ${height * 0.98} ${width * 0.32} ${height * 0.96} ${width * 0.24} ${height * 0.9}
    L ${width * 0.18} ${height * 0.74}
    C ${width * 0.13} ${height * 0.64} ${width * 0.1} ${height * 0.52} ${width * 0.12} ${height * 0.42}
    Z
  `;

  const meshLines: string[] = [];
  const rows = 14;
  const cols = 22;
  const padX = width * 0.16;
  const padY = height * 0.1;
  const meshW = width * 0.68;
  const meshH = height * 0.82;

  for (let r = 0; r <= rows; r++) {
    const y = padY + (meshH * r) / rows;
  for (let c = 0; c <= cols; c++) {
      const x = padX + (meshW * c) / cols;
      const nx = (c / cols) * 2 - 1;
      const ny = (r / rows) * 2 - 1;
      const edgeFactor = Math.abs(nx) + Math.abs(ny * 0.85);
      if (edgeFactor < 1.05) {
        if (c < cols) {
          const x2 = padX + (meshW * (c + 1)) / cols;
          meshLines.push(`M ${x} ${y} L ${x2} ${y}`);
        }
        if (r < rows) {
          const y2 = padY + (meshH * (r + 1)) / rows;
          meshLines.push(`M ${x} ${y} L ${x} ${y2}`);
        }
      }
    }
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <pattern id="vv-zone-brush" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
          <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width={width} height={height} fill="#080a0e" />
      <rect width={width} height={height} fill="url(#vv-zone-brush)" />

      <path d={bodyPath} fill="rgba(120,130,140,0.08)" stroke="none" />

      <g stroke="rgba(200,210,220,0.14)" strokeWidth="0.6" fill="none">
        {meshLines.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      <path
        d={bodyPath}
        fill="none"
        stroke="rgba(220,225,230,0.22)"
        strokeWidth="1.2"
      />

      {/* Orthogonal backbone hint (subtle spine) */}
      <line
        x1={cx}
        y1={height * 0.18}
        x2={cx}
        y2={height * 0.88}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <line
        x1={width * 0.2}
        y1={height * 0.48}
        x2={width * 0.8}
        y2={height * 0.48}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />
    </svg>
  );
}
