'use client';

import { networks } from '@/lib/data';

/** Compact network legend for homepage architecture — does not replace shared NetworkLegend elsewhere. */
export function HomeNetworkLegend() {
  return (
    <div className="hp-network-legend glass-panel" aria-label="Network legend">
      <h4 className="hp-network-legend-title">Networks</h4>
      <div className="hp-network-legend-grid">
        {networks.map((net) => (
          <div key={net.id} className="hp-network-legend-item">
            <span className="hp-network-swatch" style={{ backgroundColor: net.color }} />
            <span className="hp-network-name">{net.name}</span>
            <span className="hp-network-rate">{net.baudRate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
