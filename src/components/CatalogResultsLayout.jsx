import { useEffect, useRef } from 'react';
import { hasCatalogFilters } from '../lib/catalogQuery';
import FilterSidebar from './FilterSidebar';
import Pagination from './Pagination';
import { ProductGrid, SkeletonGrid } from './ProductGrid';

const SORT_OPTIONS = [
  ['newest', 'Newest first'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['artist-asc', 'Artist A-Z'],
];

export default function CatalogResultsLayout({ title, header, query, updateQuery, resource }) {
  const resultsHeading = useRef(null);
  const previousPage = useRef(query.page);
  const { items, meta, status, error, reload } = resource;

  useEffect(() => {
    if (previousPage.current !== query.page && status !== 'loading') {
      resultsHeading.current?.focus();
    }
    previousPage.current = query.page;
  }, [query.page, status]);

  const catalogTotal = meta?.facets?.stock?.reduce((sum, entry) => sum + entry.count, 0) ?? null;
  const emptyTitle = catalogTotal === 0
    ? 'No records are available'
    : hasCatalogFilters(query) ? 'No records match these filters' : 'No records are available';

  return (
    <main>
      <div className="container catalog-page">
        <h1 className="section-heading page-heading">{title}</h1>
        {header}
        <div className="catalog-layout">
          <FilterSidebar query={query} facets={meta?.facets} onChange={updateQuery} />
          <section aria-labelledby="catalog-results-heading" aria-busy={status === 'loading'}>
            <div className="catalog-toolbar">
              <p className="result-count" aria-live="polite">
                {status === 'loading' ? 'Updating results...' : `Showing ${items.length} of ${meta?.total ?? 0} records`}
              </p>
              <label htmlFor="sort-select" className="sr-only">Sort by</label>
              <select id="sort-select" className="sort-select" value={query.sort} onChange={(event) => updateQuery({ sort: event.target.value })}>
                {SORT_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </div>
            <h2 id="catalog-results-heading" ref={resultsHeading} tabIndex="-1" className="sr-only">Catalog results</h2>
            {status === 'error' && (
              <div className="state-box compact-state" role="alert">
                <p className="state-title">Catalog unavailable</p>
                <p className="state-desc">{error?.message}</p>
                <button className="btn btn-primary" onClick={reload}>Try again</button>
              </div>
            )}
            {status === 'loading' && items.length === 0 && <SkeletonGrid count={8} />}
            {status === 'empty' && (
              <div className="state-box" role="status">
                <p className="state-title">{emptyTitle}</p>
                <p className="state-desc">Try widening your query or clearing some filters.</p>
                {hasCatalogFilters(query) && (
                  <button className="btn btn-outline" onClick={() => updateQuery({ q: '', genres: [], eras: [], conditions: [], minPrice: null, maxPrice: null, inStock: false })}>
                    Clear search and filters
                  </button>
                )}
              </div>
            )}
            {items.length > 0 && <ProductGrid records={items} />}
            <Pagination page={query.page} totalPages={meta?.totalPages ?? 0} onPageChange={(page) => updateQuery({ page }, { resetPage: false })} />
          </section>
        </div>
      </div>
    </main>
  );
}
