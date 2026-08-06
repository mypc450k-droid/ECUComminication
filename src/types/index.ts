export type NetworkType = 'CAN_HS' | 'CAN_LS' | 'LIN' | 'Ethernet' | 'FlexRay';

export type AsilLevel = 'QM' | 'A' | 'B' | 'C' | 'D';

export type VehicleDomain =
  | 'body'
  | 'powertrain'
  | 'chassis'
  | 'adas'
  | 'comfort'
  | 'infotainment'
  | 'safety'
  | 'diagnostics'
  | 'autosar'
  | 'iso26262';

export interface ECU {
  id: string;
  name: string;
  shortName: string;
  domain: VehicleDomain;
  description: string;
  purpose: string;
  microcontroller: string;
  flash: string;
  ram: string;
  asil: AsilLevel;
  autosar: boolean;
  canIds: string[];
  diagnostics: string[];
  supplier: string;
  powerMode: string;
  communicationPartners: string[];
  signals: Signal[];
  dtcSupport: string[];
  position: { x: number; y: number };
  networks: NetworkType[];
}

export interface Signal {
  id: string;
  name: string;
  direction: 'in' | 'out' | 'both';
  network: NetworkType;
  canId?: string;
  description: string;
}

export interface Network {
  id: string;
  name: string;
  type: NetworkType;
  baudRate: string;
  description: string;
  color: string;
  ecuIds: string[];
}

export interface CommunicationMessage {
  id: string;
  timestamp: string;
  network: NetworkType;
  canId: string;
  source: string;
  signal: string;
  destination: string;
  status: 'success' | 'error' | 'pending';
}

export interface AutosarLayer {
  id: string;
  name: string;
  shortName: string;
  purpose: string;
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  configuration: string[];
  relatedModules: string[];
  order: number;
}

export interface FlowStage {
  id: string;
  name: string;
  type: 'input' | 'switch' | 'lin' | 'ecu' | 'gateway' | 'can' | 'autosar' | 'mcal' | 'driver' | 'hardware' | 'output' | 'swc' | 'port' | 'rte' | 'com' | 'pdur' | 'canif' | 'candrv' | 'controller' | 'bus';
  ecuId?: string;
  description: string;
  duration: number;
}

export interface Feature {
  id: string;
  name: string;
  domain: VehicleDomain;
  description: string;
  driverInput: string;
  physicalOutput: string;
  involvedEcus: string[];
  involvedNetworks: NetworkType[];
  flowStages: FlowStage[];
  signalFlowStages: FlowStage[];
}

export interface SidebarItem {
  id: string;
  label: string;
  type: 'category' | 'domain' | 'feature' | 'mode';
  domain?: VehicleDomain;
  featureId?: string;
  children?: SidebarItem[];
  icon?: string;
}

export type ViewMode = 'architecture' | 'autosar' | 'feature';

export interface AppState {
  selectedEcuId: string | null;
  selectedFeatureId: string | null;
  viewMode: ViewMode;
  searchQuery: string;
  highlightedIds: string[];
  expandedSidebar: string[];
  communicationMessages: CommunicationMessage[];
  isSimulationRunning: boolean;
  activeFlowStage: number;
  selectedAutosarLayerId: string | null;
  bottomPanelExpanded: boolean;
}
