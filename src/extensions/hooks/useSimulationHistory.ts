'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { useExtensionStore } from '../store/extensionStore';
import { getSimulationFeature } from '@/lib/simulation-loader';

export function useSimulationHistoryRecorder() {
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const addHistoryEntry = useExtensionStore((s) => s.addHistoryEntry);
  const prevIndex = useRef(-1);

  useEffect(() => {
    if (currentStepIndex < 0 || !selectedFeatureId) return;
    if (currentStepIndex === prevIndex.current) return;
    prevIndex.current = currentStepIndex;

    const feature = getSimulationFeature(selectedFeatureId);
    const step = feature?.steps[currentStepIndex];
    if (!step) return;

    addHistoryEntry({
      stepIndex: currentStepIndex,
      stepTitle: step.title,
      signal: step.signalName,
      sender: step.sender,
      receiver: step.receiver,
      network: step.network,
      autosarLayer: step.autosarLayerId,
      durationMs: step.executionTimeMs,
    });
  }, [currentStepIndex, selectedFeatureId, addHistoryEntry]);
}

export function useExtendedPlayback() {
  const extendedSpeed = useExtensionStore((s) => s.extendedPlaybackSpeed);
  const setPlaybackSpeed = useAppStore((s) => s.setPlaybackSpeed);

  useEffect(() => {
    const mapped = extendedSpeed <= 0.5 ? 0.5 : extendedSpeed >= 2 ? 2 : 1;
    setPlaybackSpeed(mapped as 0.5 | 1 | 2);
  }, [extendedSpeed, setPlaybackSpeed]);

  return extendedSpeed;
}
