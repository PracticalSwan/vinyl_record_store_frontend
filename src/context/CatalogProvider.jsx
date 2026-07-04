import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchUserRecommendations } from '../lib/api';
import { useLocation } from 'react-router-dom';
import { CatalogContext } from './catalogContext';

const INITIAL_RECOMMENDATIONS = {
  data: [],
  status: 'loading',
  error: null,
  mode: null,
  profileSummary: [],
};

const withReason = (item, response) => ({
  ...item.product,
  reason: item.reasons?.[0] || '',
  recommendationReasons: item.reasons || [],
  recommendationScore: item.score,
  recommendationRank: item.rank,
  recommendationContext: {
    requestId: response.requestId,
    algorithmVersion: response.algorithmVersion,
    mode: response.mode,
    rank: item.rank,
    listId: response.listId,
  },
});

const selectRecommendations = (response) => ({
  data: response.data.recommendations.map((item) => withReason(item, response.data)),
  status: response.data.recommendations.length ? 'success' : 'empty',
  error: null,
  mode: response.data.mode,
  profileSummary: response.data.profileSummary || [],
  requestId: response.data.requestId,
  recommendationLogged: response.data.recommendationLogged,
});

function useRemoteResource(loader, select, initialState) {
  const [state, setState] = useState(initialState);
  const controllerRef = useRef(null);

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
    // Abort any in-flight request (initial mount or a prior reload) so a stale
    // response can never settle after unmount or overwrite a newer attempt.
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState(initialState);
    load(controller.signal);
  }, [initialState, load]);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    Promise.resolve().then(() => load(controller.signal));
    return () => controller.abort();
  }, [load]);

  return { ...state, reload };
}

export function CatalogProvider({ children }) {
  const location = useLocation();
  const recommendationSurface = location.pathname === '/recommendations' ? 'recommendations' : 'home';
  const loadDemoRecommendations = useCallback(
    (options) => fetchUserRecommendations('demo-user', { ...options, surface: recommendationSurface }),
    [recommendationSurface],
  );
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
    recommendationRequestId: recommendation.requestId,
    recommendationLogged: recommendation.recommendationLogged,
    reloadRecommendations: recommendation.reload,
  }), [recommendation]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
