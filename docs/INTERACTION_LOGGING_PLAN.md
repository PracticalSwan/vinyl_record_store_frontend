# Interaction Logging

Status: Implemented and verified on 2026-07-05 as FFP-01. This document records the active design; offline evaluation remains BFP-02 Part B.

## Purpose

Capture privacy-bounded storefront behavior without blocking navigation or customer-state actions. Events allow recommendation impressions and downstream actions to join the exact list recorded by BFP-02 Part A.

## Active Design

- `src/lib/tracking.js` owns a maximum 500-event queue, 25-event batches, five bounded retry attempts, exponential backoff, and page-hide/visibility flushes.
- The queue and pseudonymous anonymous ID use versioned `localStorage`; the per-tab session ID uses `sessionStorage`.
- `TrackingProvider` exposes the current usage-data choice. `TrackingPreference` appears in the footer and profile-preferences page.
- Tracking is enabled by default for the academic demo. Opt-out immediately prevents capture and request logging, clears unsent events, and remains authoritative in memory when browser storage rejects the preference write.
- Authentication operations flush or discard pending events before login, registration, or logout. Generation checks prevent an older failed delivery from re-entering the queue under a different identity.
- Recommendation impressions are deduplicated for the full request/list/product/surface page view. Ordinary render-effect duplicates use a short two-second window.
- Analytics failure never rolls back wishlist, cart, rating, search, or navigation behavior.

## Event Contract

Every event has a UUID `eventId`, schema version, controlled type, pseudonymous anonymous/session IDs, timestamp, source, and controlled surface. Product events include a numeric product ID. Recommendation events require `requestId`, `listId`, `algorithmVersion`, `mode`, and rank.

Implemented types include:

- recommendation impression, click, wishlist add, and cart add;
- product view;
- wishlist add/remove;
- cart add/remove/absolute quantity;
- rating set/remove;
- search submit and result click.

Search events store query length and result rank, not raw search text. No event contains a username, display name, password, cookie, address, IP address, arbitrary URL, or free-form field value.

## Backend Boundary

`POST /api/interactions` accepts 1 through 50 version-1 events, validates controlled fields, derives authenticated ownership from the signed session, strips anonymous ownership for authenticated batches, and uses unique event IDs for idempotency. Anonymous batches require an anonymous ID. Stored events have a 90-day eventual TTL target.

Recommendation endpoints receive `X-Tracking-Enabled`; user-recommendation requests also receive `X-Anonymous-Id` when enabled. MongoDB mode persists the exact served list before returning it; opt-out and seed mode suppress that request log.

## Verification

- Unit tests cover event shape, opt-out, storage failure, deduplication windows, queue flushing, retry bounds, and auth-boundary clearing.
- Playwright covers recommendation metadata, impression/click/downstream attribution, rating attribution, search/customer-state events, and opt-out on desktop and mobile.
- Browser tests verify that user recommendation requests occur only on Home and Recommendations, so unseen lists are not logged.
- Backend tests cover PII/unknown-field rejection, complete recommendation context, authenticated ownership, duplicate IDs, logging opt-out, ordered list persistence, and TTL indexes.

## Deferred

- `recommendation_dismiss` waits for a real not-interested control.
- `demo_checkout_complete` waits for FFP-08.
- Dataset construction, minimum-evidence checks, leakage-safe splits, baselines, and metric reports remain BFP-02 Part B.
