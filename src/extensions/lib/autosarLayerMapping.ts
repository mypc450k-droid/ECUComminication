import type { SimulationStep } from '@/types/simulation';

export const AUTOSAR_LAYER_PIPELINE = [
  { id: 'app-layer', key: 'swc', label: 'App SWC', short: 'SWC' },
  { id: 'rte', key: 'rte', label: 'RTE', short: 'RTE' },
  { id: 'com', key: 'com', label: 'COM', short: 'COM' },
  { id: 'pdur', key: 'pdur', label: 'PduR', short: 'PduR' },
  { id: 'canif', key: 'canif', label: 'CanIf', short: 'CanIf' },
  { id: 'candrv', key: 'canif', label: 'CanDrv', short: 'Drv' },
  { id: 'mcal', key: 'mcal', label: 'MCAL', short: 'MCAL' },
  { id: 'can-controller', key: 'can', label: 'CAN Ctrl', short: 'Ctrl' },
  { id: 'transceiver', key: 'can', label: 'Transceiver', short: 'PHY' },
  { id: 'bus', key: 'bus', label: 'CAN Bus', short: 'Bus' },
  { id: 'rx-ecu', key: 'ecu', label: 'Dest ECU', short: 'RX ECU' },
] as const;

export const AUTOSAR_RX_PIPELINE = [
  { id: 'rx-candrv', key: 'canif', label: 'CanDrv RX', short: 'Drv' },
  { id: 'rx-canif', key: 'canif', label: 'CanIf RX', short: 'CanIf' },
  { id: 'rx-com', key: 'com', label: 'COM RX', short: 'COM' },
  { id: 'rx-rte', key: 'rte', label: 'RTE RX', short: 'RTE' },
  { id: 'rx-swc', key: 'swc', label: 'Recv SWC', short: 'SWC' },
] as const;

const TYPE_TO_LAYER: Record<string, string> = {
  swc: 'app-layer',
  port: 'rte',
  rte: 'rte',
  com: 'com',
  pdur: 'pdur',
  canif: 'canif',
  candrv: 'candrv',
  mcal: 'mcal',
  controller: 'can-controller',
  bus: 'bus',
  can: 'bus',
  lin: 'bus',
  ecu: 'rx-ecu',
  gateway: 'pdur',
  autosar: 'com',
};

const RX_TYPE_TO_LAYER: Record<string, string> = {
  candrv: 'rx-candrv',
  canif: 'rx-canif',
  com: 'rx-com',
  rte: 'rx-rte',
  swc: 'rx-swc',
  mcal: 'mcal',
};

export function resolveAutosarLayerId(step: SimulationStep | null): string | null {
  if (!step) return null;
  if (step.autosarLayerId) return step.autosarLayerId;
  if (RX_TYPE_TO_LAYER[step.type]) return RX_TYPE_TO_LAYER[step.type];
  return TYPE_TO_LAYER[step.type] ?? null;
}

export function resolveAutosarLayerIndex(
  layerId: string | null,
  pipeline: ReadonlyArray<{ id: string }>
): number {
  if (!layerId) return -1;
  const idx = pipeline.findIndex((l) => l.id === layerId);
  return idx >= 0 ? idx : -1;
}
