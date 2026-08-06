import { create } from 'zustand';
import type { AppState, CommunicationMessage, ViewMode } from '@/types';
import type {
  LearningMode,
  FeatureTab,
  PlaybackSpeed,
  SimulationEngineState,
} from '@/types/simulation';
import { communicationPool } from '@/data/communications.json';
import { getSimulationFeature } from './simulation-loader';
import { generateMessageId, formatTimestamp } from './utils';

interface StoreActions {
  selectEcu: (id: string | null) => void;
  selectFeature: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setHighlightedIds: (ids: string[]) => void;
  toggleSidebarExpand: (id: string) => void;
  addCommunicationMessage: (msg: Omit<CommunicationMessage, 'id' | 'timestamp'>) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  setActiveFlowStage: (stage: number) => void;
  selectAutosarLayer: (id: string | null) => void;
  toggleBottomPanel: () => void;
  tickCommunications: () => void;
  // Simulation engine actions
  nextStep: () => void;
  prevStep: () => void;
  playSimulation: () => void;
  pauseSimulation: () => void;
  restartSimulation: () => void;
  skipToEnd: () => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setLearningMode: (mode: LearningMode) => void;
  setFeatureTab: (tab: FeatureTab) => void;
  openExplainWhy: (key: string) => void;
  closeExplainWhy: () => void;
  openShowMeMore: (key: string) => void;
  closeShowMeMore: () => void;
  setActiveFailureId: (id: string | null) => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  resetCanvas: () => void;
}

const initialSimulationState: SimulationEngineState = {
  currentStepIndex: -1,
  simulationPaused: true,
  simulationAutoPlay: false,
  playbackSpeed: 1,
  learningMode: 'intermediate',
  featureTab: 'simulation',
  explainWhyKey: null,
  showMeMoreKey: null,
  activeFailureId: null,
  canvasZoom: 1,
  canvasPan: { x: 0, y: 0 },
  showGrid: true,
  snapToGrid: true,
};

const initialState: AppState = {
  selectedEcuId: null,
  selectedFeatureId: null,
  viewMode: 'architecture',
  searchQuery: '',
  highlightedIds: [],
  expandedSidebar: ['vehicle', 'body', 'powertrain'],
  communicationMessages: [],
  isSimulationRunning: false,
  activeFlowStage: -1,
  selectedAutosarLayerId: null,
  bottomPanelExpanded: true,
};

let simInterval: ReturnType<typeof setInterval> | null = null;
let commInterval: ReturnType<typeof setInterval> | null = null;
let poolIndex = 0;

function getStepCount(featureId: string | null): number {
  if (!featureId) return 0;
  const sim = getSimulationFeature(featureId);
  return sim?.steps.length ?? 0;
}

function clearSimInterval() {
  if (simInterval) clearInterval(simInterval);
  simInterval = null;
}

function startAutoPlayInterval(get: () => AppState & SimulationEngineState & StoreActions, set: (partial: Partial<AppState & SimulationEngineState>) => void) {
  clearSimInterval();
  const { playbackSpeed, selectedFeatureId } = get();
  const stepCount = getStepCount(selectedFeatureId);
  if (stepCount === 0) return;

  const baseMs = 1200;
  const intervalMs = baseMs / playbackSpeed;

  simInterval = setInterval(() => {
    const state = get();
    if (state.simulationPaused || !state.selectedFeatureId) return;

    const count = getStepCount(state.selectedFeatureId);
    const next = state.currentStepIndex + 1;
    if (next >= count) {
      set({
        currentStepIndex: 0,
        activeFlowStage: 0,
      });
    } else {
      set({
        currentStepIndex: next,
        activeFlowStage: next,
        isSimulationRunning: true,
      });
    }
  }, intervalMs);
}

export const useAppStore = create<AppState & SimulationEngineState & StoreActions>((set, get) => ({
  ...initialState,
  ...initialSimulationState,

  selectEcu: (id) =>
    set({
      selectedEcuId: id,
      viewMode: id ? 'architecture' : get().viewMode,
      selectedFeatureId: null,
    }),

  selectFeature: (id) =>
    set({
      selectedFeatureId: id,
      viewMode: id ? 'feature' : 'architecture',
      selectedEcuId: null,
      activeFlowStage: -1,
      currentStepIndex: -1,
      simulationPaused: true,
      simulationAutoPlay: false,
      isSimulationRunning: false,
      featureTab: 'simulation',
      activeFailureId: null,
    }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setHighlightedIds: (ids) => set({ highlightedIds: ids }),

  toggleSidebarExpand: (id) => {
    const expanded = get().expandedSidebar;
    set({
      expandedSidebar: expanded.includes(id)
        ? expanded.filter((e) => e !== id)
        : [...expanded, id],
    });
  },

  addCommunicationMessage: (msg) =>
    set((state) => ({
      communicationMessages: [
        {
          ...msg,
          id: generateMessageId(),
          timestamp: formatTimestamp(),
        },
        ...state.communicationMessages.slice(0, 49),
      ],
    })),

  startSimulation: () => {
    const { selectedFeatureId } = get();
    if (!selectedFeatureId) return;
    set({
      isSimulationRunning: true,
      activeFlowStage: 0,
      currentStepIndex: 0,
      simulationPaused: false,
      simulationAutoPlay: true,
    });
    startAutoPlayInterval(get, set);
  },

  stopSimulation: () => {
    clearSimInterval();
    set({
      isSimulationRunning: false,
      activeFlowStage: -1,
      currentStepIndex: -1,
      simulationPaused: true,
      simulationAutoPlay: false,
    });
  },

  setActiveFlowStage: (stage) =>
    set({ activeFlowStage: stage, currentStepIndex: stage }),

  selectAutosarLayer: (id) =>
    set({
      selectedAutosarLayerId: id,
      viewMode: 'autosar',
    }),

  toggleBottomPanel: () =>
    set((s) => ({ bottomPanelExpanded: !s.bottomPanelExpanded })),

  tickCommunications: () => {
    const pool = communicationPool as Omit<CommunicationMessage, 'id' | 'timestamp'>[];
    const msg = pool[poolIndex % pool.length];
    poolIndex++;
    get().addCommunicationMessage(msg);
  },

  nextStep: () => {
    const { selectedFeatureId, currentStepIndex } = get();
    const count = getStepCount(selectedFeatureId);
    if (count === 0) return;
    const next = Math.min(currentStepIndex + 1, count - 1);
    set({
      currentStepIndex: next,
      activeFlowStage: next,
      isSimulationRunning: next >= 0,
    });
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    const prev = Math.max(currentStepIndex - 1, 0);
    set({
      currentStepIndex: prev,
      activeFlowStage: prev,
      isSimulationRunning: prev >= 0,
    });
  },

  playSimulation: () => {
    const { selectedFeatureId, currentStepIndex } = get();
    if (!selectedFeatureId) return;
    const idx = currentStepIndex < 0 ? 0 : currentStepIndex;
    set({
      simulationPaused: false,
      simulationAutoPlay: true,
      isSimulationRunning: true,
      currentStepIndex: idx,
      activeFlowStage: idx,
    });
    startAutoPlayInterval(get, set);
  },

  pauseSimulation: () => {
    clearSimInterval();
    set({ simulationPaused: true, simulationAutoPlay: false });
  },

  restartSimulation: () => {
    clearSimInterval();
    set({
      currentStepIndex: 0,
      activeFlowStage: 0,
      isSimulationRunning: true,
      simulationPaused: false,
      simulationAutoPlay: false,
    });
  },

  skipToEnd: () => {
    clearSimInterval();
    const { selectedFeatureId } = get();
    const count = getStepCount(selectedFeatureId);
    if (count === 0) return;
    set({
      currentStepIndex: count - 1,
      activeFlowStage: count - 1,
      isSimulationRunning: true,
      simulationPaused: true,
      simulationAutoPlay: false,
    });
  },

  setPlaybackSpeed: (speed) => {
    set({ playbackSpeed: speed });
    const { simulationAutoPlay, simulationPaused } = get();
    if (simulationAutoPlay && !simulationPaused) {
      startAutoPlayInterval(get, set);
    }
  },

  setLearningMode: (mode) => set({ learningMode: mode }),

  setFeatureTab: (tab) => set({ featureTab: tab }),

  openExplainWhy: (key) => set({ explainWhyKey: key }),

  closeExplainWhy: () => set({ explainWhyKey: null }),

  openShowMeMore: (key) => set({ showMeMoreKey: key }),

  closeShowMeMore: () => set({ showMeMoreKey: null }),

  setActiveFailureId: (id) => set({ activeFailureId: id }),

  setCanvasZoom: (zoom) => set({ canvasZoom: Math.max(0.3, Math.min(3, zoom)) }),

  setCanvasPan: (pan) => set({ canvasPan: pan }),

  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),

  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  resetCanvas: () => set({ canvasZoom: 1, canvasPan: { x: 0, y: 0 } }),
}));

export function startCommunicationTicker() {
  if (commInterval) return;
  commInterval = setInterval(() => {
    useAppStore.getState().tickCommunications();
  }, 2200);
}

export function stopCommunicationTicker() {
  if (commInterval) clearInterval(commInterval);
  commInterval = null;
}
