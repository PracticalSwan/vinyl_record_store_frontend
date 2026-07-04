import { getAnonymousId, isTrackingEnabled } from './identity';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request(path, {
  signal,
  method = 'GET',
  body,
  idempotencyKey,
  keepalive = false,
  extraHeaders = {},
} = {}) {
  let response;
  try {
    const headers = { ...extraHeaders };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal,
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
      keepalive,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('The storefront could not reach the backend API.', 'API_UNAVAILABLE');
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || 'The backend returned an unexpected response.',
      payload?.error?.code,
      response.status,
    );
  }
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    throw new ApiError('The backend returned an invalid response.', 'INVALID_RESPONSE', response.status);
  }
  return payload;
}

export function serializeProductQuery(query = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  for (const genre of query.genres || []) params.append('genre', genre);
  for (const era of query.eras || []) params.append('era', era);
  for (const condition of query.conditions || []) params.append('condition', condition);
  if (query.artist) params.set('artist', query.artist);
  if (query.label) params.set('label', query.label);
  if (query.minPrice !== null && query.minPrice !== undefined) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice !== null && query.maxPrice !== undefined) params.set('maxPrice', String(query.maxPrice));
  if (query.inStock === true || query.inStock === 'true') params.set('inStock', 'true');
  if (query.inStock === 'false') params.set('inStock', 'false');
  if (query.sort) params.set('sort', query.sort);
  return params;
}

export function fetchProducts(query = {}, { signal } = {}) {
  const params = serializeProductQuery(query);
  const suffix = params.size ? `?${params.toString()}` : '';
  return request(`/api/products${suffix}`, { signal });
}

export function fetchProduct(productId, { signal } = {}) {
  return request(`/api/products/${encodeURIComponent(productId)}`, { signal });
}

export async function fetchProductsByIds(productIds, { signal } = {}) {
  const settled = await Promise.allSettled(
    productIds.map((productId) => fetchProduct(productId, { signal })),
  );
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return {
    items: settled.flatMap((result) => result.status === 'fulfilled' ? [result.value.data.product] : []),
    failed: settled.filter((result) => result.status === 'rejected').length,
  };
}

function trackingHeaders() {
  const enabled = isTrackingEnabled();
  return {
    'X-Tracking-Enabled': String(enabled),
    ...(enabled ? { 'X-Anonymous-Id': getAnonymousId() } : {}),
  };
}

export function fetchUserRecommendations(userId = 'demo-user', { signal, surface = 'recommendations' } = {}) {
  const params = new URLSearchParams({ limit: '12', surface });
  return request(`/api/recommendations/user/${encodeURIComponent(userId)}?${params}`, {
    signal,
    extraHeaders: trackingHeaders(),
  });
}

export function fetchProductRecommendations(productId, { signal, surface = 'product-detail' } = {}) {
  const params = new URLSearchParams({ limit: '6', surface });
  return request(`/api/recommendations/product/${encodeURIComponent(productId)}?${params}`, {
    signal,
    extraHeaders: { 'X-Tracking-Enabled': String(isTrackingEnabled()) },
  });
}

export function fetchSession({ signal } = {}) {
  return request('/api/auth/session', { signal });
}

export function login(credentials, { signal } = {}) {
  return request('/api/auth/login', { method: 'POST', body: credentials, signal });
}

export function register(account, { signal } = {}) {
  return request('/api/auth/register', { method: 'POST', body: account, signal });
}

export function logout({ signal } = {}) {
  return request('/api/auth/logout', { method: 'POST', signal });
}

export function fetchMe({ signal } = {}) {
  return request('/api/me', { signal });
}

export function updatePreferences(preferences, { signal } = {}) {
  return request('/api/me/preferences', { method: 'PATCH', body: preferences, signal });
}

export function fetchWishlist({ signal } = {}) {
  return request('/api/wishlist', { signal });
}

export function addWishlistProduct(productId, { signal } = {}) {
  return request(`/api/wishlist/${encodeURIComponent(productId)}`, { method: 'PUT', signal });
}

export function removeWishlistProduct(productId, { signal } = {}) {
  return request(`/api/wishlist/${encodeURIComponent(productId)}`, { method: 'DELETE', signal });
}

export function fetchCart({ signal } = {}) {
  return request('/api/cart', { signal });
}

export function setCartProduct(productId, quantity, { signal } = {}) {
  return request(`/api/cart/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    body: { quantity },
    signal,
  });
}

export function removeCartProduct(productId, { signal } = {}) {
  return request(`/api/cart/${encodeURIComponent(productId)}`, { method: 'DELETE', signal });
}

export function fetchRatings({ signal } = {}) {
  return request('/api/ratings', { signal });
}

export function setProductRating(productId, rating, { signal } = {}) {
  return request(`/api/ratings/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    body: { rating },
    signal,
  });
}

export function removeProductRating(productId, { signal } = {}) {
  return request(`/api/ratings/${encodeURIComponent(productId)}`, { method: 'DELETE', signal });
}

export function mergeGuestState(state, { signal } = {}) {
  return request('/api/me/merge-guest-state', { method: 'POST', body: state, signal });
}

export function sendInteractions(events, { signal, keepalive = false } = {}) {
  return request('/api/interactions', { method: 'POST', body: { events }, signal, keepalive });
}

export { API_BASE_URL };
