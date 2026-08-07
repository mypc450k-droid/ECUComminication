import type { Feature, FlowStage, NetworkType } from '@/types';
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
  bus: 'bus',
  input: 'input',
  switch: 'switch',
  driver: 'driver',
  hardware: 'hardware',
  output: 'output',
  port: 'port',
  controller: 'controller',
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

function inferNetwork(stage: FlowStage, feature: Feature): NetworkType {
  const desc = stage.description.toLowerCase();
  const name = stage.name.toLowerCase();
  if (stage.type === 'lin') return 'LIN';
  if (desc.includes('ethernet') || name.includes('ethernet') || desc.includes('someip')) return 'Ethernet';
  if (desc.includes('flexray')) return 'FlexRay';
  if (feature.involvedNetworks.includes('Ethernet') && (stage.type === 'com' || stage.type === 'bus')) {
    return 'Ethernet';
  }
  if (feature.involvedNetworks.includes('CAN_HS')) return 'CAN_HS';
  if (feature.involvedNetworks.includes('CAN_LS')) return 'CAN_LS';
  return feature.involvedNetworks[0];
}

const typeToAutosarLayer: Record<string, string> = {
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
  autosar: 'com',
};

function inferCanId(description: string): string | undefined {
  const match = description.match(/0x[0-9A-Fa-f]{2,4}/);
  return match ? match[0] : undefined;
}

function convertFlowStageToStep(stage: FlowStage, index: number, feature: Feature): SimulationStep {
  const explainKey = typeToExplainKey[stage.type] || stage.type;
  const ecu = stage.ecuId ? feature.involvedEcus.includes(stage.ecuId) ? stage.ecuId : undefined : undefined;
  const network = inferNetwork(stage, feature);
  const canId = inferCanId(stage.description);

  const prevEcu = index > 0 ? feature.flowStages[index - 1]?.ecuId : undefined;
  const nextEcu = index < feature.flowStages.length - 1 ? feature.flowStages[index + 1]?.ecuId : undefined;

  return {
    id: stage.id,
    stepNumber: index + 1,
    title: stage.name,
    type: stage.type,
    beginnerExplanation: generateBeginnerExplanation(stage),
    engineeringExplanation: generateEngineeringExplanation(stage),
    ecuId: stage.ecuId || ecu,
    network,
    autosarLayerId: typeToAutosarLayer[stage.type],
    ecuState: typeToEcuState[stage.type],
    executionTimeMs: stage.duration,
    explainWhyKey: explainKey,
    showMeMoreKey: stage.ecuId || explainKey,
    canId,
    sender: stage.ecuId || prevEcu || feature.involvedEcus[0],
    receiver: nextEcu || stage.ecuId || feature.involvedEcus[feature.involvedEcus.length - 1],
    canvasPosition: { x: 60 + (index % 6) * 130, y: 50 + Math.floor(index / 6) * 100 },
  };
}

export function getSimulationFeature(featureId: string): SimulationFeature | undefined {
  if (enhancedSimulations[featureId]) {
    const enhanced = enhancedSimulations[featureId];
    const legacy = features.find((f) => f.id === featureId);
    return {
      ...enhanced,
      signalFlowStages: enhanced.signalFlowStages ?? legacy?.signalFlowStages,
    };
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

export function getExplainWhy(key: string): ExplainWhyContent {
  if (explainWhyMap[key]) {
    return explainWhyMap[key];
  }

  const label = key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const base = explainWhyMap.ecu;

  return {
    key,
    title: `Why ${label}?`,
    purpose: `The ${label} stage is part of the end-to-end vehicle feature path. It transforms, routes, or acts on signals between driver input and physical output.`,
    responsibilities: [
      `Participates in the ${label} step of the feature execution chain`,
      'Must meet timing and reliability requirements for the domain',
      'Interfaces with adjacent AUTOSAR or hardware layers',
    ],
    realWorldExample: `In a typical body-domain feature, the ${label} layer handles one hop in the signal path from switch to actuator.`,
    analogy: `Think of ${label} as one station in a relay race — each layer passes the baton (data) to the next.`,
    oemExample: base.oemExample,
    interviewQuestions: [
      `What is the role of ${label} in vehicle E/E architecture?`,
      `How does ${label} interact with neighboring layers?`,
      `What failure modes affect ${label}?`,
    ],
    commonMistakes: [
      `Skipping ${label} when tracing a signal end-to-end`,
      'Assuming all OEMs implement this layer identically',
    ],
    vectorTools: base.vectorTools,
    debuggingMethod: `Trace the feature timeline step-by-step and verify ${label} inputs/outputs with CANoe or ECU logs.`,
  };
}

export function getShowMeMore(key: string): ShowMeMoreContent {
  if (showMeMoreMap[key]) {
    return showMeMoreMap[key];
  }

  const label = key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const base = showMeMoreMap.bcm ?? showMeMoreMap.com;

  return {
    key,
    title: `${label} — Deep Dive`,
    architecture: `${label} participates in the distributed architecture spanning multiple ECUs and networks. Signals are defined in ARXML/CAN databases and routed per OEM integration rules.`,
    signals: [
      `Primary command/status signals associated with ${label}`,
      'Network PDUs mapped through COM and PduR configuration',
    ],
    requirements: [
      'Functional safety and timing constraints per feature ASIL',
      'Diagnostic coverage and DTC reporting where applicable',
    ],
    stateMachine: `Typical states: Idle → Request → Active → Complete (varies by ${label} role).`,
    canFrames: base.canFrames,
    dbcSignal: base.dbcSignal,
    autosarMapping: base.autosarMapping,
    hardwareConnections: base.hardwareConnections,
    softwareConnections: base.softwareConnections,
    diagnostics: base.diagnostics,
    failureModes: base.failureModes,
    iso26262Impact: base.iso26262Impact,
    asilLevel: base.asilLevel,
    oemUsage: base.oemUsage,
  };
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
