'use client';

import { useEffect, useState } from 'react';
import type { ArchitectureExplanation } from '@/extensions/inspector/architectureExplain';
import { cn } from '@/lib/utils';

interface ArchitectureExplainSectionProps {
  selectionKey: string;
  explanation: ArchitectureExplanation;
}

export function ArchitectureExplainSection({
  selectionKey,
  explanation,
}: ArchitectureExplainSectionProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [selectionKey]);

  return (
    <div className="border-t border-cyan-500/10 pt-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'w-full py-2 rounded-md text-xs font-semibold transition-all border',
          expanded
            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35'
            : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:border-cyan-500/30 hover:text-cyan-300'
        )}
      >
        ✨ Explain Architecture
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <h4 className="text-[10px] font-semibold text-cyan-400/90 uppercase tracking-wider">
            {explanation.heading}
          </h4>

          {explanation.sections.map((section) => (
            <div key={section.title}>
              <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {section.title}
              </h5>
              {section.lines.length > 1 &&
              (section.title.toLowerCase().includes('flow') ||
                section.title.toLowerCase().includes('impact') ||
                section.title.toLowerCase().includes('involved')) ? (
                <ul className="space-y-1">
                  {section.lines.map((line, index) => (
                    <li key={`${section.title}-${index}`} className="text-xs text-slate-400">
                      {index > 0 && (
                        <span className="text-cyan-500/50 block text-[10px] leading-none mb-0.5">
                          ↓
                        </span>
                      )}
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-1">
                  {section.lines.map((line, index) => (
                    <p key={`${section.title}-${index}`} className="text-xs text-slate-400 leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2 border-t border-slate-800/80">
            <h5 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              One-line summary
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">{explanation.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
