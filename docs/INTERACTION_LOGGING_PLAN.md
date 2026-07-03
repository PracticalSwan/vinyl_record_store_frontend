# Interaction Logging (Frontend) Implementation Plan

Later decision: FFP-01 in `FUTURE_IMPLEMENTATION_PLAN.md` supplements this general tracking plan with recommendation-specific events and the approved default-on, visible-opt-out privacy behavior. Reconcile both documents before implementation; FFP-01 controls if they conflict.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture storefront interactions (views, wishlist, cart, rating, search) from the Groovehaus frontend and send them to the backend as a batched, durable, fire-and-forget stream so the recommender can later learn from real signals.

**Architecture:** A framework-agnostic singleton module (`src/lib/tracking.js`) owns an anonymous identity, an in-memory queue persisted to `localStorage`, debounced batched flushes to `POST /api/interactions`, retry with exponential backoff, and a `pagehide`/`visibilitychange` flush via `fetch(..., { keepalive: true })`. Components call `track(type, payload)` at interaction points. The module is fully usable before the backend write route exists: events are queued and retried, then dropped after a bounded number of attempts, and never break the UI.

**Tech Stack:** React 19, Vite 8, existing `src/lib/api.js` HTTP boundary, `localStorage`/`sessionStorage`, `fetch` with `keepalive`. No new runtime dependency.

---

## Scope

**In scope (this plan, frontend only):**

- Interaction event model and the assumed backend write contract (the schema the frontend sends).
- The tracking client module, identity, queue, flush, retry, dedup, debug mode.
- Wiring `track(...)` into existing UI interaction points.
- Documentation updates for the contract, backlog, roadmap, and env template.

**Out of scope (separate plans):**

- Backend `POST /api/interactions` handler, validation, MongoDB persistence, and adding `POST` to CORS. This plan only **defines the contract** the frontend depends on.
- Wiring recommendations to use the captured identity (see Follow-ups).
- Authentication and real user identity.
- A privacy/opt-out consent banner (decision item below).

## Decisions (locked in this plan)

1. **Anonymous browser identity, not `demo-user`.** Tracking uses a client-generated `anon_*` id stored in `localStorage` so a per-browser profile can be reconstructed server-side later. Recommendations continue to use the documented `demo-user` demo profile until the backend can personalize from captured history — the identity seam is documented as a follow-up, not changed here.
2. **Batched POST, single endpoint.** One route receives a batch: `POST /api/interactions` with `{ events: [...] }`. Batching reduces request count; the queue drains 25 events at a time.
3. **Fire-and-forget, never block the UI.** `track` is synchronous and returns nothing; all network work is backgrounded; every error is swallowed inside the module.
4. **Durable queue.** Unsent events persist in `localStorage` across refresh. On failure, events retry with exponential backoff up to `MAX_ATTEMPTS` (5), then are dropped to bound storage. Until the backend route exists, events will retry then drop — this is expected and harmless.
5. **No test runner is added by default.** The frontend has no test framework; this plan validates via `npm run lint`, `npm run build`, and manual browser verification (DevTools Network panel), per the project convention. Adding Vitest for the pure tracking helpers is an optional final task.
6. **Debug mode is log-only.** With `VITE_TRACKING_DEBUG=true`, events print to the console and are **not** queued or sent, so the module can be developed and demoed without a backend.

## Event schema (versioned)

One interaction event:

```json
{
  "v": 1,
  "type": "view | wishlist_add | wishlist_remove | cart_add | cart_remove | cart_qty | rating | search",
  "userId": "anon_<uuid>",
  "sessionId": "sess_<random>",
  "productId": 42,
  "value": 5,
  "query": "miles davis",
  "ts": "2026-07-03T12:00:00.000Z",
  "source": "groovehaus-frontend"
}
```

- `productId`: number for product-scoped events, `null` otherwise.
- `value`: rating stars (1-5) for `rating`; qty delta for `cart_qty`; `null` otherwise.
- `query`: the search string for `search`; `null` otherwise.
- `ts`: ISO 8601 client timestamp.
- Internal bookkeeping fields (e.g. retry counter) are stripped before sending.

## Assumed backend contract (for the backend plan to implement)

```text
POST /api/interactions
  Request:  { "events": Event[] }
  Response: 200 { "data": { "accepted": <number>, "rejected": 0 } }
  Errors:   standard { "error": { "code": "...", "message": "..." } }
```

Backend prerequisites (out of scope here): add `POST` to `Access-Control-Allow-Methods` and keep `Content-Type` in `Access-Control-Allow-Headers` in `vinyl_record_store_backend/next.config.mjs`.

## File structure

| File | Status | Responsibility |
| --- | --- | --- |
| `src/lib/tracking.js` | Create | Identity, queue, `track`, `flush`, retry, dedup, debug, `initTracking`. Singleton, no React. |
| `src/lib/api.js` | Modify | Extend `request` to support `POST`; add `postInteractions(events, { signal, keepalive })`. |
| `src/main.jsx` | Modify | Import and call `initTracking()` once at app start. |
| `src/context/StoreProvider.jsx` | Modify | Emit `wishlist_add`/`wishlist_remove`, `cart_add`, `cart_remove`, `cart_qty`. |
| `src/pages/DetailPage.jsx` | Modify | Emit `view` (deduped) on mount and `rating` on star click. |
| `src/pages/SearchPage.jsx` | Modify | Emit `search` (debounced) on query change. |
| `.env.example` | Modify | Document `VITE_TRACKING_DEBUG` and `VITE_TRACKING_ENABLED`. |
| `docs/API_CONTRACT_PLAN.md` | Modify | Add the POST contract and event schema. |
| `docs/TASK_BACKLOG.md` | Modify | Add tracking tasks; move interactions out of "deferred". |
| `docs/ROADMAP.md` | Modify | Note the interaction-logging milestone. |
| `docs/RECOMMENDER_SYSTEM_PLAN.md` | Modify | Note captured signals as a future input. |

---

## Task 1: Tracking core module

**Files:**

- Create: `src/lib/tracking.js`

- [ ] **Step 1: Create the module**

```javascript
// src/lib/tracking.js
// Interaction tracking client. Fire-and-forget: never blocks UI, never throws to callers.
// Events queue in localStorage so unsent events survive refresh, then POST in batches.
// Until the backend implements POST /api/interactions, events retry then drop (expected).

import { postInteractions } from './api';

const UID_KEY = 'groovehaus.uid';
const SID_KEY = 'groovehaus.sid';
const QUEUE_KEY = 'groovehaus.queue';
const SOURCE = 'groovehaus-frontend';
const SCHEMA_VERSION = 1;

const env = (import.meta.env.VITE_TRACKING_DEBUG ?? '').toLowerCase();
const envEn = (import.meta.env.VITE_TRACKING_ENABLED ?? 'true').toLowerCase();
const DEBUG = env === 'true';
const ENABLED = envEn !== 'false';

const FLUSH_DEBOUNCE_MS = 1500;
const FLUSH_BATCH_SIZE = 25;
const MAX_ATTEMPTS = 5;
const VIEW_DEDUP_MS = 30000;

// --- identity ---
function getUserId() {
  try {
    let id = localStorage.getItem(UID_KEY);
    if (!id) {
      const rand = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      id = `anon_${rand}`;
      localStorage.setItem(UID_KEY, id);
    }
    return id;
  } catch {
    return 'anon_unknown';
  }
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SID_KEY);
    if (!id) {
      id = `sess_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SID_KEY, id);
    }
    return id;
  } catch {
    return 'sess_unknown';
  }
}

// --- queue persistence ---
let queue = loadQueue();

function loadQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistQueue() {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or unavailable: drop oldest until it fits, else stop silently.
    while (queue.length) {
      queue.shift();
      try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); break; } catch { /* keep dropping */ }
    }
  }
}

// --- view dedup (avoid spamming on re-renders / StrictMode double-invoke) ---
const lastEmitted = new Map();
function shouldDedupe(type, key) {
  if (type !== 'view') return false;
  const now = Date.now();
  const last = lastEmitted.get(key) ?? 0;
  if (now - last < VIEW_DEDUP_MS) return true;
  lastEmitted.set(key, now);
  return false;
}

// --- public API ---
export function track(type, payload = {}) {
  if (!ENABLED) return;
  const event = {
    v: SCHEMA_VERSION,
    type,
    userId: getUserId(),
    sessionId: getSessionId(),
    productId: payload.productId ?? null,
    value: payload.value ?? null,
    query: payload.query ?? null,
    ts: new Date().toISOString(),
    source: SOURCE,
  };
  const dedupeKey = `${type}:${event.productId ?? event.query ?? ''}`;
  if (shouldDedupe(type, dedupeKey)) return;

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.debug('[tracking]', event);
    return; // debug mode: log only, do not queue or send
  }
  queue.push(event);
  persistQueue();
  scheduleFlush();
}

// --- flush ---
let flushTimer = null;
function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => { flushTimer = null; flush(); }, FLUSH_DEBOUNCE_MS);
}

function toWire(event) {
  const { _attempts, ...wire } = event; // strip internal fields before send
  return wire;
}

function maxAttempts(batch) {
  return batch.reduce((max, e) => Math.max(max, e._attempts ?? 0), 0);
}

function backoffMs(attempts) {
  // Exponential backoff keyed on attempt count, capped at 30s.
  return Math.min(30000, 1000 * 2 ** Math.min(5, attempts));
}

// Pop a batch off the queue synchronously before sending, so two concurrent flush
// paths (scheduled flush + pagehide/visibilitychange unload) can never send or
// drop the same events.
function reserveBatch() {
  const batch = queue.splice(0, FLUSH_BATCH_SIZE);
  persistQueue();
  return batch;
}

function requeue(batch) {
  for (const e of batch) e._attempts = (e._attempts ?? 0) + 1;
  const retriable = batch.filter((e) => (e._attempts ?? 0) < MAX_ATTEMPTS);
  queue.unshift(...retriable);
  persistQueue();
}

export async function flush() {
  if (!queue.length) return;
  const batch = reserveBatch();
  if (!batch.length) return;
  try {
    const res = await postInteractions(batch.map(toWire));
    // Contract: data.accepted = number stored. Missing on a 2xx is treated as
    // "all accepted" (optimistic) to avoid retry loops; partial accept requeues the tail.
    // Clamp to [0, batch.length] so a buggy backend (e.g. negative accepted) cannot
    // make batch.slice() discard the head or requeue more than the batch.
    const accepted = Math.max(0, Math.min(
      batch.length,
      Number.isFinite(res?.data?.accepted) ? res.data.accepted : batch.length,
    ));
    if (accepted < batch.length) {
      // Partial accept: route the unaccepted tail through requeue so it is
      // attempt-bumped (and eventually dropped) instead of retrying forever.
      requeue(batch.slice(accepted));
    }
    if (queue.length) scheduleFlush();
  } catch {
    // Never surface to UI: requeue with attempt bump, drop over limit, backoff retry.
    requeue(batch);
    if (queue.length) setTimeout(flush, backoffMs(maxAttempts(batch)));
  }
}

export function flushOnUnload() {
  if (!queue.length) return;
  const batch = reserveBatch();
  if (!batch.length) return;
  postInteractions(batch.map(toWire), { keepalive: true }).catch(() => {
    queue.unshift(...batch); // survive to next page load
    persistQueue();
  });
}

export function initTracking() {
  if (typeof window === 'undefined') return;
  window.addEventListener('pagehide', flushOnUnload);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushOnUnload();
  });
  if (queue.length) scheduleFlush(); // drain backlog from a previous session
}

// dev/inspection only
export function _debugQueue() { return queue; }
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: PASS (no errors). If `no-console` fires on the debug line, the inline disable comment already covers it.

- [ ] **Step 3: Commit**

```bash
git add src/lib/tracking.js
git commit -m "feat(tracking): add interaction tracking client module"
```

Note: do not run the app or `npm run build` yet — `postInteractions` does not exist until Task 2, so the import would not resolve. Lint passes because it does not resolve imports.

---

## Task 2: API client — add `postInteractions`

**Files:**

- Modify: `src/lib/api.js`

- [ ] **Step 1: Extend `request` to support POST**

In `src/lib/api.js`, replace the existing `request` function with a version that accepts `method`, `body`, and `keepalive`:

```javascript
async function request(path, { signal, method = 'GET', body, keepalive = false } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal,
      method,
      ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}),
      keepalive,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('The storefront could not reach the backend API.', 'API_UNAVAILABLE');
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || 'The backend returned an unexpected response.',
      payload?.error?.code,
      response.status,
    );
  }
  return payload;
}
```

- [ ] **Step 2: Add `postInteractions`**

Append after `fetchProductRecommendations`:

```javascript
export function postInteractions(events, { signal, keepalive = false } = {}) {
  return request('/api/interactions', { method: 'POST', body: { events }, signal, keepalive });
}
```

- [ ] **Step 3: Lint and build**

Run: `npm run lint && npm run build`
Expected: PASS. Build should still show 44 modules (tracking is not imported anywhere yet).

- [ ] **Step 4: Commit**

```bash
git add src/lib/api.js
git commit -m "feat(api): add postInteractions write client"
```

---

## Task 3: Initialize tracking at app start

**Files:**

- Modify: `src/main.jsx`

- [ ] **Step 1: Wire `initTracking`**

Replace the contents of `src/main.jsx` with:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initTracking } from './lib/tracking'

initTracking()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: Lint and build**

Run: `npm run lint && npm run build`
Expected: PASS. The tracking module is now imported and its `pagehide`/`visibilitychange` listeners are registered; the queue drains on load if backlog exists.

- [ ] **Step 3: Commit**

```bash
git add src/main.jsx
git commit -m "feat(tracking): initialize tracking on app startup"
```

---

## Task 4: Emit wishlist and cart events from StoreProvider

**Files:**

- Modify: `src/context/StoreProvider.jsx`

- [ ] **Step 1: Import `track`**

Add to the imports at the top:

```javascript
import { track } from '../lib/tracking';
```

- [ ] **Step 2: Emit events from each mutation**

Replace the four mutation functions (`toggleWishlist`, `addToCart`, `removeFromCart`, `updateQty`, and `removeFromWishlist`) with versions that emit. The closures over `wishlist`/`cart` are the render-time values, which is correct for the add/remove decision:

```javascript
  const toggleWishlist = (id) => {
    const adding = !wishlist.includes(id);
    setWishlist(adding ? [...wishlist, id] : wishlist.filter((itemId) => itemId !== id));
    track(adding ? 'wishlist_add' : 'wishlist_remove', { productId: id });
  };

  const addToCart = (id) => {
    // Use the render-time cart (closure) to distinguish a first insert from a qty bump,
    // so the right event is emitted without side effects inside the state updater.
    const existing = cart.find((item) => item.id === id);
    setCart(existing
      ? cart.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item)
      : [...cart, { id, qty: 1 }]);
    track(existing ? 'cart_qty' : 'cart_add', { productId: id, value: existing ? 1 : null });
  };

  const removeFromCart = (id) => {
    setCart((previous) => previous.filter((item) => item.id !== id));
    track('cart_remove', { productId: id });
  };

  const updateQty = (id, delta) => {
    setCart((previous) =>
      previous.map((item) => item.id === id
        ? { ...item, qty: Math.max(1, item.qty + delta) }
        : item));
    track('cart_qty', { productId: id, value: delta });
  };

  const removeFromWishlist = (id) => {
    setWishlist((previous) => previous.filter((itemId) => itemId !== id));
    track('wishlist_remove', { productId: id });
  };
```

- [ ] **Step 3: Lint and build**

Run: `npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/context/StoreProvider.jsx
git commit -m "feat(tracking): emit wishlist and cart interaction events"
```

---

## Task 5: Emit view, rating, and search events

**Files:**

- Modify: `src/pages/DetailPage.jsx`
- Modify: `src/pages/SearchPage.jsx`

- [ ] **Step 1: DetailPage — import `track` and `useEffect`**

Ensure `useEffect` is imported from `react` (the file currently imports `useState` only) and add the tracking import:

```jsx
import { useState, useEffect } from 'react';
import { track } from '../lib/tracking';
```

- [ ] **Step 2: DetailPage — emit `view` on mount**

Add this `useEffect` with the other hooks, ABOVE the `if (!record)` early-return block (React's Rules of Hooks require hooks to run unconditionally on every render; placing it after the early return would crash navigation between found and not-found products):

```jsx
  useEffect(() => {
    if (!record) return;
    track('view', { productId: record.id });
  }, [record?.id]);
```

- [ ] **Step 3: DetailPage — emit `rating` on star click**

In the star button `onClick`, change `onClick={() => setRating(n)}` to:

```jsx
onClick={() => { setRating(n); track('rating', { productId: record.id, value: n }); }}
```

Then update the rating label so it stays accurate now that clicks are captured. Change the label text `Demo rating (local only)` to `Demo rating (captured anonymously)`.

- [ ] **Step 4: SearchPage — import `track` and emit `search` (debounced)**

Replace the existing `import { useMemo } from 'react';` line and add the tracking import (avoid a duplicate `react` import, which fails `no-duplicate-imports`):

```jsx
import { useMemo, useEffect } from 'react';
import { track } from '../lib/tracking';
```

After the `results` `useMemo` block, add a debounced search effect:

```jsx
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const timer = setTimeout(() => track('search', { query: q }), 500);
    return () => clearTimeout(timer);
  }, [query]);
```

- [ ] **Step 5: Lint and build**

Run: `npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/DetailPage.jsx src/pages/SearchPage.jsx
git commit -m "feat(tracking): emit view, rating, and search events"
```

---

## Task 6: Environment template

**Files:**

- Modify: `.env.example`

- [ ] **Step 1: Append the tracking flags**

Add at the end of `.env.example`:

```bash
# Interaction tracking (frontend capture only; events POST to /api/interactions)
VITE_TRACKING_ENABLED=true
# Log events to the console and skip queueing/sending (develop without a backend)
VITE_TRACKING_DEBUG=false
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs(env): document interaction tracking flags"
```

---

## Task 7: Documentation updates

**Files:**

- Modify: `docs/API_CONTRACT_PLAN.md`
- Modify: `docs/TASK_BACKLOG.md`
- Modify: `docs/ROADMAP.md`
- Modify: `docs/RECOMMENDER_SYSTEM_PLAN.md`

- [ ] **Step 1: Add the write contract to `docs/API_CONTRACT_PLAN.md`**

Replace the "## Deferred Write Calls" section with two sections: an implemented frontend capture contract and a remaining deferral list. Add:

```markdown
## Implemented Write Call (Frontend Capture)

| Frontend Need | Method | Path | Current Use |
| --- | --- | --- | --- |
| Interaction capture | `POST` | `/api/interactions` | Batched by `src/lib/tracking.js`. Events: `view`, `wishlist_add`, `wishlist_remove`, `cart_add`, `cart_remove`, `cart_qty`, `rating`, `search`. |

Request body: `{ "events": Event[] }`. Response: `{ "data": { "accepted": <number> } }`.

The backend handler is not yet implemented; the frontend queues events in `localStorage` and retries, then drops after bounded attempts. It must not pretend the data was saved.

## Deferred Write Calls

Wishlist, cart, order, authentication, and admin write endpoints remain not implemented and are independent of interaction capture.
```

- [ ] **Step 2: Update `docs/TASK_BACKLOG.md`**

Add rows (before the deferred block) and keep F-008..F-010 as deferred:

```markdown
| F-011 | Implement frontend interaction capture (tracking module). | done | `src/lib/tracking.js` queue, flush, retry, dedup, debug. |
| F-012 | Emit interaction events from UI interaction points. | done | StoreProvider, DetailPage, SearchPage wired. |
| F-013 | Implement backend `POST /api/interactions` + CORS POST. | deferred | Separate backend plan; unblocks real evaluation. |
```

- [ ] **Step 3: Update `docs/ROADMAP.md`**

Add a short milestone note under the relevant phase:

```markdown
## Interaction Capture (Frontend)

Status: done on the frontend; backend handler deferred.

- Frontend captures views, wishlist, cart, rating, and search events into a durable queue.
- Events POST to `/api/interactions` once the backend route exists.
```

- [ ] **Step 4: Update `docs/RECOMMENDER_SYSTEM_PLAN.md`**

Add a note that captured interactions are a future input:

```markdown
## Captured Interaction Signals

The frontend now captures anonymous interaction events (view, wishlist, cart, rating, search) under a per-browser id. Once the backend persists them, `recommendForUser` can read real history. Until then, user recommendations remain the documented `demo-profile`/`cold-start` modes and must not be described as personalized.
```

- [ ] **Step 5: Commit**

```bash
git add docs/API_CONTRACT_PLAN.md docs/TASK_BACKLOG.md docs/ROADMAP.md docs/RECOMMENDER_SYSTEM_PLAN.md
git commit -m "docs: document interaction capture contract and milestone"
```

---

## Task 8: End-to-end verification (manual, browser)

**Files:** none (verification only).

- [ ] **Step 1: Debug-mode smoke test**

Set `VITE_TRACKING_DEBUG=true` in a local `.env.local` (not committed). Run `npm run dev`. Open the app, browse to a product, add to cart, search. Open the browser console.
Expected: `[tracking]` lines appear for `view`, `cart_add`, `search`, etc. No network requests to `/api/interactions` are made.

- [ ] **Step 2: Persistence across refresh**

With debug still on, confirm dedup: staying on one product detail does not flood `view` events (at most one per 30s per product).

- [ ] **Step 3: Live-mode graceful failure (no backend)**

Set `VITE_TRACKING_DEBUG=false`, keep the backend stopped. Browse the app. Open DevTools Network panel.
Expected: POST requests to `/api/interactions` fail (404 or `API_UNAVAILABLE`). The UI is unaffected. `localStorage['groovehaus.queue']` shows queued events. After ~5 attempts the events drop (bounded). No errors surface to the user.

- [ ] **Step 4: Flush on unload**

With events queued, switch the browser tab to hidden or close it.
Expected: a final POST with `keepalive` is attempted for the current batch.

- [ ] **Step 5: Production build check**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit verification notes (optional)**

Append a short note to `AGENT_MEMORY.md` describing what was verified.

---

## Task 9 (optional): Unit tests for pure helpers

Only if the team decides to add a test runner. Skip if staying with lint/build/browser verification.

**Files:**

- Create: `vitest.config.js`
- Create: `src/lib/tracking.test.js`

- [ ] **Step 1:** Install Vitest: `npm install -D vitest`.
- [ ] **Step 2:** Add a `test` script to `package.json`: `"test": "vitest run"`.
- [ ] **Step 3:** Test the pure helpers (`loadQueue`/`persistQueue` round-trip, `shouldDedupe` window, `toWire` strips `_attempts`, `backoffMs` bounds). Export them from `tracking.js` for testability if needed.
- [ ] **Step 4:** `npm test` — all green.
- [ ] **Step 5:** Commit.

---

## Follow-ups (separate plans; do not implement here)

1. **Backend:** implement `POST /api/interactions` (validation, idempotency, MongoDB persistence) and add `POST` + `Content-Type` to CORS in `vinyl_record_store_backend/next.config.mjs`.
2. **Backend:** make `recommendForUser` read real interaction history for the anonymous uid, with a leakage-safe split for evaluation.
3. **Frontend identity seam:** replace the hardcoded `'demo-user'` in `CatalogProvider` with `getUserId()` once the backend personalizes; keep `demo-user`/`cold-start` as the documented fallback.
4. **Privacy/ethics:** decide on a consent/opt-out notice and whether to honor `navigator.doNotTrack`. Required only if the course or live demo demands it.
5. **Evaluation:** once interactions accrue, run the `recommender-evaluation` skill on held-out real data and compare against a popularity baseline.

## Risks

- **React StrictMode double-invokes effects in dev.** Mitigated by the `view` dedup window; `search` is debounced; `rating`/wishlist/cart are click handlers (not effects) so unaffected.
- **Unbounded queue if backend is absent.** Bounded by `MAX_ATTEMPTS` drop logic and `localStorage` eviction.
- **Stale identity.** `anon_*` ids live until the user clears storage; acceptable for an anonymous demo, documented as non-authenticated.
- **Unload flush is best-effort.** `flushOnUnload` pops the batch and persists the shorter queue before the `keepalive` POST resolves; if the page terminates while the POST is in flight, the `.catch` cannot run and those in-flight events are lost from `localStorage`. This deliberately trades under-count for no double-count, and `keepalive` minimizes the window.
