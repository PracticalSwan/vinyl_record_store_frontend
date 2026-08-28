import { expect, test } from '@playwright/test';
import process from 'node:process';
import { DEMO_USERS } from '../../../vinyl_record_store_backend/src/data/demoUsers.js';

test('showcase personas render role-aligned hybrid recommendations', async ({ page }, testInfo) => {
  test.skip(
    process.env.E2E_ENABLE_PERS_INTEGRATION !== '1'
      || process.env.E2E_PERS_CATALOG_DATA_SOURCE !== 'mongodb',
    'Requires the explicit MongoDB Profile C integration harness.',
  );
  test.skip(testInfo.project.name !== 'chromium-desktop', 'One desktop browser is sufficient.');

  await page.addInitScript(() => {
    localStorage.setItem('groovehaus.usage-data.v1', 'disabled');
  });

  for (const fixture of DEMO_USERS) {
    await page.goto('/login');
    await page.getByLabel('Username').fill(fixture.username);
    await page.getByLabel('Password').fill(fixture.password);
    await page.locator('form').getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL('/account');

    const recommendationResponse = page.waitForResponse((response) => (
      response.url().includes('/api/recommendations/me') && response.request().method() === 'GET'
    ));
    await page.goto('/recommendations');
    const response = await recommendationResponse;
    expect(response.status()).toBe(200);
    const payload = (await response.json()).data;
    expect(payload).toMatchObject({
      mode: 'personalized-hybrid',
      algorithmVersion: 'personalized-hybrid-v1',
      recommendationLogged: false,
    });

    const knownProductIds = new Set([
      ...fixture.personalization.ratings,
      ...fixture.personalization.wishlist,
    ].map((signal) => signal.productPublicId));
    expect(payload.recommendations.some((item) => knownProductIds.has(item.product.id))).toBe(false);

    const genreCounts = payload.recommendations.reduce((counts, item) => {
      const genre = item.product.genre || 'Unknown';
      counts.set(genre, (counts.get(genre) || 0) + 1);
      return counts;
    }, new Map());
    const dominantGenre = [...genreCounts.entries()]
      .sort(([leftGenre, leftCount], [rightGenre, rightCount]) => (
        rightCount - leftCount || leftGenre.localeCompare(rightGenre)
      ))[0]?.[0];
    expect(dominantGenre).toBe(fixture.personalization.preferences.favoriteGenres[0]);
    await expect(page.getByText('Personalized picks')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Not interested' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Already own' }).first()).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath(`${fixture.personalization.role}-recommendations.png`),
      fullPage: true,
    });

    await page.goto('/account');
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page).toHaveURL('/');
  }
});
