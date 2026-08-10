import type { ECU } from '@/types';
import { ecus, features, networks } from '@/lib/data';
import type { AsilLevel } from '@/types';

export function getPartnerConnectionCount(ecuId: string): number {
  const ecu = ecus.find((e) => e.id === ecuId);
  if (!ecu) return 0;
  return ecu.communicationPartners.length;
}

/** BFS path over existing communication partner graph — does not invent edges. */
export function findCommunicationPath(sourceId: string, destId: string): string[] {
  if (sourceId === destId) return [sourceId];

  const ecuMap = new Map(ecus.map((e) => [e.id, e]));
  if (!ecuMap.has(sourceId) || !ecuMap.has(destId)) return [];

  const queue: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);
  const parent = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const ecu = ecuMap.get(current)!;
    for (const partnerId of ecu.communicationPartners) {
      if (visited.has(partnerId)) continue;
      visited.add(partnerId);
      parent.set(partnerId, current);
      if (partnerId === destId) {
        const path: string[] = [destId];
        let node: string | undefined = destId;
        while (node && node !== sourceId) {
          node = parent.get(node);
          if (node) path.unshift(node);
        }
        return path;
      }
      queue.push(partnerId);
    }
  }

  return [];
}

export function buildPathSummary(pathIds: string[]): string[] {
  return pathIds.map((id) => {
    const ecu = ecus.find((e) => e.id === id);
    return ecu?.shortName ?? id;
  });
}

export interface ArchitectureSummary {
  ecuCount: number;
  networkCount: number;
  featureCount: number;
  asilCounts: Record<AsilLevel, number>;
  networkTypeCounts: Record<string, number>;
}

export function computeArchitectureSummary(): ArchitectureSummary {
  const asilCounts: Record<AsilLevel, number> = { D: 0, C: 0, B: 0, A: 0, QM: 0 };
  const networkTypeCounts: Record<string, number> = {
    CAN_HS: 0,
    CAN_LS: 0,
    LIN: 0,
    Ethernet: 0,
    FlexRay: 0,
  };

  ecus.forEach((ecu) => {
    asilCounts[ecu.asil] += 1;
    ecu.networks.forEach((n) => {
      if (networkTypeCounts[n] !== undefined) networkTypeCounts[n] += 1;
    });
  });

  return {
    ecuCount: ecus.length,
    networkCount: networks.length,
    featureCount: features.length,
    asilCounts,
    networkTypeCounts,
  };
}

export function computeArchitectureInsights(): string[] {
  const insights: string[] = [];
  const gateway = ecus.find((e) => e.id === 'gateway');
  const networkTypes = new Set<string>();
  ecus.forEach((e) => e.networks.forEach((n) => networkTypes.add(n)));

  if (gateway && gateway.communicationPartners.length >= 3) {
    insights.push('Central gateway connects multiple domains');
  }
  if (networkTypes.size >= 3) {
    insights.push('Multiple network technologies detected');
  }
  const multiNetwork = ecus.filter((e) => e.networks.length >= 3);
  if (multiNetwork.length > 0) {
    insights.push('ECUs using multiple communication networks present');
  }
  const asilLevels = new Set(ecus.map((e) => e.asil));
  if (asilLevels.size >= 3) {
    insights.push('ASIL distribution detected across architecture');
  }
  const maxLinks = ecus.reduce(
    (best, ecu) => (ecu.communicationPartners.length > best.count ? { id: ecu.id, count: ecu.communicationPartners.length } : best),
    { id: '', count: 0 }
  );
  if (maxLinks.count >= 5) {
    insights.push('High-connectivity ECU detected');
  }

  return insights;
}

export function getHighConnectivityEcu(): ECU | undefined {
  let best: ECU | undefined;
  let bestCount = 0;
  ecus.forEach((ecu) => {
    if (ecu.communicationPartners.length > bestCount) {
      bestCount = ecu.communicationPartners.length;
      best = ecu;
    }
  });
  return best;
}
