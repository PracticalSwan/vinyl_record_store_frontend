import { expect, test } from '@playwright/test';
import process from 'node:process';

const apiBaseUrl = 'http://localhost:3000';

async function api(page, path, { method = 'GET', body } = {}) {
  return page.evaluate(async ({ url, method: requestMethod, body: requestBody }) => {
    const response = await fetch(url, {
      method: requestMethod,
      credentials: 'include',
      headers: requestBody === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
    });
    return { status: response.status, payload: await response.json() };
  }, { url: `${apiBaseUrl}${path}`, method, body });
}

test('registration, login, restoration, and protected writes work with cleanup', async ({ page }) => {
  const username = process.env.E2E_REGISTER_USERNAME;
  const password = process.env.E2E_REGISTER_PASSWORD;
  await page.goto('/register');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Display name').fill('Temporary E2E Listener');
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create customer account' }).click();
  await expect(page).toHaveURL('/account');
  await expect(page.getByText(username)).toBeVisible();

  try {
    const credentialCheck = await api(page, '/api/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    expect(credentialCheck.status).toBe(200);
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page).toHaveURL('/');
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login\?returnTo=/);
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.locator('form').getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL('/account');
    await page.reload();
    await expect(page.getByText('Authenticated session')).toBeVisible();

    const preferences = await api(page, '/api/me/preferences', {
      method: 'PATCH',
      body: {
        favoriteGenres: ['Jazz'],
        dislikedGenres: ['Rock'],
        favoriteArtists: ['Miles Davis'],
        budget: { min: 10, max: 100 },
        conditions: ['NM'],
        formats: ['LP, 33 1/3 rpm'],
        completed: true,
      },
    });
    expect(preferences.status).toBe(200);
    expect(preferences.payload.data.user.onboardingComplete).toBe(true);

    expect((await api(page, '/api/wishlist/1', { method: 'PUT' })).status).toBe(200);
    const wishlist = await api(page, '/api/wishlist/1', { method: 'PUT' });
    expect(wishlist.payload.data.productIds).toEqual([1]);

    expect((await api(page, '/api/cart/2', { method: 'PUT', body: { quantity: 3 } })).status).toBe(200);
    const cart = await api(page, '/api/cart/2', { method: 'PUT', body: { quantity: 3 } });
    expect(cart.payload.data.items[0].quantity).toBe(3);

    const forgedOwner = await api(page, '/api/cart/2', {
      method: 'PUT',
      body: { quantity: 4, userPublicId: 'demo-admin' },
    });
    expect(forgedOwner.status).toBe(400);
    expect(forgedOwner.payload.error.code).toBe('INVALID_INPUT');

    expect((await api(page, '/api/ratings/1', { method: 'PUT', body: { rating: 4 } })).status).toBe(200);
    const ratings = await api(page, '/api/ratings');
    expect(ratings.payload.data.items).toEqual([
      expect.objectContaining({ productId: 1, rating: 4 }),
    ]);

    const eventId = `e2e-event-${Date.now()}`;
    const event = {
      eventId,
      v: 1,
      type: 'product_view',
      sessionId: `e2e-session-${Date.now()}`,
      productId: 1,
      occurredAt: new Date().toISOString(),
      source: 'groovehaus-frontend',
      surface: 'product-detail',
    };
    const firstEvent = await api(page, '/api/interactions', { method: 'POST', body: { events: [event] } });
    const replayedEvent = await api(page, '/api/interactions', { method: 'POST', body: { events: [event] } });
    expect(firstEvent.payload.data).toEqual({ accepted: 1, duplicates: 0 });
    expect(replayedEvent.payload.data).toEqual({ accepted: 0, duplicates: 1 });

    const mergeBody = {
      mergeId: `e2e-merge-${Date.now()}`,
      wishlist: [3],
      cart: [{ productId: 2, quantity: 2 }],
      ratings: [{ productId: 3, rating: 5, updatedAt: new Date().toISOString() }],
    };
    const firstMerge = await api(page, '/api/me/merge-guest-state', { method: 'POST', body: mergeBody });
    const replayedMerge = await api(page, '/api/me/merge-guest-state', { method: 'POST', body: mergeBody });
    expect(firstMerge.status).toBe(200);
    expect(firstMerge.payload.data.cart.find((item) => item.productPublicId === 2).quantity).toBe(5);
    expect(replayedMerge.payload.data.replayed).toBe(true);
    expect(replayedMerge.payload.data.cart.find((item) => item.productPublicId === 2).quantity).toBe(5);

    const olderRatingTime = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString();
    const newerRatingTime = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString();
    const olderRatingMerge = await api(page, '/api/me/merge-guest-state', {
      method: 'POST',
      body: {
        mergeId: `e2e-rating-old-${Date.now()}`,
        ratings: [{ productId: 4, rating: 2, updatedAt: olderRatingTime }],
      },
    });
    expect(olderRatingMerge.status).toBe(200);
    const newerRatingMerge = await api(page, '/api/me/merge-guest-state', {
      method: 'POST',
      body: {
        mergeId: `e2e-rating-new-${Date.now()}`,
        ratings: [{ productId: 4, rating: 5, updatedAt: newerRatingTime }],
      },
    });
    expect(newerRatingMerge.status).toBe(200);
    expect(newerRatingMerge.payload.data.ratings.find((item) => item.productPublicId === 4).rating).toBe(5);
  } finally {
    let deletion = await api(page, '/api/me', { method: 'DELETE' });
    if (deletion.status === 401) {
      await api(page, '/api/auth/login', { method: 'POST', body: { username, password } });
      deletion = await api(page, '/api/me', { method: 'DELETE' });
    }
    expect(deletion.status).toBe(200);
    expect(deletion.payload.data.deleted).toBe(true);
  }
});

test('tampered cookies cannot enter a protected route', async ({ context, page }) => {
  await context.addCookies([{
    name: 'groovehaus_session',
    value: 'tampered.payload',
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
  }]);
  await page.goto('/account');
  await expect(page).toHaveURL(/\/login\?returnTo=/);
});
