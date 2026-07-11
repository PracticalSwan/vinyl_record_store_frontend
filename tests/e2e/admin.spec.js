import { expect, test } from '@playwright/test';
import process from 'node:process';

const apiBaseUrl = 'http://localhost:3000';
// The only administrator is the seeded demo account documented for the
// classroom backend (see README). There is no API to mint an admin, so this
// spec depends on those credentials being present in the backend .env.local.
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'groovehaus-admin';

async function api(page, path, { method = 'GET', body } = {}) {
  return page.evaluate(async ({ url, method: requestMethod, body: requestBody }) => {
    const response = await fetch(url, {
      method: requestMethod,
      credentials: 'include',
      headers: requestBody === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
    });
    return { status: response.status, payload: await response.json().catch(() => null) };
  }, { url: `${apiBaseUrl}${path}`, method, body });
}

async function login(page, username, password) {
  const result = await api(page, '/api/auth/login', { method: 'POST', body: { username, password } });
  expect(result.status, `login as ${username} should succeed`).toBe(200);
}

test('a registered customer is denied the administrator area', async ({ page }, testInfo) => {
  test.slow();
  const suffix = testInfo.project.name.replace(/[^a-z0-9]/gi, '_').slice(0, 20);
  const username = `${process.env.E2E_REGISTER_USERNAME}_admin_${suffix}`;
  const password = process.env.E2E_REGISTER_PASSWORD;
  // Establish the storefront origin first so credentialed fetches carry it.
  await page.goto('/');
  const registration = await api(page, '/api/auth/register', {
    method: 'POST',
    body: { username, password, displayName: 'Admin E2E Customer' },
  });
  expect(registration.status).toBe(200);
  try {
    await page.goto('/admin');
    await expect(page.getByText('Administrator access required')).toBeVisible();
    // The customer never reaches administrator data.
    await expect(page.getByText('Active products')).toHaveCount(0);
  } finally {
    const deletion = await api(page, '/api/me', { method: 'DELETE' });
    expect(deletion.status).toBe(200);
  }
});

test('the administrator sees the dashboard and product catalog', async ({ page }) => {
  test.slow();
  await page.goto('/');
  await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
  const customerRecommendations = await api(page, '/api/recommendations/me?surface=home');
  expect(customerRecommendations.status).toBe(403);
  expect(customerRecommendations.payload.error.code).toBe('FORBIDDEN');
  await page.goto('/admin');
  // Administrator data is reachable for a verified admin session.
  await expect(page.getByText('Active products')).toBeVisible();
  await expect(page.getByText('Administration')).toBeVisible();

  await page.getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page).toHaveURL('/admin/products');
  await expect(page.getByRole('link', { name: 'Kind of Blue' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add product' })).toBeVisible();

  // Write routes are mongodb-only; in the seed-catalog test backend the create
  // form surfaces the persistence-unavailable error rather than mutating data.
  await page.getByRole('link', { name: 'Add product' }).click();
  await expect(page).toHaveURL('/admin/products/new');
  await page.getByLabel('Title').fill('E2E Admin Product');
  await page.getByLabel('Artist').fill('E2E Artist');
  await page.getByLabel('Price (USD)').fill('20');
  await page.getByRole('button', { name: 'Create product' }).click();
  await expect(page.getByText('Catalog writes unavailable')).toBeVisible();
});
