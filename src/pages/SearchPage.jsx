import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/ProductGrid';
import { useCatalog } from '../context/useCatalog';

export default function SearchPage() {
  const { records } = useCatalog();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return records.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.artist.toLowerCase().includes(q) ||
      r.genre.toLowerCase().includes(q)
    );
  }, [query, records]);

  return (
    <main>
      <div className="container">
        <div className="search-header">
          <p className="search-query-display">
            Results for "<em>{query}</em>"
          </p>
          <p style={{ color: 'var(--ink-muted)', fontSize: 14, marginTop: 4 }} aria-live="polite">
            {results.length} record{results.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div style={{ padding: '1.5rem 0' }}>
          {results.length === 0 ? (
            <div className="state-box">
              <p className="state-title">No results for "{query}"</p>
              <p className="state-desc">Try a different artist, album title, or genre.</p>
            </div>
          ) : (
            <ProductGrid records={results} />
          )}
        </div>
      </div>
    </main>
  );
}
