import type { Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { ECU, NetworkType } from '@/types';
import { TRUNK_HUB_ID, TRUNK_SPOKE_IDS } from './homeLayout';

export const HOME_NETWORK_COLORS: Record<string, string> = {
  CAN_HS: '#00D4FF',
  CAN_LS: '#4A9EFF',
  LIN: '#7B68EE',
  Ethernet: '#00FF88',
  FlexRay: '#FF6B35',
};

function sharedNetworks(a: ECU, b: ECU): NetworkType[] {
  return a.networks.filter((n) => b.networks.includes(n));
}

function pickNetwork(shared: NetworkType[]): NetworkType {
  const order: NetworkType[] = ['Ethernet', 'CAN_HS', 'CAN_LS', 'LIN', 'FlexRay'];
  for (const n of order) {
    if (shared.includes(n)) return n;
  }
  return shared[0];
}

/** Visual backbone trunks from gateway — no logic change. */
export function buildTrunkEdges(ecuIds: Set<string>): Edge[] {
  if (!ecuIds.has(TRUNK_HUB_ID)) return [];
  return TRUNK_SPOKE_IDS
    .filter((id) => ecuIds.has(id))
    .map((spokeId) => ({
      id: `trunk-${TRUNK_HUB_ID}-${spokeId}`,
      source: TRUNK_HUB_ID,
      target: spokeId,
      type: 'homeTrunk',
      selectable: false,
      data: { edgeKind: 'trunk' },
      style: { stroke: 'rgba(0,212,255,0.35)', strokeWidth: 2, opacity: 0.4 },
    }));
}

/** Partner links only — avoids full network mesh spaghetti. */
export function buildPartnerEdges(ecus: ECU[]): Edge[] {
  const edges: Edge[] = [];
  const seen = new Set<string>();
  const map = new Map(ecus.map((e) => [e.id, e]));

  ecus.forEach((ecu) => {
    ecu.communicationPartners.forEach((partnerId) => {
      const partner = map.get(partnerId);
      if (!partner) return;

      const isTrunk =
        (ecu.id === TRUNK_HUB_ID && TRUNK_SPOKE_IDS.includes(partnerId as typeof TRUNK_SPOKE_IDS[number])) ||
        (partnerId === TRUNK_HUB_ID && TRUNK_SPOKE_IDS.includes(ecu.id as typeof TRUNK_SPOKE_IDS[number]));
      if (isTrunk) return;

      const shared = sharedNetworks(ecu, partner);
      if (shared.length === 0) return;

      const net = pickNetwork(shared);
      const [src, tgt] = ecu.id < partnerId ? [ecu.id, partner.id] : [partner.id, ecu.id];
      const key = `link-${src}-${tgt}-${net}`;
      if (seen.has(key)) return;
      seen.add(key);

      const color = HOME_NETWORK_COLORS[net] || '#64748b';
      edges.push({
        id: key,
        source: src,
        target: tgt,
        type: 'homeLink',
        data: { networkType: net, edgeKind: 'link' },
        style: { stroke: color, strokeWidth: 1.3, opacity: 0.38 },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 8, height: 8 },
      });
    });
  });

  return edges;
}

export function buildHomeEdges(ecus: ECU[]): Edge[] {
  const ids = new Set(ecus.map((e) => e.id));
  return [...buildTrunkEdges(ids), ...buildPartnerEdges(ecus)];
}
