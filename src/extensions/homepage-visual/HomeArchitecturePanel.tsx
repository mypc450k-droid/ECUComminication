'use client';

import { networks } from '@/lib/data';
import { computeArchitectureInsights, computeArchitectureSummary } from './homepageGraphUtils';

export function HomeArchitecturePanel() {
  const summary = computeArchitectureSummary();
  const insights = computeArchitectureInsights();

  return (
    <aside className="hp-right-panel" aria-label="Architecture summary">
      <section className="hp-right-section">
        <h4 className="hp-panel-heading">Architecture Summary</h4>
        <ul className="hp-summary-stats">
          <li><span>ECUs</span><span>{summary.ecuCount}</span></li>
          <li><span>Networks</span><span>{summary.networkCount}</span></li>
          <li><span>Features</span><span>{summary.featureCount}</span></li>
        </ul>
        <div className="hp-summary-block">
          <span className="hp-summary-block-title">ASIL</span>
          <ul className="hp-summary-mini">
            {(Object.entries(summary.asilCounts) as [string, number][]).map(([level, count]) => (
              <li key={level}><span>ASIL {level}</span><span>{count}</span></li>
            ))}
          </ul>
        </div>
        <div className="hp-summary-block">
          <span className="hp-summary-block-title">Network ECUs</span>
          <ul className="hp-summary-mini">
            <li><span>CAN HS</span><span>{summary.networkTypeCounts.CAN_HS}</span></li>
            <li><span>CAN LS</span><span>{summary.networkTypeCounts.CAN_LS}</span></li>
            <li><span>LIN</span><span>{summary.networkTypeCounts.LIN}</span></li>
            <li><span>ETHERNET</span><span>{summary.networkTypeCounts.Ethernet}</span></li>
            <li><span>FLEXRAY</span><span>{summary.networkTypeCounts.FlexRay}</span></li>
          </ul>
        </div>
      </section>

      <section className="hp-right-section">
        <h4 className="hp-panel-heading">Architecture Insights</h4>
        {insights.length === 0 ? (
          <p className="hp-insights-empty">NO ADDITIONAL INSIGHTS</p>
        ) : (
          <ul className="hp-check-list">
            {insights.map((item) => (
              <li key={item}>
                <span className="hp-check-icon" aria-hidden>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="hp-right-section">
        <h4 className="hp-panel-heading">Network Summary</h4>
        <ul className="hp-summary-list">
          {networks.map((net) => (
            <li key={net.id}>
              <span className="hp-summary-name">{net.name}</span>
              <span className="hp-summary-rate">{net.baudRate}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
