'use client';

import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { getEcuById } from '@/lib/data';
import { getHomepageLayoutPosition } from './homepageZoneLayout';
import { useHomepageInteraction } from './HomepageInteractionContext';

/** Centers viewport on click-focus ECU — presentation only. */
export function HomepageFocusController() {
  const { clickFocusId } = useHomepageInteraction();
  const { setCenter } = useReactFlow();

  useEffect(() => {
    if (!clickFocusId) return;
    const ecu = getEcuById(clickFocusId);
    if (!ecu) return;
    const pos = getHomepageLayoutPosition(ecu);
    setCenter(pos.x + 61, pos.y + 48, { zoom: 1.05, duration: 380 });
  }, [clickFocusId, setCenter]);

  return null;
}
