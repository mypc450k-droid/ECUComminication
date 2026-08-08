'use client';

import { useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAppStore } from '@/lib/store';
import { ecus, getFeatureById } from '@/lib/data';
import { useExtensionStore } from '../store/extensionStore';
import { VehicleSilhouette } from './VehicleSilhouette';
import { getVehicleLayoutPosition, getArchitectureTranslateExtent } from './vehicleZoneLayout';
import { buildPartnerEdges, getConnectedEcuIds } from './buildPartnerEdges';
import { ArchitectureECUNode, type ArchitectureECUNodeData } from './ArchitectureECUNode';
import { ArchitectureAnimatedEdge } from './ArchitectureAnimatedEdge';
import { ArchitectureCanvasControls } from './ArchitectureCanvasControls';
import { ArchitectureNetworkLegend } from './ArchitectureNetworkLegend';
import { getCommActiveEdgeKeys, isCommEdgeActive } from './commEdgeHighlight';

const nodeTypes = { architectureEcu: ArchitectureECUNode };
const edgeTypes = { architecture: ArchitectureAnimatedEdge };
const EMPTY_CONNECTED_IDS: string[] = [];

export function ArchitectureViewEnhancement() {
  const selectedEcuId = useAppStore((s) => s.selectedEcuId);
  const highlightedIds = useAppStore((s) => s.highlightedIds);
  const communicationMessages = useAppStore((s) => s.communicationMessages);
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

  const fitViewDone = useRef(false);

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
    return highlightedIds;
  }, [traceSignalMode, tracedSignalPath, focusEcuId, connectedIds, highlightedIds]);

  const relevantIdKey = relevantIdList.join('|');
  const hasFocus = Boolean(focusEcuId || traceSignalMode || highlightedIds.length > 0);

  const commActiveKeys = useMemo(
    () => getCommActiveEdgeKeys(communicationMessages),
    [communicationMessages]
  );

  const displayNodes = useMemo((): Node[] => {
    const relevantSet = new Set(relevantIdList);
    return ecus.map((ecu) => {
      const isRelevant = !hasFocus || relevantSet.has(ecu.id);
      const isSelected = ecu.id === selectedEcuId || ecu.id === ecuFocusId;
      return {
        id: ecu.id,
        type: 'architectureEcu',
        position: getVehicleLayoutPosition(ecu),
        data: {
          ecu,
          selected: isSelected,
          highlighted: highlightedIds.includes(ecu.id) || connectedIds.includes(ecu.id),
          activeInFlow: ecu.id === activeEcuId,
          dimmed: hasFocus && !isRelevant,
        } satisfies ArchitectureECUNodeData,
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

  const displayEdges = useMemo((): Edge[] => {
    const relevantSet = new Set(relevantIdList);
    const base = buildPartnerEdges(ecus);

    const stage = feature?.flowStages[activeFlowStage];
    const activeNetwork = isSimulationRunning && stage
      && (stage.type === 'can' || stage.type === 'lin' || stage.type === 'bus');

    return base.map((e) => {
      const src = e.source as string;
      const tgt = e.target as string;
      const commActive = isCommEdgeActive(src, tgt, commActiveKeys);
      const simulationActive =
        activeNetwork && (src === activeEcuId || tgt === activeEcuId);
      const inFocus =
        !hasFocus || (relevantSet.has(src) && relevantSet.has(tgt));

      let opacity = 0.42;
      if (hasFocus) {
        opacity = inFocus ? 0.55 : 0.06;
      }
      if (commActive || simulationActive) {
        opacity = 0.92;
      }

      return {
        ...e,
        type: 'architecture',
        data: {
          ...(e.data as object),
          active: commActive,
          simulationActive,
        },
        style: {
          ...e.style,
          strokeWidth: commActive || simulationActive ? 2 : 1.25,
          opacity,
        },
      };
    });
  }, [
    relevantIdKey,
    hasFocus,
    commActiveKeys,
    isSimulationRunning,
    activeEcuId,
    activeFlowStage,
    feature,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(displayNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(displayEdges);

  useEffect(() => {
    setNodes(displayNodes);
  }, [displayNodes, setNodes]);

  useEffect(() => {
    setEdges(displayEdges);
  }, [displayEdges, setEdges]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    if (!fitViewDone.current) {
      fitViewDone.current = true;
      requestAnimationFrame(() => {
        instance.fitView({ padding: 0.18, duration: 0, minZoom: 0.5, maxZoom: 1.1 });
      });
    }
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectEcu(node.id);
      setEcuFocusId(null);
    },
    [selectEcu, setEcuFocusId]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectEcu(node.id);
      setEcuFocusId(node.id);
      setHighlightedIds(getConnectedEcuIds(node.id, ecus));
    },
    [selectEcu, setEcuFocusId, setHighlightedIds]
  );

  return (
    <div className="relative w-full h-full engineering-bg vv-architecture-workspace overflow-hidden">
      <VehicleSilhouette />
      {presentationMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-900/85 border border-cyan-500/20 text-[10px] text-cyan-300/80 font-mono">
          Illustrative Vehicle E/E Topology
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.35}
        maxZoom={2.5}
        panOnScroll
        zoomOnScroll
        panOnDrag
        selectionOnDrag={false}
        translateExtent={getArchitectureTranslateExtent()}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background color="rgba(0,212,255,0.025)" gap={32} size={1} />
        {!presentationMode && <ArchitectureCanvasControls showMinimap />}
      </ReactFlow>
      {!presentationMode && <ArchitectureNetworkLegend />}
    </div>
  );
}
