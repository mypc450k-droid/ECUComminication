import {
  HOMEPAGE_LAYOUT_BOUNDS,
  VEHICLE_CENTER_X,
  VEHICLE_DOMAIN_BANDS,
  VEHICLE_WHEELS,
} from './homepageVehicleGeometry';

const { width, height } = HOMEPAGE_LAYOUT_BOUNDS;
const cx = VEHICLE_CENTER_X;

/**
 * Subtle top-down vehicle wireframe — flow-space spatial anchor beneath ECU modules.
 */
export function HomeVehicleSilhouette() {
  const bodyPath = `
    M ${cx} 118
    C ${cx + 100} 118 ${cx + 168} 138 ${cx + 188} 178
    L ${cx + 208} 248
    Q ${width * 0.9} ${height * 0.36} ${width * 0.87} ${height * 0.52}
    L ${width * 0.82} ${height * 0.76}
    Q ${cx} ${height * 0.9} ${width * 0.18} ${height * 0.76}
    L ${width * 0.13} ${height * 0.52}
    Q ${width * 0.1} ${height * 0.36} ${cx - 208} 248
    L ${cx - 188} 178
    C ${cx - 168} 138 ${cx - 100} 118 ${cx} 118
    Z
  `;

  return (
    <svg
      className="hp-vehicle-svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <defs>
        <clipPath id="hp-body-clip">
          <path d={bodyPath} />
        </clipPath>
      </defs>

      <text x={cx} y={98} className="hp-orient-label hp-orient-front">FRONT ↑</text>
      <text x={cx} y={height - 28} className="hp-orient-label hp-orient-rear">REAR ↓</text>
      <text x={width * 0.07} y={height * 0.48} className="hp-side-label">LEFT</text>
      <text x={width * 0.93} y={height * 0.48} className="hp-side-label hp-side-right">RIGHT</text>

      <g clipPath="url(#hp-body-clip)">
        {VEHICLE_DOMAIN_BANDS.map((band) => (
          <rect
            key={band.id}
            className={`hp-domain-band hp-domain-band-${band.id}`}
            x={width * 0.12}
            y={height * band.yStart}
            width={width * 0.76}
            height={height * (band.yEnd - band.yStart)}
          />
        ))}
      </g>

      <line x1={cx} y1={height * 0.12} x2={cx} y2={height * 0.88} className="hp-centerline" />

      <path className="hp-vehicle-body-fill" d={bodyPath} />
      <path className="hp-vehicle-outline" d={bodyPath} />

      <path
        className="hp-vehicle-glass"
        d={`M ${cx - 118} 198 Q ${cx} 178 ${cx + 118} 198 L ${cx + 108} 268 Q ${cx} 282 ${cx - 108} 268 Z`}
      />
      <path
        className="hp-vehicle-glass"
        d={`M ${cx - 100} 458 Q ${cx} 446 ${cx + 100} 458 L ${cx + 92} 502 Q ${cx} 512 ${cx - 92} 502 Z`}
      />

      {Object.values(VEHICLE_WHEELS).map((wheel, i) => (
        <g key={i}>
          <ellipse className="hp-wheel-arch" cx={wheel.x} cy={wheel.y} rx={52} ry={38} />
          <ellipse className="hp-wheel-tire" cx={wheel.x} cy={wheel.y} rx={34} ry={24} />
        </g>
      ))}
    </svg>
  );
}
