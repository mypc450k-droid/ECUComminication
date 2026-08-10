import { HOMEPAGE_LAYOUT_BOUNDS } from './homepageVehicleGeometry';

const { width, height } = HOMEPAGE_LAYOUT_BOUNDS;

const DOMAIN_LABELS = [
  { text: 'ADAS / SENSORS', x: 280, y: 58, className: 'hp-domain-adas' },
  { text: 'CENTRAL COMMUNICATION', x: width / 2, y: 248, className: 'hp-domain-central', anchor: 'middle' as const },
  { text: 'BODY & COMFORT', x: 1020, y: 58, className: 'hp-domain-body', anchor: 'end' as const },
  { text: 'POWERTRAIN', x: 340, y: 548, className: 'hp-domain-powertrain' },
  { text: 'CHASSIS & SAFETY', x: 540, y: 688, className: 'hp-domain-chassis' },
];

/** Flow-space functional domain labels — integrated with vehicle composition. */
export function HomeDomainLabels() {
  return (
    <svg
      className="hp-domain-labels-svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      {DOMAIN_LABELS.map((label) => (
        <text
          key={label.text}
          x={label.x}
          y={label.y}
          textAnchor={label.anchor ?? 'start'}
          className={`hp-domain-label ${label.className}`}
        >
          {label.text}
        </text>
      ))}
    </svg>
  );
}
