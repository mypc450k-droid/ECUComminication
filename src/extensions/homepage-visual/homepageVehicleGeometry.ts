/**
 * Shared vehicle coordinate system for homepage presentation (flow-space pixels).
 */
export const HOMEPAGE_LAYOUT_BOUNDS = { width: 1320, height: 880 };

export const VEHICLE_CENTER_X = HOMEPAGE_LAYOUT_BOUNDS.width / 2;

/** Wheel hubs — door ECUs anchor near corresponding corners. */
export const VEHICLE_WHEELS = {
  fl: { x: 200, y: 310 },
  fr: { x: 1120, y: 310 },
  rl: { x: 200, y: 610 },
  rr: { x: 1120, y: 610 },
} as const;

/** Presentation domain bands for subtle in-body tinting. */
export const VEHICLE_DOMAIN_BANDS = [
  { id: 'adas', yStart: 0.1, yEnd: 0.24 },
  { id: 'cabin', yStart: 0.24, yEnd: 0.52 },
  { id: 'powertrain', yStart: 0.52, yEnd: 0.68 },
  { id: 'chassis', yStart: 0.68, yEnd: 0.86 },
] as const;
