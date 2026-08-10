import type { ECU } from '@/types';

/** Homepage canvas bounds — layout only, ECU JSON unchanged. */
export const HOME_CANVAS = { width: 1020, height: 580 };

export const ZONE_LABELS = [
  { text: 'ADAS & SENSING', x: 510, y: 22 },
  { text: 'BODY CONTROL', x: 510, y: 128 },
  { text: 'CABIN / COMFORT', x: 510, y: 228 },
  { text: 'POWERTRAIN / ENERGY', x: 510, y: 398 },
  { text: 'CHASSIS', x: 510, y: 488 },
] as const;

/** Deterministic top-view positions (FRONT ↑ top, REAR ↓ bottom). */
const POSITIONS: Record<string, { x: number; y: number }> = {
  camera: { x: 255, y: 46 },
  radar: { x: 395, y: 38 },
  adas: { x: 535, y: 38 },
  ultrasonic: { x: 675, y: 46 },
  lighting: { x: 495, y: 92 },

  'door-fl': { x: 82, y: 152 },
  'pw-fl': { x: 168, y: 152 },
  sunroof: { x: 495, y: 168 },
  'door-fr': { x: 888, y: 152 },

  bcm: { x: 375, y: 238 },
  gateway: { x: 495, y: 238 },
  cluster: { x: 615, y: 238 },
  infotainment: { x: 715, y: 218 },
  telematics: { x: 815, y: 198 },
  airbag: { x: 295, y: 288 },

  hvac: { x: 435, y: 308 },
  seat: { x: 675, y: 308 },
  'door-rl': { x: 82, y: 308 },
  'door-rr': { x: 888, y: 308 },

  charging: { x: 195, y: 408 },
  bms: { x: 295, y: 408 },
  engine: { x: 395, y: 408 },
  transmission: { x: 495, y: 408 },
  'motor-controller': { x: 595, y: 408 },
  inverter: { x: 705, y: 408 },

  abs: { x: 295, y: 498 },
  esp: { x: 395, y: 498 },
  steering: { x: 495, y: 498 },
  epb: { x: 595, y: 498 },
};

export function getHomeEcuPosition(ecu: ECU): { x: number; y: number } {
  return POSITIONS[ecu.id] ?? ecu.position;
}

export function getHomeTranslateExtent(): [[number, number], [number, number]] {
  const { width, height } = HOME_CANVAS;
  return [[-70, -30], [width + 70, height + 50]];
}

/** Visual trunk spokes from gateway — display only. */
export const TRUNK_SPOKE_IDS = [
  'bcm',
  'cluster',
  'infotainment',
  'telematics',
  'adas',
  'bms',
  'engine',
  'door-fl',
  'door-fr',
  'door-rl',
  'door-rr',
] as const;

export const TRUNK_HUB_ID = 'gateway';
