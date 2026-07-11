import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMyRecommendations, fetchShowcaseRecommendations } from '../lib/api';
import { personalizationMeEndpointEnabled } from '../lib/features';
import { useLocation } from 'react-router-dom';
import { CatalogContext } from './catalogContext';
import { useAuth } from './useAuth';

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

function useRemoteResource(loader, select, initialState, {
  enabled = true,
  resourceKey = 'default',
} = {}) {
  const [state, setState] = useState({ ...initialState, resourceKey: null });
  const controllerRef = useRef(null);
  const generationRef = useRef(0);

  const load = useCallback(async (signal, generation) => {
    try {
      const response = await loader({ signal });
      if (generation !== generationRef.current) return;
      setState({ ...select(response), resourceKey });
    } catch (error) {
      if (generation !== generationRef.current || error.name === 'AbortError') return;
      setState({ ...initialState, status: 'error', error, resourceKey });
    }
  }, [initialState, loader, resourceKey, select]);

  const reload = useCallback(() => {
    if (!enabled) return;
    // Abort any in-flight request (initial mount or a prior reload) so a stale
    // response can never settle after unmount or overwrite a newer attempt.
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const generation = ++generationRef.current;
    setState({ ...initialState, resourceKey });
    load(controller.signal, generation);
  }, [enabled, initialState, load, resourceKey]);

  useEffect(() => {
    if (!enabled) {
      generationRef.current += 1;
      controllerRef.current?.abort();
      controllerRef.current = null;
      return undefined;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    const generation = ++generationRef.current;
    Promise.resolve().then(() => load(controller.signal, generation));
    return () => {
      controller.abort();
      if (generationRef.current === generation) generationRef.current += 1;
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [enabled, load]);

  const visibleState = enabled && state.resourceKey === resourceKey ? state : initialState;
  return { ...visibleState, reload };
}

export function CatalogProvider({ children }) {
  const location = useLocation();
  const auth = useAuth();
  const meEndpointEnabled = personalizationMeEndpointEnabled();
  const recommendationSurface = location.pathname === '/'
    ? 'home'
    : location.pathname.startsWith('/recommendations') ? 'recommendations' : null;
  const authenticatedSubject = auth.status === 'authenticated'
    ? auth.user?.publicId || 'missing-public-id'
    : auth.status;
  const loadRecommendations = useCallback(
    (options) => meEndpointEnabled
      ? fetchMyRecommendations({
          ...options,
          surface: recommendationSurface || 'home',
          anonymous: auth.status !== 'authenticated',
        })
      : fetchShowcaseRecommendations({
          ...options,
          surface: recommendationSurface || 'home',
          anonymous: auth.status !== 'authenticated',
        }),
    [auth.status, meEndpointEnabled, recommendationSurface],
  );
  const recommendation = useRemoteResource(
    loadRecommendations,
    selectRecommendations,
    INITIAL_RECOMMENDATIONS,
    {
      enabled: recommendationSurface !== null && auth.status !== 'loading',
      resourceKey: recommendationSurface
        ? `${recommendationSurface}:${meEndpointEnabled ? 'me' : 'showcase'}:${authenticatedSubject}`
        : 'disabled',
    },
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
