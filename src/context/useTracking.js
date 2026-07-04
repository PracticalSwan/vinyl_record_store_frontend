import { useContext } from 'react';
import { TrackingContext } from './trackingContext';

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) throw new Error('useTracking must be used within TrackingProvider');
  return context;
}

