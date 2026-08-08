'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useExtensionStore } from '../store/extensionStore';

/**
 * Global keyboard shortcuts for simulation and presentation.
 * Only active when feature simulation view is active.
 */
export function PresentationModeController() {
  const viewMode = useAppStore((s) => s.viewMode);
  const selectedFeatureId = useAppStore((s) => s.selectedFeatureId);
  const simulationPaused = useAppStore((s) => s.simulationPaused);
  const playSimulation = useAppStore((s) => s.playSimulation);
  const pauseSimulation = useAppStore((s) => s.pauseSimulation);
  const nextStep = useAppStore((s) => s.nextStep);
  const prevStep = useAppStore((s) => s.prevStep);
  const restartSimulation = useAppStore((s) => s.restartSimulation);

  const presentationMode = useExtensionStore((s) => s.presentationMode);
  const setPresentationMode = useExtensionStore((s) => s.setPresentationMode);
  const focusMode = useExtensionStore((s) => s.focusMode);
  const setFocusMode = useExtensionStore((s) => s.setFocusMode);
  const togglePanelCollapse = useExtensionStore((s) => s.togglePanelCollapse);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const inFeature = viewMode === 'feature' && selectedFeatureId;

      if (e.key === 'Escape') {
        if (focusMode) {
          setFocusMode(false);
          e.preventDefault();
        } else if (presentationMode) {
          setPresentationMode(false);
          e.preventDefault();
        }
        return;
      }

      if (!inFeature) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (simulationPaused) playSimulation();
          else pauseSimulation();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case 'r':
        case 'R':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            restartSimulation();
          }
          break;
        case 'f':
        case 'F':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            const next = !focusMode;
            setFocusMode(next);
            if (next) {
              togglePanelCollapse('sidebar');
              togglePanelCollapse('inspector');
              togglePanelCollapse('commMonitor');
            }
          }
          break;
        case 'p':
        case 'P':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setPresentationMode(!presentationMode);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    viewMode,
    selectedFeatureId,
    simulationPaused,
    playSimulation,
    pauseSimulation,
    nextStep,
    prevStep,
    restartSimulation,
    presentationMode,
    setPresentationMode,
    focusMode,
    setFocusMode,
    togglePanelCollapse,
  ]);

  return null;
}
