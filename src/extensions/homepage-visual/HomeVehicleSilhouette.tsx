import {
  HOMEPAGE_LAYOUT_BOUNDS,
  VEHICLE_CENTER_X,
  VEHICLE_ZONE_BANDS,
  VEHICLE_WHEELS,
} from './homepageVehicleGeometry';

const { width, height } = HOMEPAGE_LAYOUT_BOUNDS;
const cx = VEHICLE_CENTER_X;

/**
 * Flow-space vehicle silhouette — rendered inside React Flow ViewportPortal
 * so geometry shares the same coordinate system as ECU nodes.
 */
export function HomeVehicleSilhouette() {
  const bodyPath = `
    M ${cx} 52
    C ${cx + 88} 52 ${cx + 148} 68 ${cx + 168} 108
    L ${cx + 188} 168
    Q ${width * 0.9} ${height * 0.34} ${width * 0.88} ${height * 0.5}
    L ${width * 0.84} ${height * 0.72}
    Q ${cx} ${height * 0.92} ${width * 0.16} ${height * 0.72}
    L ${width * 0.12} ${height * 0.5}
    Q ${width * 0.1} ${height * 0.34} ${cx - 188} 168
    L ${cx - 168} 108
    C ${cx - 148} 68 ${cx - 88} 52 ${cx} 52
    Z
  `;

  const hoodPath = `
    M ${cx - 120} 108
    Q ${cx} 78 ${cx + 120} 108
    L ${cx + 108} 168
    Q ${cx} 188 ${cx - 108} 168
    Z
  `;

  const windshieldPath = `
    M ${cx - 108} 178
    Q ${cx} 162 ${cx + 108} 178
    L ${cx + 100} 248
    Q ${cx} 262 ${cx - 100} 248
    Z
  `;

  const rearGlassPath = `
    M ${cx - 96} 430
    Q ${cx} 418 ${cx + 96} 430
    L ${cx + 88} 478
    Q ${cx} 490 ${cx - 88} 478
    Z
  `;

  const trunkPath = `
    M ${cx - 88} 488
    Q ${cx} 502 ${cx + 88} 488
    L ${cx + 72} 580
    Q ${cx} 598 ${cx - 72} 580
    Z
  `;

  return (
    <svg
      className="hp-vehicle-svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hp-body-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.07)" />
          <stop offset="35%" stopColor="rgba(30, 41, 59, 0.5)" />
          <stop offset="100%" stopColor="rgba(15, 23, 42, 0.45)" />
        </linearGradient>
        <clipPath id="hp-body-clip">
          <path d={bodyPath} />
        </clipPath>
      </defs>

      {/* Orientation — outside body */}
      <text x={cx} y={28} className="hp-orient-label hp-orient-front">FRONT</text>
      <path className="hp-orient-arrow hp-orient-arrow-front" d={`M ${cx} 36 L ${cx - 5} 48 L ${cx + 5} 48 Z`} />
      <text x={cx} y={height - 16} className="hp-orient-label hp-orient-rear">REAR</text>
      <path
        className="hp-orient-arrow hp-orient-arrow-rear"
        d={`M ${cx} ${height - 24} L ${cx - 5} ${height - 36} L ${cx + 5} ${height - 36} Z`}
      />
      <text x={width * 0.06} y={height * 0.48} className="hp-side-label">LEFT</text>
      <text x={width * 0.94} y={height * 0.48} className="hp-side-label hp-side-right">RIGHT</text>

      {/* Subtle zone bands — clipped to body, not rectangular overlays */}
      <g clipPath="url(#hp-body-clip)">
        {VEHICLE_ZONE_BANDS.map((band) => (
          <rect
            key={band.id}
            className={`hp-zone-band hp-zone-band-${band.id}`}
            x={width * 0.08}
            y={height * band.yStart}
            width={width * 0.84}
            height={height * (band.yEnd - band.yStart)}
          />
        ))}
      </g>

      {/* Centerline */}
      <line
        x1={cx}
        y1={height * 0.1}
        x2={cx}
        y2={height * 0.88}
        className="hp-centerline"
      />

      {/* Body shell */}
      <path className="hp-vehicle-body" d={bodyPath} fill="url(#hp-body-fill)" />

      {/* Structural regions */}
      <path className="hp-vehicle-region hp-vehicle-hood" d={hoodPath} />
      <path className="hp-vehicle-region hp-vehicle-windshield" d={windshieldPath} />
      <path className="hp-vehicle-region hp-vehicle-rear-glass" d={rearGlassPath} />
      <path className="hp-vehicle-region hp-vehicle-trunk" d={trunkPath} />

      {/* Wheel arches */}
      {Object.values(VEHICLE_WHEELS).map((wheel, i) => (
        <g key={i}>
          <ellipse
            className="hp-wheel-arch"
            cx={wheel.x}
            cy={wheel.y}
            rx={58}
            ry={42}
          />
          <ellipse
            className="hp-wheel-tire"
            cx={wheel.x}
            cy={wheel.y}
            rx={38}
            ry={28}
          />
        </g>
      ))}

      {/* Body outline stroke on top */}
      <path className="hp-vehicle-outline" d={bodyPath} />

      {/* Zone labels — inside left body margin */}
      {VEHICLE_ZONE_BANDS.map((band) => (
        <text
          key={band.id}
          x={width * 0.19}
          y={height * (band.yStart + (band.yEnd - band.yStart) * 0.42)}
          className="hp-zone-label"
        >
          {band.label}
        </text>
      ))}
    </svg>
  );
}
