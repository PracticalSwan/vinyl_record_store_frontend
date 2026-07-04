import { expect, test } from '@playwright/test';

test('recommendation metadata is surfaced and usage-data opt-out stops event delivery', async ({ page }) => {
  const batches = [];
  await page.route('**/api/interactions', async (route) => {
    const body = route.request().postDataJSON();
    batches.push(body.events);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { accepted: body.events.length, duplicates: 0 } }),
    });
  });

  const recommendationResponse = page.waitForResponse((response) => response.url().includes('/api/recommendations/user/'));
  await page.goto('/recommendations');
  const response = await recommendationResponse;
  const payload = await response.json();
  expect(new URL(response.url()).searchParams.get('surface')).toBe('recommendations');
  expect(payload.data.requestId).toMatch(/^[a-f0-9-]+$/);
  expect(payload.data.listId).toContain(payload.data.requestId);
  expect(typeof payload.data.recommendationLogged).toBe('boolean');

  const firstRecommendation = page.getByRole('button', { name: 'View record' }).first();
  await firstRecommendation.scrollIntoViewIfNeeded();
  await expect(firstRecommendation).toBeVisible();
  await expect.poll(() => batches.flat().map((event) => event.type)).toContain('recommendation_impression');
  await firstRecommendation.click();
  await expect.poll(() => batches.flat().map((event) => event.type)).toEqual(
    expect.arrayContaining(['recommendation_click', 'product_view']),
  );
  const productView = batches.flat().find((event) => event.type === 'product_view');
  expect(productView.recommendationContext).toMatchObject({
    requestId: payload.data.requestId,
    listId: payload.data.listId,
  });
  await page.getByRole('button', { name: 'Add to wishlist' }).click();
  await expect.poll(() => batches.flat().map((event) => event.type)).toContain('recommendation_wishlist_add');
  await page.getByRole('button', { name: '4 stars' }).click();
  await expect.poll(() => batches.flat().find((event) => event.type === 'rating_set')).toMatchObject({
    recommendationContext: {
      requestId: payload.data.requestId,
      listId: payload.data.listId,
    },
  });

  await page.goto('/records/1');
  await page.getByRole('button', { name: 'Add to wishlist' }).click();
  await expect.poll(() => batches.flat().map((event) => event.type)).toEqual(
    expect.arrayContaining(['product_view', 'wishlist_add']),
  );

  const preference = page.getByRole('checkbox', { name: /Share pseudonymous usage data/ });
  await preference.uncheck();
  const delivered = batches.flat().length;
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.waitForTimeout(1_000);
  expect(batches.flat()).toHaveLength(delivered);
  expect(await page.evaluate(() => localStorage.getItem('groovehaus.interaction-queue.v1'))).toBeNull();

  const requestAfterOptOut = page.waitForRequest((request) => request.url().includes('/api/recommendations/user/'));
  await page.goto('/recommendations');
  expect((await requestAfterOptOut).headers()['x-tracking-enabled']).toBe('false');
});
