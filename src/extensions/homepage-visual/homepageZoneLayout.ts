import type { ECU } from '@/types';
import { getVehicleLayoutPosition } from '@/extensions/architecture/vehicleZoneLayout';
import { HOMEPAGE_LAYOUT_BOUNDS, VEHICLE_WHEELS } from './homepageVehicleGeometry';

/**
 * HOME_VISUAL_LAYOUT — presentation-only ECU positions grouped by functional domain.
 * Aligns with reference engineering diagram composition; does not alter graph topology.
 */
export { HOMEPAGE_LAYOUT_BOUNDS };

const CARD_GAP = 142;
const ADAS_Y = 88;
const BODY_TOP_Y = 88;
const BODY_SECOND_Y = 188;
const CABIN_Y = 430;
const GATEWAY_Y = 288;
const POWERTRAIN_Y = 578;
const CHASSIS_Y = 718;

const ADAS_X_START = 218;
const BODY_X_START = 818;
const POWERTRAIN_X_START = 158;
const CHASSIS_X_START = 398;

const HOME_VISUAL_LAYOUT: Record<string, { x: number; y: number }> = {
  // DOMAIN 1 — ADAS & SENSORS (front row, evenly spaced)
  camera: { x: ADAS_X_START, y: ADAS_Y },
  radar: { x: ADAS_X_START + CARD_GAP, y: ADAS_Y },
  adas: { x: ADAS_X_START + CARD_GAP * 2, y: ADAS_Y },
  ultrasonic: { x: ADAS_X_START + CARD_GAP * 3, y: ADAS_Y },

  // DOMAIN 2 — BODY & COMFORT (top-right cluster + doors at corners)
  lighting: { x: BODY_X_START, y: BODY_TOP_Y },
  bcm: { x: BODY_X_START + CARD_GAP, y: BODY_TOP_Y },
  hvac: { x: BODY_X_START + CARD_GAP * 2, y: BODY_TOP_Y },
  sunroof: { x: BODY_X_START, y: BODY_SECOND_Y },
  seat: { x: BODY_X_START + CARD_GAP * 2, y: CABIN_Y },

  'door-fl': { x: 24, y: VEHICLE_WHEELS.fl.y - 52 },
  'door-fr': { x: 1178, y: VEHICLE_WHEELS.fr.y - 52 },
  'door-rl': { x: 24, y: VEHICLE_WHEELS.rl.y - 52 },
  'door-rr': { x: 1178, y: VEHICLE_WHEELS.rr.y - 52 },
  'pw-fl': { x: 24, y: VEHICLE_WHEELS.fl.y + 18 },

  // DOMAIN 3 — CENTRAL COMMUNICATION (gateway hub)
  gateway: { x: 598, y: GATEWAY_Y },

  // Cabin / display controllers (central band)
  cluster: { x: 378, y: CABIN_Y },
  infotainment: { x: 518, y: CABIN_Y },
  telematics: { x: 758, y: CABIN_Y },
  airbag: { x: 1038, y: CABIN_Y },

  // DOMAIN 4 — POWERTRAIN (lower-central horizontal group)
  charging: { x: POWERTRAIN_X_START, y: POWERTRAIN_Y },
  bms: { x: POWERTRAIN_X_START + CARD_GAP, y: POWERTRAIN_Y },
  engine: { x: POWERTRAIN_X_START + CARD_GAP * 2, y: POWERTRAIN_Y },
  transmission: { x: POWERTRAIN_X_START + CARD_GAP * 3, y: POWERTRAIN_Y },
  'motor-controller': { x: POWERTRAIN_X_START + CARD_GAP * 4, y: POWERTRAIN_Y },
  inverter: { x: POWERTRAIN_X_START + CARD_GAP * 5, y: POWERTRAIN_Y },

  // DOMAIN 5 — CHASSIS & SAFETY (lower band)
  abs: { x: CHASSIS_X_START, y: CHASSIS_Y },
  esp: { x: CHASSIS_X_START + CARD_GAP, y: CHASSIS_Y },
  steering: { x: CHASSIS_X_START + CARD_GAP * 2, y: CHASSIS_Y },
  epb: { x: CHASSIS_X_START + CARD_GAP * 3, y: CHASSIS_Y },
};

export function getHomepageLayoutPosition(ecu: ECU): { x: number; y: number } {
  return HOME_VISUAL_LAYOUT[ecu.id] ?? getVehicleLayoutPosition(ecu);
}
