import { useEffect, useState } from 'react';
import CatalogResultsLayout from '../components/CatalogResultsLayout';
import RecentSearches from '../components/RecentSearches';
import { useCatalogQuery } from '../hooks/useCatalogQuery';
import { useTracking } from '../context/useTracking';
import { useAuth } from '../context/useAuth';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { normalizeSearchTerm } from '../lib/recentSearches';

export default function SearchPage() {
  const catalog = useCatalogQuery();
  const tracking = useTracking();
  const auth = useAuth();
  const queryText = catalog.query.q;
  const updateQuery = catalog.updateQuery;
  const [draft, setDraft] = useState({ sourceQuery: queryText, value: queryText });
  const input = draft.sourceQuery === queryText ? draft.value : queryText;
  const searchScope = auth.status === 'authenticated' ? auth.user.publicId : 'guest';
  const recentSearches = useRecentSearches(searchScope);

  useEffect(() => {
    if (input === queryText) return undefined;
    const timer = setTimeout(() => updateQuery({ q: input }, { replace: true }), 300);
    return () => clearTimeout(timer);
  }, [input, queryText, updateQuery]);

  const commitSearch = (value) => {
    const term = normalizeSearchTerm(value);
    if (!term) return;
    recentSearches.add(term);
    tracking.track('search_submit', {
      surface: 'search',
      value: Math.min(99, term.length),
      dedupeKey: `search:${term}`,
    });
    setDraft({ sourceQuery: term, value: term });
    updateQuery({ q: term });
  };

  const searchForm = (
    <form className="search-page-form" role="search" onSubmit={(event) => {
      event.preventDefault();
      commitSearch(input);
    }}>
      <label htmlFor="catalog-search">Search title, artist, genre, or label</label>
      <div className="search-page-controls">
        <input id="catalog-search" type="search" value={input} maxLength="100" onChange={(event) => setDraft({ sourceQuery: queryText, value: event.target.value })} />
        <button className="btn btn-primary" type="submit">Search</button>
      </div>
      <RecentSearches
        items={recentSearches.items}
        onSelect={commitSearch}
        onClear={recentSearches.clear}
      />
    </form>
  );

  return (
    <CatalogResultsLayout
      title={catalog.query.q ? `Search results for "${catalog.query.q}"` : 'Search records'}
      header={searchForm}
      query={catalog.query}
      updateQuery={catalog.updateQuery}
      resource={catalog}
      surface="search"
    />
  );
}
