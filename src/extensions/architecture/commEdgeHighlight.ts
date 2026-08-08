import type { CommunicationMessage } from '@/types';
import { ecus } from '@/lib/data';

/** Map comm monitor display names to ECU ids — homepage visual only. */
const NAME_TO_ECU: Record<string, string> = {
  BCM: 'bcm',
  'Body Control Module': 'bcm',
  Gateway: 'gateway',
  'Gateway ECU': 'gateway',
  'ADAS ECU': 'adas',
  ADAS: 'adas',
  'Engine ECU': 'engine',
  ECM: 'engine',
  Cluster: 'cluster',
  'Instrument Cluster': 'cluster',
  'Door ECU FL': 'door-fl',
  'Door ECU FR': 'door-fr',
  Radar: 'radar',
  Camera: 'camera',
  'Lighting ECU': 'lighting',
  HVAC: 'hvac',
  BMS: 'bms',
  'ABS ECU': 'abs',
  ABS: 'abs',
  'ESP ECU': 'esp',
  ESP: 'esp',
  'Steering ECU': 'steering',
  EPB: 'epb',
  'Charging ECU': 'charging',
  'Airbag ECU': 'airbag',
  'Seat ECU': 'seat',
};

function resolveEcuId(name: string): string | null {
  if (NAME_TO_ECU[name]) return NAME_TO_ECU[name];
  const lower = name.toLowerCase().replace(/\s+/g, '-');
  const byId = ecus.find((e) => e.id === lower || e.shortName.toLowerCase() === lower);
  return byId?.id ?? null;
}

/** Stable key for edge highlighting from recent comm messages. */
export function getCommActiveEdgeKeys(messages: CommunicationMessage[]): string {
  const pairs: string[] = [];
  messages.slice(0, 4).forEach((m) => {
    const src = resolveEcuId(m.source);
    const dst = resolveEcuId(m.destination);
    if (src && dst) {
      const [a, b] = src < dst ? [src, dst] : [dst, src];
      pairs.push(`${a}|${b}`);
    }
  });
  return pairs.join(',');
}

export function isCommEdgeActive(
  source: string,
  target: string,
  activeKeys: string
): boolean {
  if (!activeKeys) return false;
  const [a, b] = source < target ? [source, target] : [target, source];
  return activeKeys.includes(`${a}|${b}`);
}
