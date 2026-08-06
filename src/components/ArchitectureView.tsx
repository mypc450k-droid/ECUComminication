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
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAppStore } from '@/lib/store';
import { ecus, networks, getFeatureById } from '@/lib/data';
import { ECUNode, type ECUNodeData } from './ECUNode';
import { NetworkLegend } from './NetworkLegend';

const nodeTypes = { ecuNode: ECUNode };

const networkColors: Record<string, string> = {
  CAN_HS: '#00D4FF',
  CAN_LS: '#4A9EFF',
  LIN: '#7B68EE',
  Ethernet: '#00FF88',
  FlexRay: '#FF6B35',
};

function buildEdges(): Edge[] {
  const edges: Edge[] = [];
  const edgeSet = new Set<string>();

  networks.forEach((network) => {
    const members = network.ecuIds;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const source = members[i];
        const target = members[j];
        const key = `${source}-${target}-${network.type}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({
            id: key,
            source,
            target,
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: networkColors[network.type] || '#64748b',
              strokeWidth: 1,
              opacity: 0.3,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: networkColors[network.type] || '#64748b',
              width: 12,
              height: 12,
            },
            data: { networkType: network.type },
          });
        }
      }
    }
  });

  return edges;
}

export function ArchitectureView() {
  const selectedEcuId = useAppStore((s) => s.selectedEcuId);
  const highlightedIds = useAppStore((s) => s.highlightedIds);
  const selectEcu = useAppStore((s) => s.selectEcu);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const activeFlowStage = useAppStore((s) => s.activeFlowStage);
  const isSimulationRunning = useAppStore((s) => s.isSimulationRunning);
  const feature = selectedFeatureId ? getFeatureById(selectedFeatureId) : null;
  const activeEcuId = isSimulationRunning && feature
    ? feature.flowStages[activeFlowStage]?.ecuId
    : null;

  const initialNodes: Node[] = useMemo(
    () =>
      ecus.map((ecu) => ({
        id: ecu.id,
        type: 'ecuNode',
        position: { x: ecu.position.x, y: ecu.position.y },
        data: {
          ecu,
          selected: ecu.id === selectedEcuId,
          highlighted: highlightedIds.includes(ecu.id),
          activeInFlow: ecu.id === activeEcuId,
        } satisfies ECUNodeData,
      })),
    [selectedEcuId, highlightedIds, activeEcuId]
  );

  const initialEdges = useMemo(() => buildEdges(), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(
      ecus.map((ecu) => ({
        id: ecu.id,
        type: 'ecuNode',
        position: { x: ecu.position.x, y: ecu.position.y },
        data: {
          ecu,
          selected: ecu.id === selectedEcuId,
          highlighted: highlightedIds.includes(ecu.id),
          activeInFlow: ecu.id === activeEcuId,
        } satisfies ECUNodeData,
      }))
    );
  }, [selectedEcuId, highlightedIds, activeEcuId, setNodes]);

  useEffect(() => {
    if (isSimulationRunning && feature) {
      const stage = feature.flowStages[activeFlowStage];
      const activeNetwork = stage?.type === 'can' || stage?.type === 'lin' || stage?.type === 'bus';

      setEdges((eds) =>
        eds.map((e) => {
          const isActive =
            activeNetwork &&
            (e.source === activeEcuId || e.target === activeEcuId);
          return {
            ...e,
            animated: isActive || e.animated,
            style: {
              ...e.style,
              strokeWidth: isActive ? 2.5 : 1,
              opacity: isActive ? 0.9 : 0.3,
            },
          };
        })
      );
    } else {
      setEdges(buildEdges());
    }
  }, [activeFlowStage, isSimulationRunning, activeEcuId, feature, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectEcu(node.id);
    },
    [selectEcu]
  );

  return (
    <div className="relative w-full h-full engineering-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background color="rgba(0,212,255,0.04)" gap={40} size={1} />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          className="!bg-slate-900/80 !border-cyan-500/10"
          nodeColor={() => '#1e293b'}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
      <NetworkLegend />
    </div>
  );
}
