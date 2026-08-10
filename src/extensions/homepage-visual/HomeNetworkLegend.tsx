'use client';

import { networks } from '@/lib/data';

/** Left sidebar — network legend for homepage architecture diagram. */
export function HomeNetworkLegend() {
  return (
    <div className="hp-network-legend" aria-label="Network legend">
      <h4 className="hp-panel-heading">Network Legend</h4>
      <ul className="hp-network-list">
        {networks.map((net) => (
          <li key={net.id} className="hp-network-list-item">
            <span className="hp-network-dot" style={{ backgroundColor: net.color }} />
            <span className="hp-network-list-name">{net.name}</span>
            <span className="hp-network-list-rate">{net.baudRate}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
