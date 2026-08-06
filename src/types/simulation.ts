import type { NetworkType, FlowStage, VehicleDomain } from './index';

export type LearningMode = 'beginner' | 'intermediate' | 'expert';
export type FeatureTab = 'simulation' | 'failure' | 'network' | 'autosar-stack' | 'topology3d';
export type PlaybackSpeed = 0.5 | 1 | 2;
export type ECUState =
  | 'sleeping'
  | 'booting'
  | 'running'
  | 'waiting'
  | 'transmitting'
  | 'receiving'
  | 'error'
  | 'diagnostic'
  | 'update';

export interface SimulationStep {
  id: string;
  stepNumber: number;
  title: string;
  type: FlowStage['type'];
  beginnerExplanation: string;
  engineeringExplanation: string;
  ecuId?: string;
  network?: NetworkType;
  autosarLayerId?: string;
  ecuState?: ECUState;
  executionTimeMs: number;
  canId?: string;
  signalName?: string;
  payload?: string;
  sender?: string;
  receiver?: string;
  frameCount?: number;
  cycleTimeMs?: number;
  lengthBytes?: number;
  explainWhyKey?: string;
  showMeMoreKey?: string;
  canvasPosition?: { x: number; y: number };
}

export interface SimulationFeature {
  id: string;
  name: string;
  domain: VehicleDomain;
  description: string;
  driverInput: string;
  physicalOutput: string;
  involvedEcus: string[];
  involvedNetworks: NetworkType[];
  steps: SimulationStep[];
  signalFlowStages?: FlowStage[];
  knowledge?: KnowledgeContent;
}

export interface ExplainWhyContent {
  key: string;
  title: string;
  purpose: string;
  responsibilities: string[];
  realWorldExample: string;
  analogy: string;
  oemExample: string;
  interviewQuestions: string[];
  commonMistakes: string[];
  vectorTools: string[];
  debuggingMethod: string;
}

export interface ShowMeMoreContent {
  key: string;
  title: string;
  architecture: string;
  signals: string[];
  requirements: string[];
  stateMachine: string;
  canFrames: string[];
  dbcSignal: string;
  autosarMapping: string[];
  hardwareConnections: string[];
  softwareConnections: string[];
  diagnostics: string[];
  failureModes: string[];
  iso26262Impact: string;
  asilLevel: string;
  oemUsage: string[];
}

export interface KnowledgeContent {
  interviewQuestions: string[];
  oemNotes: Record<string, string>;
  realVehicleExample: string;
  vectorTool?: string;
  etasTool?: string;
}

export interface FailureScenario {
  id: string;
  name: string;
  description: string;
  category: string;
  detectionStep: string;
  demAction: string;
  dtcCode: string;
  recovery: string;
  warningLamp: string;
  fallbackMode: string;
  involvedEcus: string[];
}

export interface SimulationEngineState {
  currentStepIndex: number;
  simulationPaused: boolean;
  simulationAutoPlay: boolean;
  playbackSpeed: PlaybackSpeed;
  learningMode: LearningMode;
  featureTab: FeatureTab;
  explainWhyKey: string | null;
  showMeMoreKey: string | null;
  activeFailureId: string | null;
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  showGrid: boolean;
  snapToGrid: boolean;
}
