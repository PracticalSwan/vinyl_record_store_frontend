export const MAX_RECENT_SEARCHES = 5;

const STORAGE_PREFIX = 'groovehaus.recent-searches.v1.';

export function normalizeSearchTerm(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 100);
}

export function recentSearchStorageKey(scope = 'guest') {
  return `${STORAGE_PREFIX}${encodeURIComponent(String(scope || 'guest'))}`;
}

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const result = [];
  for (const entry of value) {
    const term = normalizeSearchTerm(entry);
    const identity = term.toLocaleLowerCase();
    if (!term || seen.has(identity)) continue;
    seen.add(identity);
    result.push(term);
    if (result.length === MAX_RECENT_SEARCHES) break;
  }
  return result;
}

export function readRecentSearches(scope, storage = globalThis.localStorage) {
  try {
    return normalizeList(JSON.parse(storage.getItem(recentSearchStorageKey(scope)) || '[]'));
  } catch {
    return [];
  }
}

export function addRecentSearch(scope, value, storage = globalThis.localStorage) {
  const term = normalizeSearchTerm(value);
  if (!term) return readRecentSearches(scope, storage);
  const identity = term.toLocaleLowerCase();
  const next = [term, ...readRecentSearches(scope, storage).filter(
    (entry) => entry.toLocaleLowerCase() !== identity,
  )].slice(0, MAX_RECENT_SEARCHES);
  try {
    storage.setItem(recentSearchStorageKey(scope), JSON.stringify(next));
  } catch {
    // Search still works when browser storage is unavailable.
  }
  return next;
}

export function clearRecentSearches(scope, storage = globalThis.localStorage) {
  try {
    storage.removeItem(recentSearchStorageKey(scope));
  } catch {
    // Search still works when browser storage is unavailable.
  }
  return [];
}
