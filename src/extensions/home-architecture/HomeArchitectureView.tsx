'use client';

import { useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  type Node as FlowNode,
  type Edge as FlowEdge,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAppStore } from '@/lib/store';
import { ecus, getFeatureById } from '@/lib/data';
import { VehicleOutline } from './VehicleOutline';
import { getHomeEcuPosition, getHomeTranslateExtent } from './homeLayout';
import { buildHomeEdges } from './homeEdges';
import { HomeECUNode, type HomeECUNodeData } from './HomeECUNode';
import { HomeTrunkEdge, HomeLinkEdge } from './HomeArchitectureEdge';
import { HomeCanvasControls } from './HomeCanvasControls';
import { HomeNetworkLegend } from './HomeNetworkLegend';
import { getRecentCommEdgeKeys, isCommEdgePair } from './commHighlight';

const nodeTypes = { homeEcu: HomeECUNode };
const edgeTypes = { homeTrunk: HomeTrunkEdge, homeLink: HomeLinkEdge };

/**
 * Homepage-only architecture view.
 * Same behaviour as ArchitectureView — visual layer isolated here.
 */
export function HomeArchitectureView() {
  const selectedEcuId = useAppStore((s) => s.selectedEcuId);
  const highlightedIds = useAppStore((s) => s.highlightedIds);
  const communicationMessages = useAppStore((s) => s.communicationMessages);
  const selectEcu = useAppStore((s) => s.selectEcu);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const activeFlowStage = useAppStore((s) => s.activeFlowStage);
  const isSimulationRunning = useAppStore((s) => s.isSimulationRunning);

  const fitOnce = useRef(false);

  const feature = selectedFeatureId ? getFeatureById(selectedFeatureId) : null;
  const activeEcuId =
    isSimulationRunning && feature ? feature.flowStages[activeFlowStage]?.ecuId : null;

  const commEdgeKeys = useMemo(
    () => getRecentCommEdgeKeys(communicationMessages),
    [communicationMessages]
  );

  const displayNodes = useMemo((): FlowNode[] => {
    return ecus.map((ecu) => ({
      id: ecu.id,
      type: 'homeEcu',
      position: getHomeEcuPosition(ecu),
      data: {
        ecu,
        selected: ecu.id === selectedEcuId,
        highlighted: highlightedIds.includes(ecu.id),
        activeInFlow: ecu.id === activeEcuId,
      } satisfies HomeECUNodeData,
    }));
  }, [selectedEcuId, highlightedIds, activeEcuId]);

  const displayEdges = useMemo((): FlowEdge[] => {
    const base = buildHomeEdges(ecus);
    const stage = feature?.flowStages[activeFlowStage];
    const activeNetwork =
      isSimulationRunning &&
      stage &&
      (stage.type === 'can' || stage.type === 'lin' || stage.type === 'bus');

    return base.map((e) => {
      const src = e.source as string;
      const tgt = e.target as string;
      const simulationActive =
        activeNetwork && (src === activeEcuId || tgt === activeEcuId);
      const commActive = isCommEdgePair(src, tgt, commEdgeKeys);
      const pulse = simulationActive || commActive;

      return {
        ...e,
        data: {
          ...(e.data as object),
          active: commActive,
          simulationActive,
        },
        style: {
          ...e.style,
          strokeWidth: pulse ? 2.2 : (e.style?.strokeWidth as number),
          opacity: pulse ? 0.92 : (e.style?.opacity as number),
        },
      };
    });
  }, [
    isSimulationRunning,
    activeFlowStage,
    activeEcuId,
    feature,
    commEdgeKeys,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(displayNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(displayEdges);

  useEffect(() => {
    setNodes(displayNodes);
  }, [displayNodes, setNodes]);

  useEffect(() => {
    setEdges(displayEdges);
  }, [displayEdges, setEdges]);

  const onInit = useCallback((instance: ReactFlowInstance<FlowNode, FlowEdge>) => {
    if (!fitOnce.current) {
      fitOnce.current = true;
      requestAnimationFrame(() => {
        instance.fitView({ padding: 0.18, duration: 0, minZoom: 0.5, maxZoom: 1.1 });
      });
    }
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      selectEcu(node.id);
    },
    [selectEcu]
  );

  return (
    <div className="relative w-full h-full vv-home-architecture overflow-hidden">
      <VehicleOutline />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.35}
        maxZoom={2.5}
        panOnScroll
        zoomOnScroll
        panOnDrag
        selectionOnDrag={false}
        translateExtent={getHomeTranslateExtent()}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent z-[1]"
      >
        <Background color="rgba(0,212,255,0.025)" gap={36} size={1} />
        <HomeCanvasControls />
      </ReactFlow>
      <HomeNetworkLegend />
    </div>
  );
}
