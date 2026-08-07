import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PanelLayoutState,
  SimulationHistoryEntry,
  CommMonitorFilters,
  PacketInspectorData,
  CommViewMode,
  ExtendedPlaybackSpeed,
  StepInspectorState,
  CanvasViewMode,
  EcuCanvasPosition,
  SignalPanelLayout,
} from '../types';

interface ExtensionState {
  panelLayout: PanelLayoutState;
  simulationHistory: SimulationHistoryEntry[];
  historyBookmarks: number[];
  commMonitorPaused: boolean;
  commFilters: CommMonitorFilters;
  commViewMode: CommViewMode;
  selectedPacket: PacketInspectorData | null;
  packetInspectorOpen: boolean;
  extendedPlaybackSpeed: ExtendedPlaybackSpeed;
  stepInspector: StepInspectorState;
  failureSimStep: number;
  failureSimRunning: boolean;
  failureSimAuto: boolean;
  signalEvolutionOpen: boolean;
  canvasZoomSlider: number;
  canvasViewMode: CanvasViewMode;
  ecuCanvasPositions: Record<string, Record<string, EcuCanvasPosition>>;
  signalPanelLayout: SignalPanelLayout;
}

interface ExtensionActions {
  setPanelSize: (key: keyof PanelLayoutState, value: number | boolean) => void;
  togglePanelCollapse: (panel: 'sidebar' | 'inspector' | 'stepPanel' | 'commMonitor') => void;
  togglePanelMaximize: (panel: 'sidebar' | 'inspector') => void;
  addHistoryEntry: (entry: Omit<SimulationHistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  addBookmark: (stepIndex: number) => void;
  setCommPaused: (paused: boolean) => void;
  setCommFilters: (filters: Partial<CommMonitorFilters>) => void;
  setCommViewMode: (mode: CommViewMode) => void;
  openPacketInspector: (packet: PacketInspectorData) => void;
  closePacketInspector: () => void;
  setExtendedPlaybackSpeed: (speed: ExtendedPlaybackSpeed) => void;
  setStepInspector: (state: Partial<StepInspectorState>) => void;
  setFailureSimStep: (step: number) => void;
  setFailureSimRunning: (running: boolean) => void;
  setFailureSimAuto: (auto: boolean) => void;
  toggleSignalEvolution: () => void;
  setCanvasZoomSlider: (zoom: number) => void;
  setCanvasViewMode: (mode: CanvasViewMode) => void;
  setEcuPosition: (featureId: string, ecuId: string, pos: EcuCanvasPosition) => void;
  resetEcuPositions: (featureId: string) => void;
  setSignalPanelLayout: (layout: Partial<SignalPanelLayout>) => void;
  exportHistoryJson: () => string;
  exportHistoryCsv: () => string;
}

const defaultPanelLayout: PanelLayoutState = {
  sidebarWidth: 14,
  inspectorWidth: 18,
  stepPanelWidth: 28,
  commMonitorHeight: 22,
  sidebarCollapsed: false,
  inspectorCollapsed: false,
  stepPanelCollapsed: false,
  commMonitorCollapsed: false,
  sidebarMaximized: false,
  inspectorMaximized: false,
};

export const useExtensionStore = create<ExtensionState & ExtensionActions>()(
  persist(
    (set, get) => ({
      panelLayout: defaultPanelLayout,
      simulationHistory: [],
      historyBookmarks: [],
      commMonitorPaused: false,
      commFilters: { network: '', source: '', destination: '', signal: '', search: '' },
      commViewMode: 'decoded',
      selectedPacket: null,
      packetInspectorOpen: false,
      extendedPlaybackSpeed: 1,
      stepInspector: {
        maximized: false,
        minimized: false,
        pinned: false,
        detached: false,
        detachedPosition: { x: 0, y: 0 },
        detachedSize: { width: 480, height: 520 },
      },
      failureSimStep: 0,
      failureSimRunning: false,
      failureSimAuto: false,
      signalEvolutionOpen: true,
      canvasZoomSlider: 100,
      canvasViewMode: 'both',
      ecuCanvasPositions: {},
      signalPanelLayout: { x: 0, y: 0, width: 440, height: 260, collapsed: false },

      setPanelSize: (key, value) =>
        set((s) => ({ panelLayout: { ...s.panelLayout, [key]: value } })),

      togglePanelCollapse: (panel) => {
        const key = `${panel}Collapsed` as keyof PanelLayoutState;
        set((s) => ({
          panelLayout: { ...s.panelLayout, [key]: !s.panelLayout[key] },
        }));
      },

      togglePanelMaximize: (panel) => {
        const key = `${panel}Maximized` as keyof PanelLayoutState;
        set((s) => ({
          panelLayout: { ...s.panelLayout, [key]: !s.panelLayout[key] },
        }));
      },

      addHistoryEntry: (entry) =>
        set((s) => ({
          simulationHistory: [
            {
              ...entry,
              id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: Date.now(),
            },
            ...s.simulationHistory.slice(0, 199),
          ],
        })),

      clearHistory: () => set({ simulationHistory: [], historyBookmarks: [] }),

      addBookmark: (stepIndex) =>
        set((s) => ({
          historyBookmarks: s.historyBookmarks.includes(stepIndex)
            ? s.historyBookmarks
            : [...s.historyBookmarks, stepIndex],
        })),

      setCommPaused: (paused) => set({ commMonitorPaused: paused }),

      setCommFilters: (filters) =>
        set((s) => ({ commFilters: { ...s.commFilters, ...filters } })),

      setCommViewMode: (mode) => set({ commViewMode: mode }),

      openPacketInspector: (packet) =>
        set({ selectedPacket: packet, packetInspectorOpen: true }),

      closePacketInspector: () =>
        set({ packetInspectorOpen: false }),

      setExtendedPlaybackSpeed: (speed) => set({ extendedPlaybackSpeed: speed }),

      setStepInspector: (state) =>
        set((s) => ({ stepInspector: { ...s.stepInspector, ...state } })),

      setFailureSimStep: (step) => set({ failureSimStep: step }),

      setFailureSimRunning: (running) => set({ failureSimRunning: running }),

      setFailureSimAuto: (auto) => set({ failureSimAuto: auto }),

      toggleSignalEvolution: () =>
        set((s) => ({ signalEvolutionOpen: !s.signalEvolutionOpen })),

      setCanvasZoomSlider: (zoom) => set({ canvasZoomSlider: zoom }),

      setCanvasViewMode: (mode) => set({ canvasViewMode: mode }),

      setEcuPosition: (featureId, ecuId, pos) =>
        set((s) => ({
          ecuCanvasPositions: {
            ...s.ecuCanvasPositions,
            [featureId]: { ...s.ecuCanvasPositions[featureId], [ecuId]: pos },
          },
        })),

      resetEcuPositions: (featureId) =>
        set((s) => ({
          ecuCanvasPositions: { ...s.ecuCanvasPositions, [featureId]: {} },
        })),

      setSignalPanelLayout: (layout) =>
        set((s) => ({ signalPanelLayout: { ...s.signalPanelLayout, ...layout } })),

      exportHistoryJson: () => JSON.stringify(get().simulationHistory, null, 2),

      exportHistoryCsv: () => {
        const rows = get().simulationHistory;
        const header = 'timestamp,step,title,signal,sender,receiver,network,durationMs';
        const body = rows.map((r) =>
          `${r.timestamp},${r.stepIndex},"${r.stepTitle}","${r.signal || ''}","${r.sender || ''}","${r.receiver || ''}","${r.network || ''}",${r.durationMs}`
        ).join('\n');
        return `${header}\n${body}`;
      },
    }),
    {
      name: 'vehicleverse-panel-layout',
      partialize: (state) => ({
        panelLayout: state.panelLayout,
        ecuCanvasPositions: state.ecuCanvasPositions,
        canvasViewMode: state.canvasViewMode,
        signalPanelLayout: state.signalPanelLayout,
        stepInspector: state.stepInspector,
      }),
    }
  )
);
