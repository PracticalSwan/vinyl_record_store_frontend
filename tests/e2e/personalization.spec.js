import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import process from 'node:process';

const apiBaseUrl = 'http://localhost:3000';

async function api(page, path, { method = 'GET', body, headers = {} } = {}) {
  return page.evaluate(async ({ url, method: requestMethod, body: requestBody, requestHeaders }) => {
    const response = await fetch(url, {
      method: requestMethod,
      credentials: 'include',
      headers: {
        ...(requestBody === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...requestHeaders,
      },
      body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
    });
    return { status: response.status, payload: await response.json() };
  }, { url: `${apiBaseUrl}${path}`, method, body, requestHeaders: headers });
}

test('@smoke PERS-03 to PERS-05 honor the selective personalization gate', async ({ page }, testInfo) => {
  test.slow();
  const firstBatchEnabled = process.env.E2E_ENABLE_PERS_FIRST_BATCH === '1';
  const integrationEnabled = process.env.E2E_ENABLE_PERS_INTEGRATION === '1';
  const personalizedRankingEnabled = firstBatchEnabled || integrationEnabled;
  const projectSuffix = `${testInfo.workerIndex}_${testInfo.project.name.replace(/[^a-z0-9]/gi, '_').slice(0, 16)}`;
  const username = `${process.env.E2E_REGISTER_USERNAME}_pers_${projectSuffix}`;
  const password = process.env.E2E_REGISTER_PASSWORD;

  await page.goto('/register');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Display name').fill('Temporary PERS E2E Listener');
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create customer account' }).click();
    await expect(page).toHaveURL('/onboarding', { timeout: 15_000 });

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
    if (!personalizedRankingEnabled) {
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
    await testInfo.attach('selective-loaded-recommendations', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    await page.screenshot({
      path: testInfo.outputPath(`selective-loaded-recommendations-${testInfo.project.name}.png`),
      fullPage: true,
    });
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      accessibility.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical'),
    ).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => window.innerWidth),
    );
    const malformedFeedback = await api(page, '/api/me/feedback/1', {
      method: 'PUT',
      body: { kind: 'unsupported-kind' },
    });
    expect(malformedFeedback.status).toBe(400);
    expect(malformedFeedback.payload.error.code).toBe('INVALID_INPUT');
    const unknownFeedback = await api(page, '/api/me/feedback/999999', {
      method: 'PUT',
      body: { kind: 'not-interested' },
    });
    expect(unknownFeedback.status).toBe(404);
    expect(unknownFeedback.payload.error.code).toBe('NOT_FOUND');
    const wrongOriginResponse = await page.context().request.put(
      `${apiBaseUrl}/api/me/feedback/1`,
      {
        headers: { Origin: 'https://untrusted.example' },
        data: { kind: 'not-interested' },
      },
    );
    const wrongOriginFeedback = {
      status: wrongOriginResponse.status(),
      payload: await wrongOriginResponse.json(),
    };
    expect(wrongOriginFeedback.status).toBe(403);
    expect(wrongOriginFeedback.payload.error.code).toBe('FORBIDDEN');
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
    const feedbackPutResponse = await feedbackPut;
    expect(feedbackPutResponse.status()).toBe(200);
    expect((await feedbackPutResponse.json()).data).toMatchObject({
      productPublicId: targetId,
      kind: 'not-interested',
    });
    const undo = firstCard.getByRole('button', { name: 'Undo' });
    await expect(undo).toBeFocused();
    await expect(firstCard.getByRole('status')).toContainText('Removed from recommendations.');
    await expect(firstCard.getByRole('button', { name: 'View record' })).toHaveCount(0);
    await testInfo.attach('selective-not-interested-confirmed', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    await page.screenshot({
      path: testInfo.outputPath(`selective-not-interested-confirmed-${testInfo.project.name}.png`),
      fullPage: true,
    });

    const suppressed = await api(page, '/api/recommendations/me?limit=12&surface=recommendations');
    expect(suppressed.status).toBe(200);
    expect(suppressed.payload.data.recommendations.some((item) => item.product.id === targetId)).toBe(false);

    const duplicatePut = await api(page, `/api/me/feedback/${targetId}`, {
      method: 'PUT',
      body: { kind: 'not-interested' },
    });
    expect(duplicatePut.status).toBe(200);
    expect(duplicatePut.payload.data).toMatchObject({ productPublicId: targetId, kind: 'not-interested' });

    const feedbackDelete = page.waitForResponse((response) => (
      response.url().endsWith(`/api/me/feedback/${targetId}`) && response.request().method() === 'DELETE'
    ));
    await undo.click();
    const feedbackDeleteResponse = await feedbackDelete;
    expect(feedbackDeleteResponse.status()).toBe(200);
    expect((await feedbackDeleteResponse.json()).data).toMatchObject({
      productPublicId: targetId,
      removed: true,
    });
    await expect(firstCard.getByRole('button', { name: 'Not interested' })).toBeFocused();
    await expect(firstCard.getByRole('button', { name: 'View record' })).toBeVisible();

    const doubleUndo = await api(page, `/api/me/feedback/${targetId}`, { method: 'DELETE' });
    expect(doubleUndo.status).toBe(200);
    expect(doubleUndo.payload.data).toMatchObject({ productPublicId: targetId, removed: false });

    const alreadyOwnPut = page.waitForResponse((response) => (
      response.url().endsWith(`/api/me/feedback/${targetId}`) && response.request().method() === 'PUT'
    ));
    await firstCard.getByRole('button', { name: 'Already own' }).click();
    expect((await alreadyOwnPut).status()).toBe(200);
    await expect(firstCard.getByRole('button', { name: 'Undo' })).toBeFocused();
    await expect(firstCard.getByRole('status')).toContainText('Marked as already owned.');
    await expect(firstCard.getByRole('status')).not.toContainText(/not interested|dislike/i);
    await testInfo.attach('selective-already-own-confirmed', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    await page.screenshot({
      path: testInfo.outputPath(`selective-already-own-confirmed-${testInfo.project.name}.png`),
      fullPage: true,
    });

    await page.goto('/account');
    const reloadedRecommendations = page.waitForResponse((response) => (
      response.url().includes('/api/recommendations/me') && response.request().method() === 'GET'
    ));
    await page.goto('/recommendations');
    const reloadedPayload = await (await reloadedRecommendations).json();
    expect(reloadedPayload.data.recommendations.some((item) => item.product.id === targetId)).toBe(false);
    const loadedHome = page.waitForResponse((response) => (
      response.url().includes('/api/recommendations/me') && response.request().method() === 'GET'
    ));
    await page.goto('/');
    const expectedHomeMode = integrationEnabled ? 'personalized-hybrid' : 'preference-profile';
    expect((await (await loadedHome).json()).data.mode).toBe(expectedHomeMode);
    await expect(page.getByText(
      integrationEnabled ? 'Personalized hybrid' : 'Saved preference profile',
    )).toBeVisible();
    await testInfo.attach('selective-loaded-home', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    await page.screenshot({
      path: testInfo.outputPath(`selective-loaded-home-${testInfo.project.name}.png`),
      fullPage: true,
    });
  } finally {
    const deletion = await api(page, '/api/me', { method: 'DELETE' });
    expect(deletion.status).toBe(200);
    expect(deletion.payload.data.deleted).toBe(true);
    if (personalizedRankingEnabled) {
      const unauthenticatedFeedback = await api(page, '/api/me/feedback/1', {
        method: 'PUT',
        body: { kind: 'not-interested' },
      });
      expect(unauthenticatedFeedback.status).toBe(401);
      expect(unauthenticatedFeedback.payload.error.code).toBe('UNAUTHENTICATED');
    }
  }
});

test('PERS-09 full gates use durable behavior and true hybrid without off-surface refresh', async ({ page }, testInfo) => {
  test.skip(process.env.E2E_ENABLE_PERS_INTEGRATION !== '1', 'Requires the explicit PERS-09 integration harness.');
  test.slow();
  const projectSuffix = `${testInfo.workerIndex}_${testInfo.project.name.replace(/[^a-z0-9]/gi, '_').slice(0, 16)}`;
  const username = `${process.env.E2E_REGISTER_USERNAME}_p9_${projectSuffix}`;
  const password = process.env.E2E_REGISTER_PASSWORD;

  await page.goto('/register');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Display name').fill('Temporary PERS-09 E2E Customer');
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create customer account' }).click();
  await expect(page).toHaveURL('/onboarding', { timeout: 15_000 });
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

    expect((await api(page, '/api/ratings/1', { method: 'PUT', body: { rating: 5 } })).status).toBe(200);
    expect((await api(page, '/api/wishlist/2', { method: 'PUT' })).status).toBe(200);
    expect((await api(page, '/api/cart/3', { method: 'PUT', body: { quantity: 2 } })).status).toBe(200);

    const trackingPreference = page.getByRole('checkbox', { name: /pseudonymous usage data/i });
    await trackingPreference.uncheck();
    const passiveRequests = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/api/interactions')) passiveRequests.push(request);
    });
    expect((await api(page, '/api/ratings/1', { method: 'PUT', body: { rating: 5 } })).status).toBe(200);
    expect((await api(page, '/api/wishlist/2', { method: 'PUT' })).status).toBe(200);
    const feedbackUnderOptOut = await api(page, '/api/me/feedback/4', {
      method: 'PUT',
      body: { kind: 'already-own' },
    });
    expect(feedbackUnderOptOut.status).toBe(200);
    const optedOutRecommendation = await api(
      page,
      '/api/recommendations/me?limit=12&surface=recommendations',
      { headers: { 'X-Tracking-Enabled': 'false' } },
    );
    expect(optedOutRecommendation.status).toBe(200);
    expect(optedOutRecommendation.payload.data.mode).toBe('personalized-hybrid');
    expect(optedOutRecommendation.payload.data.recommendationLogged).toBe(false);
    expect(optedOutRecommendation.payload.data.recommendations.some((item) => item.product.id === 4)).toBe(false);
    await page.waitForTimeout(900);
    expect(passiveRequests).toHaveLength(0);
    expect(await page.evaluate(() => localStorage.getItem('groovehaus.interaction-queue.v1'))).toBeNull();
    expect((await api(page, '/api/me/feedback/4', { method: 'DELETE' })).status).toBe(200);

    const recommendationResponse = page.waitForResponse((response) => (
      response.url().includes('/api/recommendations/me') && response.request().method() === 'GET'
    ));
    await page.goto('/recommendations');
    const response = await recommendationResponse;
    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.data.mode).toBe('personalized-hybrid');
    expect(payload.data.algorithmVersion).toBe('personalized-hybrid-v1');
    expect(payload.data.recommendations.length).toBeGreaterThan(0);
    expect(payload.data.recommendations.every((item) => item.algorithmVersion === 'personalized-hybrid-v1')).toBe(true);
    await expect(page.getByText('Personalized hybrid')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Not interested' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Already own' }).first()).toBeVisible();

    await testInfo.attach('pers09-loaded-recommendations', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    await page.screenshot({
      path: testInfo.outputPath(`pers09-loaded-recommendations-${testInfo.project.name}.png`),
      fullPage: true,
    });

    await page.goto('/');
    await expect(page.getByText('Personalized hybrid')).toBeVisible();
    await testInfo.attach('pers09-loaded-home', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
    await page.screenshot({
      path: testInfo.outputPath(`pers09-loaded-home-${testInfo.project.name}.png`),
      fullPage: true,
    });
  } finally {
    const deletion = await api(page, '/api/me', { method: 'DELETE' });
    expect(deletion.status).toBe(200);
    expect(deletion.payload.data.deleted).toBe(true);
  }
});
