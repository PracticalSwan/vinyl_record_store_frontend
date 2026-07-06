# Frontend Decision Log

These decisions define the consolidated storefront baseline.

## FDEC-001: Keep Vite And JavaScript

Date: 2026-07-02

Decision: Keep the implemented Vite 8.1, React 19.2.7, JavaScript, and React Router stack.

Rationale: The unique storefront is already implemented and builds cleanly. A framework or TypeScript migration would add scope without improving the requested integration update.

## FDEC-002: Make `src/` Canonical

Date: 2026-07-02

Decision: Treat `src/` as the only active application. Retain `code_for_website/` as a design-import snapshot excluded from active linting.

Rationale: Two maintained application trees create drift and duplicate lint findings. Retention avoids accidental deletion of user work.

## FDEC-003: Use A Single API Boundary

Date: 2026-07-02

Decision: Keep backend calls in `src/lib/api.js`, route-specific catalog data in query hooks, and shared recommendation state in `CatalogProvider`.

Rationale: Pages stay focused on UI, request errors are normalized once, routes avoid a global catalog preload, and the backend remains the data source of truth.

## FDEC-004: Keep Client Actions Explicitly Local

Date: 2026-07-02

Decision: Wishlist, cart, quantity, and rating remain local demo state; checkout stays disabled.

Rationale: No identity or user-state write API exists. Optional backend catalog persistence does not make these actions durable.

Status update, 2026-07-05: Superseded by FDEC-008 after the backend identity/write contracts were implemented.

## FDEC-005: Label Recommendation Context

Date: 2026-07-02

Decision: Display sample-profile, content-similarity, and cold-start context explicitly.

Rationale: The academic demo should explain its decision support without claiming real user personalization.

## FDEC-006: Make Catalog Queries URL-Backed

Date: 2026-07-03

Decision: Use one canonical URL query model for Catalog and Search, with backend-owned literal search, repeated facets, deterministic sorting, pagination, and facet metadata.

Rationale: Links and browser history remain reproducible, rapid searches can cancel stale requests, and the client no longer assumes the complete catalog is loaded.

## FDEC-007: Establish The Browser Quality Gate

Date: 2026-07-03

Decision: Use Vitest and React Testing Library for unit/component checks and Playwright plus axe for critical multi-browser, responsive, failure, history, and accessibility flows.

Rationale: Static lint and build checks cannot verify interactive behavior, stale responses, browser history, responsive filters, or accessible rendered states.

## FDEC-008: Use Session Guests And Account-Backed Authenticated State

Date: 2026-07-05

Decision: Keep guest wishlist/cart/rating state in versioned `sessionStorage`. Merge it only into a brand-new registration, discard it on existing-account login or ordinary restore, and resume a persisted keyed registration merge after failure/refresh. Authenticated mutations use the server APIs behind the same Store interface.

Rationale: This preserves a useful guest session without copying a shared-device visitor's state onto an existing account. A persisted key and backend receipt make registration retries idempotent.

## FDEC-009: Keep Analytics Optional And Identity-Bounded

Date: 2026-07-05

Decision: Enable bounded pseudonymous interaction capture by default with a visible immediate opt-out. Fetch recommendation lists only where rendered, join actions by request/list context, and flush or discard queued events before authentication changes.

Rationale: The course needs reconstructable recommendation evidence, but direct personal information, unseen-list logs, and capture-time events assigned to a later identity would invalidate both privacy and evaluation data.

## FDEC-010: Centralize Approved Artwork Rendering

Date: 2026-07-06

Decision: Route every card, recommendation, detail, wishlist, and cart image through `ProductImage`. Accept only a complete structured mapping from approved Cover Art Archive and MusicBrainz hosts, reserve dimensions before load, lazy-load repeated images, use local product metadata for accessibility, show source attribution on detail, and fall back locally once on missing or broken art.

Rationale: One validation and recovery boundary prevents host drift, broken-image loops, inconsistent alt text, and layout shifts while keeping product text and actions usable during external failures.
