import { expect, test } from '@playwright/test';
import process from 'node:process';

const apiBaseUrl = 'http://localhost:3000';
const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

async function loginAdmin(page) {
  const status = await page.evaluate(async ({ url, username, password }) => {
    const response = await fetch(url, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.status;
  }, { url: `${apiBaseUrl}/api/auth/login`, username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
  expect(status).toBe(200);
}

test('recommendations preserve container padding on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/recommendations');
  const metrics = await page.locator('.rec-page').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { left: rect.left, paddingLeft: parseFloat(style.paddingLeft) };
  });
  expect(metrics.left + metrics.paddingLeft).toBeGreaterThanOrEqual(20);
});
test('administrator navbar fits a 360px viewport', async ({ page }) => {
  test.skip(!ADMIN_USERNAME || !ADMIN_PASSWORD, 'Administrator E2E credentials are not configured.');
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await loginAdmin(page);
  await page.goto('/admin');
  const metrics = await page.evaluate(() => {
    const right = (selector) => Math.round(document.querySelector(selector).getBoundingClientRect().right);
    return {
      viewport: innerWidth,
      bodyScrollWidth: document.body.scrollWidth,
      linksRight: right('.nav-links'),
      searchRight: right('.nav-search'),
      navLinkWidth: parseFloat(getComputedStyle(document.querySelector('.nav-link')).width),
      navPaddingLeft: parseFloat(getComputedStyle(document.querySelector('.nav-inner')).paddingLeft),
      navGap: parseFloat(getComputedStyle(document.querySelector('.nav-links')).columnGap),
    };
  });
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.linksRight).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.searchRight).toBeLessThanOrEqual(metrics.viewport);
  expect(metrics.navLinkWidth).toBeLessThanOrEqual(30);
  expect(metrics.navPaddingLeft).toBeLessThanOrEqual(8);
  expect(metrics.navGap).toBe(0);
});

test('research label badges wrap long source labels', async ({ page }) => {
  await page.goto('/catalog');
  const styles = await page.evaluate(() => {
    const element = document.createElement('span');
    element.className = 'badge badge-label';
    element.textContent = 'KIDinaKORNER/Interscope Records';
    document.body.append(element);
    const style = getComputedStyle(element);
    const result = { whiteSpace: style.whiteSpace, overflowWrap: style.overflowWrap };
    element.remove();
    return result;
  });
  expect(styles.whiteSpace).toBe('normal');
  expect(styles.overflowWrap).toBe('anywhere');
});
