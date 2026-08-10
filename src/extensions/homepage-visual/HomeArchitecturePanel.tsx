'use client';

import { networks } from '@/lib/data';

const FEATURE_HIGHLIGHTS = [
  'Clear segregation of functional domains',
  'Central gateway cross-domain routing',
  'Multi-protocol vehicle backbone',
  'ASIL-aware safety architecture',
  'AUTOSAR Classic platform integration',
] as const;

export function HomeArchitecturePanel() {
  return (
    <aside className="hp-right-panel" aria-label="Architecture summary">
      <section className="hp-right-section">
        <h4 className="hp-panel-heading">Feature Highlights</h4>
        <ul className="hp-check-list">
          {FEATURE_HIGHLIGHTS.map((item) => (
            <li key={item}>
              <span className="hp-check-icon" aria-hidden>✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hp-right-section">
        <h4 className="hp-panel-heading">Network Summary</h4>
        <ul className="hp-summary-list">
          {networks.map((net) => (
            <li key={net.id}>
              <span className="hp-summary-name">{net.name}</span>
              <span className="hp-summary-rate">{net.baudRate}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hp-right-section">
        <h4 className="hp-panel-heading">ECU Placement</h4>
        <svg className="hp-side-profile" viewBox="0 0 120 48" aria-hidden>
          <path
            d="M 8 32 Q 20 12 60 10 Q 100 12 112 32 L 108 38 Q 60 44 12 38 Z"
            className="hp-side-profile-body"
          />
          <circle cx="28" cy="34" r="5" className="hp-side-profile-wheel" />
          <circle cx="92" cy="34" r="5" className="hp-side-profile-wheel" />
          <circle cx="22" cy="22" r="2.5" className="hp-side-profile-ecu hp-ecu-front" />
          <circle cx="60" cy="20" r="2.5" className="hp-side-profile-ecu hp-ecu-cabin" />
          <circle cx="78" cy="28" r="2.5" className="hp-side-profile-ecu hp-ecu-power" />
          <circle cx="48" cy="32" r="2.5" className="hp-side-profile-ecu hp-ecu-chassis" />
        </svg>
        <p className="hp-side-profile-note">Side-view ECU density reference</p>
      </section>
    </aside>
  );
}
