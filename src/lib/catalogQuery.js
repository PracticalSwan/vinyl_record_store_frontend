export const GENRES = ['Jazz', 'Rock', 'Soul', 'Electronic', 'Classical', 'Folk', 'Hip-Hop', 'Blues'];
export const ERAS = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s+'];
export const CONDITIONS = ['M', 'NM', 'VG+', 'VG', 'G'];
export const SORTS = ['newest', 'price-asc', 'price-desc', 'artist-asc'];

export const DEFAULT_CATALOG_QUERY = {
  q: '',
  page: 1,
  limit: 24,
  genres: [],
  eras: [],
  conditions: [],
  minPrice: null,
  maxPrice: null,
  inStock: false,
  sort: 'newest',
};

const positiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};
const optionalPrice = (value) => {
  if (value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};
const controlled = (params, name, allowed) => [
  ...new Set(params.getAll(name).filter((value) => allowed.includes(value))),
];

export function parseCatalogSearchParams(searchParams) {
  const sort = searchParams.get('sort');
  return {
    q: (searchParams.get('q') || '').slice(0, 100),
    page: positiveInteger(searchParams.get('page'), 1),
    limit: Math.min(positiveInteger(searchParams.get('limit'), 24), 100),
    genres: controlled(searchParams, 'genre', GENRES),
    eras: controlled(searchParams, 'era', ERAS),
    conditions: controlled(searchParams, 'condition', CONDITIONS),
    minPrice: optionalPrice(searchParams.get('minPrice')),
    maxPrice: optionalPrice(searchParams.get('maxPrice')),
    inStock: searchParams.get('inStock') === 'true',
    sort: SORTS.includes(sort) ? sort : 'newest',
  };
}

export function toCatalogSearchParams(query) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.page > 1) params.set('page', String(query.page));
  if (query.limit !== 24) params.set('limit', String(query.limit));
  for (const genre of query.genres) params.append('genre', genre);
  for (const era of query.eras) params.append('era', era);
  for (const condition of query.conditions) params.append('condition', condition);
  if (query.minPrice !== null) params.set('minPrice', String(query.minPrice));
  if (query.maxPrice !== null) params.set('maxPrice', String(query.maxPrice));
  if (query.inStock) params.set('inStock', 'true');
  if (query.sort !== 'newest') params.set('sort', query.sort);
  return params;
}

export function mergeCatalogQuery(current, patch, { resetPage = true } = {}) {
  return { ...current, ...patch, page: resetPage && !('page' in patch) ? 1 : (patch.page ?? current.page) };
}

export const hasCatalogFilters = (query) => Boolean(
  query.q || query.genres.length || query.eras.length || query.conditions.length
  || query.minPrice !== null || query.maxPrice !== null || query.inStock,
);
