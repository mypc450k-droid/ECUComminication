'use client';

import { useHomepageInteraction } from './HomepageInteractionContext';
import type { DomainFilterKey, NetworkFilterKey } from './homepageDomainFilters';

const DOMAIN_OPTIONS: { value: DomainFilterKey; label: string }[] = [
  { value: 'ALL', label: 'ALL' },
  { value: 'ADAS', label: 'ADAS' },
  { value: 'BODY', label: 'BODY' },
  { value: 'POWERTRAIN', label: 'POWERTRAIN' },
  { value: 'CHASSIS', label: 'CHASSIS' },
  { value: 'COMMUNICATION', label: 'COMM' },
];

const NETWORK_OPTIONS: { value: NetworkFilterKey; label: string }[] = [
  { value: 'ALL', label: 'ALL' },
  { value: 'CAN_HS', label: 'CAN HS' },
  { value: 'CAN_LS', label: 'CAN LS' },
  { value: 'LIN', label: 'LIN' },
  { value: 'Ethernet', label: 'ETH' },
  { value: 'FlexRay', label: 'FLEX' },
];

export function HomepageInteractionToolbar() {
  const {
    domainFilter,
    networkFilter,
    viewMode,
    traceActive,
    setDomainFilter,
    setNetworkFilter,
    setViewMode,
    startTrace,
    exitTrace,
    openGuidedTour,
    guidedTourOpen,
  } = useHomepageInteraction();

  return (
    <div className="hp-interaction-toolbar" aria-label="Architecture exploration controls">
      <div className="hp-toolbar-group">
        <span className="hp-toolbar-label">DOMAIN</span>
        <select
          className="hp-toolbar-select"
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value as DomainFilterKey)}
          aria-label="Domain filter"
        >
          {DOMAIN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="hp-toolbar-group">
        <span className="hp-toolbar-label">NETWORK</span>
        <select
          className="hp-toolbar-select"
          value={networkFilter}
          onChange={(e) => setNetworkFilter(e.target.value as NetworkFilterKey)}
          aria-label="Network filter"
        >
          {NETWORK_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="hp-toolbar-group">
        <button
          type="button"
          className={`hp-toolbar-btn${viewMode === 'architecture' ? ' hp-toolbar-btn-active' : ''}`}
          onClick={() => setViewMode('architecture')}
        >
          ARCHITECTURE
        </button>
        <button
          type="button"
          className={`hp-toolbar-btn${viewMode === 'network' ? ' hp-toolbar-btn-active' : ''}`}
          onClick={() => setViewMode('network')}
        >
          NETWORK
        </button>
      </div>
      <div className="hp-toolbar-group">
        {traceActive ? (
          <button type="button" className="hp-toolbar-btn hp-toolbar-btn-warn" onClick={exitTrace}>
            EXIT TRACE
          </button>
        ) : (
          <button type="button" className="hp-toolbar-btn" onClick={startTrace}>
            TRACE
          </button>
        )}
        {!guidedTourOpen && (
          <button type="button" className="hp-toolbar-btn" onClick={openGuidedTour}>
            GUIDED TOUR
          </button>
        )}
      </div>
    </div>
  );
}
