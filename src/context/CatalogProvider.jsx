import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchProducts, fetchUserRecommendations } from '../lib/api';
import { CatalogContext } from './catalogContext';

const INITIAL_CATALOG = { data: [], status: 'loading', error: null };
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

const selectCatalog = (response) => ({
  data: response.data.items,
  status: response.data.items.length ? 'success' : 'empty',
  error: null,
});

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
  const catalog = useRemoteResource(fetchProducts, selectCatalog, INITIAL_CATALOG);
  const recommendation = useRemoteResource(
    loadDemoRecommendations,
    selectRecommendations,
    INITIAL_RECOMMENDATIONS,
  );

  const value = useMemo(() => ({
    records: catalog.data,
    catalogStatus: catalog.status,
    catalogError: catalog.error,
    reloadCatalog: catalog.reload,
    recommendations: recommendation.data,
    recommendationStatus: recommendation.status,
    recommendationError: recommendation.error,
    recommendationMode: recommendation.mode,
    profileSummary: recommendation.profileSummary,
    reloadRecommendations: recommendation.reload,
  }), [catalog, recommendation]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
