import type { Feature, FlowStage } from '@/types';
import type { SimulationFeature, SimulationStep, ECUState } from '@/types/simulation';
import powerWindowSim from '@/data/simulations/power-window.json';
import explainWhyData from '@/data/knowledge/explain-why.json';
import showMeMoreData from '@/data/knowledge/show-me-more.json';
import failuresData from '@/data/failures.json';
import { features } from './data';
import type { ExplainWhyContent, ShowMeMoreContent, FailureScenario } from '@/types/simulation';

const explainWhyMap = explainWhyData as Record<string, ExplainWhyContent>;
const showMeMoreMap = showMeMoreData as Record<string, ShowMeMoreContent>;
const failures = failuresData as FailureScenario[];

const enhancedSimulations: Record<string, SimulationFeature> = {
  'power-window': powerWindowSim as SimulationFeature,
};

const typeToExplainKey: Record<string, string> = {
  com: 'com',
  rte: 'rte',
  pdur: 'pdur',
  canif: 'canif',
  candrv: 'canif',
  gateway: 'gateway',
  can: 'can',
  lin: 'lin',
  autosar: 'autosar',
  mcal: 'mcal',
  ecu: 'ecu',
  swc: 'swc',
};

const typeToEcuState: Partial<Record<FlowStage['type'], ECUState>> = {
  input: 'waiting',
  switch: 'running',
  ecu: 'running',
  gateway: 'transmitting',
  can: 'transmitting',
  lin: 'transmitting',
  autosar: 'running',
  mcal: 'running',
  driver: 'running',
  hardware: 'running',
  output: 'running',
  swc: 'running',
  bus: 'transmitting',
};

function generateBeginnerExplanation(stage: FlowStage): string {
  const templates: Record<string, string> = {
    input: `The driver does something — like pressing a button or turning a switch. This is where every vehicle feature starts.`,
    switch: `A physical switch or sensor detects the driver's action and creates an electrical signal.`,
    lin: `The signal travels on the LIN bus — a simple wire connecting door modules to the main body computer.`,
    ecu: `An ECU (small computer) receives the signal and decides what to do next.`,
    gateway: `The Gateway routes the message between different parts of the vehicle's communication network.`,
    can: `The message travels on the CAN bus — the vehicle's main information highway at 500,000 bits per second.`,
    autosar: `The AUTOSAR software stack processes the message through standardized layers — like a postal system for data.`,
    mcal: `The Microcontroller Abstraction Layer configures the hardware pins and timers.`,
    driver: `A driver circuit amplifies the signal to power the actuator (motor, lamp, relay).`,
    hardware: `The physical component — motor, lamp, or solenoid — receives power and moves.`,
    output: `You see or feel the result — the window moves, the lamp lights up, or the door unlocks.`,
    swc: `Application software runs the feature logic — like an app on your phone.`,
    bus: `Data packets travel along the network wire to reach the destination ECU.`,
  };
  return templates[stage.type] || stage.description;
}

function generateEngineeringExplanation(stage: FlowStage): string {
  return stage.description;
}

function convertFlowStageToStep(stage: FlowStage, index: number, feature: Feature): SimulationStep {
  const explainKey = typeToExplainKey[stage.type] || stage.type;
  const ecu = stage.ecuId ? feature.involvedEcus.includes(stage.ecuId) ? stage.ecuId : undefined : undefined;

  return {
    id: stage.id,
    stepNumber: index + 1,
    title: stage.name,
    type: stage.type,
    beginnerExplanation: generateBeginnerExplanation(stage),
    engineeringExplanation: generateEngineeringExplanation(stage),
    ecuId: stage.ecuId || ecu,
    network: feature.involvedNetworks[0],
    autosarLayerId: stage.type === 'com' ? 'com' : stage.type === 'rte' ? 'rte' : stage.type === 'pdur' ? 'pdur' : stage.type === 'canif' || stage.type === 'candrv' ? 'canif' : stage.type === 'mcal' ? 'mcal' : undefined,
    ecuState: typeToEcuState[stage.type],
    executionTimeMs: stage.duration,
    explainWhyKey: explainKey,
    showMeMoreKey: stage.ecuId || explainKey,
    canvasPosition: { x: 100 + (index % 4) * 180, y: 80 + Math.floor(index / 4) * 120 },
  };
}

export function getSimulationFeature(featureId: string): SimulationFeature | undefined {
  if (enhancedSimulations[featureId]) {
    return enhancedSimulations[featureId];
  }

  const legacy = features.find((f) => f.id === featureId);
  if (!legacy) return undefined;

  return {
    id: legacy.id,
    name: legacy.name,
    domain: legacy.domain,
    description: legacy.description,
    driverInput: legacy.driverInput,
    physicalOutput: legacy.physicalOutput,
    involvedEcus: legacy.involvedEcus,
    involvedNetworks: legacy.involvedNetworks,
    steps: legacy.flowStages.map((s, i) => convertFlowStageToStep(s, i, legacy)),
    signalFlowStages: legacy.signalFlowStages,
    knowledge: {
      interviewQuestions: [
        `How does ${legacy.name} work in a vehicle?`,
        `Which ECUs are involved in ${legacy.name}?`,
        `What networks does ${legacy.name} use?`,
      ],
      oemNotes: {
        Bosch: `Bosch implements ${legacy.name} across multiple OEM platforms.`,
        Continental: `Continental BCM handles ${legacy.name} on LIN/CAN networks.`,
        Mercedes: `Mercedes-Benz integrates ${legacy.name} in body domain architecture.`,
      },
      realVehicleExample: `${legacy.name}: ${legacy.driverInput} → ${legacy.physicalOutput}`,
      vectorTool: 'CANoe',
      etasTool: 'RTA-CAR',
    },
  };
}

export function getExplainWhy(key: string): ExplainWhyContent | undefined {
  return explainWhyMap[key];
}

export function getShowMeMore(key: string): ShowMeMoreContent | undefined {
  return showMeMoreMap[key];
}

export function getFailureScenarios(): FailureScenario[] {
  return failures;
}

export function getFailureById(id: string): FailureScenario | undefined {
  return failures.find((f) => f.id === id);
}

export function getAllSimulationIds(): string[] {
  const legacyIds = features.map((f) => f.id);
  const enhancedIds = Object.keys(enhancedSimulations);
  return [...new Set([...legacyIds, ...enhancedIds])];
}
