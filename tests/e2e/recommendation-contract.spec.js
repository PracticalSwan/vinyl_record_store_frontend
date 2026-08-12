import process from 'node:process';
import { expect, test } from '@playwright/test';

const apiBaseUrl = 'http://localhost:3000';
const privateKeys = new Set([
  '_id',
  'anonymousId',
  'componentWeights',
  'excludedProductIds',
  'explicitFeedback',
  'explicitPreferences',
  'meanRating',
  'passiveInteractions',
  'ratingCount',
  'subjectId',
  'userKey',
  'userPublicId',
]);

async function api(page, path, headers = {}) {
  return page.evaluate(async ({ url, requestHeaders }) => {
    const response = await fetch(url, {
      credentials: 'include',
      headers: requestHeaders,
    });
    return { status: response.status, payload: await response.json() };
  }, { url: `${apiBaseUrl}${path}`, requestHeaders: headers });
}

function collectKeys(value, keys = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
    return keys;
  }
  if (!value || typeof value !== 'object') return keys;
  for (const [key, child] of Object.entries(value)) {
    keys.push(key);
    collectKeys(child, keys);
  }
  return keys;
}

function expectSafeRankedResponse(result, { limit, mode } = {}) {
  expect(result.status).toBe(200);
  expect(result.payload).toEqual({ data: expect.any(Object) });
  const data = result.payload.data;
  if (mode) expect(data.mode).toBe(mode);
  expect(data.requestId).toMatch(/^[a-f0-9-]+$/);
  expect(data.listId).toContain(data.requestId);
  expect(data.algorithmVersion).toEqual(expect.any(String));
  expect(data.recommendationLogged).toEqual(expect.any(Boolean));
  expect(data.recommendations.length).toBeLessThanOrEqual(limit);
  expect(data.recommendations.map((item) => item.rank)).toEqual(
    data.recommendations.map((_, index) => index + 1),
  );
  for (const item of data.recommendations) {
    expect(item).toMatchObject({
      product: { id: expect.any(Number), title: expect.any(String) },
      score: expect.any(Number),
      rank: expect.any(Number),
      reasons: expect.any(Array),
      algorithmVersion: expect.any(String),
    });
  }
  const leaked = collectKeys(data).filter((key) => privateKeys.has(key));
  expect(leaked).toEqual([]);
  return data;
}

function expectInputError(result) {
  expect(result).toEqual({
    status: 400,
    payload: {
      error: {
        code: 'INVALID_INPUT',
        message: expect.any(String),
      },
    },
  });
}

test('@smoke PERS-09 real recommendation routes preserve contracts and privacy', async ({ page }) => {
  test.slow();
  await page.goto('/');
  const catalog = await api(page, '/api/products?limit=3');
  expect(catalog.status).toBe(200);
  const catalogMode = catalog.payload.meta.catalogMode;
  if (process.env.E2E_PERS_CATALOG_DATA_SOURCE === 'mongodb') {
    expect(catalogMode).toBe('research-only');
  }
  const sourceProductId = catalog.payload.data.items[0].id;

  const anonymous = expectSafeRankedResponse(
    await api(page, '/api/recommendations/me?limit=3&surface=home'),
    { limit: 3 },
  );
  expect(anonymous.mode).toBe(catalogMode === 'research-only' ? 'popularity' : 'anonymous-fallback');
  if (catalogMode === 'research-only') {
    expect(anonymous.algorithmVersion).toBe('popularity-v1');
    expect(anonymous.recommendations.every((item) => (
      item.product.catalogMode === 'research-only'
      && item.product.price === null
      && item.product.stock === null
    ))).toBe(true);
  }

  const optedOut = expectSafeRankedResponse(
    await api(page, '/api/recommendations/me?limit=2&surface=recommendations', {
      'X-Tracking-Enabled': 'false',
    }),
    { limit: 2 },
  );
  expect(optedOut.recommendationLogged).toBe(false);

  const demo = expectSafeRankedResponse(
    await api(page, '/api/recommendations/user/demo-user?limit=3&surface=recommendations'),
    { limit: 3 },
  );
  if (catalogMode === 'research-only') {
    expect(demo.mode).toBe('cold-start');
    expect(demo.algorithmVersion).toBe('content-demo-v1');
  } else {
    expect(demo.mode).toBe('demo-profile');
    expect(demo.algorithmVersion).toBe('content-demo-v1');
  }

  const arbitraryLegacy = expectSafeRankedResponse(
    await api(page, '/api/recommendations/user/another-customer?limit=3&surface=recommendations'),
    { limit: 3 },
  );
  expect(arbitraryLegacy.mode).toBe('cold-start');
  expect(arbitraryLegacy.algorithmVersion).toBe('content-demo-v1');
  expect(arbitraryLegacy.userId).toBe('another-customer');

  const product = expectSafeRankedResponse(
    await api(page, `/api/recommendations/product/${sourceProductId}?limit=3&surface=product-detail`),
    { limit: 3, mode: 'content-similarity' },
  );
  expect(product.sourceProductId).toBe(sourceProductId);
  expect(product.algorithmVersion).toBe('content-demo-v1');
  expect(product.recommendations.every((item) => item.product.id !== sourceProductId)).toBe(true);

  for (const path of [
    '/api/recommendations/me?limit=0',
    '/api/recommendations/me?limit=21',
    '/api/recommendations/me?limit=not-a-number',
    '/api/recommendations/me?surface=unsupported',
    '/api/recommendations/user/invalid%20id',
    '/api/recommendations/product/not-a-number',
    `/api/recommendations/product/${sourceProductId}?limit=21`,
    `/api/recommendations/product/${sourceProductId}?surface=unsupported`,
  ]) {
    expectInputError(await api(page, path));
  }

  const unknownProduct = await api(page, '/api/recommendations/product/999999?limit=3');
  expect(unknownProduct).toEqual({
    status: 404,
    payload: {
      error: {
        code: 'NOT_FOUND',
        message: expect.any(String),
      },
    },
  });
});
