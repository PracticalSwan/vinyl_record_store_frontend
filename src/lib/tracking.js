import { sendInteractions } from './api';
import {
  getAnonymousId,
  getSessionId,
  isTrackingEnabled,
  resetTrackingPreferenceForTests,
  storeTrackingPreference,
} from './identity';

export const TRACKING_QUEUE_KEY = 'groovehaus.interaction-queue.v1';
const SOURCE = 'groovehaus-frontend';
const SCHEMA_VERSION = 1;
const MAX_QUEUE = 500;
const BATCH_SIZE = 25;
const MAX_ATTEMPTS = 5;
const FLUSH_DELAY_MS = 750;
const debug = String(import.meta.env.VITE_TRACKING_DEBUG || '').toLowerCase() === 'true';
const environmentEnabled = String(import.meta.env.VITE_TRACKING_ENABLED || 'true').toLowerCase() !== 'false';

let queue = loadQueue();
let flushTimer = null;
let retryTimer = null;
let flushing = false;
let initialized = false;
let identityGeneration = 0;
const dedupe = new Map();

function storage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function loadQueue(target = storage()) {
  try {
    const parsed = JSON.parse(target?.getItem(TRACKING_QUEUE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((event) => event && typeof event === 'object') : [];
  } catch {
    return [];
  }
}

export function persistQueue(value = queue, target = storage()) {
  try {
    target?.setItem(TRACKING_QUEUE_KEY, JSON.stringify(value.slice(-MAX_QUEUE)));
    return true;
  } catch {
    return false;
  }
}

export function stripInternal(event) {
  const wire = { ...event };
  delete wire._attempts;
  return wire;
}

export function retryDelay(attempts) {
  return Math.min(30_000, 1_000 * (2 ** Math.min(5, attempts)));
}

export function surfaceFromPath(pathname = globalThis.location?.pathname || '/') {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/recommendations')) return 'recommendations';
  if (pathname.startsWith('/records/')) return 'product-detail';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/wishlist')) return 'wishlist';
  if (pathname.startsWith('/cart')) return 'cart';
  return 'catalog';
}

function enabled() {
  return environmentEnabled && isTrackingEnabled(storage());
}

function clearTimers() {
  if (flushTimer) clearTimeout(flushTimer);
  if (retryTimer) clearTimeout(retryTimer);
  flushTimer = null;
  retryTimer = null;
}

export function setTrackingEnabled(value) {
  storeTrackingPreference(value, storage());
  if (!value) {
    queue = [];
    dedupe.clear();
    clearTimers();
    try { storage()?.removeItem(TRACKING_QUEUE_KEY); } catch { /* ignored */ }
  } else if (queue.length) {
    scheduleFlush();
  }
}

export function trackingEnabled() {
  return enabled();
}

function scheduleFlush(delay = FLUSH_DELAY_MS) {
  if (flushTimer || retryTimer || flushing || !enabled()) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, delay);
}

function requeue(batch) {
  const retriable = batch
    .map((event) => ({ ...event, _attempts: (event._attempts || 0) + 1 }))
    .filter((event) => event._attempts < MAX_ATTEMPTS);
  queue = [...retriable, ...queue].slice(-MAX_QUEUE);
  persistQueue();
  return retriable;
}

export function track(type, payload = {}) {
  if (!enabled()) return false;
  const event = {
    eventId: globalThis.crypto?.randomUUID?.() || `event-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    v: SCHEMA_VERSION,
    type,
    anonymousId: getAnonymousId(storage()),
    sessionId: getSessionId(typeof window === 'undefined' ? null : window.sessionStorage),
    productId: payload.productId ?? null,
    occurredAt: new Date().toISOString(),
    source: SOURCE,
    surface: payload.surface || surfaceFromPath(),
    ...(payload.value === undefined || payload.value === null ? {} : { value: payload.value }),
    ...(payload.recommendationContext ? { recommendationContext: payload.recommendationContext } : {}),
    ...(payload.searchContext ? { searchContext: payload.searchContext } : {}),
  };
  const dedupeKey = payload.dedupeKey;
  if (dedupeKey) {
    const now = Date.now();
    const windowMs = payload.dedupeWindowMs ?? 2_000;
    const last = dedupe.get(dedupeKey);
    if (last !== undefined && now - last < windowMs) return false;
    dedupe.set(dedupeKey, now);
  }
  if (debug) {
    console.debug('[tracking]', event);
    return true;
  }
  queue = [...queue, event].slice(-MAX_QUEUE);
  persistQueue();
  scheduleFlush();
  return true;
}

export async function flush({ keepalive = false } = {}) {
  if (flushing || !enabled() || !queue.length) return;
  const generation = identityGeneration;
  flushing = true;
  const batch = queue.splice(0, BATCH_SIZE);
  persistQueue();
  try {
    const response = await sendInteractions(batch.map(stripInternal), { keepalive });
    const handled = Math.max(0, Math.min(
      batch.length,
      Number(response.data.accepted || 0) + Number(response.data.duplicates || 0),
    ));
    if (generation === identityGeneration && handled < batch.length && enabled()) {
      requeue(batch.slice(handled));
    }
  } catch {
    if (generation !== identityGeneration || !enabled()) return;
    const retriable = requeue(batch);
    if (retriable.length && enabled()) {
      const attempts = Math.max(...retriable.map((event) => event._attempts || 0));
      retryTimer = setTimeout(() => {
        retryTimer = null;
        flush();
      }, retryDelay(attempts));
    }
  } finally {
    flushing = false;
    if (generation === identityGeneration && queue.length && !retryTimer) scheduleFlush();
  }
}

export async function prepareTrackingIdentityChange() {
  identityGeneration += 1;
  clearTimers();
  await flush();
  clearTimers();
  queue = [];
  dedupe.clear();
  persistQueue([]);
  try { storage()?.removeItem(TRACKING_QUEUE_KEY); } catch { /* ignored */ }
}

function flushOnHide() {
  flush({ keepalive: true });
}

function onVisibilityChange() {
  if (document.visibilityState === 'hidden') flushOnHide();
}

export function initializeTracking() {
  if (typeof window === 'undefined' || initialized) return () => {};
  initialized = true;
  queue = loadQueue();
  window.addEventListener('pagehide', flushOnHide);
  document.addEventListener('visibilitychange', onVisibilityChange);
  if (queue.length) scheduleFlush();
  return () => {
    window.removeEventListener('pagehide', flushOnHide);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    initialized = false;
  };
}

export function trackingQueueForTests() {
  return [...queue];
}

export function resetTrackingForTests() {
  clearTimers();
  queue = [];
  flushing = false;
  dedupe.clear();
  initialized = false;
  identityGeneration = 0;
  resetTrackingPreferenceForTests();
}
