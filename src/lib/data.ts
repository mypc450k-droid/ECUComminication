import ecusData from '@/data/ecus.json';
import networksData from '@/data/networks.json';
import featuresData from '@/data/features.json';
import autosarData from '@/data/autosar.json';
import sidebarData from '@/data/sidebar.json';
import type { ECU, Network, Feature, AutosarLayer, SidebarItem } from '@/types';

export const ecus: ECU[] = ecusData as ECU[];
export const networks: Network[] = networksData as Network[];
export const features: Feature[] = featuresData as Feature[];
export const autosarLayers: AutosarLayer[] = autosarData as AutosarLayer[];
export const sidebarItems: SidebarItem[] = sidebarData as SidebarItem[];

export function getEcuById(id: string): ECU | undefined {
  return ecus.find((e) => e.id === id);
}

export function getFeatureById(id: string): Feature | undefined {
  return features.find((f) => f.id === id);
}

export function getNetworkById(id: string): Network | undefined {
  return networks.find((n) => n.id === id);
}

export function getAutosarLayerById(id: string): AutosarLayer | undefined {
  return autosarLayers.find((l) => l.id === id);
}

export function searchAll(query: string): {
  ecuIds: string[];
  featureIds: string[];
  networkIds: string[];
} {
  const q = query.toLowerCase().trim();
  if (!q) return { ecuIds: [], featureIds: [], networkIds: [] };

  const ecuIds = ecus
    .filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.signals.some((s) => s.name.toLowerCase().includes(q))
    )
    .map((e) => e.id);

  const featureIds = features
    .filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.involvedEcus.some((id) => {
          const ecu = getEcuById(id);
          return ecu?.name.toLowerCase().includes(q);
        })
    )
    .map((f) => f.id);

  const networkIds = networks
    .filter((n) => n.name.toLowerCase().includes(q) || n.type.toLowerCase().includes(q))
    .map((n) => n.id);

  // When features match, also highlight their involved ECUs and networks
  const featureInvolvedEcuIds = features
    .filter((f) => featureIds.includes(f.id))
    .flatMap((f) => f.involvedEcus);

  const featureInvolvedNetworkIds = networks
    .filter((n) =>
      features
        .filter((f) => featureIds.includes(f.id))
        .some((f) => f.involvedNetworks.includes(n.type))
    )
    .map((n) => n.id);

  const allEcuIds = [...new Set([...ecuIds, ...featureInvolvedEcuIds])];
  const allNetworkIds = [...new Set([...networkIds, ...featureInvolvedNetworkIds])];

  return { ecuIds: allEcuIds, featureIds, networkIds: allNetworkIds };
}
