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

test('PERS-03 to PERS-05 honor the seed E2E feature gate', async ({ page }, testInfo) => {
  test.slow();
  const firstBatchEnabled = process.env.E2E_ENABLE_PERS_FIRST_BATCH === '1';
  const projectSuffix = testInfo.project.name.replace(/[^a-z0-9]/gi, '_').slice(0, 20);
  const username = `${process.env.E2E_REGISTER_USERNAME}_pers_${projectSuffix}`;
  const password = process.env.E2E_REGISTER_PASSWORD;

  await page.goto('/register');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Display name').fill('Temporary PERS E2E Listener');
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create customer account' }).click();
  await expect(page).toHaveURL('/onboarding');

  await page.getByRole('group', { name: /Favorite genres/ }).getByText('Jazz', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  let offSurfaceRecommendationRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/recommendations/me')) offSurfaceRecommendationRequests += 1;
  });

  try {
    await page.getByRole('button', { name: 'Save preferences' }).click();
    await expect(page).toHaveURL('/account');
    expect(offSurfaceRecommendationRequests).toBe(0);

    const firstRecommendationResponse = page.waitForResponse((response) => (
      response.url().includes('/api/recommendations/me') && response.request().method() === 'GET'
    ));
    await page.goto('/recommendations');
    const firstResponse = await firstRecommendationResponse;
    expect(firstResponse.status()).toBe(200);
    const firstPayload = await firstResponse.json();
    if (!firstBatchEnabled) {
      expect(firstPayload.data.mode).toBe('cold-start');
      await expect(page.getByText('Session-owned cold-start')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Not interested' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Already own' })).toHaveCount(0);
      const targetId = firstPayload.data.recommendations[0].product.id;
      const disabledFeedback = await api(page, `/api/me/feedback/${targetId}`, {
        method: 'PUT',
        body: { kind: 'not-interested' },
      });
      expect(disabledFeedback.status).toBe(404);
      expect(disabledFeedback.payload.error.code).toBe('NOT_FOUND');
      return;
    }
    expect(firstPayload.data.mode).toBe('preference-profile');
    expect(firstPayload.data.algorithmVersion).toBe('preference-profile-v1');
    const targetProduct = firstPayload.data.recommendations[0].product;
    const targetId = targetProduct.id;
    const targetArtist = targetProduct.artist || 'Unknown artist';
    const firstCard = page.getByRole('listitem', {
      name: `${targetProduct.title} by ${targetArtist}`,
    }).first();
    const feedbackPut = page.waitForResponse((response) => (
      response.url().endsWith(`/api/me/feedback/${targetId}`) && response.request().method() === 'PUT'
    ));
    await firstCard.getByRole('button', { name: 'Not interested' }).click();
    expect((await feedbackPut).status()).toBe(200);
    const undo = firstCard.getByRole('button', { name: 'Undo' });
    await expect(undo).toBeFocused();
    await expect(firstCard.getByRole('status')).toContainText('Removed from recommendations.');
    await expect(firstCard.getByRole('button', { name: 'View record' })).toHaveCount(0);

    const suppressed = await api(page, '/api/recommendations/me?limit=12&surface=recommendations');
    expect(suppressed.status).toBe(200);
    expect(suppressed.payload.data.recommendations.some((item) => item.product.id === targetId)).toBe(false);

    const feedbackDelete = page.waitForResponse((response) => (
      response.url().endsWith(`/api/me/feedback/${targetId}`) && response.request().method() === 'DELETE'
    ));
    await undo.click();
    expect((await feedbackDelete).status()).toBe(200);
    await expect(firstCard.getByRole('button', { name: 'Not interested' })).toBeFocused();
    await expect(firstCard.getByRole('button', { name: 'View record' })).toBeVisible();

    const alreadyOwnPut = page.waitForResponse((response) => (
      response.url().endsWith(`/api/me/feedback/${targetId}`) && response.request().method() === 'PUT'
    ));
    await firstCard.getByRole('button', { name: 'Already own' }).click();
    expect((await alreadyOwnPut).status()).toBe(200);
    await expect(firstCard.getByRole('button', { name: 'Undo' })).toBeFocused();

    await page.goto('/account');
    const reloadedRecommendations = page.waitForResponse((response) => (
      response.url().includes('/api/recommendations/me') && response.request().method() === 'GET'
    ));
    await page.goto('/recommendations');
    const reloadedPayload = await (await reloadedRecommendations).json();
    expect(reloadedPayload.data.recommendations.some((item) => item.product.id === targetId)).toBe(false);
  } finally {
    const deletion = await api(page, '/api/me', { method: 'DELETE' });
    expect(deletion.status).toBe(200);
    expect(deletion.payload.data.deleted).toBe(true);
  }
});
