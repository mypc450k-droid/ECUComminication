'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { getEcuById, getAutosarLayerById, getFeatureById } from '@/lib/data';
import { EcuInspectorActions } from '@/extensions/panels/EcuInspectorActions';
import { getVehicleZone, getZoneLabel } from '@/extensions/architecture/vehicleZoneLayout';
import { GlassPanel } from './ui/GlassPanel';
import { AsilBadge, NetworkBadge } from './ui/Badges';
import { ArchitectureExplainSection } from './ArchitectureExplainSection';
import {
  ASIL_MEANINGS,
  buildEcuArchitectureExplanation,
  buildFeatureArchitectureExplanation,
} from '@/extensions/inspector/architectureExplain';
import type { AsilLevel, Feature, VehicleDomain } from '@/types';
import { cn } from '@/lib/utils';

const NOT_SPECIFIED = 'Not specified';

const DOMAIN_LABELS: Record<VehicleDomain, string> = {
  body: 'Body / Cabin',
  powertrain: 'Powertrain',
  chassis: 'Chassis',
  adas: 'ADAS',
  comfort: 'Comfort',
  infotainment: 'Infotainment',
  safety: 'Safety',
  diagnostics: 'Diagnostics',
  autosar: 'AUTOSAR',
  iso26262: 'ISO 26262',
};

function displayValue(value: string | undefined | null): string {
  return value?.trim() ? value : NOT_SPECIFIED;
}

function getFeaturePurpose(feature: Feature): string {
  const outputStage = feature.flowStages.find((stage) => stage.type === 'output');
  if (outputStage?.description?.trim()) return outputStage.description;
  if (feature.physicalOutput?.trim()) return feature.physicalOutput;
  return NOT_SPECIFIED;
}

function getFeatureAsilLevels(feature: Feature): AsilLevel[] {
  const levels = new Set<AsilLevel>();
  feature.involvedEcus.forEach((id) => {
    const ecu = getEcuById(id);
    if (ecu) levels.add(ecu.asil);
  });
  return Array.from(levels);
}

function InspectorKindBadge({ kind }: { kind: 'inspector' | 'feature' }) {
  return (
    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border border-cyan-500/25 bg-cyan-500/10 text-cyan-300/90">
      {kind === 'inspector' ? 'Inspector' : 'Feature'}
    </span>
  );
}

export function InspectorPanel() {
  const selectedEcuId = useAppStore((s) => s.selectedEcuId);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const selectedAutosarLayerId = useAppStore((s) => s.selectedAutosarLayerId);
  const viewMode = useAppStore((s) => s.viewMode);
  const ecu = selectedEcuId ? getEcuById(selectedEcuId) : null;
  const ecuExplanation = ecu ? buildEcuArchitectureExplanation(ecu) : null;

  if (viewMode === 'autosar' && selectedAutosarLayerId) {
    return <AutosarInspector layerId={selectedAutosarLayerId} />;
  }

  if (viewMode === 'feature' && selectedFeatureId) {
    return <FeatureInspector featureId={selectedFeatureId} />;
  }

  if (!ecu) {
    return (
      <aside className="w-full h-full min-h-0 border-l border-cyan-500/10 bg-slate-900/40 flex flex-col">
        <div className="p-3 border-b border-cyan-500/10">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Inspector
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-slate-800/60 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">Select an ECU to inspect</p>
            <p className="text-[10px] text-slate-600 mt-1">Click any ECU card in the architecture view</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full h-full min-h-0 border-l border-cyan-500/10 bg-slate-900/40 flex flex-col">
      <div className="p-3 border-b border-cyan-500/10">
        <div className="flex items-center justify-between gap-2">
          <InspectorKindBadge kind="inspector" />
          <AsilBadge level={ecu.asil} />
        </div>
        <h3 className="text-sm font-semibold text-slate-100 mt-1">{ecu.name}</h3>
        <p className="text-[10px] font-mono text-cyan-400/70">{ecu.shortName}</p>
        <p className="text-[9px] text-slate-600 mt-0.5">
          {ecu.domain} / {getZoneLabel(getVehicleZone(ecu.id))}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3">
        <InspectorSection title="Description">
          <p className="text-xs text-slate-400 leading-relaxed">{ecu.description}</p>
        </InspectorSection>

        <InspectorSection title="Purpose">
          <p className="text-xs text-slate-400 leading-relaxed">{displayValue(ecu.purpose)}</p>
        </InspectorSection>

        <InspectorSection title="Hardware">
          <div className="space-y-1.5">
            <InfoRow label="MCU" value={displayValue(ecu.microcontroller)} />
            <InfoRow label="Flash" value={displayValue(ecu.flash)} />
            <InfoRow label="RAM" value={displayValue(ecu.ram)} />
            <InfoRow label="Supplier" value={displayValue(ecu.supplier)} />
            <InfoRow label="Power Mode" value={displayValue(ecu.powerMode)} />
          </div>
        </InspectorSection>

        <InspectorSection title="AUTOSAR">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs font-medium',
              ecu.autosar ? 'text-emerald-400' : 'text-slate-500'
            )}>
              {ecu.autosar ? 'AUTOSAR Compliant' : 'Non-AUTOSAR'}
            </span>
            {ecu.autosar && <StatusIndicator active />}
          </div>
        </InspectorSection>

        <InspectorSection title="Networks">
          <div className="flex flex-wrap gap-1">
            {ecu.networks.length > 0 ? (
              ecu.networks.map((n) => <NetworkBadge key={n} type={n} />)
            ) : (
              <span className="text-xs text-slate-500">{NOT_SPECIFIED}</span>
            )}
          </div>
        </InspectorSection>

        <InspectorSection title="ASIL">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <AsilBadge level={ecu.asil} />
              <span className="text-xs text-slate-400">ASIL {ecu.asil}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">{ASIL_MEANINGS[ecu.asil]}</p>
          </div>
        </InspectorSection>

        {ecuExplanation && (
          <ArchitectureExplainSection
            key={`ecu:${ecu.id}`}
            explanation={ecuExplanation}
          />
        )}

        <InspectorSection title="CAN IDs">
          <div className="flex flex-wrap gap-1">
            {ecu.canIds.map((id) => (
              <span key={id} className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800/60 rounded text-cyan-400/80 border border-cyan-500/10">
                {id}
              </span>
            ))}
            {ecu.canIds.length === 0 && (
              <span className="text-xs text-slate-500">None</span>
            )}
          </div>
        </InspectorSection>

        <InspectorSection title="Communication Partners">
          <div className="flex flex-wrap gap-1">
            {ecu.communicationPartners.map((p) => (
              <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-800/40 rounded text-slate-400 border border-slate-700/30">
                {p}
              </span>
            ))}
          </div>
        </InspectorSection>

        <InspectorSection title="Signals">
          <div className="space-y-2">
            {ecu.signals.map((sig) => (
              <GlassPanel key={sig.id} className="p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">{sig.name}</span>
                  <NetworkBadge type={sig.network} />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{sig.description}</p>
                {sig.canId && (
                  <span className="text-[10px] font-mono text-cyan-400/60">{sig.canId}</span>
                )}
              </GlassPanel>
            ))}
            {ecu.signals.length === 0 && (
              <span className="text-xs text-slate-500">No signals defined</span>
            )}
          </div>
        </InspectorSection>

        <InspectorSection title="Diagnostics">
          <div className="flex flex-wrap gap-1">
            {ecu.diagnostics.map((d) => (
              <span key={d} className="text-[10px] px-1.5 py-0.5 bg-slate-800/40 rounded text-slate-400">
                {d}
              </span>
            ))}
          </div>
        </InspectorSection>

        <InspectorSection title="DTC Support">
          <div className="flex flex-wrap gap-1">
            {ecu.dtcSupport.map((d) => (
              <span key={d} className="text-[10px] font-mono px-1.5 py-0.5 bg-red-500/10 rounded text-red-400/80 border border-red-500/20">
                {d}
              </span>
            ))}
          </div>
        </InspectorSection>

        <EcuInspectorActions ecu={ecu} />
      </div>
    </aside>
  );
}

function InspectorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {title}
      </h4>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="text-[10px] text-slate-300 font-mono">{value}</span>
    </div>
  );
}

function StatusIndicator({ active }: { active: boolean }) {
  return (
    <span className={cn(
      'w-2 h-2 rounded-full',
      active ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-slate-600'
    )} />
  );
}

function AutosarInspector({ layerId }: { layerId: string }) {
  const layer = getAutosarLayerById(layerId);

  if (!layer) return null;

  return (
    <aside className="w-full h-full min-h-0 border-l border-cyan-500/10 bg-slate-900/40 flex flex-col">
      <div className="p-3 border-b border-cyan-500/10">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">AUTOSAR Layer</h2>
        <h3 className="text-sm font-semibold text-slate-100 mt-1">{layer.name}</h3>
        <p className="text-[10px] font-mono text-cyan-400/70">{layer.shortName}</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3">
        <InspectorSection title="Purpose">
          <p className="text-xs text-slate-400 leading-relaxed">{layer.purpose}</p>
        </InspectorSection>
        <InspectorSection title="Responsibilities">
          <ul className="space-y-1">
            {layer.responsibilities.map((r: string) => (
              <li key={r} className="text-xs text-slate-400 flex gap-2">
                <span className="text-cyan-500/50">▸</span>{r}
              </li>
            ))}
          </ul>
        </InspectorSection>
        <InspectorSection title="Inputs">
          <ul className="space-y-1">
            {layer.inputs.map((i: string) => (
              <li key={i} className="text-xs text-slate-400">→ {i}</li>
            ))}
          </ul>
        </InspectorSection>
        <InspectorSection title="Outputs">
          <ul className="space-y-1">
            {layer.outputs.map((o: string) => (
              <li key={o} className="text-xs text-slate-400">← {o}</li>
            ))}
          </ul>
        </InspectorSection>
        <InspectorSection title="Configuration">
          <ul className="space-y-1">
            {layer.configuration.map((c: string) => (
              <li key={c} className="text-[10px] text-slate-500 font-mono">{c}</li>
            ))}
          </ul>
        </InspectorSection>
        <InspectorSection title="Related Modules">
          <div className="flex flex-wrap gap-1">
            {layer.relatedModules.map((m: string) => (
              <span key={m} className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 rounded text-cyan-400 border border-cyan-500/20">
                {m}
              </span>
            ))}
          </div>
        </InspectorSection>
      </div>
    </aside>
  );
}

function FeatureInspector({ featureId }: { featureId: string }) {
  const feature = getFeatureById(featureId);
  const isSimulationRunning = useAppStore((s) => s.isSimulationRunning);
  const startSimulation = useAppStore((s) => s.startSimulation);
  const stopSimulation = useAppStore((s) => s.stopSimulation);

  if (!feature) return null;

  const featureExplanation = buildFeatureArchitectureExplanation(feature);
  const featureAsilLevels = getFeatureAsilLevels(feature);
  const featurePurpose = getFeaturePurpose(feature);

  return (
    <aside className="w-full h-full min-h-0 border-l border-cyan-500/10 bg-slate-900/40 flex flex-col">
      <div className="p-3 border-b border-cyan-500/10">
        <InspectorKindBadge kind="feature" />
        <h3 className="text-sm font-semibold text-slate-100 mt-2">{feature.name}</h3>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3">
        <InspectorSection title="Description">
          <p className="text-xs text-slate-400 leading-relaxed">{displayValue(feature.description)}</p>
        </InspectorSection>
        <InspectorSection title="Purpose">
          <p className="text-xs text-slate-400 leading-relaxed">{featurePurpose}</p>
        </InspectorSection>
        <InspectorSection title="Driver Input">
          <p className="text-xs text-amber-400/80">{displayValue(feature.driverInput)}</p>
        </InspectorSection>
        <InspectorSection title="Physical Output">
          <p className="text-xs text-emerald-400/80">{displayValue(feature.physicalOutput)}</p>
        </InspectorSection>
        <InspectorSection title="Involved ECUs">
          <div className="flex flex-wrap gap-1">
            {feature.involvedEcus.length > 0 ? (
              feature.involvedEcus.map((id: string) => {
                const ecu = getEcuById(id);
                return (
                  <span key={id} className="text-[10px] px-1.5 py-0.5 bg-slate-800/40 rounded text-slate-400">
                    {ecu ? ecu.shortName || ecu.name : id}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-slate-500">{NOT_SPECIFIED}</span>
            )}
          </div>
        </InspectorSection>
        <InspectorSection title="Networks">
          <div className="flex flex-wrap gap-1">
            {feature.involvedNetworks.length > 0 ? (
              feature.involvedNetworks.map((n: string) => <NetworkBadge key={n} type={n} />)
            ) : (
              <span className="text-xs text-slate-500">{NOT_SPECIFIED}</span>
            )}
          </div>
        </InspectorSection>
        <InspectorSection title="Domain">
          <p className="text-xs text-slate-400">{DOMAIN_LABELS[feature.domain] ?? feature.domain}</p>
        </InspectorSection>
        {featureAsilLevels.length > 0 && (
          <InspectorSection title="ASIL">
            <div className="space-y-2">
              {featureAsilLevels.map((level) => (
                <div key={level} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AsilBadge level={level} />
                    <span className="text-xs text-slate-400">ASIL {level}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{ASIL_MEANINGS[level]}</p>
                </div>
              ))}
            </div>
          </InspectorSection>
        )}

        <ArchitectureExplainSection
          key={`feature:${feature.id}`}
          explanation={featureExplanation}
        />

        <motion.button
          onClick={() => isSimulationRunning ? stopSimulation() : startSimulation()}
          className={cn(
            'w-full py-2.5 rounded-md text-xs font-semibold transition-all',
            isSimulationRunning
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 neon-cyan'
          )}
          whileTap={{ scale: 0.98 }}
        >
          {isSimulationRunning ? '■ Stop Simulation' : '▶ Run Simulation'}
        </motion.button>
      </div>
    </aside>
  );
}
