import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  initializeTracking,
  setTrackingEnabled,
  track,
  trackingEnabled,
} from '../lib/tracking';
import { TrackingContext } from './trackingContext';

export function TrackingProvider({ children }) {
  const [enabled, setEnabledState] = useState(() => trackingEnabled());

  useEffect(() => initializeTracking(), []);

  const setEnabled = useCallback((value) => {
    setTrackingEnabled(value);
    setEnabledState(value);
  }, []);

  const value = useMemo(() => ({ enabled, setEnabled, track }), [enabled, setEnabled]);
  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

