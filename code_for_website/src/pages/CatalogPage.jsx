import { useState, useMemo } from 'react';
import { records } from '../data/records';
import FilterSidebar from '../components/FilterSidebar';
import { ProductGrid } from '../components/ProductGrid';

const DEFAULT_FILTERS = { genres: [], eras: [], conditions: [], inStockOnly: false, minPrice: 0, maxPrice: 200 };
const SORT_OPTIONS = ['Newest first', 'Price: low to high', 'Price: high to low', 'Artist A–Z'];

function eraMatch(year, eras) {
  if (!eras.length) return true;
  return eras.some(e => {
    if (e === '2000s+') return year >= 2000;
    const decade = parseInt(e);
    return year >= decade && year < decade + 10;
  });
}

export default function CatalogPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort]       = useState('Newest first');

  const filtered = useMemo(() => {
    let res = records.filter(r => {
      if (filters.genres.length     && !filters.genres.includes(r.genre))      return false;
      if (!eraMatch(r.year, filters.eras))                                       return false;
      if (filters.conditions.length && !filters.conditions.includes(r.condition)) return false;
      if (filters.inStockOnly       && r.stock === 'out')                        return false;
      if (r.price < filters.minPrice || r.price > filters.maxPrice)             return false;
      return true;
    });

    if (sort === 'Price: low to high') res = [...res].sort((a, b) => a.price - b.price);
    else if (sort === 'Price: high to low') res = [...res].sort((a, b) => b.price - a.price);
    else if (sort === 'Artist A–Z') res = [...res].sort((a, b) => a.artist.localeCompare(b.artist));
    else res = [...res].sort((a, b) => b.year - a.year);

    return res;
  }, [filters, sort]);

  return (
    <main>
      <div className="container">
        <div className="catalog-layout">
          <FilterSidebar filters={filters} onChange={setFilters} />

          <section aria-label="Record catalog results">
            <div className="catalog-toolbar">
              <p className="result-count" aria-live="polite">
                Showing <strong>{filtered.length}</strong> records
              </p>
              <label htmlFor="sort-select" className="sr-only">Sort by</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="state-box">
                <div className="state-icon" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <p className="state-title">No records match your filters</p>
                <p className="state-desc">Try widening your search or clearing some filters.</p>
                <button className="btn btn-outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <ProductGrid records={filtered} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
