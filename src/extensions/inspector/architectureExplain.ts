import type { ECU, Feature, AsilLevel } from '@/types';
import { features, getEcuById } from '@/lib/data';
import { findCommunicationPath } from '@/extensions/homepage-visual/homepageGraphUtils';
import { getVehicleZone, getZoneLabel } from '@/extensions/architecture/vehicleZoneLayout';

const NOT_AVAILABLE = 'Not available in current architecture data.';

const ASIL_MEANINGS: Record<AsilLevel, string> = {
  QM: 'QM means no automotive safety integrity requirement is assigned to this item in the current data.',
  A: 'ASIL A is the lowest safety level — indicates limited injury risk if the function fails.',
  B: 'ASIL B indicates moderate injury risk; the ECU participates in safety-related body or chassis functions.',
  C: 'ASIL C indicates higher injury risk; failures may affect critical vehicle behavior.',
  D: 'ASIL D is the highest level — failures could lead to severe injury or life-threatening situations.',
};

export interface ExplainSection {
  title: string;
  lines: string[];
}

export interface ArchitectureExplanation {
  heading: string;
  sections: ExplainSection[];
  summary: string;
}

function ecuDisplayName(id: string): string {
  const ecu = getEcuById(id);
  return ecu ? ecu.name : id;
}

function getRelatedFeatures(ecuId: string): Feature[] {
  return features.filter((f) => f.involvedEcus.includes(ecuId));
}

function buildEcuFlowChain(ecu: ECU): string[] {
  const gatewayPath = findCommunicationPath(ecu.id, 'gateway');
  if (gatewayPath.length >= 2) {
    return gatewayPath.map((id) => ecuDisplayName(id));
  }

  const chain: string[] = [ecu.name];
  const partners = ecu.communicationPartners
    .map((id) => getEcuById(id))
    .filter(Boolean) as ECU[];

  if (partners.length > 0) {
    partners.slice(0, 3).forEach((p) => chain.push(p.name));
  }

  return chain.length > 1 ? chain : [ecu.name, 'Connected ECUs listed in Communication Partners'];
}

function networkLabels(ecu: ECU): string[] {
  if (ecu.networks.length === 0) return [NOT_AVAILABLE];
  return ecu.networks.map((n) => n.replace('_', ' '));
}

export function buildEcuArchitectureExplanation(ecu: ECU): ArchitectureExplanation {
  const related = getRelatedFeatures(ecu.id);
  const partnerNames = ecu.communicationPartners.map((id) => ecuDisplayName(id));
  const flowChain = buildEcuFlowChain(ecu);
  const impactIds = new Set<string>([ecu.id, ...ecu.communicationPartners]);

  const sections: ExplainSection[] = [
    {
      title: 'What is it?',
      lines: [ecu.description || NOT_AVAILABLE],
    },
    {
      title: 'What does it do?',
      lines: [ecu.purpose || NOT_AVAILABLE],
    },
    {
      title: 'Where does it belong?',
      lines: [
        `Domain: ${ecu.domain}`,
        `Vehicle area: ${getZoneLabel(getVehicleZone(ecu.id))}`,
      ],
    },
    {
      title: 'Safety',
      lines: [
        `ASIL ${ecu.asil}`,
        ASIL_MEANINGS[ecu.asil],
      ],
    },
    {
      title: 'Communication',
      lines: [
        `Networks: ${networkLabels(ecu).join(', ')}`,
        partnerNames.length > 0
          ? `Connected ECUs: ${partnerNames.join(', ')}`
          : 'No communication partners listed.',
        ecu.signals.length > 0
          ? `Key signals: ${ecu.signals.slice(0, 4).map((s) => s.name).join(', ')}`
          : 'No signals defined in current data.',
      ],
    },
    {
      title: 'How does information flow?',
      lines: flowChain,
    },
    {
      title: 'AUTOSAR',
      lines: ecu.autosar
        ? [
            'AUTOSAR Classic compliant ECU in the current model.',
            'Uses standardized BSW, RTE, and COM stacks where applicable.',
            'Software is organized in application SWCs connected through RTE ports.',
          ]
        : ['Non-AUTOSAR ECU in the current architecture data.'],
    },
    {
      title: 'Related features',
      lines:
        related.length > 0
          ? related.map((f) => f.name)
          : [NOT_AVAILABLE],
    },
    {
      title: 'Architecture impact',
      lines:
        impactIds.size > 1
          ? Array.from(impactIds).map((id) => ecuDisplayName(id))
          : [ecu.name],
    },
  ];

  const networkText = ecu.networks.length > 0 ? ecu.networks.join('/') : 'vehicle networks';
  const summary = `${ecu.name} operates in the ${ecu.domain} domain and communicates over ${networkText} with ${partnerNames.length} listed partner ECU(s).`;

  return {
    heading: 'Architecture Explanation',
    sections,
    summary,
  };
}

function featureFlowChain(feature: Feature): string[] {
  const stages = feature.flowStages;
  if (stages.length === 0) return [NOT_AVAILABLE];

  return stages.map((stage) => {
    if (stage.ecuId) {
      return ecuDisplayName(stage.ecuId);
    }
    return stage.name;
  });
}

function autosarFlowChain(feature: Feature): string[] {
  const autosarTypes = new Set([
    'autosar', 'swc', 'port', 'rte', 'com', 'pdur', 'canif', 'candrv', 'mcal', 'bus',
  ]);

  const fromSignalFlow = feature.signalFlowStages
    .filter((s) => autosarTypes.has(s.type))
    .map((s) => s.name);

  if (fromSignalFlow.length > 0) return fromSignalFlow;

  const fromFlow = feature.flowStages
    .filter((s) => autosarTypes.has(s.type))
    .map((s) => s.name);

  if (fromFlow.length > 0) return fromFlow;

  return [NOT_AVAILABLE];
}

function featureAsilSummary(feature: Feature): string[] {
  const levels = new Set<AsilLevel>();
  feature.involvedEcus.forEach((id) => {
    const ecu = getEcuById(id);
    if (ecu) levels.add(ecu.asil);
  });

  if (levels.size === 0) return [NOT_AVAILABLE];

  return Array.from(levels).map((level) => `Involved ECUs include ASIL ${level}: ${ASIL_MEANINGS[level]}`);
}

export function buildFeatureArchitectureExplanation(feature: Feature): ArchitectureExplanation {
  const ecuNames = feature.involvedEcus.map((id) => ecuDisplayName(id));
  const networks =
    feature.involvedNetworks.length > 0
      ? feature.involvedNetworks.map((n) => n.replace('_', ' '))
      : [NOT_AVAILABLE];

  const sections: ExplainSection[] = [
    {
      title: 'What is this feature?',
      lines: [feature.description || NOT_AVAILABLE],
    },
    {
      title: 'Purpose',
      lines: [feature.description || NOT_AVAILABLE],
    },
    {
      title: 'Driver / system input',
      lines: [feature.driverInput || NOT_AVAILABLE],
    },
    {
      title: 'Physical / system output',
      lines: [feature.physicalOutput || NOT_AVAILABLE],
    },
    {
      title: 'Involved ECUs',
      lines: ecuNames.length > 0 ? ecuNames : [NOT_AVAILABLE],
    },
    {
      title: 'Communication networks',
      lines: networks,
    },
    {
      title: 'Communication flow',
      lines: featureFlowChain(feature),
    },
    {
      title: 'AUTOSAR flow',
      lines: autosarFlowChain(feature),
    },
    {
      title: 'Safety / ASIL',
      lines: featureAsilSummary(feature),
    },
    {
      title: 'Related ECUs / networks',
      lines: [
        `ECUs: ${ecuNames.join(', ') || NOT_AVAILABLE}`,
        `Networks: ${networks.join(', ')}`,
      ],
    },
  ];

  const summary = `${feature.name} takes "${feature.driverInput}" as input and produces "${feature.physicalOutput}" using ${ecuNames.length} ECU(s) over ${networks.join(' and ')}.`;

  return {
    heading: 'Feature Architecture Explanation',
    sections,
    summary,
  };
}
