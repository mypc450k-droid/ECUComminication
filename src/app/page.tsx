'use client';

import { useEffect } from 'react';
import { HeaderBar } from '@/components/HeaderBar';
import { Sidebar } from '@/components/Sidebar';
import { InspectorPanel } from '@/components/InspectorPanel';
import { CommunicationMonitor } from '@/components/CommunicationMonitor';
import { ArchitectureView } from '@/components/ArchitectureView';
import { AutosarExplorer } from '@/components/AutosarExplorer';
import { FeatureSimulation } from '@/components/FeatureSimulation';
import { useAppStore } from '@/lib/store';

function CenterView() {
  const viewMode = useAppStore((s) => s.viewMode);

  switch (viewMode) {
    case 'autosar':
      return <AutosarExplorer />;
    case 'feature':
      return <FeatureSimulation />;
    default:
      return <ArchitectureView />;
  }
}

export default function Home() {
  const stopSimulation = useAppStore((s) => s.stopSimulation);

  useEffect(() => {
    return () => stopSimulation();
  }, [stopSimulation]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0e17]">
      <HeaderBar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 relative">
          <CenterView />
        </main>
        <InspectorPanel />
      </div>
      <CommunicationMonitor />
    </div>
  );
}
