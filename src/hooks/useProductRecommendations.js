import { useEffect, useState } from 'react';
import { fetchProductRecommendations } from '../lib/api';

export function useProductRecommendations(productId) {
  const normalizedProductId = String(productId);
  const [state, setState] = useState({ productId: null, status: 'loading', items: [], error: null });

  useEffect(() => {
    const controller = new AbortController();

    fetchProductRecommendations(productId, { signal: controller.signal })
      .then((response) => {
        const items = response.data.recommendations.map((item) => ({
          ...item.product,
          reason: item.reasons?.[0] || '',
          recommendationReasons: item.reasons || [],
        }));
        setState({ productId: normalizedProductId, status: items.length ? 'success' : 'empty', items, error: null });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ productId: normalizedProductId, status: 'error', items: [], error });
        }
      });

    return () => controller.abort();
  }, [normalizedProductId, productId]);

  return state.productId === normalizedProductId
    ? state
    : { productId: normalizedProductId, status: 'loading', items: [], error: null };
}
