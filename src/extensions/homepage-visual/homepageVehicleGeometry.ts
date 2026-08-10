/**
 * Shared vehicle coordinate system for homepage presentation.
 * ECU layout positions and SVG silhouette use the same flow-space bounds.
 */
export const HOMEPAGE_LAYOUT_BOUNDS = { width: 1000, height: 780 };

export const VEHICLE_CENTER_X = HOMEPAGE_LAYOUT_BOUNDS.width / 2;

/** Longitudinal zone bands (flow-space Y) — used for subtle zone visualization. */
export const VEHICLE_ZONE_BANDS = [
  { id: 'perception', label: 'PERCEPTION', yStart: 0.08, yEnd: 0.22 },
  { id: 'cabin', label: 'CABIN', yStart: 0.22, yEnd: 0.52 },
  { id: 'powertrain', label: 'POWERTRAIN', yStart: 0.52, yEnd: 0.68 },
  { id: 'chassis', label: 'CHASSIS', yStart: 0.68, yEnd: 0.82 },
] as const;

/** Wheel hub centers — door ECUs anchor near corresponding corners. */
export const VEHICLE_WHEELS = {
  fl: { x: 195, y: 265 },
  fr: { x: 805, y: 265 },
  rl: { x: 195, y: 555 },
  rr: { x: 805, y: 555 },
} as const;
