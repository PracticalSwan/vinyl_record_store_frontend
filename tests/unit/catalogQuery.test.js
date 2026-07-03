import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CATALOG_QUERY,
  hasCatalogFilters,
  mergeCatalogQuery,
  parseCatalogSearchParams,
  toCatalogSearchParams,
} from '../../src/lib/catalogQuery';

describe('catalog URL query model', () => {
  it('round trips repeated filters, sort, price, and pagination', () => {
    const query = {
      ...DEFAULT_CATALOG_QUERY,
      q: 'blue', page: 3, limit: 48, genres: ['Jazz', 'Rock'], eras: ['1950s'],
      conditions: ['NM'], minPrice: 20, maxPrice: 90, inStock: true, sort: 'price-desc',
    };
    expect(parseCatalogSearchParams(toCatalogSearchParams(query))).toEqual(query);
  });

  it('falls back safely for malformed URL values', () => {
    const parsed = parseCatalogSearchParams(new URLSearchParams(
      'page=-1&limit=999&genre=Unknown&sort=random&minPrice=nope&inStock=false',
    ));
    expect(parsed).toEqual({ ...DEFAULT_CATALOG_QUERY, limit: 100 });
  });

  it('resets page for query changes but preserves explicit page navigation', () => {
    expect(mergeCatalogQuery({ ...DEFAULT_CATALOG_QUERY, page: 4 }, { sort: 'artist-asc' }).page).toBe(1);
    expect(mergeCatalogQuery(DEFAULT_CATALOG_QUERY, { page: 3 }, { resetPage: false }).page).toBe(3);
  });

  it('recognizes active search constraints', () => {
    expect(hasCatalogFilters(DEFAULT_CATALOG_QUERY)).toBe(false);
    expect(hasCatalogFilters({ ...DEFAULT_CATALOG_QUERY, genres: ['Jazz'] })).toBe(true);
  });
});
