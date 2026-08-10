'use client';

import { useHomepageInteraction } from './HomepageInteractionContext';
import { GUIDED_TOUR_STEPS } from './homepageGuidedTour';

export function HomepageGuidedTour() {
  const {
    guidedTourOpen,
    guidedTourStep,
    currentTourStep,
    closeGuidedTour,
    nextTourStep,
    prevTourStep,
  } = useHomepageInteraction();

  if (!guidedTourOpen || !currentTourStep) return null;

  const isLast = guidedTourStep >= GUIDED_TOUR_STEPS.length - 1;

  return (
    <div className="hp-guided-tour" role="dialog" aria-label="Guided architecture tour">
      <div className="hp-guided-tour-header">
        <span className="hp-guided-tour-step">
          {guidedTourStep + 1} / {GUIDED_TOUR_STEPS.length}
        </span>
        <button type="button" className="hp-guided-tour-exit" onClick={closeGuidedTour}>
          Exit Tour
        </button>
      </div>
      <h3 className="hp-guided-tour-title">{currentTourStep.title}</h3>
      <p className="hp-guided-tour-desc">{currentTourStep.description}</p>
      <div className="hp-guided-tour-nav">
        <button
          type="button"
          className="hp-toolbar-btn"
          onClick={prevTourStep}
          disabled={guidedTourStep === 0}
        >
          Previous
        </button>
        {isLast ? (
          <button type="button" className="hp-toolbar-btn hp-toolbar-btn-active" onClick={closeGuidedTour}>
            Finish
          </button>
        ) : (
          <button type="button" className="hp-toolbar-btn hp-toolbar-btn-active" onClick={nextTourStep}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
