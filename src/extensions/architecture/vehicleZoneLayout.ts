import type { ECU } from '@/types';

/** Logical vehicle zones for illustrative top-view E/E topology layout. */
export type VehicleZone = 'front' | 'cabin' | 'powertrain' | 'chassis' | 'rear';

/** Canvas coordinate space for homepage architecture (scrollable workspace). */
export const VEHICLE_LAYOUT_BOUNDS = { width: 1040, height: 600 };

/** Subtle zone labels for visual grouping — display only. */
export const ZONE_UI_LABELS: Array<{
  label: string;
  x: number;
  y: number;
  width: number;
}> = [
  { label: 'ADAS & SENSING', x: 200, y: 18, width: 640 },
  { label: 'BODY CONTROL', x: 320, y: 118, width: 400 },
  { label: 'CABIN / COMFORT', x: 280, y: 218, width: 480 },
  { label: 'INFOTAINMENT', x: 620, y: 198, width: 280 },
  { label: 'ENERGY / POWERTRAIN', x: 200, y: 398, width: 640 },
  { label: 'CHASSIS', x: 280, y: 488, width: 480 },
];

/**
 * Deterministic ECU positions — illustrative top-view vehicle layout.
 * Does not modify source ECU JSON data.
 */
const ZONE_POSITIONS: Record<string, { x: number; y: number }> = {
  // FRONT — ADAS & sensing
  camera: { x: 220, y: 52 },
  radar: { x: 380, y: 42 },
  adas: { x: 520, y: 42 },
  ultrasonic: { x: 680, y: 52 },

  // Front body / lighting
  lighting: { x: 480, y: 108 },

  // Front cabin sides
  'door-fl': { x: 72, y: 168 },
  'pw-fl': { x: 168, y: 168 },
  sunroof: { x: 480, y: 148 },
  'door-fr': { x: 888, y: 168 },

  // Center cabin
  bcm: { x: 360, y: 228 },
  gateway: { x: 480, y: 228 },
  cluster: { x: 600, y: 228 },
  infotainment: { x: 720, y: 208 },
  telematics: { x: 820, y: 188 },
  airbag: { x: 280, y: 268 },
  hvac: { x: 480, y: 308 },
  seat: { x: 640, y: 308 },

  // Rear cabin sides
  'door-rl': { x: 72, y: 308 },
  'door-rr': { x: 888, y: 308 },

  // Powertrain / energy
  charging: { x: 168, y: 408 },
  bms: { x: 300, y: 408 },
  engine: { x: 400, y: 408 },
  transmission: { x: 500, y: 408 },
  'motor-controller': { x: 600, y: 408 },
  inverter: { x: 720, y: 408 },

  // Chassis
  abs: { x: 300, y: 498 },
  esp: { x: 400, y: 498 },
  steering: { x: 500, y: 498 },
  epb: { x: 600, y: 498 },
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

/** Bounds used for fit-to-screen and translate extent. */
export function getArchitectureTranslateExtent(): [[number, number], [number, number]] {
  const { width, height } = VEHICLE_LAYOUT_BOUNDS;
  return [[-80, -40], [width + 80, height + 60]];
}
