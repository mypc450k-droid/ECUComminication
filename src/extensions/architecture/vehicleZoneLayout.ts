import type { ECU } from '@/types';

export type NodeVisualRole = 'compute' | 'gateway' | 'telematics' | 'zonal' | 'sensor' | 'standard';

export const VEHICLE_LAYOUT_BOUNDS = { width: 1000, height: 620 };

const ZONE_TEAL = '#26A69A';

/** Zone-architecture layout — illustrative positions only (JSON data unchanged). */
const ZONE_POSITIONS: Record<string, { x: number; y: number }> = {
  // Front sensors (extremities)
  camera: { x: 280, y: 72 },
  radar: { x: 400, y: 52 },
  adas: { x: 520, y: 52 },
  ultrasonic: { x: 660, y: 72 },
  lighting: { x: 500, y: 108 },

  // Central compute stack
  infotainment: { x: 468, y: 232 },
  gateway: { x: 468, y: 272 },
  telematics: { x: 468, y: 312 },

  // Zonal gateways (corners + body)
  bcm: { x: 340, y: 292 },
  'door-fl': { x: 128, y: 208 },
  'door-fr': { x: 812, y: 208 },
  'door-rl': { x: 128, y: 388 },
  'door-rr': { x: 812, y: 388 },

  // Cabin
  sunroof: { x: 500, y: 188 },
  cluster: { x: 560, y: 352 },
  hvac: { x: 400, y: 352 },
  seat: { x: 640, y: 368 },
  airbag: { x: 340, y: 352 },
  'pw-fl': { x: 200, y: 248 },

  // Powertrain / rear
  charging: { x: 280, y: 448 },
  bms: { x: 360, y: 448 },
  engine: { x: 440, y: 448 },
  transmission: { x: 520, y: 448 },
  'motor-controller': { x: 600, y: 448 },
  inverter: { x: 680, y: 448 },

  // Chassis
  abs: { x: 360, y: 518 },
  esp: { x: 440, y: 518 },
  steering: { x: 520, y: 518 },
  epb: { x: 600, y: 518 },
};

/** Visual role per ECU for zone-architecture styling. */
const NODE_ROLES: Record<string, NodeVisualRole> = {
  infotainment: 'compute',
  gateway: 'gateway',
  telematics: 'telematics',
  bcm: 'zonal',
  'door-fl': 'zonal',
  'door-fr': 'zonal',
  'door-rl': 'zonal',
  'door-rr': 'zonal',
  camera: 'sensor',
  radar: 'sensor',
  adas: 'sensor',
  ultrasonic: 'sensor',
  lighting: 'sensor',
};

/** Gateway backbone spokes — white trunk lines in reference. */
export const BACKBONE_HUB_ID = 'gateway';
export const BACKBONE_SPOKE_IDS = [
  'infotainment',
  'telematics',
  'bcm',
  'door-fl',
  'door-fr',
  'door-rl',
  'door-rr',
  'cluster',
  'adas',
];

export function getVehicleLayoutPosition(ecu: ECU): { x: number; y: number } {
  return ZONE_POSITIONS[ecu.id] ?? ecu.position;
}

export function getNodeVisualRole(ecuId: string): NodeVisualRole {
  return NODE_ROLES[ecuId] ?? 'standard';
}

export function getArchitectureTranslateExtent(): [[number, number], [number, number]] {
  const { width, height } = VEHICLE_LAYOUT_BOUNDS;
  return [[-60, -30], [width + 60, height + 40]];
}

export { ZONE_TEAL };
