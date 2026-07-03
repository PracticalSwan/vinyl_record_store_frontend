const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { signal });
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

export function fetchUserRecommendations(userId = 'demo-user', { signal } = {}) {
  return request(`/api/recommendations/user/${encodeURIComponent(userId)}?limit=12`, { signal });
}

export function fetchProductRecommendations(productId, { signal } = {}) {
  return request(`/api/recommendations/product/${encodeURIComponent(productId)}?limit=6`, { signal });
}

export { API_BASE_URL };
