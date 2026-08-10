import type { ECU } from '@/types';
import { getVehicleLayoutPosition } from '@/extensions/architecture/vehicleZoneLayout';

/**
 * Homepage-only illustrative ECU positions — wider canvas and spacing to reduce card overlap.
 * Does not modify source ECU JSON or shared zone metadata.
 */
export const HOMEPAGE_LAYOUT_BOUNDS = { width: 1100, height: 720 };

const HOMEPAGE_ZONE_POSITIONS: Record<string, { x: number; y: number }> = {
  // FRONT — perception & lighting (spread arc)
  camera: { x: 120, y: 42 },
  radar: { x: 310, y: 32 },
  adas: { x: 500, y: 38 },
  ultrasonic: { x: 720, y: 42 },
  lighting: { x: 610, y: 118 },

  // CABIN — left wing
  'door-fl': { x: 36, y: 228 },
  'pw-fl': { x: 36, y: 318 },
  'door-rl': { x: 36, y: 408 },

  // CABIN — center rows (staggered)
  sunroof: { x: 280, y: 188 },
  bcm: { x: 400, y: 198 },
  gateway: { x: 520, y: 198 },
  cluster: { x: 640, y: 198 },
  infotainment: { x: 760, y: 188 },
  telematics: { x: 880, y: 188 },
  airbag: { x: 280, y: 298 },
  hvac: { x: 640, y: 298 },
  seat: { x: 760, y: 298 },

  // CABIN — right wing
  'door-fr': { x: 920, y: 228 },
  'door-rr': { x: 920, y: 408 },

  // POWERTRAIN
  charging: { x: 56, y: 468 },
  bms: { x: 200, y: 448 },
  engine: { x: 380, y: 448 },
  transmission: { x: 520, y: 448 },
  'motor-controller': { x: 660, y: 448 },
  inverter: { x: 820, y: 448 },

  // CHASSIS
  abs: { x: 240, y: 588 },
  esp: { x: 420, y: 588 },
  steering: { x: 600, y: 588 },
  epb: { x: 760, y: 588 },
};

export function getHomepageLayoutPosition(ecu: ECU): { x: number; y: number } {
  return HOMEPAGE_ZONE_POSITIONS[ecu.id] ?? getVehicleLayoutPosition(ecu);
}
