import type { ECU } from '@/types';

/** Logical vehicle zones for illustrative top-view E/E topology layout. */
export type VehicleZone = 'front' | 'cabin' | 'powertrain' | 'chassis' | 'rear';

/** Illustrative 2D positions — does not modify source ECU JSON data. */
const ZONE_POSITIONS: Record<string, { x: number; y: number }> = {
  // FRONT — perception & front lighting
  camera: { x: 280, y: 60 },
  radar: { x: 400, y: 50 },
  adas: { x: 520, y: 60 },
  ultrasonic: { x: 640, y: 70 },
  lighting: { x: 460, y: 120 },

  // CABIN — body, comfort, doors
  bcm: { x: 380, y: 260 },
  gateway: { x: 460, y: 260 },
  cluster: { x: 540, y: 260 },
  infotainment: { x: 620, y: 240 },
  telematics: { x: 700, y: 220 },
  hvac: { x: 540, y: 320 },
  seat: { x: 620, y: 320 },
  sunroof: { x: 460, y: 200 },
  'door-fl': { x: 200, y: 240 },
  'door-fr': { x: 760, y: 240 },
  'door-rl': { x: 200, y: 340 },
  'door-rr': { x: 760, y: 340 },
  'pw-fl': { x: 240, y: 280 },
  airbag: { x: 340, y: 320 },

  // POWERTRAIN
  engine: { x: 360, y: 420 },
  transmission: { x: 480, y: 420 },
  bms: { x: 280, y: 420 },
  charging: { x: 200, y: 460 },
  'motor-controller': { x: 560, y: 420 },
  inverter: { x: 640, y: 420 },

  // CHASSIS
  abs: { x: 280, y: 500 },
  esp: { x: 360, y: 500 },
  steering: { x: 460, y: 500 },
  epb: { x: 560, y: 500 },
};

const ZONE_LABELS: Record<VehicleZone, string> = {
  front: 'FRONT',
  cabin: 'CABIN',
  powertrain: 'POWERTRAIN',
  chassis: 'CHASSIS',
  rear: 'REAR',
};

const ECU_ZONE_MAP: Record<string, VehicleZone> = {
  camera: 'front',
  radar: 'front',
  adas: 'front',
  ultrasonic: 'front',
  lighting: 'front',
  bcm: 'cabin',
  gateway: 'cabin',
  cluster: 'cabin',
  infotainment: 'cabin',
  telematics: 'cabin',
  hvac: 'cabin',
  seat: 'cabin',
  sunroof: 'cabin',
  'door-fl': 'cabin',
  'door-fr': 'cabin',
  'door-rl': 'cabin',
  'door-rr': 'cabin',
  'pw-fl': 'cabin',
  airbag: 'cabin',
  engine: 'powertrain',
  transmission: 'powertrain',
  bms: 'powertrain',
  charging: 'powertrain',
  'motor-controller': 'powertrain',
  inverter: 'powertrain',
  abs: 'chassis',
  esp: 'chassis',
  steering: 'chassis',
  epb: 'chassis',
};

export function getVehicleZone(ecuId: string): VehicleZone {
  return ECU_ZONE_MAP[ecuId] ?? 'cabin';
}

export function getZoneLabel(zone: VehicleZone): string {
  return ZONE_LABELS[zone];
}

/** Returns illustrative layout position; falls back to JSON position if unmapped. */
export function getVehicleLayoutPosition(ecu: ECU): { x: number; y: number } {
  return ZONE_POSITIONS[ecu.id] ?? ecu.position;
}

export const VEHICLE_LAYOUT_BOUNDS = { width: 960, height: 580 };
