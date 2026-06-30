import { useState } from 'react';
import { IconFilter } from './Icons';
import { GENRES, ERAS, CONDITIONS } from '../data/records';

const GENRE_COUNTS = { Jazz: 148, Rock: 312, Soul: 94, Electronic: 201, Classical: 77, Folk: 63, 'Hip-Hop': 115, Blues: 52 };

export default function FilterSidebar({ filters, onChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGenre = (g) => {
    const next = filters.genres.includes(g)
      ? filters.genres.filter(x => x !== g)
      : [...filters.genres, g];
    onChange({ ...filters, genres: next });
  };

  const toggleEra = (e) => {
    const next = filters.eras.includes(e)
      ? filters.eras.filter(x => x !== e)
      : [...filters.eras, e];
    onChange({ ...filters, eras: next });
  };

  const toggleCond = (c) => {
    const next = filters.conditions.includes(c)
      ? filters.conditions.filter(x => x !== c)
      : [...filters.conditions, c];
    onChange({ ...filters, conditions: next });
  };

  const clearAll = () => onChange({ genres: [], eras: [], conditions: [], inStockOnly: false, minPrice: 0, maxPrice: 200 });

  return (
    <>
      <button
        className="filter-mobile-toggle"
        onClick={() => setMobileOpen(o => !o)}
        aria-expanded={mobileOpen}
        aria-controls="filter-sidebar"
      >
        <span>Filters</span><IconFilter />
      </button>

      <aside
        id="filter-sidebar"
        className={`filter-sidebar${mobileOpen ? ' open' : ''}`}
        aria-label="Filter records"
      >
        <p className="filter-title">Filter</p>

        <div className="filter-group" role="group" aria-labelledby="genre-fl">
          <span className="filter-group-label" id="genre-fl">Genre</span>
          {GENRES.map(g => (
            <label className="filter-option" key={g}>
              <input
                type="checkbox"
                checked={filters.genres.includes(g)}
                onChange={() => toggleGenre(g)}
              />
              <span>{g}</span>
              <span className="filter-count">{GENRE_COUNTS[g] ?? ''}</span>
            </label>
          ))}
        </div>
        <hr className="filter-divider" aria-hidden="true" />

        <div className="filter-group" role="group" aria-labelledby="era-fl">
          <span className="filter-group-label" id="era-fl">Era</span>
          {ERAS.map(e => (
            <label className="filter-option" key={e}>
              <input
                type="checkbox"
                checked={filters.eras.includes(e)}
                onChange={() => toggleEra(e)}
              />
              <span>{e}</span>
            </label>
          ))}
        </div>
        <hr className="filter-divider" aria-hidden="true" />

        <div className="filter-group" role="group" aria-labelledby="cond-fl">
          <span className="filter-group-label" id="cond-fl">Condition</span>
          {CONDITIONS.map(c => (
            <label className="filter-option" key={c}>
              <input
                type="checkbox"
                checked={filters.conditions.includes(c)}
                onChange={() => toggleCond(c)}
              />
              <span>{c}</span>
            </label>
          ))}
        </div>
        <hr className="filter-divider" aria-hidden="true" />

        <div className="filter-group" role="group" aria-labelledby="price-fl">
          <span className="filter-group-label" id="price-fl">Price (USD)</span>
          <div className="price-range">
            <input
              className="price-input"
              type="number"
              min="0"
              value={filters.minPrice}
              aria-label="Minimum price"
              onChange={e => onChange({ ...filters, minPrice: Number(e.target.value) })}
            />
            <span aria-hidden="true">–</span>
            <input
              className="price-input"
              type="number"
              min="0"
              value={filters.maxPrice}
              aria-label="Maximum price"
              onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            />
          </div>
        </div>
        <hr className="filter-divider" aria-hidden="true" />

        <div className="filter-group" role="group" aria-labelledby="stock-fl">
          <span className="filter-group-label" id="stock-fl">Availability</span>
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={e => onChange({ ...filters, inStockOnly: e.target.checked })}
            />
            <span>In stock only</span>
          </label>
        </div>

        <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '.5rem' }} onClick={clearAll}>
          Clear all filters
        </button>
      </aside>
    </>
  );
}
