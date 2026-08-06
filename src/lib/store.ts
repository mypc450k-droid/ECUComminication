import { create } from 'zustand';
import type { AppState, CommunicationMessage, ViewMode } from '@/types';
import { communicationPool } from '@/data/communications.json';
import { features } from './data';
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
}

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

export const useAppStore = create<AppState & StoreActions>((set, get) => ({
  ...initialState,

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

    set({ isSimulationRunning: true, activeFlowStage: 0 });

    if (simInterval) clearInterval(simInterval);

    simInterval = setInterval(() => {
      const { activeFlowStage, isSimulationRunning, selectedFeatureId: fid } = get();
      if (!isSimulationRunning || !fid) return;

      const feature = features.find((f) => f.id === fid);
      if (!feature) return;

      const next = activeFlowStage + 1;
      if (next >= feature.flowStages.length) {
        set({ activeFlowStage: 0 });
      } else {
        set({ activeFlowStage: next });
      }
    }, 1200);
  },

  stopSimulation: () => {
    if (simInterval) clearInterval(simInterval);
    simInterval = null;
    set({ isSimulationRunning: false, activeFlowStage: -1 });
  },

  setActiveFlowStage: (stage) => set({ activeFlowStage: stage }),

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
