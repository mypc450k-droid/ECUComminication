import type { Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { ECU, NetworkType } from '@/types';
import { networks } from '@/lib/data';

const networkColors: Record<string, string> = {
  CAN_HS: '#00D4FF',
  CAN_LS: '#4A9EFF',
  LIN: '#7B68EE',
  Ethernet: '#00FF88',
  FlexRay: '#FF6B35',
};

function sharedNetworks(a: ECU, b: ECU): NetworkType[] {
  return a.networks.filter((n) => b.networks.includes(n));
}

function pickPrimaryNetwork(shared: NetworkType[]): NetworkType {
  const order: NetworkType[] = ['Ethernet', 'CAN_HS', 'CAN_LS', 'LIN', 'FlexRay'];
  for (const n of order) {
    if (shared.includes(n)) return n;
  }
  return shared[0];
}

/** Partner-based edges reduce spaghetti vs full network mesh. */
export function buildPartnerEdges(ecus: ECU[]): Edge[] {
  const edges: Edge[] = [];
  const edgeSet = new Set<string>();
  const ecuMap = new Map(ecus.map((e) => [e.id, e]));

  ecus.forEach((ecu) => {
    ecu.communicationPartners.forEach((partnerId) => {
      const partner = ecuMap.get(partnerId);
      if (!partner) return;

      const shared = sharedNetworks(ecu, partner);
      if (shared.length === 0) return;

      const networkType = pickPrimaryNetwork(shared);
      const [source, target] = ecu.id < partnerId ? [ecu.id, partner.id] : [partner.id, ecu.id];
      const key = `${source}-${target}-${networkType}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);

      const color = networkColors[networkType] || '#64748b';
      edges.push({
        id: key,
        source,
        target,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: color,
          strokeWidth: 1.2,
          opacity: 0.35,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color,
          width: 10,
          height: 10,
        },
        data: { networkType },
      });
    });
  });

  // Fallback: if partner graph is sparse, add a few network backbone links via gateway
  const gateway = ecuMap.get('gateway');
  if (gateway) {
    networks.forEach((network) => {
      const members = network.ecuIds.filter((id) => id !== 'gateway' && ecuMap.has(id));
      members.slice(0, 2).forEach((memberId) => {
        const member = ecuMap.get(memberId)!;
        const shared = sharedNetworks(gateway, member);
        if (shared.length === 0) return;
        const networkType = pickPrimaryNetwork(shared);
        const key = `gw-${memberId}-${networkType}`;
        if (edgeSet.has(key)) return;
        edgeSet.add(key);
        const color = networkColors[networkType] || '#64748b';
        edges.push({
          id: key,
          source: 'gateway',
          target: memberId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: color, strokeWidth: 1, opacity: 0.2 },
          data: { networkType },
        });
      });
    });
  }

  return edges;
}

export function getConnectedEcuIds(ecuId: string, ecus: ECU[]): string[] {
  const ecu = ecus.find((e) => e.id === ecuId);
  if (!ecu) return [];
  const ids = new Set<string>([ecuId]);
  ecu.communicationPartners.forEach((p) => ids.add(p));
  return Array.from(ids);
}

export { networkColors };
