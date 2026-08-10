import type { ECU } from '@/types';
import { getVehicleLayoutPosition } from '@/extensions/architecture/vehicleZoneLayout';
import { HOMEPAGE_LAYOUT_BOUNDS, VEHICLE_CENTER_X, VEHICLE_WHEELS } from './homepageVehicleGeometry';

/**
 * Vehicle-native ECU positions — each ECU anchored to a physical vehicle region.
 * Coordinates are React Flow space (top-left of node), aligned with HomeVehicleSilhouette.
 */
export { HOMEPAGE_LAYOUT_BOUNDS };

const cx = VEHICLE_CENTER_X;
const { fl, fr, rl, rr } = VEHICLE_WHEELS;

const HOMEPAGE_ZONE_POSITIONS: Record<string, { x: number; y: number }> = {
  // ── FRONT / PERCEPTION — hood & front bumper region ──
  camera: { x: cx - 52, y: 62 },
  radar: { x: cx - 128, y: 82 },
  adas: { x: cx - 52, y: 102 },
  ultrasonic: { x: cx + 76, y: 82 },
  lighting: { x: cx - 52, y: 148 },

  // ── DOOR ECUs — vehicle corners (not clustered) ──
  'door-fl': { x: fl.x - 118, y: fl.y - 58 },
  'door-fr': { x: fr.x + 18, y: fr.y - 58 },
  'door-rl': { x: rl.x - 118, y: rl.y - 42 },
  'door-rr': { x: rr.x + 18, y: rr.y - 42 },
  'pw-fl': { x: fl.x - 82, y: fl.y - 8 },

  // ── CABIN — distributed inside body, longitudinal spread ──
  sunroof: { x: cx - 48, y: 188 },
  telematics: { x: cx + 172, y: 212 },
  cluster: { x: cx - 92, y: 238 },
  infotainment: { x: cx + 28, y: 238 },
  bcm: { x: cx - 168, y: 288 },
  gateway: { x: cx - 48, y: 280 },
  airbag: { x: cx - 248, y: 308 },
  hvac: { x: cx + 128, y: 295 },
  seat: { x: cx - 108, y: 348 },

  // ── POWERTRAIN — central tunnel / axle region ──
  charging: { x: cx - 278, y: 468 },
  bms: { x: cx - 198, y: 418 },
  engine: { x: cx - 78, y: 408 },
  transmission: { x: cx + 18, y: 408 },
  'motor-controller': { x: cx + 118, y: 408 },
  inverter: { x: cx + 218, y: 418 },

  // ── CHASSIS — lower vehicle band ──
  abs: { x: cx - 108, y: 538 },
  esp: { x: cx - 8, y: 548 },
  steering: { x: cx + 92, y: 538 },
  epb: { x: cx + 192, y: 548 },
};

export function getHomepageLayoutPosition(ecu: ECU): { x: number; y: number } {
  return HOMEPAGE_ZONE_POSITIONS[ecu.id] ?? getVehicleLayoutPosition(ecu);
}
