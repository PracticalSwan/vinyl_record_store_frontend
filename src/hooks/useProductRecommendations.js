import { useEffect, useState } from 'react';
import { fetchProductRecommendations } from '../lib/api';

export function useProductRecommendations(productId, { enabled = true } = {}) {
  const normalizedProductId = String(productId);
  const [state, setState] = useState({ productId: null, status: 'loading', items: [], error: null });

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();

    fetchProductRecommendations(productId, { signal: controller.signal })
      .then((response) => {
        const items = response.data.recommendations.map((item) => ({
          ...item.product,
          reason: item.reasons?.[0] || '',
          recommendationReasons: item.reasons || [],
          recommendationContext: {
            requestId: response.data.requestId,
            algorithmVersion: response.data.algorithmVersion,
            mode: response.data.mode,
            rank: item.rank,
            listId: response.data.listId,
          },
        }));
        setState({ productId: normalizedProductId, status: items.length ? 'success' : 'empty', items, error: null });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ productId: normalizedProductId, status: 'error', items: [], error });
        }
      });

    return () => controller.abort();
  }, [enabled, normalizedProductId, productId]);

  if (!enabled) return { productId: normalizedProductId, status: 'idle', items: [], error: null };

  return state.productId === normalizedProductId
    ? state
    : { productId: normalizedProductId, status: 'loading', items: [], error: null };
}
