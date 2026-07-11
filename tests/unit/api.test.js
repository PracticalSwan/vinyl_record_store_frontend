import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  fetchMyRecommendations,
  fetchProductRecommendations,
  fetchProducts,
  fetchShowcaseRecommendations,
  login,
  setCartProduct,
} from '../../src/lib/api';
import {
  resetTrackingPreferenceForTests,
  storeTrackingPreference,
} from '../../src/lib/identity';

afterEach(() => {
  resetTrackingPreferenceForTests();
  vi.unstubAllGlobals();
});

describe('API client', () => {
  it('requests the catalog and returns its envelope', async () => {
    const payload = { data: { items: [] }, meta: { total: 0 } };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(payload),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchProducts()).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/products',
      {
        signal: undefined,
        method: 'GET',
        headers: {},
        credentials: 'include',
        body: undefined,
        keepalive: false,
      },
    );
  });

  it('serializes repeated filters and controlled pagination', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { items: [] }, meta: {} }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await fetchProducts({
      q: 'Miles', page: 2, limit: 24, genres: ['Jazz', 'Rock'], eras: ['1950s'],
      conditions: ['NM'], minPrice: 20, maxPrice: 80, inStock: true, sort: 'price-asc',
    });
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.getAll('genre')).toEqual(['Jazz', 'Rock']);
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('sort')).toBe('price-asc');
  });

  it('encodes product identifiers safely', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { recommendations: [] } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchProductRecommendations('1/../../secret');
    expect(fetchMock.mock.calls[0][0]).toContain('/1%2F..%2F..%2Fsecret?limit=6');
  });

  it('sends the runtime opt-out even when browser storage rejects persistence', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { recommendations: [] } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    storeTrackingPreference(false);
    await fetchMyRecommendations({ anonymous: true });

    expect(fetchMock.mock.calls[0][1].headers).toEqual({ 'X-Tracking-Enabled': 'false' });
    storageWrite.mockRestore();
  });

  it('uses the session-owned endpoint without sending a client-selected identity', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: { recommendations: [] } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchMyRecommendations({ surface: 'home', anonymous: false });
    await fetchShowcaseRecommendations({ surface: 'recommendations', userId: 'another-user' });

    const sessionUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(sessionUrl.pathname).toBe('/api/recommendations/me');
    expect(sessionUrl.searchParams.get('surface')).toBe('home');
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ 'X-Tracking-Enabled': 'true' });
    expect(new URL(fetchMock.mock.calls[1][0]).pathname).toBe('/api/recommendations/user/demo-user');
  });

  it('sends credentialed JSON for authentication and absolute cart writes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: {} }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await login({ username: 'listener', password: 'password value' });
    await setCartProduct(12, 3);

    expect(fetchMock.mock.calls[0]).toEqual([
      'http://localhost:3000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'listener', password: 'password value' }),
      }),
    ]);
    expect(fetchMock.mock.calls[1]).toEqual([
      'http://localhost:3000/api/cart/12',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ quantity: 3 }) }),
    ]);
  });

  it('maps backend error envelopes to ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ error: { code: 'INVALID_QUERY', message: 'Bad query.' } }),
    }));

    await expect(fetchProducts()).rejects.toMatchObject({
      name: 'ApiError',
      code: 'INVALID_QUERY',
      message: 'Bad query.',
      status: 400,
    });
  });

  it('reports unreachable backends without leaking the original error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('socket details')));

    await expect(fetchProducts()).rejects.toEqual(
      new ApiError('The storefront could not reach the backend API.', 'API_UNAVAILABLE'),
    );
  });

  it('preserves AbortError so stale callers can stop quietly', async () => {
    const aborted = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(aborted));

    await expect(fetchProducts()).rejects.toBe(aborted);
  });

  it('rejects malformed success responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(null),
    }));
    await expect(fetchProducts()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });
});
