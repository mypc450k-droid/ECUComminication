'use client';

import { GlassPanel } from '@/components/ui/GlassPanel';
import type { SimulationFeature } from '@/types/simulation';

export function KnowledgePanel({ feature }: { feature: SimulationFeature }) {
  const knowledge = feature.knowledge;

  if (!knowledge) return null;

  return (
    <div className="border-t border-cyan-500/10 p-3 space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
      <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        Knowledge Panel
      </h3>

      {knowledge.interviewQuestions.length > 0 && (
        <GlassPanel className="p-2">
          <h4 className="text-[9px] text-slate-500 uppercase mb-1">Interview Questions</h4>
          <ul className="space-y-0.5">
            {knowledge.interviewQuestions.slice(0, 3).map((q) => (
              <li key={q} className="text-[10px] text-slate-400">• {q}</li>
            ))}
          </ul>
        </GlassPanel>
      )}

      {knowledge.realVehicleExample && (
        <GlassPanel className="p-2">
          <h4 className="text-[9px] text-slate-500 uppercase mb-1">Real Vehicle Example</h4>
          <p className="text-[10px] text-slate-300">{knowledge.realVehicleExample}</p>
        </GlassPanel>
      )}

      {Object.entries(knowledge.oemNotes).slice(0, 3).map(([oem, note]) => (
        <div key={oem} className="text-[10px]">
          <span className="text-cyan-400/70 font-medium">{oem}:</span>
          <span className="text-slate-500 ml-1">{note}</span>
        </div>
      ))}

      <div className="flex gap-2 text-[9px] text-slate-600 font-mono">
        {knowledge.vectorTool && <span>Vector: {knowledge.vectorTool}</span>}
        {knowledge.etasTool && <span>ETAS: {knowledge.etasTool}</span>}
      </div>
    </div>
  );
}
