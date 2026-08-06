'use client';

import { Group, Panel, Separator } from 'react-resizable-panels';
import { useExtensionStore } from '../store/extensionStore';

interface ResizableDashboardProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  inspector: React.ReactNode;
  commMonitor: React.ReactNode;
}

export function ResizableDashboard({ sidebar, main, inspector, commMonitor }: ResizableDashboardProps) {
  const panelLayout = useExtensionStore((s) => s.panelLayout);
  const setPanelSize = useExtensionStore((s) => s.setPanelSize);
  const togglePanelCollapse = useExtensionStore((s) => s.togglePanelCollapse);

  return (
    <div className="flex flex-1 min-h-0 relative">
      <Group orientation="horizontal" id="vv-main-horizontal" className="flex-1 min-h-0">
        {!panelLayout.sidebarCollapsed && (
          <>
            <Panel
              id="sidebar"
              defaultSize={panelLayout.sidebarWidth}
              minSize={8}
              maxSize={30}
              onResize={(size) => setPanelSize('sidebarWidth', size.asPercentage)}
              className="min-w-0"
            >
              <div className="h-full flex flex-col border-r border-cyan-500/10">
                <PanelHeader title="ECU Tree" onCollapse={() => togglePanelCollapse('sidebar')} />
                <div className="flex-1 min-h-0 overflow-hidden">{sidebar}</div>
              </div>
            </Panel>
            <Separator className="w-1.5 bg-slate-800/30 hover:bg-cyan-500/10 transition-colors cursor-col-resize flex items-center justify-center">
              <div className="w-0.5 h-8 rounded-full bg-slate-600" />
            </Separator>
          </>
        )}

        {panelLayout.sidebarCollapsed && (
          <CollapsedBar label="ECU Tree" onExpand={() => togglePanelCollapse('sidebar')} side="left" />
        )}

        <Panel id="center" minSize={40}>
          <Group orientation="vertical" id="vv-main-vertical" className="h-full">
            <Panel id="center-main" minSize={30}>
              <Group orientation="horizontal" className="h-full">
                <Panel id="canvas" minSize={35}>
                  <div className="h-full min-w-0 relative">{main}</div>
                </Panel>

                {!panelLayout.inspectorCollapsed && (
                  <>
                    <Separator className="w-1.5 bg-slate-800/30 hover:bg-cyan-500/10 cursor-col-resize flex items-center justify-center">
                      <div className="w-0.5 h-8 rounded-full bg-slate-600" />
                    </Separator>
                    <Panel
                      id="inspector"
                      defaultSize={panelLayout.inspectorWidth}
                      minSize={12}
                      maxSize={35}
                      onResize={(size) => setPanelSize('inspectorWidth', size.asPercentage)}
                    >
                      <div className="h-full flex flex-col border-l border-cyan-500/10 bg-slate-900/40">
                        <PanelHeader title="Feature Details" onCollapse={() => togglePanelCollapse('inspector')} />
                        <div className="flex-1 min-h-0 overflow-hidden">{inspector}</div>
                      </div>
                    </Panel>
                  </>
                )}
              </Group>
            </Panel>

            {!panelLayout.commMonitorCollapsed && (
              <>
                <Separator className="h-1.5 bg-slate-800/30 hover:bg-cyan-500/10 cursor-row-resize flex items-center justify-center">
                  <div className="h-0.5 w-8 rounded-full bg-slate-600" />
                </Separator>
                <Panel
                  id="comm-monitor"
                  defaultSize={panelLayout.commMonitorHeight}
                  minSize={8}
                  maxSize={50}
                  onResize={(size) => setPanelSize('commMonitorHeight', size.asPercentage)}
                >
                  <div className="h-full border-t border-cyan-500/10 flex flex-col min-h-0">
                    <PanelHeader title="Live Communication Monitor" onCollapse={() => togglePanelCollapse('commMonitor')} />
                    <div className="flex-1 min-h-0 overflow-hidden">{commMonitor}</div>
                  </div>
                </Panel>
              </>
            )}
          </Group>
        </Panel>
      </Group>

      {panelLayout.commMonitorCollapsed && (
        <CollapsedBar label="Comm Monitor" onExpand={() => togglePanelCollapse('commMonitor')} side="bottom" />
      )}
    </div>
  );
}

function PanelHeader({ title, onCollapse }: { title: string; onCollapse: () => void }) {
  return (
    <div className="flex items-center justify-between px-2 h-7 border-b border-cyan-500/10 bg-slate-900/60">
      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
      <button onClick={onCollapse} className="text-[10px] text-slate-600 hover:text-slate-400 px-1">−</button>
    </div>
  );
}

function CollapsedBar({
  label,
  onExpand,
  side,
}: {
  label: string;
  onExpand: () => void;
  side: 'left' | 'bottom';
}) {
  if (side === 'bottom') {
    return (
      <button
        onClick={onExpand}
        className="absolute bottom-0 left-0 right-0 h-6 bg-slate-900/80 border-t border-cyan-500/10 text-[9px] text-slate-500 hover:text-cyan-400 z-20"
      >
        ▲ {label}
      </button>
    );
  }
  return (
    <button
      onClick={onExpand}
      className="w-6 h-full bg-slate-900/80 border-r border-cyan-500/10 text-[8px] text-slate-500 hover:text-cyan-400"
      style={{ writingMode: 'vertical-rl' }}
    >
      {label}
    </button>
  );
}
