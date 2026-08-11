'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ECU } from '@/types';
import { ecus } from '@/lib/data';
import { getConnectedEcuIds } from '@/extensions/architecture/buildPartnerEdges';
import {
  type DomainFilterKey,
  type NetworkFilterKey,
  getEcuIdsForDomainFilter,
  getEcuIdsForNetworkFilter,
} from './homepageDomainFilters';
import { findCommunicationPath } from './homepageGraphUtils';
import { GUIDED_TOUR_STEPS } from './homepageGuidedTour';

export type HomepageViewMode = 'architecture' | 'network';

type TracePick = 'source' | 'destination' | null;

interface TooltipState {
  ecuId: string;
  x: number;
  y: number;
}

interface HomepageInteractionContextValue {
  hoveredEcuId: string | null;
  clickFocusId: string | null;
  traceActive: boolean;
  tracePick: TracePick;
  traceSourceId: string | null;
  traceDestId: string | null;
  tracePathIds: string[];
  domainFilter: DomainFilterKey;
  networkFilter: NetworkFilterKey;
  viewMode: HomepageViewMode;
  guidedTourOpen: boolean;
  guidedTourStep: number;
  tooltip: TooltipState | null;
  interactionRelevantIds: string[];
  interactionRelevantKey: string;
  hasInteractionFilter: boolean;
  setHoveredEcu: (id: string | null) => void;
  setTooltip: (tooltip: TooltipState | null) => void;
  setClickFocus: (id: string | null) => void;
  clearClickFocus: () => void;
  startTrace: () => void;
  exitTrace: () => void;
  handleTraceNodeClick: (ecuId: string) => boolean;
  setDomainFilter: (filter: DomainFilterKey) => void;
  setNetworkFilter: (filter: NetworkFilterKey) => void;
  setViewMode: (mode: HomepageViewMode) => void;
  setNetworkFilterFromLegend: (type: NetworkFilterKey) => void;
  openGuidedTour: () => void;
  closeGuidedTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  currentTourStep: typeof GUIDED_TOUR_STEPS[number] | null;
}

const HomepageInteractionContext = createContext<HomepageInteractionContextValue | null>(null);

const EMPTY_IDS: string[] = [];

function intersectSets(a: string[], b: string[]): string[] {
  if (a.length === 0) return b;
  if (b.length === 0) return a;
  const setB = new Set(b);
  return a.filter((id) => setB.has(id));
}

export function HomepageInteractionProvider({ children }: { children: ReactNode }) {
  const [hoveredEcuId, setHoveredEcuId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [clickFocusId, setClickFocusId] = useState<string | null>(null);
  const [traceActive, setTraceActive] = useState(false);
  const [tracePick, setTracePick] = useState<TracePick>(null);
  const [traceSourceId, setTraceSourceId] = useState<string | null>(null);
  const [traceDestId, setTraceDestId] = useState<string | null>(null);
  const [tracePathIds, setTracePathIds] = useState<string[]>([]);
  const [domainFilter, setDomainFilter] = useState<DomainFilterKey>('ALL');
  const [networkFilter, setNetworkFilter] = useState<NetworkFilterKey>('ALL');
  const [viewMode, setViewMode] = useState<HomepageViewMode>('architecture');
  const [guidedTourOpen, setGuidedTourOpen] = useState(false);
  const [guidedTourStep, setGuidedTourStep] = useState(0);

  const setHoveredEcu = useCallback((id: string | null) => {
    setHoveredEcuId(id);
    if (!id) setTooltip(null);
  }, []);

  const clearClickFocus = useCallback(() => setClickFocusId(null), []);

  const startTrace = useCallback(() => {
    setTraceActive(true);
    setTracePick('source');
    setTraceSourceId(null);
    setTraceDestId(null);
    setTracePathIds([]);
    setClickFocusId(null);
    setGuidedTourOpen(false);
  }, []);

  const exitTrace = useCallback(() => {
    setTraceActive(false);
    setTracePick(null);
    setTraceSourceId(null);
    setTraceDestId(null);
    setTracePathIds([]);
  }, []);

  const handleTraceNodeClick = useCallback((ecuId: string): boolean => {
    if (!traceActive) return false;
    if (tracePick === 'source') {
      setTraceSourceId(ecuId);
      setTracePick('destination');
      return true;
    }
    if (tracePick === 'destination' && traceSourceId) {
      setTraceDestId(ecuId);
      const path = findCommunicationPath(traceSourceId, ecuId);
      setTracePathIds(path);
      setTracePick(null);
      return true;
    }
    return true;
  }, [traceActive, tracePick, traceSourceId]);

  const openGuidedTour = useCallback(() => {
    setGuidedTourOpen(true);
    setGuidedTourStep(0);
    exitTrace();
    setClickFocusId(null);
  }, [exitTrace]);

  const closeGuidedTour = useCallback(() => {
    setGuidedTourOpen(false);
    setGuidedTourStep(0);
  }, []);

  const nextTourStep = useCallback(() => {
    setGuidedTourStep((s) => Math.min(s + 1, GUIDED_TOUR_STEPS.length - 1));
  }, []);

  const prevTourStep = useCallback(() => {
    setGuidedTourStep((s) => Math.max(s - 1, 0));
  }, []);

  const setNetworkFilterFromLegend = useCallback((type: NetworkFilterKey) => {
    setNetworkFilter((prev) => (prev === type ? 'ALL' : type));
  }, []);

  const interactionRelevantIds = useMemo(() => {
    if (guidedTourOpen) {
      return GUIDED_TOUR_STEPS[guidedTourStep]?.ecuIds ?? EMPTY_IDS;
    }
    if (tracePathIds.length > 0) {
      return tracePathIds;
    }
    if (clickFocusId) {
      return getConnectedEcuIds(clickFocusId, ecus);
    }

    let filtered: string[] = EMPTY_IDS;
    const domainIds = getEcuIdsForDomainFilter(domainFilter, ecus);
    const networkIds = getEcuIdsForNetworkFilter(networkFilter, ecus);

    if (domainFilter !== 'ALL') filtered = domainIds;
    if (networkFilter !== 'ALL') {
      filtered = domainFilter !== 'ALL'
        ? intersectSets(filtered, networkIds)
        : networkIds;
    }

    return filtered;
  }, [
    guidedTourOpen,
    guidedTourStep,
    tracePathIds,
    clickFocusId,
    domainFilter,
    networkFilter,
  ]);

  const interactionRelevantKey = interactionRelevantIds.join('|');

  const hasInteractionFilter = useMemo(
    () =>
      guidedTourOpen ||
      tracePathIds.length > 0 ||
      clickFocusId !== null ||
      domainFilter !== 'ALL' ||
      networkFilter !== 'ALL',
    [guidedTourOpen, tracePathIds.length, clickFocusId, domainFilter, networkFilter]
  );

  const currentTourStep = guidedTourOpen ? GUIDED_TOUR_STEPS[guidedTourStep] : null;

  const value: HomepageInteractionContextValue = {
    hoveredEcuId,
    clickFocusId,
    traceActive,
    tracePick,
    traceSourceId,
    traceDestId,
    tracePathIds,
    domainFilter,
    networkFilter,
    viewMode,
    guidedTourOpen,
    guidedTourStep,
    tooltip,
    interactionRelevantIds,
    interactionRelevantKey,
    hasInteractionFilter,
    setHoveredEcu,
    setTooltip,
    setClickFocus: setClickFocusId,
    clearClickFocus,
    startTrace,
    exitTrace,
    handleTraceNodeClick,
    setDomainFilter,
    setNetworkFilter,
    setViewMode,
    setNetworkFilterFromLegend,
    openGuidedTour,
    closeGuidedTour,
    nextTourStep,
    prevTourStep,
    currentTourStep,
  };

  return (
    <HomepageInteractionContext.Provider value={value}>
      {children}
    </HomepageInteractionContext.Provider>
  );
}

export function useHomepageInteraction() {
  const ctx = useContext(HomepageInteractionContext);
  if (!ctx) throw new Error('useHomepageInteraction must be used within HomepageInteractionProvider');
  return ctx;
}

/** Node-level hover dimming without mutating graph state. */
export function useHomepageNodeVisual(ecuId: string) {
  const { hoveredEcuId, hasInteractionFilter, interactionRelevantIds } = useHomepageInteraction();

  return useMemo(() => {
    if (!hoveredEcuId || hasInteractionFilter) {
      return { hoverDimmed: false, hoverHighlighted: false };
    }
    const connected = getConnectedEcuIds(hoveredEcuId, ecus);
    const connectedSet = new Set(connected);
    const hoverHighlighted = ecuId === hoveredEcuId || connectedSet.has(ecuId);
    return { hoverDimmed: !hoverHighlighted, hoverHighlighted };
  }, [hoveredEcuId, hasInteractionFilter, ecuId]);
}
