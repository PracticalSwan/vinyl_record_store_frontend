import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const representativeRoutes = [
  ['home', '/'],
  ['catalog', '/catalog'],
  ['detail', '/records/1'],
  ['search', '/search?q=jazz'],
  ['recommendations', '/recommendations'],
  ['wishlist', '/wishlist'],
  ['cart', '/cart'],
  ['login', '/login'],
  ['register', '/register'],
];

for (const [name, route] of representativeRoutes) {
  test(`${name} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );
    const summary = blocking.map(({ id, impact, nodes }) => ({
      id,
      impact,
      targets: nodes.map((node) => node.target),
    }));
    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}

test('@smoke keyboard focus reaches the primary navigation and search', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Groovehaus home' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('searchbox', { name: 'Search records' })).toBeFocused();
});
