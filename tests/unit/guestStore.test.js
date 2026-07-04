import { beforeEach, describe, expect, it } from 'vitest';
import {
  GUEST_STORE_KEY,
  ensureGuestMerge,
  migrateLegacyGuestStore,
  readGuestStore,
  resetGuestStoreMigrationForTests,
  toGuestMergePayload,
  writeGuestStore,
} from '../../src/lib/guestStore';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

describe('guestStore', () => {
  it('falls back safely for malformed JSON and invalid values', () => {
    const malformed = memoryStorage({ [GUEST_STORE_KEY]: '{broken' });
    expect(readGuestStore(malformed)).toMatchObject({ wishlist: [], cart: [], ratings: [] });

    const storage = memoryStorage();
    writeGuestStore({ wishlist: [1, 1, -2], cart: [{ id: 2, qty: 120 }, { id: 'bad', qty: 1 }] }, storage);
    expect(readGuestStore(storage)).toMatchObject({
      wishlist: [1],
      cart: [{ id: 2, qty: 99 }],
    });
  });

  it('drops values that would invalidate an otherwise valid backend merge', () => {
    const payload = toGuestMergePayload({
      wishlist: [1, 1_000_001],
      cart: [{ id: 2, qty: 1 }, { id: 1_000_001, qty: 1 }],
      ratings: [
        { id: 3, rating: 5, updatedAt: 'not-a-date' },
        { id: 4, rating: 4, updatedAt: '1999-12-31T23:59:59.999Z' },
        { id: 5, rating: 3, updatedAt: '2026-07-04T00:00:00.000Z' },
      ],
    });

    expect(payload).toMatchObject({
      wishlist: [1],
      cart: [{ productId: 2, quantity: 1 }],
      ratings: [{ productId: 5, rating: 3, updatedAt: '2026-07-04T00:00:00.000Z' }],
    });
  });

  it('keeps a stable merge id and maps the backend payload', () => {
    const state = ensureGuestMerge({
      wishlist: [1],
      cart: [{ id: 2, qty: 3 }],
      ratings: [{ id: 3, rating: 4, updatedAt: '2026-07-04T00:00:00.000Z' }],
    });
    expect(ensureGuestMerge(state).mergeId).toBe(state.mergeId);
    expect(toGuestMergePayload(state)).toEqual({
      mergeId: state.mergeId,
      wishlist: [1],
      cart: [{ productId: 2, quantity: 3 }],
      ratings: [{ productId: 3, rating: 4, updatedAt: '2026-07-04T00:00:00.000Z' }],
    });
  });

  it('reports quota failures without throwing', () => {
    const storage = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
    expect(writeGuestStore({ wishlist: [1] }, storage)).toBe(false);
  });

  it('migrates versionless state and rejects unknown future versions safely', () => {
    const legacy = memoryStorage({
      [GUEST_STORE_KEY]: JSON.stringify({ wishlist: [4], cart: [{ productId: 2, quantity: 3 }] }),
    });
    expect(readGuestStore(legacy)).toMatchObject({ wishlist: [4], cart: [{ id: 2, qty: 3 }] });

    const future = memoryStorage({
      [GUEST_STORE_KEY]: JSON.stringify({ version: 99, wishlist: [4] }),
    });
    expect(readGuestStore(future).wishlist).toEqual([]);
  });
});

describe('guestStore production storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetGuestStoreMigrationForTests();
  });

  it('uses sessionStorage by default so guest state clears with the tab', () => {
    writeGuestStore({ wishlist: [7] });
    expect(sessionStorage.getItem(GUEST_STORE_KEY)).not.toBeNull();
    expect(JSON.parse(sessionStorage.getItem(GUEST_STORE_KEY)).wishlist).toEqual([7]);
    expect(localStorage.getItem(GUEST_STORE_KEY)).toBeNull();
    expect(readGuestStore().wishlist).toEqual([7]);
  });

  it('drops legacy localStorage guest data on first production use', () => {
    localStorage.setItem(
      GUEST_STORE_KEY,
      JSON.stringify({ wishlist: [9], cart: [{ id: 2, qty: 1 }] }),
    );
    expect(readGuestStore().wishlist).toEqual([]);
    expect(localStorage.getItem(GUEST_STORE_KEY)).toBeNull();
  });

  it('migrateLegacyGuestStore removes the legacy key without touching session state', () => {
    sessionStorage.setItem(GUEST_STORE_KEY, JSON.stringify({ wishlist: [5] }));
    localStorage.setItem(GUEST_STORE_KEY, JSON.stringify({ wishlist: [9] }));
    migrateLegacyGuestStore();
    expect(localStorage.getItem(GUEST_STORE_KEY)).toBeNull();
    expect(readGuestStore().wishlist).toEqual([5]);
  });
});
