'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { getExplainWhy } from '@/lib/simulation-loader';
import { GlassPanel } from '@/components/ui/GlassPanel';

export function ExplainWhyModal() {
  const explainWhyKey = useAppStore((s) => s.explainWhyKey);
  const closeExplainWhy = useAppStore((s) => s.closeExplainWhy);

  const content = explainWhyKey ? getExplainWhy(explainWhyKey) : null;

  return (
    <AnimatePresence>
      {explainWhyKey && content && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeExplainWhy}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <GlassPanel className="p-5 glass-panel-highlight max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">{content.title}</h2>
                  <p className="text-xs text-cyan-400/70 mt-0.5">Explain Why</p>
                </div>
                <button onClick={closeExplainWhy} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
              </div>

              <Section title="Purpose">
                <p className="text-xs text-slate-300 leading-relaxed">{content.purpose}</p>
              </Section>

              <Section title="Responsibilities">
                <ul className="space-y-1">
                  {content.responsibilities.map((r) => (
                    <li key={r} className="text-xs text-slate-400 flex gap-2">
                      <span className="text-cyan-500/50">▸</span>{r}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Real World Example">
                <p className="text-xs text-slate-300">{content.realWorldExample}</p>
              </Section>

              <Section title="Analogy">
                <p className="text-xs text-amber-400/80 italic">{content.analogy}</p>
              </Section>

              <Section title="OEM Example">
                <p className="text-xs text-slate-300">{content.oemExample}</p>
              </Section>

              <Section title="Interview Questions">
                <ul className="space-y-1">
                  {content.interviewQuestions.map((q) => (
                    <li key={q} className="text-xs text-slate-400">• {q}</li>
                  ))}
                </ul>
              </Section>

              <Section title="Common Mistakes">
                <ul className="space-y-1">
                  {content.commonMistakes.map((m) => (
                    <li key={m} className="text-xs text-red-400/70">⚠ {m}</li>
                  ))}
                </ul>
              </Section>

              <Section title="Vector Tools">
                <div className="flex flex-wrap gap-1">
                  {content.vectorTools.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">{t}</span>
                  ))}
                </div>
              </Section>

              <Section title="Debugging Method">
                <p className="text-xs text-slate-400 font-mono">{content.debuggingMethod}</p>
              </Section>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
      {children}
    </div>
  );
}
