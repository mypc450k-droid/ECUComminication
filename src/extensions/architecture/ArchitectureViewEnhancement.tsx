'use client';

import { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ViewportPortal,
  useNodesState,
  useEdgesState,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAppStore } from '@/lib/store';
import { ecus, getFeatureById } from '@/lib/data';
import { type ECUNodeData } from '@/components/ECUNode';
import { HomeECUNode } from '@/extensions/homepage-visual/HomeECUNode';
import { useExtensionStore } from '../store/extensionStore';
import { HomeVehicleSilhouette } from '@/extensions/homepage-visual/HomeVehicleSilhouette';
import { HomeDomainLabels } from '@/extensions/homepage-visual/HomeDomainLabels';
import { HomeFitViewButton, HomeDirectionPill } from '@/extensions/homepage-visual/HomeArchitectureChrome';
import { HomeLeftPanel } from '@/extensions/homepage-visual/HomeLeftPanel';
import { HomeArchitecturePanel } from '@/extensions/homepage-visual/HomeArchitecturePanel';
import { HomeArchitectureTitle } from '@/extensions/homepage-visual/HomeArchitectureTitle';
import { HomepageInteractionProvider, useHomepageInteraction } from '@/extensions/homepage-visual/HomepageInteractionContext';
import { HomepageInteractionToolbar } from '@/extensions/homepage-visual/HomepageInteractionToolbar';
import { HomepageEcuTooltip } from '@/extensions/homepage-visual/HomepageEcuTooltip';
import { HomepageTracePanel } from '@/extensions/homepage-visual/HomepageTracePanel';
import { HomepageClearFocus } from '@/extensions/homepage-visual/HomepageClearFocus';
import { HomepageGuidedTour } from '@/extensions/homepage-visual/HomepageGuidedTour';
import { HomepageFocusController } from '@/extensions/homepage-visual/HomepageFocusController';
import { HomepagePresentationBar } from '@/extensions/homepage-visual/HomepagePresentationBar';
import '@/extensions/homepage-visual/homepage-visual.css';
import { getHomepageLayoutPosition as getVehicleLayoutPosition } from '@/extensions/homepage-visual/homepageZoneLayout';
import { getVehicleZone } from './vehicleZoneLayout';
import { buildPartnerEdges, getConnectedEcuIds } from './buildPartnerEdges';

const nodeTypes = { ecuNode: HomeECUNode };
const EMPTY_CONNECTED_IDS: string[] = [];
const EMPTY_RELEVANT_IDS: string[] = [];

export function ArchitectureViewEnhancement() {
  return (
    <HomepageInteractionProvider>
      <ArchitectureViewEnhancementInner />
    </HomepageInteractionProvider>
  );
}

function ArchitectureViewEnhancementInner() {
  const selectedEcuId = useAppStore((s) => s.selectedEcuId);
  const highlightedIds = useAppStore((s) => s.highlightedIds);
  const selectEcu = useAppStore((s) => s.selectEcu);
  const setHighlightedIds = useAppStore((s) => s.setHighlightedIds);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const activeFlowStage = useAppStore((s) => s.activeFlowStage);
  const isSimulationRunning = useAppStore((s) => s.isSimulationRunning);

  const ecuFocusId = useExtensionStore((s) => s.ecuFocusId);
  const setEcuFocusId = useExtensionStore((s) => s.setEcuFocusId);
  const traceSignalMode = useExtensionStore((s) => s.traceSignalMode);
  const tracedSignalPath = useExtensionStore((s) => s.tracedSignalPath);
  const presentationMode = useExtensionStore((s) => s.presentationMode);

  const {
    interactionRelevantIds,
    interactionRelevantKey,
    hasInteractionFilter,
    hoveredEcuId,
    viewMode,
    setHoveredEcu,
    setTooltip,
    setClickFocus,
    handleTraceNodeClick,
    guidedTourOpen,
  } = useHomepageInteraction();

  const feature = selectedFeatureId ? getFeatureById(selectedFeatureId) : null;
  const activeEcuId = isSimulationRunning && feature
    ? feature.flowStages[activeFlowStage]?.ecuId
    : null;

  const focusEcuId = ecuFocusId ?? selectedEcuId;
  const connectedIds = useMemo(
    () => (focusEcuId ? getConnectedEcuIds(focusEcuId, ecus) : EMPTY_CONNECTED_IDS),
    [focusEcuId]
  );

  const relevantIdList = useMemo(() => {
    if (traceSignalMode && tracedSignalPath.length > 0) return tracedSignalPath;
    if (focusEcuId) return connectedIds;
    if (highlightedIds.length > 0) return highlightedIds;
    if (interactionRelevantIds.length > 0) return interactionRelevantIds;
    return EMPTY_RELEVANT_IDS;
  }, [
    traceSignalMode,
    tracedSignalPath,
    focusEcuId,
    connectedIds,
    highlightedIds,
    interactionRelevantKey,
  ]);

  const relevantIdKey = relevantIdList.join('|');

  const hasFocus = Boolean(
    focusEcuId ||
    traceSignalMode ||
    highlightedIds.length > 0 ||
    hasInteractionFilter
  );

  const buildNodes = useCallback((): Node[] => {
    const relevantSet = new Set(relevantIdList);
    return ecus.map((ecu) => {
      const isRelevant = !hasFocus || relevantSet.has(ecu.id);
      const isSelected = ecu.id === selectedEcuId || ecu.id === ecuFocusId;
      return {
        id: ecu.id,
        type: 'ecuNode',
        position: getVehicleLayoutPosition(ecu),
        data: {
          ecu,
          selected: isSelected,
          highlighted: highlightedIds.includes(ecu.id) || connectedIds.includes(ecu.id),
          activeInFlow: ecu.id === activeEcuId,
          dimmed: hasFocus && !isRelevant,
        } satisfies ECUNodeData & { dimmed?: boolean },
      };
    });
  }, [
    relevantIdKey,
    hasFocus,
    selectedEcuId,
    ecuFocusId,
    highlightedIds,
    connectedIds,
    activeEcuId,
  ]);

  const initialNodes = useMemo(() => buildNodes(), [buildNodes]);
  const initialEdges = useMemo(() => buildPartnerEdges(ecus), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(buildNodes());
  }, [buildNodes, setNodes]);

  useEffect(() => {
    const hoverSet = hoveredEcuId
      ? new Set(getConnectedEcuIds(hoveredEcuId, ecus))
      : null;

    if (isSimulationRunning && feature) {
      const stage = feature.flowStages[activeFlowStage];
      const activeNetwork = stage?.type === 'can' || stage?.type === 'lin' || stage?.type === 'bus';
      const relevantSet = new Set(relevantIdList);

      setEdges((eds) =>
        eds.map((e) => {
          const isActive =
            activeNetwork &&
            (e.source === activeEcuId || e.target === activeEcuId);
          const inHover =
            hoverSet &&
            hoverSet.has(e.source as string) &&
            hoverSet.has(e.target as string);
          const inRelevant =
            relevantSet.has(e.source as string) && relevantSet.has(e.target as string);

          let opacity = 0.35;
          if (isActive) opacity = 0.9;
          else if (hoverSet && !hasFocus) opacity = inHover ? 0.55 : 0.1;
          else if (hasFocus) opacity = inRelevant ? 0.55 : 0.08;

          return {
            ...e,
            animated: isActive,
            style: {
              ...e.style,
              strokeWidth: isActive ? 2.5 : viewMode === 'network' ? 1.6 : (e.style?.strokeWidth as number) ?? 1.2,
              opacity,
            },
          };
        })
      );
    } else {
      const relevantSet = new Set(relevantIdList);
      setEdges(
        buildPartnerEdges(ecus).map((e) => {
          const inHover =
            hoverSet &&
            hoverSet.has(e.source) &&
            hoverSet.has(e.target);
          const inRelevant =
            relevantSet.has(e.source) && relevantSet.has(e.target);

          let opacity = 0.35;
          if (hoverSet && !hasFocus) opacity = inHover ? 0.55 : 0.1;
          else if (hasFocus) opacity = inRelevant ? 0.55 : 0.08;

          return {
            ...e,
            style: {
              ...e.style,
              strokeWidth: viewMode === 'network' ? 1.6 : (e.style?.strokeWidth as number) ?? 1.2,
              opacity,
            },
          };
        })
      );
    }
  }, [
    activeFlowStage,
    isSimulationRunning,
    activeEcuId,
    feature,
    setEdges,
    hasFocus,
    relevantIdKey,
    hoveredEcuId,
    viewMode,
  ]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (handleTraceNodeClick(node.id)) {
        selectEcu(node.id);
        return;
      }
      selectEcu(node.id);
      setEcuFocusId(null);
      setClickFocus(node.id);
    },
    [selectEcu, setEcuFocusId, handleTraceNodeClick, setClickFocus]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectEcu(node.id);
      setEcuFocusId(node.id);
      setClickFocus(node.id);
      const connected = getConnectedEcuIds(node.id, ecus);
      setHighlightedIds(connected);
    },
    [selectEcu, setEcuFocusId, setHighlightedIds, setClickFocus]
  );

  const onNodeMouseEnter = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setHoveredEcu(node.id);
    },
    [setHoveredEcu]
  );

  const onNodeMouseMove = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setTooltip({ ecuId: node.id, x: event.clientX + 12, y: event.clientY + 12 });
    },
    [setTooltip]
  );

  const onNodeMouseLeave = useCallback(() => {
    setHoveredEcu(null);
  }, [setHoveredEcu]);

  const flowClassName = [
    'bg-transparent homepage-architecture-flow',
    isSimulationRunning ? 'hp-simulation-active' : '',
    viewMode === 'network' ? 'hp-view-network' : '',
    guidedTourOpen ? 'hp-guided-tour-active' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="relative w-full h-full engineering-bg homepage-architecture hp-layout-root">
      <HomeArchitectureTitle />
      {!presentationMode && <HomepageInteractionToolbar />}
      <div className="hp-layout-body">
        {!presentationMode && <HomeLeftPanel />}
        <div className="hp-canvas-wrap">
          <div className="hp-vignette" aria-hidden />
          <HomepageEcuTooltip />
          <HomepageTracePanel />
          <HomepageClearFocus />
          <HomepageGuidedTour />
          <HomepagePresentationBar />
          {presentationMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/20 text-[10px] text-cyan-300/80 font-mono">
              Illustrative Vehicle E/E Topology
            </div>
          )}
          {!presentationMode && <HomeArchitecturePanel />}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseMove={onNodeMouseMove}
            onNodeMouseLeave={onNodeMouseLeave}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.05, maxZoom: 0.98 }}
            minZoom={0.35}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            className={flowClassName}
          >
            <HomepageFocusController />
            <ViewportPortal>
              <div className="hp-vehicle-layer">
                <HomeVehicleSilhouette />
              </div>
              <div className="hp-domain-labels-layer">
                <HomeDomainLabels />
              </div>
            </ViewportPortal>
            <Background color="rgba(0,212,255,0.02)" gap={48} size={1} />
            {!presentationMode && (
              <>
                <HomeDirectionPill />
                <Controls
                  position="bottom-left"
                  showInteractive={false}
                  className="hp-flow-controls !left-3 !bottom-14"
                />
                <HomeFitViewButton />
                <MiniMap
                  position="bottom-right"
                  className="hp-flow-minimap !bg-slate-950/90 !border-cyan-500/15 !bottom-3 !right-3"
                  nodeStrokeWidth={2}
                  nodeColor={(node) => {
                    const zone = getVehicleZone(node.id);
                    if (zone === 'front') return '#38bdf8';
                    if (zone === 'cabin') return '#a78bfa';
                    if (zone === 'powertrain') return '#fbbf24';
                    if (zone === 'chassis') return '#34d399';
                    return '#475569';
                  }}
                  maskColor="rgba(2, 6, 23, 0.78)"
                  pannable
                  zoomable
                />
              </>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
