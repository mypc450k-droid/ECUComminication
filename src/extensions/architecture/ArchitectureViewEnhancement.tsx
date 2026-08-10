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
import { VehicleWireframeMesh } from './VehicleWireframeMesh';
import {
  getVehicleLayoutPosition,
  getNodeVisualRole,
  getArchitectureTranslateExtent,
} from './vehicleZoneLayout';
import { buildZoneArchitectureEdges, getConnectedEcuIds } from './buildZoneEdges';
import { ArchitectureECUNode, type ArchitectureECUNodeData } from './ArchitectureECUNode';
import { ZoneBackboneEdge, ZonePeripheralEdge } from './ZoneArchitectureEdges';
import { ArchitectureCanvasControls, ZoneArchitectureLegend } from './ArchitectureCanvasControls';
import { ArchitectureNetworkLegend } from './ArchitectureNetworkLegend';
import { getCommActiveEdgeKeys, isCommEdgeActive } from './commEdgeHighlight';

const nodeTypes = { architectureEcu: ArchitectureECUNode };
const edgeTypes = {
  zoneBackbone: ZoneBackboneEdge,
  zonePeripheral: ZonePeripheralEdge,
};

const EMPTY_HIGHLIGHT: string[] = [];

export function ArchitectureViewEnhancement() {
  const selectedEcuId = useAppStore((s) => s.selectedEcuId);
  const highlightedIds = useAppStore((s) => s.highlightedIds);
  const communicationMessages = useAppStore((s) => s.communicationMessages);
  const selectEcu = useAppStore((s) => s.selectEcu);
  const setHighlightedIds = useAppStore((s) => s.setHighlightedIds);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const activeFlowStage = useAppStore((s) => s.activeFlowStage);
  const isSimulationRunning = useAppStore((s) => s.isSimulationRunning);

  const fitViewDone = useRef(false);

  const feature = selectedFeatureId ? getFeatureById(selectedFeatureId) : null;
  const activeEcuId =
    isSimulationRunning && feature
      ? feature.flowStages[activeFlowStage]?.ecuId
      : null;

  const focusId = selectedEcuId;
  const connectedIds = useMemo(
    () => (focusId ? getConnectedEcuIds(focusId, ecus) : EMPTY_HIGHLIGHT),
    [focusId]
  );

  const relevantIdKey = useMemo(() => {
    if (highlightedIds.length > 0) return highlightedIds.join('|');
    if (focusId) return connectedIds.join('|');
    return '';
  }, [highlightedIds, focusId, connectedIds]);

  const hasFocus = Boolean(focusId || highlightedIds.length > 0);

  const commActiveKeys = useMemo(
    () => getCommActiveEdgeKeys(communicationMessages),
    [communicationMessages]
  );

  const displayNodes = useMemo((): Node[] => {
    const relevantSet = new Set(
      highlightedIds.length > 0 ? highlightedIds : focusId ? connectedIds : []
    );
    return ecus.map((ecu) => {
      const isRelevant = !hasFocus || relevantSet.has(ecu.id);
      return {
        id: ecu.id,
        type: 'architectureEcu',
        position: getVehicleLayoutPosition(ecu),
        data: {
          ecu,
          selected: ecu.id === selectedEcuId,
          highlighted: highlightedIds.includes(ecu.id) || connectedIds.includes(ecu.id),
          activeInFlow: ecu.id === activeEcuId,
          dimmed: hasFocus && !isRelevant,
          visualRole: getNodeVisualRole(ecu.id),
        } satisfies ArchitectureECUNodeData,
      };
    });
  }, [
    selectedEcuId,
    highlightedIds,
    connectedIds,
    activeEcuId,
    hasFocus,
    relevantIdKey,
    focusId,
  ]);

  const displayEdges = useMemo((): Edge[] => {
    const relevantSet = new Set(
      highlightedIds.length > 0 ? highlightedIds : focusId ? connectedIds : []
    );
    const base = buildZoneArchitectureEdges(ecus);
    const stage = feature?.flowStages[activeFlowStage];
    const activeNetwork =
      isSimulationRunning &&
      stage &&
      (stage.type === 'can' || stage.type === 'lin' || stage.type === 'bus');

    return base.map((e) => {
      const src = e.source as string;
      const tgt = e.target as string;
      const isBackbone = e.type === 'zoneBackbone';
      const commActive = isCommEdgeActive(src, tgt, commActiveKeys);
      const simulationActive =
        activeNetwork && (src === activeEcuId || tgt === activeEcuId);
      const inFocus = !hasFocus || (relevantSet.has(src) && relevantSet.has(tgt));

      let opacity = isBackbone ? 0.5 : 0.42;
      if (hasFocus && !inFocus) opacity = 0.06;
      if (commActive || simulationActive) opacity = 0.95;

      return {
        ...e,
        data: {
          ...(e.data as object),
          active: commActive,
          simulationActive,
        },
        style: {
          ...e.style,
          opacity,
        },
      };
    });
  }, [
    commActiveKeys,
    isSimulationRunning,
    activeEcuId,
    activeFlowStage,
    feature,
    hasFocus,
    relevantIdKey,
    highlightedIds,
    focusId,
    connectedIds,
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
        instance.fitView({ padding: 0.16, duration: 0, minZoom: 0.48, maxZoom: 1.1 });
      });
    }
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectEcu(node.id);
    },
    [selectEcu]
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectEcu(node.id);
      setHighlightedIds(getConnectedEcuIds(node.id, ecus));
    },
    [selectEcu, setHighlightedIds]
  );

  return (
    <div className="relative w-full h-full vv-zone-architecture overflow-hidden">
      <VehicleWireframeMesh />
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
        className="bg-transparent z-[1]"
      >
        <Background color="rgba(255,255,255,0.02)" gap={32} size={1} />
        <ArchitectureCanvasControls />
      </ReactFlow>
      <ArchitectureNetworkLegend />
      <ZoneArchitectureLegend />
    </div>
  );
}
