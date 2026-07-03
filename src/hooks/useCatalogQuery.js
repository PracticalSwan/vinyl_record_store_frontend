import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  mergeCatalogQuery,
  parseCatalogSearchParams,
  toCatalogSearchParams,
} from '../lib/catalogQuery';
import { useProductQuery } from './useRemoteProducts';

export function useCatalogQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseCatalogSearchParams(searchParams), [searchParams]);
  const resource = useProductQuery(query);

  const updateQuery = useCallback((patch, options = {}) => {
    const next = mergeCatalogQuery(query, patch, { resetPage: options.resetPage !== false });
    setSearchParams(toCatalogSearchParams(next), { replace: Boolean(options.replace) });
  }, [query, setSearchParams]);

  useEffect(() => {
    if (!resource.meta || query.page === 1) return;
    if (resource.meta.totalPages === 0 || query.page > resource.meta.totalPages) {
      updateQuery({ page: 1 }, { resetPage: false, replace: true });
    }
  }, [query.page, resource.meta, updateQuery]);

  return { query, updateQuery, ...resource };
}
