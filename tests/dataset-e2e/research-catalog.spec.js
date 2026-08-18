import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import process from 'node:process';

const apiBaseUrl = 'http://localhost:3000';
const datasetKey = 'amazon-reviews-2023-cds-vinyl-5core-v3';
const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

function fixtureProduct(index) {
  const id = 100_001 + index;
  const acceptedArtwork = index === 0;
  return {
    id,
    slug: `record-${id}`,
    title: index === 0
      ? 'Dataset Contract Record With A Deliberately Long, Wrapping Title'
      : `Dataset Contract Record ${String(index + 1).padStart(2, '0')}`,
    artist: index === 1 ? null : index === 0 ? 'A Long Primary Artist Credit Used For Layout Verification' : `Fixture Artist ${index + 1}`,
    genre: index % 3 === 2 ? null : index % 2 === 0 ? 'Jazz' : 'Rock',
    genres: index % 3 === 2 ? [] : [index % 2 === 0 ? 'Jazz' : 'Rock'],
    year: index === 0 ? 1963 : null,
    originalReleaseYear: index === 0 ? 1963 : null,
    editionReleaseYear: index === 1 ? null : 2000 + (index % 24),
    yearDisplayType: index === 0 ? 'original' : index === 1 ? 'unknown' : 'edition',
    price: null,
    currency: null,
    stock: null,
    condition: null,
    label: index === 1 ? null : 'Fixture Label',
    format: 'Vinyl',
    pressing: null,
    description: null,
    image: acceptedArtwork ? {
      thumbnailUrl: 'https://coverartarchive.org/release/fixture/cover-500.jpg',
      detailUrl: 'https://coverartarchive.org/release/fixture/cover-1200.jpg',
      source: 'cover-art-archive',
      sourceUrl: 'https://musicbrainz.org/release/00000000-0000-0000-0000-000000000001',
    } : null,
    localArtworkAvailable: acceptedArtwork,
    source: 'amazon-reviews-2023',
    sourceVersion: '2023-cds-vinyl-5core-v3',
    datasetKey,
    catalogMode: 'research-only',
    fieldOrigins: {
      title: 'source',
      artist: index === 1 ? 'unknown' : 'derived',
      genre: index % 3 === 2 ? 'unknown' : 'derived',
      artwork: acceptedArtwork ? 'enriched' : 'unknown',
    },
    qualityFlags: acceptedArtwork ? ['artwork-high-confidence-musicbrainz-match'] : ['artwork-unresolved-or-ambiguous'],
  };
}

const products = Array.from({ length: 48 }, (_, index) => fixtureProduct(index));

function listPayload(url) {
  const query = url.searchParams;
  const page = Math.max(1, Number(query.get('page') || 1));
  const limit = Math.max(1, Number(query.get('limit') || 24));
  const search = (query.get('q') || '').toLowerCase();
  const genres = query.getAll('genre');
  let matches = products.filter((product) => (
    (!search || [product.title, product.artist, product.genre].some((value) => String(value || '').toLowerCase().includes(search)))
    && (!genres.length || genres.includes(product.genre))
  ));
  if (query.get('sort') === 'artist-asc') {
    matches = [...matches].sort((left, right) => String(left.artist || '').localeCompare(String(right.artist || '')) || left.id - right.id);
  }
  const unfiltered = !search && genres.length === 0;
  const total = unfiltered ? 2305 : matches.length;
  const items = matches.slice((page - 1) * limit, page * limit);
  return {
    data: { items },
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      catalogMode: 'research-only',
      facets: {
        genres: [
          { value: 'Jazz', count: 71 },
          { value: 'Rock', count: 993 },
        ],
        eras: [
          { value: '1960s', count: 1 },
        ],
        formats: [{ value: 'Vinyl', count: 2305 }],
        conditions: [],
        stock: [],
        price: { min: null, max: null },
      },
    },
  };
}

async function installDatasetContract(page) {
  await page.route('**/api/products/*', async (route) => {
    const url = new URL(route.request().url());
    const detailMatch = url.pathname.match(/^\/api\/products\/(\d+)$/);
    const product = products.find((item) => item.id === Number(detailMatch?.[1]));
    await route.fulfill({
      status: product ? 200 : 404,
      contentType: 'application/json',
      body: JSON.stringify(product
        ? { data: { product }, meta: { catalogMode: 'research-only' } }
        : { error: { code: 'NOT_FOUND', message: 'That record was not found.' } }),
    });
  });
  await page.route('**/api/products?*', async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(listPayload(url)),
    });
  });
  await page.route('**/api/recommendations/product/*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: {
        recommendations: [],
        requestId: 'fixture-request',
        listId: 'fixture-list',
        algorithmVersion: 'deferred',
        mode: 'anonymous-fallback',
      },
    }),
  }));
}

test.beforeEach(async ({ page }) => {
  await installDatasetContract(page);
});

test('research catalog exposes dataset facets, pagination, search, and no commerce controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).not.toContainText(/Research catalog|Research record|Research-only metadata|Amazon Reviews 2023 research subset|source-derived|metadata honestly/i);

  await page.goto('/catalog');
  await expect(page.locator('body')).not.toContainText(/Research catalog|Research record|Research-only metadata|Amazon Reviews 2023 research subset|source-derived|metadata honestly/i);
  await expect(page.getByText('Showing 24 of 2305 records')).toBeVisible();
  if ((await page.viewportSize()).width < 700) {
    await page.getByRole('button', { name: /Filters/ }).click();
  }
  await expect(page.getByRole('group', { name: 'Genre' }).getByLabel('Jazz')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Format' }).getByLabel('Vinyl')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Era' }).getByLabel('1960s')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Era' }).getByLabel('2000s+')).toHaveCount(0);
  await expect(page.getByLabel('Minimum price')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Condition' })).toHaveCount(0);
  await expect(page.getByText('In stock only')).toHaveCount(0);
  await expect(page.getByLabel('Sort by').locator('option')).toHaveCount(2);
  await expect(page.getByLabel('Catalog pagination')).toBeVisible();

  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText('Showing 24 of 2305 records')).toBeVisible();

  await page.goto('/search?q=deliberately%20long');
  await expect(page.getByText('Showing 1 of 1 records')).toBeVisible();
  await expect(page.getByRole('listitem', { name: /Dataset Contract Record With A Deliberately Long/ })).toBeVisible();
});

test('record cards navigate from artwork and padding but exclude text and wishlist controls', async ({ page }) => {
  await page.goto('/catalog');
  const card = page.getByRole('listitem', { name: /Dataset Contract Record With A Deliberately Long/ }).first();
  await card.locator('.card-cover').click();
  await expect(page).toHaveURL(new RegExp(`/records/${products[0].id}$`));

  await page.goto('/catalog');
  const freshCard = page.getByRole('listitem', { name: /Dataset Contract Record With A Deliberately Long/ }).first();
  await freshCard.locator('.card-title').click();
  await expect(page).toHaveURL(/\/catalog$/);
  await freshCard.locator('.card-artist').click();
  await expect(page).toHaveURL(/\/catalog$/);
  await freshCard.locator('.badge-genre').click();
  await expect(page).toHaveURL(/\/catalog$/);
  await freshCard.locator('.card-wishlist-btn').click();
  await expect(page).toHaveURL(/\/catalog$/);

  await freshCard.locator('.card-body').click({ position: { x: 3, y: 3 } });
  await expect(page).toHaveURL(new RegExp(`/records/${products[0].id}$`));
});

test('view record remains the explicit keyboard navigation control', async ({ page }) => {
  await page.goto('/catalog');
  const card = page.getByRole('listitem', { name: /Dataset Contract Record With A Deliberately Long/ }).first();
  const viewRecord = card.getByRole('button', { name: 'View record' });
  await viewRecord.focus();
  await viewRecord.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/records/${products[0].id}$`));
});

test('accepted artwork uses local fallback while unresolved records use no legacy artwork', async ({ page }) => {
  let localAcceptedRequests = 0;
  let localUnresolvedRequests = 0;
  await page.route('**/api/artwork?*', (route) => route.abort('failed'));
  await page.route('**/api/artwork/local/*', async (route) => {
    const id = Number(new URL(route.request().url()).pathname.split('/').at(-1));
    if (id === products[0].id) localAcceptedRequests += 1;
    if (id === products[1].id) localUnresolvedRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="500" height="500" fill="#4d2f23"/></svg>',
    });
  });

  await page.goto(`/records/${products[0].id}`);
  const localImage = page.getByRole('img', { name: /Cover art for Dataset Contract Record/ });
  await expect(localImage).toHaveAttribute('data-artwork-source', 'local');
  await expect.poll(() => localAcceptedRequests).toBe(1);
  await expect(page.getByRole('link', { name: 'Artwork source' })).toHaveAttribute('href', products[0].image.sourceUrl);

  await page.goto(`/records/${products[1].id}`);
  await expect(page.locator('.detail-cover').getByTestId('product-image-placeholder')).toBeVisible();
  expect(localUnresolvedRequests).toBe(0);
});

test('research detail keeps wishlist and rating but has no cart or checkout path', async ({ page }) => {
  await page.goto(`/records/${products[0].id}`);
  await expect(page.locator('body')).not.toContainText(/Research catalog|Research record|Research-only metadata|Amazon Reviews 2023 research subset|source-derived|metadata honestly/i);
  await expect(page.getByRole('row', { name: 'Original release year 1963' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Edition release year 2000' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(0);
  await expect(page.getByText(/Price unavailable/)).toHaveCount(0);

  await page.getByRole('button', { name: 'Add to wishlist' }).click();
  await page.getByRole('button', { name: '4 stars' }).click();
  await expect(page.getByRole('button', { name: '4 stars' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/wishlist');
  await expect(page.getByRole('listitem', { name: /Dataset Contract Record/ })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/Research catalog|Research record|Research-only metadata|Amazon Reviews 2023 research subset|source-derived|metadata honestly/i);
  await expect(page.getByRole('button', { name: /Add .* to cart/ })).toHaveCount(0);

  await page.goto('/cart');
  await expect(page.getByText('Your cart is empty')).toBeVisible();
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/login/);
});

test('dataset catalog and detail have no serious accessibility violations', async ({ page }) => {
  for (const route of ['/catalog', `/records/${products[1].id}`]) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
    expect(blocking.map(({ id, impact }) => ({ id, impact }))).toEqual([]);
  }
});

test('mobile dataset filters open with the keyboard', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile-only dataset disclosure check.');
  await page.goto('/catalog');
  const toggle = page.getByRole('button', { name: /Filters/ });
  await toggle.focus();
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByLabel('Filter records')).toBeVisible();
});

test('administrator dashboard identifies the active research dataset and CLI-managed rows', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Administrator dataset table is covered on desktop.');
  test.skip(!ADMIN_USERNAME || !ADMIN_PASSWORD, 'Administrator E2E credentials are not configured.');
  await page.goto('/');
  const login = await page.evaluate(async ({ url, username, password }) => {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.status;
  }, { url: `${apiBaseUrl}/api/auth/login`, username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
  expect(login).toBe(200);

  await page.route('**/api/admin/summary', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: {
      summary: { activeProducts: 2305, lowStock: 0, outOfStock: 0, unresolvedArtwork: 2304, softDeleted: 0 },
      recentActions: [],
      dataset: {
        datasetKey,
        productCollection: 'datasetProducts',
        sourceVersion: '2023-cds-vinyl-5core-v3',
        catalogMode: 'research-only',
        counts: { products: 2305, users: 2387, ratings: 20288 },
        activatedAt: '2026-08-02T00:00:00.000Z',
      },
    } }),
  }));
  await page.route('**/api/admin/products?*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: { items: [products[0]], total: 2305, page: 1, limit: 20 } }),
  }));

  await page.goto('/admin');
  await expect(page.getByText(datasetKey)).toBeVisible();
  await expect(page.getByText('Research-only browsing')).toBeVisible();
  await expect(page.getByText('The active dataset has no store price')).toBeVisible();
  await expect(page.getByText('Low stock')).toHaveCount(0);
  await page.getByRole('link', { name: 'Products', exact: true }).click();
  await expect(page.getByText('CLI managed')).toBeVisible();
  await expect(page.getByText('Amazon subset')).toBeVisible();
});
