const STORAGE_VERSION = 1;
const MAX_PRODUCT_ID = 1_000_000;
const MIN_RATING_TIMESTAMP = Date.UTC(2000, 0, 1);
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
// Guest state is intentionally session-scoped. It lives in sessionStorage so an
// unsigned visitor's wishlist/cart/ratings are cleared when the tab closes and
// never persist beyond the browsing session. On first use we also drop any
// legacy copy left in localStorage by older builds, so returning visitors start
// clean instead of inheriting a stale cart.
export const GUEST_STORE_KEY = 'groovehaus.guest-store.v1';

export const emptyGuestStore = () => ({
  version: STORAGE_VERSION,
  wishlist: [],
  cart: [],
  ratings: [],
  mergeId: null,
});

const positiveId = (value) => Number.isSafeInteger(Number(value))
  && Number(value) > 0
  && Number(value) <= MAX_PRODUCT_ID
  ? Number(value)
  : null;

function normalizeWishlist(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(positiveId).filter(Boolean))].slice(0, 100);
}

function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const quantities = new Map();
  for (const item of value) {
    const id = positiveId(item?.id ?? item?.productId ?? item?.productPublicId);
    const qty = Number(item?.qty ?? item?.quantity);
    if (!id || !Number.isInteger(qty) || qty < 1) continue;
    quantities.set(id, Math.min(99, qty));
  }
  return [...quantities].slice(0, 100).map(([id, qty]) => ({ id, qty }));
}

function normalizeRatings(value) {
  const input = Array.isArray(value)
    ? value
    : Object.entries(value || {}).map(([id, entry]) => ({ id, ...entry }));
  const ratings = new Map();
  for (const item of input) {
    const id = positiveId(item?.id ?? item?.productId ?? item?.productPublicId);
    const rating = Number(item?.rating);
    const updatedAt = new Date(item?.updatedAt);
    if (
      !id
      || !Number.isInteger(rating)
      || rating < 1
      || rating > 5
      || Number.isNaN(updatedAt.getTime())
      || updatedAt.getTime() < MIN_RATING_TIMESTAMP
      || updatedAt.getTime() > Date.now() + MAX_FUTURE_SKEW_MS
    ) continue;
    ratings.set(id, {
      id,
      rating,
      updatedAt: updatedAt.toISOString(),
    });
  }
  return [...ratings.values()].slice(0, 100);
}

export function normalizeGuestStore(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyGuestStore();
  const version = value.version ?? 0;
  if (version !== 0 && version !== STORAGE_VERSION) return emptyGuestStore();
  return {
    version: STORAGE_VERSION,
    wishlist: normalizeWishlist(value.wishlist),
    cart: normalizeCart(value.cart),
    ratings: normalizeRatings(value.ratings),
    mergeId: typeof value.mergeId === 'string' && value.mergeId.length <= 128
      ? value.mergeId
      : null,
  };
}

function resolveStorage(storage) {
  if (storage) return storage;
  if (!legacyMigrationDone) {
    legacyMigrationDone = true;
    migrateLegacyGuestStore();
  }
  return typeof window === 'undefined' ? null : window.sessionStorage;
}

export function readGuestStore(storage) {
  try {
    const target = resolveStorage(storage);
    if (!target) return emptyGuestStore();
    const raw = target.getItem(GUEST_STORE_KEY);
    return raw ? normalizeGuestStore(JSON.parse(raw)) : emptyGuestStore();
  } catch {
    return emptyGuestStore();
  }
}

export function writeGuestStore(value, storage) {
  const normalized = normalizeGuestStore(value);
  try {
    const target = resolveStorage(storage);
    if (!target) return false;
    target.setItem(GUEST_STORE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

export function clearGuestStore(storage) {
  try {
    resolveStorage(storage)?.removeItem(GUEST_STORE_KEY);
  } catch {
    // Storage can be unavailable in privacy modes. In-memory state still resets safely.
  }
}

// Removes any guest-store copy left in localStorage by older builds. Run once on
// first production use; exported so tests and an explicit reset can call it.
let legacyMigrationDone = false;
export function migrateLegacyGuestStore() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(GUEST_STORE_KEY);
    }
  } catch {
    // localStorage can be unavailable in privacy modes; safe to skip.
  }
}

export function resetGuestStoreMigrationForTests() {
  legacyMigrationDone = false;
}

export function hasGuestState(value) {
  const normalized = normalizeGuestStore(value);
  return normalized.wishlist.length > 0
    || normalized.cart.length > 0
    || normalized.ratings.length > 0;
}

export function ensureGuestMerge(value) {
  const normalized = normalizeGuestStore(value);
  if (!hasGuestState(normalized) || normalized.mergeId) return normalized;
  const random = globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { ...normalized, mergeId: `guest-merge-${random}` };
}

export function toGuestMergePayload(value) {
  const normalized = ensureGuestMerge(value);
  return {
    mergeId: normalized.mergeId,
    wishlist: normalized.wishlist,
    cart: normalized.cart.map(({ id, qty }) => ({ productId: id, quantity: qty })),
    ratings: normalized.ratings.map(({ id, rating, updatedAt }) => ({
      productId: id,
      rating,
      updatedAt,
    })),
  };
}
