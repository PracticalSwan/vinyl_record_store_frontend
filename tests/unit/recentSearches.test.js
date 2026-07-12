import { beforeEach, describe, expect, it } from 'vitest';
import {
  addRecentSearch,
  clearRecentSearches,
  MAX_RECENT_SEARCHES,
  readRecentSearches,
  recentSearchStorageKey,
} from '../../src/lib/recentSearches';

describe('recent searches', () => {
  beforeEach(() => localStorage.clear());

  it('stores a case-insensitive MRU list capped at five entries per scope', () => {
    ['Blue', 'Jazz', 'Soul', 'Rock', 'Folk', 'Electronic'].forEach((term) => addRecentSearch('user-1', term));
    expect(readRecentSearches('user-1')).toEqual(['Electronic', 'Folk', 'Rock', 'Soul', 'Jazz']);
    expect(readRecentSearches('user-1')).toHaveLength(MAX_RECENT_SEARCHES);

    addRecentSearch('user-1', '  jazz  ');
    expect(readRecentSearches('user-1')).toEqual(['jazz', 'Electronic', 'Folk', 'Rock', 'Soul']);
    expect(readRecentSearches('guest')).toEqual([]);
  });

  it('recovers from malformed storage and clears only the active scope', () => {
    localStorage.setItem(recentSearchStorageKey('user-1'), '{broken');
    addRecentSearch('guest', 'Kind of Blue');
    expect(readRecentSearches('user-1')).toEqual([]);
    expect(clearRecentSearches('guest')).toEqual([]);
    expect(readRecentSearches('guest')).toEqual([]);
  });
});
