import { expect, test } from '@playwright/test';

test('explicit unavailable MongoDB returns a safe 503 instead of a recommendation fallback', async ({ request }) => {
  test.slow();
  const response = await request.get('/api/recommendations/me?limit=3&surface=recommendations');
  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({
    error: {
      code: 'PERSISTENCE_UNAVAILABLE',
      message: 'The selected catalog data source is unavailable.',
    },
  });
});
