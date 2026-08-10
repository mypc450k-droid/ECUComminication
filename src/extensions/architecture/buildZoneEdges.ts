import type { Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { ECU, NetworkType } from '@/types';
import {
  BACKBONE_HUB_ID,
  BACKBONE_SPOKE_IDS,
  ZONE_TEAL,
} from './vehicleZoneLayout';

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

/** White backbone spokes from central gateway — zone architecture trunk. */
export function buildBackboneEdges(ecus: ECU[]): Edge[] {
  const ecuMap = new Map(ecus.map((e) => [e.id, e]));
  const hub = ecuMap.get(BACKBONE_HUB_ID);
  if (!hub) return [];

  const edges: Edge[] = [];
  BACKBONE_SPOKE_IDS.forEach((spokeId) => {
    if (!ecuMap.has(spokeId)) return;
    const key = `backbone-${BACKBONE_HUB_ID}-${spokeId}`;
    edges.push({
      id: key,
      source: BACKBONE_HUB_ID,
      target: spokeId,
      type: 'zoneBackbone',
      selectable: false,
      data: { edgeKind: 'backbone', networkType: 'Ethernet' },
      style: {
        stroke: '#ffffff',
        strokeWidth: 2.5,
        opacity: 0.55,
      },
      markerEnd: undefined,
    });
  });
  return edges;
}

/** Teal peripheral links along communication partners. */
export function buildPeripheralEdges(ecus: ECU[]): Edge[] {
  const edges: Edge[] = [];
  const edgeSet = new Set<string>();
  const ecuMap = new Map(ecus.map((e) => [e.id, e]));

  ecus.forEach((ecu) => {
    ecu.communicationPartners.forEach((partnerId) => {
      const partner = ecuMap.get(partnerId);
      if (!partner) return;

      const isBackbone =
        (ecu.id === BACKBONE_HUB_ID && BACKBONE_SPOKE_IDS.includes(partnerId)) ||
        (partnerId === BACKBONE_HUB_ID && BACKBONE_SPOKE_IDS.includes(ecu.id));
      if (isBackbone) return;

      const shared = sharedNetworks(ecu, partner);
      if (shared.length === 0) return;

      const networkType = pickPrimaryNetwork(shared);
      const [source, target] = ecu.id < partnerId ? [ecu.id, partner.id] : [partner.id, ecu.id];
      const key = `peripheral-${source}-${target}-${networkType}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);

      const color = networkColors[networkType] || ZONE_TEAL;
      edges.push({
        id: key,
        source,
        target,
        type: 'zonePeripheral',
        data: { edgeKind: 'peripheral', networkType },
        style: {
          stroke: color,
          strokeWidth: 1.4,
          opacity: 0.42,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color,
          width: 8,
          height: 8,
        },
      });
    });
  });

  return edges;
}

export function buildZoneArchitectureEdges(ecus: ECU[]): Edge[] {
  return [...buildBackboneEdges(ecus), ...buildPeripheralEdges(ecus)];
}

export function getConnectedEcuIds(ecuId: string, ecus: ECU[]): string[] {
  const ecu = ecus.find((e) => e.id === ecuId);
  if (!ecu) return [ecuId];
  const ids = new Set<string>([ecuId]);
  ecu.communicationPartners.forEach((p) => ids.add(p));
  return Array.from(ids);
}

export { networkColors };
