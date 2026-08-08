export interface PanelLayoutState {
  sidebarWidth: number;
  inspectorWidth: number;
  stepPanelWidth: number;
  commMonitorHeight: number;
  sidebarCollapsed: boolean;
  inspectorCollapsed: boolean;
  stepPanelCollapsed: boolean;
  commMonitorCollapsed: boolean;
  sidebarMaximized: boolean;
  inspectorMaximized: boolean;
}

export interface SimulationHistoryEntry {
  id: string;
  stepIndex: number;
  stepTitle: string;
  timestamp: number;
  signal?: string;
  sender?: string;
  receiver?: string;
  network?: string;
  autosarLayer?: string;
  durationMs: number;
}

export interface CommMonitorFilters {
  network: string;
  source: string;
  destination: string;
  signal: string;
  search: string;
}

export interface PacketInspectorData {
  id: string;
  canId: string;
  extended: boolean;
  dlc: number;
  rawBytes: string;
  decodedSignals: string[];
  dbcName: string;
  cycleTimeMs: number;
  sender: string;
  receiver: string;
  aliveCounter: number;
  checksum: string;
  busLoad: string;
  timestamp: string;
  priority: string;
  arbitration: string;
  errorState: string;
  network: string;
  signal: string;
}

export interface SignalEvolutionStage {
  layer: string;
  oldRepresentation: string;
  newRepresentation: string;
  format: 'binary' | 'hex' | 'boolean' | 'physical' | 'engineering' | 'can' | 'decoded';
}

export type CommViewMode = 'decoded' | 'hex' | 'dbc';
export type ExtendedPlaybackSpeed = 0.25 | 0.5 | 1 | 2 | 4;

export interface StepInspectorState {
  maximized: boolean;
  minimized: boolean;
  pinned: boolean;
  detached: boolean;
  detachedPosition: { x: number; y: number };
  detachedSize: { width: number; height: number };
}

export interface SignalPanelLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
}

export type CanvasViewMode = 'ecu' | 'signal' | 'both';

export interface EcuCanvasPosition {
  x: number;
  y: number;
}

export interface ExtensionUIState {
  presentationMode: boolean;
  focusMode: boolean;
  traceSignalMode: boolean;
  tracedSignalId: string | null;
  tracedSignalPath: string[];
  ecuFocusId: string | null;
}
