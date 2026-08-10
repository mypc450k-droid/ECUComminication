import { HOMEPAGE_LAYOUT_BOUNDS } from './homepageZoneLayout';

const { width, height } = HOMEPAGE_LAYOUT_BOUNDS;
const cx = width * 0.5;

/**
 * Homepage-only vehicle silhouette — spatial reference layer beneath ECU nodes.
 */
export function HomeVehicleSilhouette() {
  return (
    <div className="hp-vehicle-silhouette" aria-hidden="true">
      <svg
        className="hp-vehicle-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="hp-body-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.06)" />
            <stop offset="45%" stopColor="rgba(30, 41, 59, 0.42)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.38)" />
          </linearGradient>
          <linearGradient id="hp-body-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(100, 116, 139, 0.2)" />
            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.28)" />
            <stop offset="100%" stopColor="rgba(100, 116, 139, 0.2)" />
          </linearGradient>
        </defs>

        <text x={cx} y={26} className="hp-orient-label hp-orient-front">FRONT</text>
        <path
          className="hp-orient-arrow hp-orient-arrow-front"
          d={`M ${cx} 34 L ${cx - 5} 46 L ${cx + 5} 46 Z`}
        />
        <text x={cx} y={height - 18} className="hp-orient-label hp-orient-rear">REAR</text>
        <path
          className="hp-orient-arrow hp-orient-arrow-rear"
          d={`M ${cx} ${height - 26} L ${cx - 5} ${height - 38} L ${cx + 5} ${height - 38} Z`}
        />

        {/* Vehicle body — top-down sedan silhouette */}
        <path
          className="hp-vehicle-body"
          fill="url(#hp-body-fill)"
          stroke="url(#hp-body-stroke)"
          d={`
            M ${width * 0.22} ${height * 0.19}
            Q ${cx} ${height * 0.085} ${width * 0.78} ${height * 0.19}
            L ${width * 0.86} ${height * 0.36}
            Q ${width * 0.9} ${height * 0.5} ${width * 0.87} ${height * 0.64}
            L ${width * 0.8} ${height * 0.87}
            Q ${cx} ${height * 0.94} ${width * 0.2} ${height * 0.87}
            L ${width * 0.13} ${height * 0.64}
            Q ${width * 0.1} ${height * 0.5} ${width * 0.14} ${height * 0.36}
            Z
          `}
        />

        {/* Cockpit glass */}
        <path
          className="hp-vehicle-cockpit"
          d={`
            M ${width * 0.3} ${height * 0.27}
            Q ${cx} ${height * 0.23} ${width * 0.7} ${height * 0.27}
            L ${width * 0.68} ${height * 0.47}
            Q ${cx} ${height * 0.51} ${width * 0.32} ${height * 0.47}
            Z
          `}
        />

        {/* Wheel wells */}
        {[
          { x: width * 0.21, y: height * 0.33 },
          { x: width * 0.79, y: height * 0.33 },
          { x: width * 0.21, y: height * 0.71 },
          { x: width * 0.79, y: height * 0.71 },
        ].map((w, i) => (
          <ellipse
            key={i}
            className="hp-wheel-well"
            cx={w.x}
            cy={w.y}
            rx={width * 0.042}
            ry={height * 0.038}
          />
        ))}

        {/* Zone dividers */}
        <line x1={width * 0.14} y1={height * 0.2} x2={width * 0.86} y2={height * 0.2} className="hp-zone-divider" />
        <line x1={width * 0.14} y1={height * 0.38} x2={width * 0.86} y2={height * 0.38} className="hp-zone-divider" />
        <line x1={width * 0.14} y1={height * 0.58} x2={width * 0.86} y2={height * 0.58} className="hp-zone-divider" />
        <line x1={width * 0.14} y1={height * 0.76} x2={width * 0.86} y2={height * 0.76} className="hp-zone-divider" />

        {/* Zone labels */}
        <text x={width * 0.155} y={height * 0.155} className="hp-zone-label">PERCEPTION / ADAS</text>
        <text x={width * 0.155} y={height * 0.31} className="hp-zone-label">CABIN</text>
        <text x={width * 0.155} y={height * 0.49} className="hp-zone-label">POWERTRAIN</text>
        <text x={width * 0.155} y={height * 0.67} className="hp-zone-label">CHASSIS</text>
      </svg>
    </div>
  );
}
