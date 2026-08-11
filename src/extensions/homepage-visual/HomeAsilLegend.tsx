'use client';

import { cn } from '@/lib/utils';

const ASIL_LEVELS = [
  { level: 'D', label: 'ASIL D', className: 'hp-asil-d' },
  { level: 'C', label: 'ASIL C', className: 'hp-asil-c' },
  { level: 'B', label: 'ASIL B', className: 'hp-asil-b' },
  { level: 'A', label: 'ASIL A', className: 'hp-asil-a' },
  { level: 'QM', label: 'ASIL QM', className: 'hp-asil-qm' },
] as const;

export function HomeAsilLegend() {
  return (
    <div className="hp-asil-legend" aria-label="ASIL legend">
      <h4 className="hp-panel-heading">ASIL Legend</h4>
      <ul className="hp-asil-list">
        {ASIL_LEVELS.map((item) => (
          <li key={item.level} className="hp-asil-item">
            <span className={cn('hp-asil-swatch', item.className)} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
