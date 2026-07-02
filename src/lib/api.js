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
  return payload;
}

export function fetchProducts({ signal } = {}) {
  return request('/api/products?limit=100', { signal });
}

export function fetchUserRecommendations(userId = 'demo-user', { signal } = {}) {
  return request(`/api/recommendations/user/${encodeURIComponent(userId)}?limit=12`, { signal });
}

export function fetchProductRecommendations(productId, { signal } = {}) {
  return request(`/api/recommendations/product/${encodeURIComponent(productId)}?limit=6`, { signal });
}

export { API_BASE_URL };
