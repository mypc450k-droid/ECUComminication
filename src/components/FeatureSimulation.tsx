'use client';

import { SimulationEngine } from './simulation/SimulationEngine';

export function FeatureSimulation() {
  return (
    <div className="h-full min-h-0 flex flex-col">
      <SimulationEngine />
    </div>
  );
}
