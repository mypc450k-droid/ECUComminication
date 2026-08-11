'use client';

import { networks } from '@/lib/data';
import type { NetworkFilterKey } from './homepageDomainFilters';
import { useHomepageInteraction } from './HomepageInteractionContext';

const NETWORK_TYPE_MAP: Record<string, NetworkFilterKey> = {
  CAN_HS: 'CAN_HS',
  CAN_LS: 'CAN_LS',
  LIN: 'LIN',
  Ethernet: 'Ethernet',
  FlexRay: 'FlexRay',
};

/** Left sidebar — network legend with availability indicators. */
export function HomeNetworkLegend() {
  const { networkFilter, setNetworkFilterFromLegend } = useHomepageInteraction();

  return (
    <div className="hp-network-legend" aria-label="Network legend">
      <h4 className="hp-panel-heading">Network Legend</h4>
      <ul className="hp-network-list">
        {networks.map((net) => {
          const filterKey = NETWORK_TYPE_MAP[net.type];
          const isActive = filterKey && networkFilter === filterKey;
          return (
            <li key={net.id}>
              <button
                type="button"
                className={`hp-network-list-btn${isActive ? ' hp-network-list-btn-active' : ''}`}
                onClick={() => filterKey && setNetworkFilterFromLegend(filterKey)}
                title="Filter architecture by network"
              >
                <span className="hp-network-dot" style={{ backgroundColor: net.color }} />
                <span className="hp-network-list-name">{net.name}</span>
                <span className="hp-network-list-rate">{net.baudRate}</span>
                <span className="hp-network-status">ACTIVE</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
