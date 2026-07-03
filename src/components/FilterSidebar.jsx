import { useState } from 'react';
import { IconFilter } from './Icons';

const toggle = (values, value) => values.includes(value)
  ? values.filter((item) => item !== value)
  : [...values, value];

// Coerce a price input safely: empty -> null, finite non-negative -> number,
// otherwise drop the entry so transient "-" / "1.2e" / negative values never
// reach the backend as NaN or an invalid bound.
const parsePrice = (raw) => {
  if (raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

export default function FilterSidebar({ query, facets, onChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const clearAll = () => onChange({
    genres: [], eras: [], conditions: [], inStock: false, minPrice: null, maxPrice: null,
  });
  return (
    <>
      <button
        className="filter-mobile-toggle"
        onClick={() => setMobileOpen((open) => !open)}
        aria-expanded={mobileOpen}
        aria-controls="filter-sidebar"
      >
        <span>Filters</span><IconFilter />
      </button>
      <aside id="filter-sidebar" className={`filter-sidebar${mobileOpen ? ' open' : ''}`} aria-label="Filter records">
        <p className="filter-title">Filter</p>
        {[
          ['Genre', 'genres', facets?.genres],
          ['Era', 'eras', facets?.eras],
          ['Condition', 'conditions', facets?.conditions],
        ].map(([label, field, values]) => (
          <div className="filter-block" key={field}>
            <div className="filter-group" role="group" aria-labelledby={`${field}-filter-label`}>
              <span className="filter-group-label" id={`${field}-filter-label`}>{label}</span>
              {(values || []).map(({ value, count }) => (
                <label className="filter-option" key={value}>
                  <input
                    type="checkbox"
                    checked={query[field].includes(value)}
                    onChange={() => onChange({ [field]: toggle(query[field], value) })}
                  />
                  <span>{value}</span><span className="filter-count">{count}</span>
                </label>
              ))}
            </div>
            <hr className="filter-divider" aria-hidden="true" />
          </div>
        ))}
        <div className="filter-group" role="group" aria-labelledby="price-filter-label">
          <span className="filter-group-label" id="price-filter-label">Price (USD)</span>
          <div className="price-range">
            <input className="price-input" type="number" min="0" value={query.minPrice ?? ''} placeholder={String(facets?.price?.min ?? 0)} aria-label="Minimum price" onChange={(event) => onChange({ minPrice: parsePrice(event.target.value) })} />
            <span aria-hidden="true">-</span>
            <input className="price-input" type="number" min="0" value={query.maxPrice ?? ''} placeholder={String(facets?.price?.max ?? 200)} aria-label="Maximum price" onChange={(event) => onChange({ maxPrice: parsePrice(event.target.value) })} />
          </div>
        </div>
        <hr className="filter-divider" aria-hidden="true" />
        <div className="filter-group" role="group" aria-labelledby="stock-filter-label">
          <span className="filter-group-label" id="stock-filter-label">Availability</span>
          <label className="filter-option">
            <input type="checkbox" checked={query.inStock} onChange={(event) => onChange({ inStock: event.target.checked })} />
            <span>In stock only</span>
          </label>
        </div>
        <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '.5rem' }} onClick={clearAll}>Clear all filters</button>
      </aside>
    </>
  );
}
