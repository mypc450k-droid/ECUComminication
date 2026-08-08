'use client';

import { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAppStore } from '@/lib/store';
import { ecus, getFeatureById } from '@/lib/data';
import { ECUNode, type ECUNodeData } from '@/components/ECUNode';
import { NetworkLegend } from '@/components/NetworkLegend';
import { useExtensionStore } from '../store/extensionStore';
import { VehicleSilhouette } from './VehicleSilhouette';
import { getVehicleLayoutPosition } from './vehicleZoneLayout';
import { buildPartnerEdges, getConnectedEcuIds } from './buildPartnerEdges';

const nodeTypes = { ecuNode: ECUNode };
const EMPTY_CONNECTED_IDS: string[] = [];

export function ArchitectureViewEnhancement() {
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
    if (isSimulationRunning && feature) {
      const stage = feature.flowStages[activeFlowStage];
      const activeNetwork = stage?.type === 'can' || stage?.type === 'lin' || stage?.type === 'bus';
      const relevantSet = new Set(relevantIdList);

      setEdges((eds) =>
        eds.map((e) => {
          const isActive =
            activeNetwork &&
            (e.source === activeEcuId || e.target === activeEcuId);
          return {
            ...e,
            animated: isActive,
            style: {
              ...e.style,
              strokeWidth: isActive ? 2.5 : (e.style?.strokeWidth as number) ?? 1.2,
              opacity: isActive ? 0.9 : hasFocus
                ? (relevantSet.has(e.source as string) && relevantSet.has(e.target as string) ? 0.5 : 0.08)
                : 0.35,
            },
          };
        })
      );
    } else {
      const relevantSet = new Set(relevantIdList);
      setEdges(
        buildPartnerEdges(ecus).map((e) => ({
          ...e,
          style: {
            ...e.style,
            opacity: hasFocus
              ? relevantSet.has(e.source) && relevantSet.has(e.target) ? 0.55 : 0.06
              : 0.35,
          },
        }))
      );
    }
  }, [activeFlowStage, isSimulationRunning, activeEcuId, feature, setEdges, hasFocus, relevantIdKey]);

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
      const connected = getConnectedEcuIds(node.id, ecus);
      setHighlightedIds(connected);
    },
    [selectEcu, setEcuFocusId, setHighlightedIds]
  );

  return (
    <div className="relative w-full h-full engineering-bg">
      <VehicleSilhouette />
      {presentationMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/20 text-[10px] text-cyan-300/80 font-mono">
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
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.35}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background color="rgba(0,212,255,0.03)" gap={40} size={1} />
        {!presentationMode && (
          <>
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap
              position="bottom-right"
              className="!bg-slate-900/80 !border-cyan-500/10"
              nodeColor={() => '#1e293b'}
              maskColor="rgba(0,0,0,0.6)"
            />
          </>
        )}
      </ReactFlow>
      <NetworkLegend />
    </div>
  );
}
