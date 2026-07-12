import { expect, test } from '@playwright/test';

test('@smoke current routes load against the real backend', async ({ page }) => {
  test.slow();
  const routes = [
    ['/', /Find the record/],
    ['/catalog', /Showing 24 of 116 records/],
    ['/records/1', /Kind of Blue/],
    ['/search?q=Coltrane', /A Love Supreme/],
    ['/recommendations', /Recommendations/],
    ['/wishlist', /Wishlist/],
    ['/cart', /Cart/],
    ['/login', /Sign in to Groovehaus/],
    ['/register', /Create an account/],
  ];

  for (const [route, expected] of routes) {
    await page.goto(route);
    await expect(page.locator('main').getByText(expected).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/\b(?:demo|CSX4207|classroom)\b/i);
  }
});

test('keyboard search, not-found, and out-of-stock states behave safely', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search records' });
  await search.fill('Kind of Blue');
  await expect(page).toHaveURL(/\/search\?q=Kind%20of%20Blue$/);
  await expect(page.getByRole('listitem', { name: /Kind of Blue by Miles Davis/ })).toBeVisible();
  await search.press('Enter');
  await page.getByRole('button', { name: 'Catalog', exact: true }).click();
  await search.focus();
  await expect(page.getByRole('region', { name: 'Recent searches' })).toContainText('Kind of Blue');

  let invalidRecommendationRequests = 0;
  await page.route('**/api/recommendations/product/999?*', async (route) => {
    invalidRecommendationRequests += 1;
    await route.continue();
  });
  await page.goto('/records/999');
  await expect(page.getByText('Record not found')).toBeVisible();
  expect(invalidRecommendationRequests).toBe(0);

  await page.goto('/records/4');
  await expect(page.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
});

test('approved artwork renders with traceability and a broken image falls back without blocking actions', async ({ page }) => {
  let breakImage = false;
  await page.route('**/api/products/1', async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    payload.data.product.image = {
      thumbnailUrl: 'https://coverartarchive.org/release/test/cover-500.jpg',
      detailUrl: 'https://coverartarchive.org/release/test/cover-1200.jpg',
      source: 'cover-art-archive',
      sourceUrl: 'https://musicbrainz.org/release/test',
    };
    await route.fulfill({ response, json: payload });
  });
  await page.route('https://coverartarchive.org/**', async (route) => {
    if (breakImage) {
      await route.abort('failed');
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="1200" height="1200" fill="#4d2f23"/></svg>',
    });
  });

  await page.goto('/records/1');
  await expect(page.getByRole('img', { name: 'Cover art for Kind of Blue by Miles Davis.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Artwork source' })).toHaveAttribute('href', 'https://musicbrainz.org/release/test');

  breakImage = true;
  await page.reload();
  await expect(page.locator('.detail-cover').getByTestId('product-image-placeholder')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  await expect(page.getByText('Kind of Blue').first()).toBeVisible();
});

test('wishlist removal and cart quantity floor remain stable', async ({ page }) => {
  await page.goto('/records/2');
  await page.getByRole('button', { name: 'Add to wishlist' }).click();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove from wishlist' })).toBeVisible();

  await page.goto('/wishlist');
  await page.getByRole('button', { name: 'Remove Innervisions from wishlist' }).click();
  await expect(page.getByRole('listitem', { name: /Innervisions by Stevie Wonder/ })).toHaveCount(0);

  await page.goto('/cart');
  const quantity = page.getByRole('group', { name: 'Quantity for Innervisions' });
  await quantity.getByRole('button', { name: 'Decrease quantity' }).click();
  await quantity.getByRole('button', { name: 'Decrease quantity' }).click();
  await expect(quantity.getByText('1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove Innervisions from cart' }).click();
  await expect(page.getByRole('listitem', { name: /Innervisions by Stevie Wonder/ })).toHaveCount(0);
});

test('catalog failure can retry and empty data is distinct', async ({ page }) => {
  let failCatalog = true;
  await page.route('**/api/products?*', async (route) => {
    if (failCatalog) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'TEST_UNAVAILABLE', message: 'Test backend unavailable.' } }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/catalog');
  await expect(page.getByRole('alert')).toContainText('Test backend unavailable.');
  failCatalog = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText(/Showing\s+24\s+of\s+116\s+records/)).toBeVisible();

  await page.unroute('**/api/products?*');
  await page.route('**/api/products?*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: { items: [] }, meta: { page: 1, limit: 24, total: 0, totalPages: 0, facets: {} } }),
  }));
  await page.reload();
  await expect(page.getByRole('status')).toContainText('No records are available');
});

test('server filters, sorting, pagination, focus, and history use the URL as source of truth', async ({ page }) => {
  await page.goto('/catalog?genre=Jazz&genre=Rock&limit=5&sort=price-asc');
  await expect(page.getByText(/Showing\s+5\s+of\s+40\s+records/)).toBeVisible();
  await expect(page.getByLabel('Catalog pagination')).toBeVisible();
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole('heading', { name: 'Catalog results' })).toBeFocused();
  await page.reload();
  await expect(page.getByText(/Showing\s+5\s+of\s+40\s+records/)).toBeVisible();
  await page.getByLabel('Sort by').selectOption('artist-asc');
  await expect(page).not.toHaveURL(/page=2/);
  await expect(page).toHaveURL(/sort=artist-asc/);
  await page.goBack();
  await expect(page).toHaveURL(/page=2/);
});

test('catalog price inputs stay within a viewport-scrolling filter panel', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 600 });
  await page.goto('/catalog');
  await expect(page.getByText(/Showing\s+24\s+of\s+116\s+records/)).toBeVisible();
  const sidebar = page.getByLabel('Filter records');
  const minimum = page.getByLabel('Minimum price');
  const maximum = page.getByLabel('Maximum price');
  const [sidebarBox, minimumBox, maximumBox] = await Promise.all([
    sidebar.boundingBox(),
    minimum.boundingBox(),
    maximum.boundingBox(),
  ]);

  expect(sidebarBox).not.toBeNull();
  expect(minimumBox.x).toBeGreaterThanOrEqual(sidebarBox.x);
  expect(maximumBox.x + maximumBox.width).toBeLessThanOrEqual(sidebarBox.x + sidebarBox.width + 1);
  const overflow = await sidebar.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    overflowY: getComputedStyle(element).overflowY,
  }));
  expect(overflow.overflowY).toBe('auto');
  expect(overflow.scrollHeight).toBeGreaterThan(overflow.clientHeight);
});

test('short routes keep the footer at the viewport bottom without trailing page background', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/wishlist');
  const footer = page.getByRole('contentinfo');
  const footerBox = await footer.boundingBox();
  expect(footerBox).not.toBeNull();
  expect(Math.abs((footerBox.y + footerBox.height) - 1000)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
});

test('recent searches keep five committed entries and replay a prior search', async ({ page }) => {
  await page.goto('/search');
  const search = page.getByRole('searchbox', { name: 'Search title, artist, genre, or label' });
  for (const term of ['Jazz', 'Rock', 'Soul', 'Folk', 'Blues', 'Classical']) {
    await search.fill(term);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
  }

  const recent = page.getByRole('region', { name: 'Recent searches' });
  await expect(recent.locator('li button')).toHaveCount(5);
  await expect(recent.getByRole('button', { name: 'Jazz', exact: true })).toHaveCount(0);
  await recent.getByRole('button', { name: 'Blues', exact: true }).click();
  await expect(page).toHaveURL(/q=Blues/);
  await expect(page.getByRole('heading', { name: 'Search results for "Blues"' })).toBeVisible();
});

test('rapid debounced search never lets an older response replace a newer query', async ({ page }) => {
  await page.route('**/api/products?*', async (route) => {
    const query = new URL(route.request().url()).searchParams.get('q');
    if (query === 'blue') await new Promise((resolve) => setTimeout(resolve, 900));
    await route.continue();
  });
  await page.goto('/search');
  const search = page.getByRole('searchbox', { name: 'Search title, artist, genre, or label' });
  await search.fill('blue');
  // Wait for the debounced "blue" request to actually be issued (independent of
  // the 300ms debounce), then supersede it before its delayed response can land.
  await page.waitForRequest((request) => new URL(request.url()).searchParams.get('q') === 'blue');
  await search.fill('jazz');
  await expect(page.getByRole('heading', { name: 'Search results for "jazz"' })).toBeVisible();
  await expect(page.getByText(/Showing\s+20\s+of\s+20\s+records/)).toBeVisible();
  // Let the delayed "blue" response resolve so the stale-response guard is
  // exercised; race against an upper bound so an aborted (canceled) response
  // that never lands cannot hang the test.
  await Promise.race([
    page.waitForResponse((response) => new URL(response.url()).searchParams.get('q') === 'blue'),
    page.waitForTimeout(1500),
  ]);
  await expect(page).toHaveURL(/q=jazz/);
  await expect(page.getByText(/Showing\s+20\s+of\s+20\s+records/)).toBeVisible();
});

test('mobile catalog filters open with the keyboard', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile-only disclosure check.');
  await page.goto('/catalog');
  const toggle = page.getByRole('button', { name: /Filters/ });
  await toggle.focus();
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByLabel('Filter records')).toBeVisible();
});
