import { useCallback, useEffect, useState } from 'react';
import {
  addRecentSearch,
  clearRecentSearches,
  readRecentSearches,
  recentSearchStorageKey,
} from '../lib/recentSearches';

const RECENT_SEARCH_EVENT = 'groovehaus:recent-searches';

export function useRecentSearches(scope = 'guest') {
  const [state, setState] = useState(() => ({ scope, items: readRecentSearches(scope) }));
  const items = state.scope === scope ? state.items : readRecentSearches(scope);

  useEffect(() => {
    const storageKey = recentSearchStorageKey(scope);
    const sync = (event) => {
      if (event.type === 'storage' && event.key !== storageKey) return;
      if (event.type === RECENT_SEARCH_EVENT && event.detail?.scope !== scope) return;
      setState({ scope, items: readRecentSearches(scope) });
    };
    window.addEventListener('storage', sync);
    window.addEventListener(RECENT_SEARCH_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(RECENT_SEARCH_EVENT, sync);
    };
  }, [scope]);

  const notify = useCallback(() => {
    window.dispatchEvent(new CustomEvent(RECENT_SEARCH_EVENT, { detail: { scope } }));
  }, [scope]);

  const add = useCallback((value) => {
    const next = addRecentSearch(scope, value);
    setState({ scope, items: next });
    notify();
    return next;
  }, [notify, scope]);

  const clear = useCallback(() => {
    clearRecentSearches(scope);
    setState({ scope, items: [] });
    notify();
  }, [notify, scope]);

  return { items, add, clear };
}
