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
    return { status: response.status, payload: await response.json().catch(() => null) };
  }, { url: `${apiBaseUrl}${path}`, method, body });
}

test('checkout creates a session summary, shows a reference, and clears the cart', async ({ page }, testInfo) => {
  test.slow();
  const suffix = testInfo.project.name.replace(/[^a-z0-9]/gi, '_').slice(0, 20);
  const username = `${process.env.E2E_REGISTER_USERNAME}_checkout_${suffix}`;
  const password = process.env.E2E_REGISTER_PASSWORD;
  // Establish the storefront origin first so credentialed fetches carry it.
  await page.goto('/');
  const register = await api(page, '/api/auth/register', {
    method: 'POST',
    body: { username, password, displayName: 'Checkout E2E' },
  });
  expect(register.status).toBe(200);
  try {
    // Seed the cart server-side so the storefront has a known item to check out.
    const cart = await api(page, '/api/cart/1', { method: 'PUT', body: { quantity: 2 } });
    expect(cart.status).toBe(200);

    await page.goto('/checkout');
    // Cart review step
    await expect(page.getByRole('heading', { name: 'Cart review' })).toBeVisible();
    await expect(page.getByText('Kind of Blue')).toBeVisible();
    await page.getByRole('button', { name: 'Continue to shipping' }).click();

    // Shipping step
    await expect(page.getByRole('heading', { name: 'Shipping details' })).toBeVisible();
    await expect(page.getByText('Shipping details stay in this browser session and are not used for analytics.')).toBeVisible();
    await page.getByLabel('Full name').fill('E2E Shopper');
    await page.getByLabel('Address line 1').fill('12 Sukhumvit Road');
    await page.getByLabel('City').fill('Bangkok');
    await page.getByLabel('Postal code').fill('10110');
    await page.getByLabel('Country').selectOption('Thailand');
    await page.getByRole('button', { name: 'Continue to payment' }).click();

    // Payment step: no fields and no charge
    await expect(page.getByText('No real payment is processed on this site.')).toBeVisible();
    await expect(page.getByText('Not collected')).toBeVisible();
    await expect(page.locator('.checkout-payment input')).toHaveCount(0);
    await page.getByRole('button', { name: 'Continue to review' }).click();

    // Review and confirm
    await expect(page.getByRole('heading', { name: 'Review and confirm' })).toBeVisible();
    await expect(page.getByText('Review your items and shipping details before confirming.')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm order' }).click();

    // Confirmation
    await expect(page).toHaveURL(/\/checkout\/complete\/GH-[A-Z0-9]{8}$/);
    await expect(page.getByText('Checkout complete')).toBeVisible();
    await expect(page.getByText(/GH-[A-Z0-9]{8}/)).toBeVisible();
    await expect(page.getByText('PREVIEW ONLY')).toHaveCount(0);
    await expect(page.getByText('Order preview ready')).toHaveCount(0);
    await expect(page.getByText('No real payment was processed.')).toBeVisible();
    await expect(page.getByText(/not submitted for fulfillment/i)).toBeVisible();
    await expect(page.getByText('No fulfillment scheduled')).toHaveCount(0);
    await expect(page.getByText('Not shipped')).toHaveCount(0);

    // The session-scoped summary survives a same-session confirmation reload.
    await page.reload();
    await expect(page.getByText('Checkout complete')).toBeVisible();
    await expect(page.getByText(/GH-[A-Z0-9]{8}/)).toBeVisible();

    await page.goto('/checkout/complete/GH-00000000');
    await expect(page).toHaveURL('/cart');
    await expect(page.getByText('That checkout summary could not be found.')).toBeVisible();

    // Cart was cleared by the confirmation flow.
    await page.goto('/cart');
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  } finally {
    const deletion = await api(page, '/api/me', { method: 'DELETE' });
    expect(deletion.status).toBe(200);
  }
});

test('an empty cart redirects back to the cart page with a notice', async ({ page }, testInfo) => {
  const suffix = testInfo.project.name.replace(/[^a-z0-9]/gi, '_').slice(0, 20);
  const username = `${process.env.E2E_REGISTER_USERNAME}_empty_${suffix}`;
  const password = process.env.E2E_REGISTER_PASSWORD;
  await page.goto('/');
  const registration = await api(page, '/api/auth/register', {
    method: 'POST',
    body: { username, password, displayName: 'Empty Cart E2E' },
  });
  expect(registration.status).toBe(200);
  try {
    await page.goto('/checkout');
    await expect(page).toHaveURL('/cart');
    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  } finally {
    const deletion = await api(page, '/api/me', { method: 'DELETE' });
    expect(deletion.status).toBe(200);
  }
});
