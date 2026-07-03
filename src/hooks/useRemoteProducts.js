import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchProduct, fetchProducts, fetchProductsByIds } from '../lib/api';

export function useProductQuery(query) {
  const key = useMemo(() => JSON.stringify(query), [query]);
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({ items: [], meta: null, status: 'loading', error: null });
  const requestSequence = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const sequence = ++requestSequence.current;
    const requestQuery = JSON.parse(key);
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) setState((previous) => ({ ...previous, status: 'loading', error: null }));
    });
    fetchProducts(requestQuery, { signal: controller.signal })
      .then((response) => {
        if (sequence !== requestSequence.current) return;
        setState({
          items: response.data.items,
          meta: response.meta,
          status: response.data.items.length ? 'success' : 'empty',
          error: null,
        });
      })
      .catch((error) => {
        if (error.name !== 'AbortError' && sequence === requestSequence.current) {
          setState({ items: [], meta: null, status: 'error', error });
        }
      });
    return () => controller.abort();
  }, [key, reloadToken]);

  const reload = useCallback(() => setReloadToken((value) => value + 1), []);
  return { ...state, reload };
}

export function useProduct(productId) {
  const [reloadToken, setReloadToken] = useState(0);
  const normalizedProductId = String(productId);
  const [state, setState] = useState({ productId: null, item: null, status: 'loading', error: null });

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) setState({ productId: normalizedProductId, item: null, status: 'loading', error: null });
    });
    fetchProduct(productId, { signal: controller.signal })
      .then((response) => setState({ productId: normalizedProductId, item: response.data.product, status: 'success', error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({
          productId: normalizedProductId,
          item: null,
          status: error.status === 404 ? 'not-found' : 'error',
          error,
        });
      });
    return () => controller.abort();
  }, [normalizedProductId, productId, reloadToken]);

  const current = state.productId === normalizedProductId
    ? state
    : { productId: normalizedProductId, item: null, status: 'loading', error: null };
  return { ...current, reload: () => setReloadToken((value) => value + 1) };
}

export function useProductsByIds(productIds) {
  const key = productIds.join(',');
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({ items: [], status: productIds.length ? 'loading' : 'empty', error: null, failed: 0 });

  useEffect(() => {
    if (!key) return undefined;
    const controller = new AbortController();
    const requestIds = key.split(',').map(Number);
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) setState((previous) => ({ ...previous, status: 'loading', error: null }));
    });
    fetchProductsByIds(requestIds, { signal: controller.signal })
      .then(({ items, failed }) => setState({
        items,
        failed,
        status: items.length ? 'success' : (failed ? 'error' : 'empty'),
        error: failed && !items.length ? new Error('The saved products could not be loaded.') : null,
      }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ items: [], status: 'error', error, failed: requestIds.length });
      });
    return () => controller.abort();
  }, [key, reloadToken]);

  const current = key ? state : { items: [], status: 'empty', error: null, failed: 0 };
  return { ...current, reload: () => setReloadToken((value) => value + 1) };
}
