'use client';

import { ecus } from '@/lib/data';
import { getPartnerConnectionCount } from './homepageGraphUtils';
import { useHomepageInteraction } from './HomepageInteractionContext';
import { NetworkBadge } from '@/components/ui/Badges';

export function HomepageEcuTooltip() {
  const { tooltip } = useHomepageInteraction();
  if (!tooltip) return null;

  const ecu = ecus.find((e) => e.id === tooltip.ecuId);
  if (!ecu) return null;

  const connections = getPartnerConnectionCount(ecu.id);

  return (
    <div
      className="hp-ecu-tooltip"
      style={{ left: tooltip.x, top: tooltip.y }}
      role="tooltip"
    >
      <div className="hp-ecu-tooltip-title">{ecu.shortName}</div>
      <div className="hp-ecu-tooltip-line">{ecu.name}</div>
      <div className="hp-ecu-tooltip-line">ASIL {ecu.asil}</div>
      <div className="hp-ecu-tooltip-networks">
        {ecu.networks.slice(0, 4).map((n) => (
          <NetworkBadge key={n} type={n} />
        ))}
      </div>
      <div className="hp-ecu-tooltip-line hp-ecu-tooltip-links">
        {connections} connection{connections === 1 ? '' : 's'}
      </div>
    </div>
  );
}
