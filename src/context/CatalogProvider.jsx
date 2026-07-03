import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchUserRecommendations } from '../lib/api';
import { CatalogContext } from './catalogContext';

const INITIAL_RECOMMENDATIONS = {
  data: [],
  status: 'loading',
  error: null,
  mode: null,
  profileSummary: [],
};

const withReason = (item) => ({
  ...item.product,
  reason: item.reasons?.[0] || '',
  recommendationReasons: item.reasons || [],
  recommendationScore: item.score,
  recommendationRank: item.rank,
});

const loadDemoRecommendations = (options) => fetchUserRecommendations('demo-user', options);

const selectRecommendations = (response) => ({
  data: response.data.recommendations.map(withReason),
  status: response.data.recommendations.length ? 'success' : 'empty',
  error: null,
  mode: response.data.mode,
  profileSummary: response.data.profileSummary || [],
});

function useRemoteResource(loader, select, initialState) {
  const [state, setState] = useState(initialState);

  const load = useCallback(async (signal) => {
    try {
      const response = await loader({ signal });
      setState(select(response));
    } catch (error) {
      if (error.name === 'AbortError') return;
      setState({ ...initialState, status: 'error', error });
    }
  }, [initialState, loader, select]);

  const reload = useCallback(() => {
    setState(initialState);
    load();
  }, [initialState, load]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => load(controller.signal));
    return () => controller.abort();
  }, [load]);

  return { ...state, reload };
}

export function CatalogProvider({ children }) {
  const recommendation = useRemoteResource(
    loadDemoRecommendations,
    selectRecommendations,
    INITIAL_RECOMMENDATIONS,
  );

  const value = useMemo(() => ({
    recommendations: recommendation.data,
    recommendationStatus: recommendation.status,
    recommendationError: recommendation.error,
    recommendationMode: recommendation.mode,
    profileSummary: recommendation.profileSummary,
    reloadRecommendations: recommendation.reload,
  }), [recommendation]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
