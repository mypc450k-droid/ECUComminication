'use client';

import { HomeNetworkLegend } from './HomeNetworkLegend';
import { HomeAsilLegend } from './HomeAsilLegend';

export function HomeLeftPanel() {
  return (
    <aside className="hp-left-panel" aria-label="Architecture legends">
      <HomeNetworkLegend />
      <HomeAsilLegend />
    </aside>
  );
}
