'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { getEcuById, getAutosarLayerById, getFeatureById } from '@/lib/data';
import { EcuInspectorActions } from '@/extensions/panels/EcuInspectorActions';
import { getVehicleZone, getZoneLabel } from '@/extensions/architecture/vehicleZoneLayout';
import { GlassPanel } from './ui/GlassPanel';
import { AsilBadge, NetworkBadge } from './ui/Badges';
import { ArchitectureExplainSection } from './ArchitectureExplainSection';
import { buildEcuArchitectureExplanation, buildFeatureArchitectureExplanation } from '@/extensions/inspector/architectureExplain';
import { cn } from '@/lib/utils';

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
      <aside className="w-72 border-l border-cyan-500/10 bg-slate-900/40 flex flex-col">
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
    <aside className="w-72 border-l border-cyan-500/10 bg-slate-900/40 flex flex-col">
      <div className="p-3 border-b border-cyan-500/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Inspector
          </h2>
          <AsilBadge level={ecu.asil} />
        </div>
        <h3 className="text-sm font-semibold text-slate-100 mt-1">{ecu.name}</h3>
        <p className="text-[10px] font-mono text-cyan-400/70">{ecu.shortName}</p>
        <p className="text-[9px] text-slate-600 mt-0.5">
          {ecu.domain} / {getZoneLabel(getVehicleZone(ecu.id))}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        <InspectorSection title="Description">
          <p className="text-xs text-slate-400 leading-relaxed">{ecu.description}</p>
        </InspectorSection>

        <InspectorSection title="Purpose">
          <p className="text-xs text-slate-400 leading-relaxed">{ecu.purpose}</p>
        </InspectorSection>

        <InspectorSection title="Hardware">
          <div className="space-y-1.5">
            <InfoRow label="MCU" value={ecu.microcontroller} />
            <InfoRow label="Flash" value={ecu.flash} />
            <InfoRow label="RAM" value={ecu.ram} />
            <InfoRow label="Supplier" value={ecu.supplier} />
            <InfoRow label="Power Mode" value={ecu.powerMode} />
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
            {ecu.networks.map((n) => (
              <NetworkBadge key={n} type={n} />
            ))}
          </div>
        </InspectorSection>

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

        {ecuExplanation && (
          <ArchitectureExplainSection
            selectionKey={`ecu:${ecu.id}`}
            explanation={ecuExplanation}
          />
        )}
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
    <aside className="w-72 border-l border-cyan-500/10 bg-slate-900/40 flex flex-col">
      <div className="p-3 border-b border-cyan-500/10">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">AUTOSAR Layer</h2>
        <h3 className="text-sm font-semibold text-slate-100 mt-1">{layer.name}</h3>
        <p className="text-[10px] font-mono text-cyan-400/70">{layer.shortName}</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
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

  return (
    <aside className="w-72 border-l border-cyan-500/10 bg-slate-900/40 flex flex-col">
      <div className="p-3 border-b border-cyan-500/10">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Feature</h2>
        <h3 className="text-sm font-semibold text-slate-100 mt-1">{feature.name}</h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        <InspectorSection title="Description">
          <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
        </InspectorSection>
        <InspectorSection title="Driver Input">
          <p className="text-xs text-amber-400/80">{feature.driverInput}</p>
        </InspectorSection>
        <InspectorSection title="Physical Output">
          <p className="text-xs text-emerald-400/80">{feature.physicalOutput}</p>
        </InspectorSection>
        <InspectorSection title="Involved ECUs">
          <div className="flex flex-wrap gap-1">
            {feature.involvedEcus.map((id: string) => (
              <span key={id} className="text-[10px] px-1.5 py-0.5 bg-slate-800/40 rounded text-slate-400">
                {id}
              </span>
            ))}
          </div>
        </InspectorSection>
        <InspectorSection title="Networks">
          <div className="flex flex-wrap gap-1">
            {feature.involvedNetworks.map((n: string) => (
              <NetworkBadge key={n} type={n} />
            ))}
          </div>
        </InspectorSection>

        <ArchitectureExplainSection
          selectionKey={`feature:${feature.id}`}
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
