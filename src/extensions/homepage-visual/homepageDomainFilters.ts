import type { ECU } from '@/types';
import { getVehicleZone } from '@/extensions/architecture/vehicleZoneLayout';

export type DomainFilterKey = 'ALL' | 'ADAS' | 'BODY' | 'POWERTRAIN' | 'CHASSIS' | 'COMMUNICATION';

export type NetworkFilterKey = 'ALL' | 'CAN_HS' | 'CAN_LS' | 'LIN' | 'Ethernet' | 'FlexRay';

const COMMUNICATION_ECU_IDS = new Set(['gateway', 'cluster', 'infotainment', 'telematics']);

const CHASSIS_SAFETY_IDS = new Set(['abs', 'esp', 'steering', 'epb', 'airbag']);

export function matchesDomainFilter(ecuId: string, filter: DomainFilterKey): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'ADAS') return getVehicleZone(ecuId) === 'front';
  if (filter === 'BODY') {
    return getVehicleZone(ecuId) === 'cabin' && ecuId !== 'gateway' && !COMMUNICATION_ECU_IDS.has(ecuId);
  }
  if (filter === 'COMMUNICATION') return COMMUNICATION_ECU_IDS.has(ecuId);
  if (filter === 'POWERTRAIN') return getVehicleZone(ecuId) === 'powertrain';
  if (filter === 'CHASSIS') return CHASSIS_SAFETY_IDS.has(ecuId);
  return true;
}

export function getEcuIdsForDomainFilter(filter: DomainFilterKey, ecus: ECU[]): string[] {
  if (filter === 'ALL') return [];
  return ecus.filter((e) => matchesDomainFilter(e.id, filter)).map((e) => e.id);
}

export function matchesNetworkFilter(ecu: ECU, filter: NetworkFilterKey): boolean {
  if (filter === 'ALL') return true;
  return ecu.networks.includes(filter);
}

export function getEcuIdsForNetworkFilter(filter: NetworkFilterKey, ecus: ECU[]): string[] {
  if (filter === 'ALL') return [];
  return ecus.filter((e) => matchesNetworkFilter(e, filter)).map((e) => e.id);
}
