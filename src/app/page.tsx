'use client';

import { useEffect } from 'react';
import { HeaderBar } from '@/components/HeaderBar';
import { Sidebar } from '@/components/Sidebar';
import { InspectorPanel } from '@/components/InspectorPanel';
import { HomeArchitectureView } from '@/extensions/home-architecture/HomeArchitectureView';
import { AutosarExplorer } from '@/components/AutosarExplorer';
import { FeatureSimulation } from '@/components/FeatureSimulation';
import { useAppStore } from '@/lib/store';
import { ResizableDashboard } from '@/extensions/layout/ResizableDashboard';
import { CommunicationMonitorPro } from '@/extensions/comm/CommunicationMonitorPro';

function CenterView() {
  const viewMode = useAppStore((s) => s.viewMode);

  switch (viewMode) {
    case 'autosar':
      return <AutosarExplorer />;
    case 'feature':
      return <FeatureSimulation />;
    default:
      return <HomeArchitectureView />;
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
      <ResizableDashboard
        sidebar={<div className="w-full h-full [&_aside]:!w-full"><Sidebar /></div>}
        main={<CenterView />}
        inspector={<InspectorPanel />}
        commMonitor={
          <div className="h-full min-h-0 [&>div]:!h-full [&>div]:!max-h-none">
            <CommunicationMonitorPro />
          </div>
        }
      />
    </div>
  );
}
