import { useEffect, useState } from 'react';
import CatalogResultsLayout from '../components/CatalogResultsLayout';
import { useCatalogQuery } from '../hooks/useCatalogQuery';

export default function SearchPage() {
  const catalog = useCatalogQuery();
  const queryText = catalog.query.q;
  const updateQuery = catalog.updateQuery;
  const [draft, setDraft] = useState({ sourceQuery: queryText, value: queryText });
  const input = draft.sourceQuery === queryText ? draft.value : queryText;

  useEffect(() => {
    if (input === queryText) return undefined;
    const timer = setTimeout(() => updateQuery({ q: input }, { replace: true }), 300);
    return () => clearTimeout(timer);
  }, [input, queryText, updateQuery]);

  const searchForm = (
    <form className="search-page-form" role="search" onSubmit={(event) => {
      event.preventDefault();
      updateQuery({ q: input });
    }}>
      <label htmlFor="catalog-search">Search title, artist, genre, or label</label>
      <div className="search-page-controls">
        <input id="catalog-search" type="search" value={input} maxLength="100" onChange={(event) => setDraft({ sourceQuery: queryText, value: event.target.value })} />
        <button className="btn btn-primary" type="submit">Search</button>
      </div>
    </form>
  );

  return (
    <CatalogResultsLayout
      title={catalog.query.q ? `Search results for "${catalog.query.q}"` : 'Search records'}
      header={searchForm}
      query={catalog.query}
      updateQuery={catalog.updateQuery}
      resource={catalog}
    />
  );
}
