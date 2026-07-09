import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../lib/api';
import {
  clearGuestStore,
  ensureGuestMerge,
  hasGuestState,
  readGuestStore,
  toGuestMergePayload,
  writeGuestStore,
} from '../lib/guestStore';
import { useAuth } from './useAuth';
import { useTracking } from './useTracking';
import { StoreContext } from './storeContext';

const emptyState = () => ({ wishlist: [], cart: [], ratings: [], warnings: [] });

function normalizeWishlist(data) {
  return [...new Set((data?.productIds || data?.wishlist || []).map(Number).filter(Number.isSafeInteger))];
}

function normalizeCart(data) {
  return (data?.items || data?.cart || []).flatMap((item) => {
    const id = Number(item.productId ?? item.productPublicId ?? item.id);
    const qty = Number(item.quantity ?? item.qty);
    return Number.isSafeInteger(id) && Number.isInteger(qty) && qty > 0
      ? [{ id, qty: Math.min(99, qty) }]
      : [];
  });
}

function normalizeRatings(data) {
  return (data?.items || data?.ratings || []).flatMap((item) => {
    const id = Number(item.productId ?? item.productPublicId ?? item.id);
    const rating = Number(item.rating);
    return Number.isSafeInteger(id) && Number.isInteger(rating) && rating >= 1 && rating <= 5
      ? [{ id, rating, updatedAt: new Date(item.updatedAt || Date.now()).toISOString() }]
      : [];
  });
}

function fromGuest(value) {
  return {
    wishlist: value.wishlist,
    cart: value.cart,
    ratings: value.ratings,
    warnings: [],
  };
}

function shouldMergeGuestState(authMethod) {
  if (authMethod === 'register') return true;
  return authMethod === 'restore' && Boolean(readGuestStore().mergeId);
}

export function StoreProvider({ children }) {
  const auth = useAuth();
  const tracking = useTracking();
  const initialGuest = useMemo(() => readGuestStore(), []);
  const [data, setData] = useState(() => fromGuest(initialGuest));
  const [status, setStatus] = useState('guest');
  const [error, setError] = useState(null);
  const [pending, setPending] = useState([]);
  const dataRef = useRef(data);
  const syncGeneration = useRef(0);
  const sequences = useRef({ wishlist: 0, cart: 0, ratings: 0 });
  const queues = useRef({
    wishlist: Promise.resolve(),
    cart: Promise.resolve(),
    ratings: Promise.resolve(),
  });
  const pendingRef = useRef(new Map());

  const commit = useCallback((next) => {
    const value = typeof next === 'function' ? next(dataRef.current) : next;
    dataRef.current = value;
    setData(value);
    return value;
  }, []);

  const persistGuest = useCallback((next) => {
    const stored = { ...readGuestStore(), ...next, mergeId: null };
    writeGuestStore(stored);
    commit((previous) => ({ ...previous, ...next, warnings: [] }));
  }, [commit]);

  const loadAuthenticated = useCallback(async (user, signal, { merge = false } = {}) => {
    if (!user) return;
    const generation = ++syncGeneration.current;
    setStatus('loading');
    setError(null);
    commit(emptyState());
    try {
      let guest = readGuestStore();
      let next;
      // Guest data merges only when a brand-new account is created (sign-up).
      // Signing in to an existing account, or an ordinary session restore,
      // discards guest data. A restore resumes only a previously keyed sign-up
      // merge, preserving retry safety if the page refreshed after failure.
      if (merge && hasGuestState(guest)) {
        guest = ensureGuestMerge(guest);
        if (!writeGuestStore(guest)) {
          throw new Error('Guest data could not be prepared for a safe merge. Check browser storage and try again.');
        }
        const response = await api.mergeGuestState(toGuestMergePayload(guest), { signal });
        next = {
          wishlist: normalizeWishlist(response.data),
          cart: normalizeCart(response.data),
          ratings: normalizeRatings(response.data),
          warnings: response.data.warnings || [],
        };
        clearGuestStore();
      } else {
        if (hasGuestState(guest)) clearGuestStore();
        const [wishlist, cart, ratings] = await Promise.all([
          api.fetchWishlist({ signal }),
          api.fetchCart({ signal }),
          api.fetchRatings({ signal }),
        ]);
        next = {
          wishlist: normalizeWishlist(wishlist.data),
          cart: normalizeCart(cart.data),
          ratings: normalizeRatings(ratings.data),
          warnings: cart.data.warnings || [],
        };
      }
      if (signal?.aborted || generation !== syncGeneration.current) return;
      commit(next);
      setStatus('authenticated');
    } catch (requestError) {
      if (requestError.name === 'AbortError' || generation !== syncGeneration.current) return;
      const restoredGuest = readGuestStore();
      commit(hasGuestState(restoredGuest) ? fromGuest(restoredGuest) : emptyState());
      setStatus('error');
      setError(requestError);
    }
  }, [commit]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      sequences.current = {
        wishlist: sequences.current.wishlist + 1,
        cart: sequences.current.cart + 1,
        ratings: sequences.current.ratings + 1,
      };
      queues.current = {
        wishlist: Promise.resolve(),
        cart: Promise.resolve(),
        ratings: Promise.resolve(),
      };
      pendingRef.current.clear();
      setPending([]);
      if (auth.status === 'authenticated') {
        loadAuthenticated(auth.user, controller.signal, {
          merge: shouldMergeGuestState(auth.authMethod),
        });
      } else if (auth.status === 'anonymous') {
        syncGeneration.current += 1;
        const guest = readGuestStore();
        const resetGuest = guest.mergeId ? { ...guest, mergeId: null } : guest;
        if (guest.mergeId) writeGuestStore(resetGuest);
        commit(fromGuest(resetGuest));
        setStatus('guest');
        setError(null);
      } else if (auth.status === 'error') {
        syncGeneration.current += 1;
        commit(fromGuest(readGuestStore()));
        setStatus('guest');
        setError(null);
      }
    });
    return () => controller.abort();
  }, [auth.status, auth.user, auth.authMethod, commit, loadAuthenticated]);

  const setPendingKey = useCallback((key, token, active) => {
    if (active) pendingRef.current.set(key, token);
    else if (pendingRef.current.get(key) === token) pendingRef.current.delete(key);
    setPending([...pendingRef.current.keys()]);
  }, []);

  const serverMutation = useCallback((kind, id, optimistic, request, select) => {
    const key = `${kind}:${id}`;
    if ([...pendingRef.current.keys()].some((pendingKey) => pendingKey.startsWith(`${kind}:`))
      || status !== 'authenticated') return Promise.resolve(false);
    const token = Symbol(key);
    const snapshot = dataRef.current[kind];
    const sequence = ++sequences.current[kind];
    commit(optimistic);
    setPendingKey(key, token, true);
    setError(null);

    const operation = queues.current[kind].catch(() => undefined).then(request);
    queues.current[kind] = operation;
    return operation.then((response) => {
      if (sequence === sequences.current[kind]) {
        commit((current) => ({
          ...current,
          ...select(response.data),
          warnings: response.data.warnings || current.warnings,
        }));
      }
      return true;
    }).catch((requestError) => {
      if (sequence === sequences.current[kind]) {
        commit((current) => ({ ...current, [kind]: snapshot }));
      }
      setError(requestError);
      return false;
    }).finally(() => setPendingKey(key, token, false));
  }, [commit, setPendingKey, status]);

  const toggleWishlist = useCallback((id, analytics = {}) => {
    if (status === 'loading') return Promise.resolve(false);
    const adding = !dataRef.current.wishlist.includes(id);
    const wishlist = adding
      ? [...dataRef.current.wishlist, id]
      : dataRef.current.wishlist.filter((itemId) => itemId !== id);
    if (status !== 'authenticated') {
      persistGuest({ wishlist });
      const result = Promise.resolve(true);
      result.then(() => tracking.track(
        adding && analytics.recommendationContext ? 'recommendation_wishlist_add' : adding ? 'wishlist_add' : 'wishlist_remove',
        { productId: id, ...analytics },
      ));
      return result;
    }
    return serverMutation(
      'wishlist', id,
      (current) => ({ ...current, wishlist }),
      () => adding ? api.addWishlistProduct(id) : api.removeWishlistProduct(id),
      (response) => ({ wishlist: normalizeWishlist(response) }),
    ).then((ok) => {
      if (ok) tracking.track(
        adding && analytics.recommendationContext ? 'recommendation_wishlist_add' : adding ? 'wishlist_add' : 'wishlist_remove',
        { productId: id, ...analytics },
      );
      return ok;
    });
  }, [persistGuest, serverMutation, status, tracking]);

  const removeFromWishlist = useCallback((id) => {
    if (!dataRef.current.wishlist.includes(id)) return Promise.resolve(true);
    return toggleWishlist(id);
  }, [toggleWishlist]);

  const setCartQuantity = useCallback((id, quantity, analytics = {}) => {
    if (status === 'loading') return Promise.resolve(false);
    const qty = Math.max(1, Math.min(99, quantity));
    const exists = dataRef.current.cart.some((item) => item.id === id);
    const cart = exists
      ? dataRef.current.cart.map((item) => item.id === id ? { ...item, qty } : item)
      : [...dataRef.current.cart, { id, qty }];
    if (status !== 'authenticated') {
      persistGuest({ cart });
      const result = Promise.resolve(true);
      result.then(() => tracking.track(
        !exists && analytics.recommendationContext ? 'recommendation_cart_add' : exists ? 'cart_quantity' : 'cart_add',
        { productId: id, value: exists ? qty : undefined, ...analytics },
      ));
      return result;
    }
    return serverMutation(
      'cart', id,
      (current) => ({ ...current, cart }),
      () => api.setCartProduct(id, qty),
      (response) => ({ cart: normalizeCart(response) }),
    ).then((ok) => {
      if (ok) tracking.track(
        !exists && analytics.recommendationContext ? 'recommendation_cart_add' : exists ? 'cart_quantity' : 'cart_add',
        { productId: id, value: exists ? qty : undefined, ...analytics },
      );
      return ok;
    });
  }, [persistGuest, serverMutation, status, tracking]);

  const addToCart = useCallback((id, analytics) => {
    const existing = dataRef.current.cart.find((item) => item.id === id);
    return setCartQuantity(id, Math.min(99, (existing?.qty || 0) + 1), analytics);
  }, [setCartQuantity]);

  const updateQty = useCallback((id, delta) => {
    const existing = dataRef.current.cart.find((item) => item.id === id);
    if (!existing) return Promise.resolve(false);
    return setCartQuantity(id, Math.max(1, existing.qty + delta));
  }, [setCartQuantity]);

  const removeFromCart = useCallback((id) => {
    if (status === 'loading') return Promise.resolve(false);
    const cart = dataRef.current.cart.filter((item) => item.id !== id);
    if (status !== 'authenticated') {
      persistGuest({ cart });
      tracking.track('cart_remove', { productId: id });
      return Promise.resolve(true);
    }
    return serverMutation(
      'cart', id,
      (current) => ({ ...current, cart }),
      () => api.removeCartProduct(id),
      (response) => ({ cart: normalizeCart(response) }),
    ).then((ok) => {
      if (ok) tracking.track('cart_remove', { productId: id });
      return ok;
    });
  }, [persistGuest, serverMutation, status, tracking]);

  const setRating = useCallback((id, rating, analytics = {}) => {
    if (status === 'loading') return Promise.resolve(false);
    const ratings = [
      ...dataRef.current.ratings.filter((item) => item.id !== id),
      { id, rating, updatedAt: new Date().toISOString() },
    ];
    if (status !== 'authenticated') {
      persistGuest({ ratings });
      tracking.track('rating_set', { productId: id, value: rating, ...analytics });
      return Promise.resolve(true);
    }
    return serverMutation(
      'ratings', id,
      (current) => ({ ...current, ratings }),
      () => api.setProductRating(id, rating),
      (response) => ({ ratings: normalizeRatings(response) }),
    ).then((ok) => {
      if (ok) tracking.track('rating_set', { productId: id, value: rating, ...analytics });
      return ok;
    });
  }, [persistGuest, serverMutation, status, tracking]);

  const removeRating = useCallback((id, analytics = {}) => {
    if (status === 'loading') return Promise.resolve(false);
    const ratings = dataRef.current.ratings.filter((item) => item.id !== id);
    if (status !== 'authenticated') {
      persistGuest({ ratings });
      tracking.track('rating_remove', { productId: id, ...analytics });
      return Promise.resolve(true);
    }
    return serverMutation(
      'ratings', id,
      (current) => ({ ...current, ratings }),
      () => api.removeProductRating(id),
      (response) => ({ ratings: normalizeRatings(response) }),
    ).then((ok) => {
      if (ok) tracking.track('rating_remove', { productId: id, ...analytics });
      return ok;
    });
  }, [persistGuest, serverMutation, status, tracking]);

  const retry = useCallback(() => {
    // A retry after a failed sign-up merge must re-attempt the merge (the guest
    // snapshot is still in storage), so forward the same merge decision the
    // effect uses. Otherwise retry would take the discard branch and wipe the
    // never-merged guest data.
    if (auth.status === 'authenticated') {
      loadAuthenticated(auth.user, undefined, {
        merge: shouldMergeGuestState(auth.authMethod),
      });
    }
  }, [auth.status, auth.user, auth.authMethod, loadAuthenticated]);

  // Clears every cart item. Used by the simulated checkout after a demo order
  // is confirmed locally. Authenticated carts remove each item through the
  // serialized cart queue; guest carts persist an empty cart to sessionStorage.
  const clearCart = useCallback(() => {
    if (status === 'loading') return Promise.resolve(false);
    const ids = dataRef.current.cart.map((item) => item.id);
    if (ids.length === 0) return Promise.resolve(true);
    if (status !== 'authenticated') {
      persistGuest({ cart: [] });
      return Promise.resolve(true);
    }
    return ids.reduce(
      (chain, id) => chain.then(() => removeFromCart(id)),
      Promise.resolve(true),
    ).then(() => true);
  }, [persistGuest, removeFromCart, status]);

  const value = useMemo(() => ({
    ...data,
    status,
    error,
    pending,
    isPending: (kind) => status === 'loading' || pending.some((key) => key.startsWith(`${kind}:`)),
    toggleWishlist,
    addToCart,
    removeFromCart,
    updateQty,
    removeFromWishlist,
    setRating,
    removeRating,
    clearCart,
    retry,
  }), [
    data, status, error, pending, toggleWishlist, addToCart, removeFromCart,
    updateQty, removeFromWishlist, setRating, removeRating, clearCart, retry,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
