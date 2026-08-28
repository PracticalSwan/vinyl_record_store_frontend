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

## FDEC-011: Personalization Architecture Freeze

Date: 2026-07-07

Decision: Plan, without implementing, the frontend half of the personalization roadmap (PERS-00 through PERS-09) scheduled after BFP-07, FFP-07, and FFP-08, mirroring backend BDEC-016. Freeze the frontend decisions: authenticated storefront uses `GET /api/recommendations/me` and anonymous visitors use the documented fallback; recommendation loading must not start before auth restoration resolves (provider ordering or a gating flag); the recommendation resource key includes the authenticated subject so sign-in/sign-out invalidates results; in-flight requests are aborted on identity change and stale responses cannot overwrite new-user results; preference edits refresh recommendations; negative feedback updates the displayed list; loading, empty, retry, partial, and fallback states are distinct; demo-profile language is removed from true personalized surfaces while synthetic showcase accounts stay clearly labelled; and every new control and state meets accessibility and responsive requirements. The honesty wording that the current ranker is not personalized stays in force until PERS-04 onward actually personalizes.

Rationale: Provider ordering, the API client, recommendation state, and feedback UI all change across milestones; fixing these decisions up front avoids rework. No quality claim is made.

Status: Frozen and completed 2026-07-10, updated for PERS-03 through PERS-08 / FFP-10 through FFP-13 on 2026-08-10 and PERS-09 / FFP-14 integration closure on 2026-08-13. The implementation uses both provider order and an auth-status gate, limit 12, customer-only access with administrator rejection, subject-key plus abort/generation stale protection, a shared mode renderer, up-to-two server reasons, and a default-on `VITE_PERS_ME_ENDPOINT` rollback switch. Ranking and feedback flags remain default-off: the deployed path is still non-personalized, while explicitly enabled PERS modes use stored account evidence without making any quality claim.

## FDEC-012: Administrator Workspace And Client-Only Simulated Checkout

Date: 2026-07-09

Decision: FFP-07 ships a `RequireRole`-guarded `/admin` area (customers see a forbidden page, anonymous redirect to login) that is a navigation aid only; the backend `requireRole('admin')` is the security boundary. The admin UI reuses existing query/form patterns and surfaces `PERSISTENCE_UNAVAILABLE` for mongodb-only writes in seed-catalog mode; product edits send `updatedAt` for optimistic concurrency and re-fetch the current record on `409 CONFLICT`. FFP-08 ships a client-only checkout: `/checkout` runs a cart/shipping/demo-payment/review wizard and `/orders/demo/:reference` shows a confirmation with a generated `DEMO-` reference and an illustrative PENDING timeline. Shipping details are never sent to analytics; the only event is a privacy-safe `demo_checkout_complete` (reference, item count, total). The demo order lives only in `sessionStorage`; the cart is cleared on confirm via `StoreProvider.clearCart`. Availability changes block confirmation, an empty cart redirects to `/cart`, and the place-order button is disabled while a cart mutation is pending.

Rationale: A frontend role guard plus server-owned authorization keeps admin safe without a second app. Keeping checkout client-only avoids payment, order-persistence, and deployment dependencies while still demonstrating the storefront flow honestly. sessionStorage-only orders and no shipping-in-analytics protect privacy in a classroom demo.

Status: Implemented and verified (vitest 73/73, eslint clean, vite build green; Playwright admin + checkout specs pass; full e2e 57 passed / 1 skipped / 0 failed). Real payments and order APIs remain intentionally out of scope.

## FDEC-013: Make Search, Preferences, Layout, And Preview Copy Explicit

Date: 2026-07-12

Decision: Debounce live search navigation by 300 ms while recording history only on committed submit or replay; keep at most five recent terms in a guest-or-customer-scoped store; make filter controls independently scrollable with bounded price inputs; use a flex page shell so the footer follows short and long content; treat preference clearing as a draft-only action and guard every dirty data-router transition (custom controls, Navbar, or browser history) with a focus-contained save/discard/cancel dialog that resumes the pending destination; and present client-only checkout through `/orders/preview/:reference` with `PREVIEW-` references. Internal compatibility identifiers such as `demo_checkout_complete` and `content-demo-v1` remain unchanged where renaming would break stored evidence or contracts.

## FDEC-014: Use A Three-Stage Artwork Source Chain

Date: 2026-07-21

Decision: Keep `ProductImage` as the only rendering boundary and use an ordered source chain: approved remote URL through the backend proxy, canonical public ID through `/api/artwork/local/:publicId`, then the generic vinyl placeholder. If remote metadata is missing or rejected but the ID is canonical, start at the local source. Key component state by record, variant, and full source identity; update it functionally and ignore load/error events that no longer belong to the rendered index. Preserve lazy/eager priority, fixed dimensions, decorative/detail alt behavior, and the reviewed MusicBrainz attribution link across failover.

Rationale: A backend proxy fixes browser reachability but can still fail on an external outage, a changed Internet Archive redirect host, or a cold cache. The local endpoint makes the 116-record classroom catalog deterministic without embedding asset knowledge in the frontend. A single state machine avoids broken icons, retry loops, stale-event source skipping, and actions disappearing when images fail.

Status: Implemented and independently reviewed `SHIP_AS_IS` on 2026-07-21. Evidence includes 5 focused component tests, all 87 unit/component tests, 67 browser tests with one intentional skip, an all-116 decode loop, forced proxy and local failures, desktop/mobile screenshots, and a forced-local detail screenshot with cart interaction.

## FDEC-015: Render Source-Derived Products Without Inventing Store Facts

Date: 2026-08-02

Decision: Treat artist, price, currency, stock, condition, and format as nullable; centralize fallbacks and purchase eligibility in `productDisplay.js`; consume dynamic genre/format facets; preserve saved preference values that are not present in the current facet response; and block cart/checkout when price or stock is unknown. Keep browse, detail, wishlist, and rating available.

Rationale: Amazon metadata is research/catalog evidence, not a Groovehaus inventory feed. A shared boundary prevents inconsistent money, availability, and identity claims across the storefront.

Status: Implemented and verified in DATA-12/DATA-14.

## FDEC-016: Keep Dataset Artwork And Administration Reproducible

Date: 2026-08-02

Decision: Dataset-owned products never use Amazon imagery or borrow a legacy binding. `ProductImage` uses the backend's explicit `localArtworkAvailable` flag, so strict accepted v2 MusicBrainz/Cover Art Archive matches follow remote proxy -> separate verified local JPEG -> placeholder, while ambiguous and unresolved records go directly to the placeholder. Admin shows active dataset source/version/counts and product ownership, but hides edit/delete/restore/artwork actions for dataset rows and identifies them as CLI-managed. Ordinary record and import controls remain unchanged.

Rationale: The 116-record artwork bundle is identity-bound to reviewed legacy releases, accepted v2 files have a separate exact manifest, and one-off browser mutations would break the reproducible dataset version.

Status: Implemented with DATA-10 through DATA-12; PERS-03 through PERS-09 / FFP-10 through FFP-14 were subsequently completed without changing the dataset boundary, while ranking flags remain default-off.

## FDEC-017: Keep Live Dataset Smoke Separate From Deterministic Fixtures

Date: 2026-08-08

Decision: Keep the dataset Playwright project deterministic and fixture-backed, and record live MongoDB/API/browser evidence separately. The live smoke path must verify the active v2 count, canonical facets, nullable research fields, accepted local fallback, unresolved placeholder/no-legacy request, mobile keyboard behavior, Admin source/version/read-only rows, and authenticated wishlist/rating behavior. Any auth-write smoke residue must go through the backend dry-run/apply cleanup policy.

Rationale: Fixture-backed tests provide stable contract coverage without an Atlas dependency, while a separate live smoke proves the integration boundary against the actual active pointer and committed artwork. Separating the two avoids turning network/database drift into nondeterministic UI tests.

Status: Verified. The deterministic dataset project passed 10 tests with two mobile-only skips; the live browser path passed all listed checks, and approved cleanup preserved the v1/v2/legacy evidence and exactly three showcase customers.

## FDEC-018: Render The Backend Mode Matrix Without Recomputing Scores

Date: 2026-08-10

Decision: Keep one shared frontend presentation map for `preference-profile`, `behavior-profile`, `popularity`, and `personalized-hybrid` plus the existing lower/demo modes. Preserve the full server `reasons[]` and request/list/version/mode/rank attribution, render at most two ordered unique non-empty reasons, and never display raw component scores or weights. Tracking opt-out remains passive-only; direct wishlist/cart/rating/feedback APIs stay functional.

Rationale: The backend owns evidence, availability, weights, and mode selection. A thin presentation boundary prevents stale copy, client-side scoring drift, and accidental historical-identity or quality claims while keeping attribution auditable.

Status: Implemented and verified in the PERS-06 through PERS-08 frontend delta; PERS-09 integration closure is complete and leaves ranking flags default-off.

Rationale: These boundaries prevent analytics inflation from search prefixes, cross-account history leakage, accidental preference saves, footer overlap, and storefront copy that could imply a real order or unfinished implementation.

## FDEC-019: Keep Personalization Integration On One Identity-Keyed Resource Path

Date: 2026-08-13

Decision: Continue to load authenticated recommendations only on Home and Recommendations through the existing `CatalogProvider` `/me` resource. Preserve subject-key plus abort/generation protection across A-to-B identity changes, keep Profile and Onboarding off that request path, store the confirmed exact feedback kind so Undo copy remains truthful, and gate the full personalization Playwright harness behind an explicit test-only environment flag. Use a separate isolated backend to prove MongoDB persistence failures return the safe `503` contract.

Rationale: One provider-owned resource avoids duplicate requests, stale identity overwrite, unseen-list logging, and client-side ranking invention. An explicit test-only gate exercises every server flag without changing shipped defaults, while the isolated failure server prevents silent seed fallback from hiding persistence errors.

Status: Implemented and verified in PERS-09 across component tests, desktop/mobile full-gate flows, tablet/Firefox/WebKit recommendation smoke, seed and MongoDB contracts, accessibility checks, and responsive screenshot review. No recommender-quality claim or dataset mutation was introduced.

## FDEC-020: Keep Storefront Checkout Client-Only While Polishing Its Presentation

Date: 2026-08-15

Decision: Keep checkout entirely client-side, but present the customer flow through `/checkout/complete/:reference` with `GH-XXXXXXXX` references, no payment fields, and an explicit no-real-payment/session-only disclosure. Preserve the `demo_checkout_complete` analytics identifier and existing sessionStorage keys for compatibility; do not add order persistence, fulfillment, or payment infrastructure.

Rationale: The presentation cleanup makes the storefront feel familiar without changing the classroom system's truth boundary or introducing commercial infrastructure.

Status: Current-state refinement implemented in UI-03; historical FFP-08 preview decisions remain preserved above.

## FDEC-021: Deploy GitHub-Linked Netlify With Same-Origin API Proxy

Date: 2026-08-19

Decision: Deploy `groovehaus-store` from the sole `master` branch to Netlify and keep `VITE_API_BASE_URL=/` so browser calls remain same-origin through the storefront `/api/*` proxy to `groovehaus-api`.

Rationale: This preserves first-party signed-cookie behavior and exact-origin mutation semantics without merging repositories or adding client secrets.

Status: Implemented and live at `https://groovehaus-store.netlify.app/`.

## FDEC-022: Separate Sealed Source Metrics From Customer Presentation

Date: 2026-08-19

Decision: Keep the 2,305 sealed v3 source count for Admin/evaluation provenance, but consume a backend presentation overlay that suppresses 46 high-confidence duplicate display rows and exposes 2,259 customer-visible records. Do not remap stable IDs or historical evidence.

Rationale: A cleaner browsing catalog should not mutate DATA-15 or make Admin source metrics ambiguous.

Status: Implemented; Admin copy identifies source counts explicitly.

## FDEC-023: Use Source-Specific Artwork Order In Production

Date: 2026-08-19

Decision: Strict dataset rows use local -> proxy -> placeholder; supplemental presentation mappings use proxy -> placeholder; unresolved dataset rows use placeholder; legacy/seed remains proxy -> local -> placeholder. Supplemental release-group artwork is representative album art, not exact Amazon pressing evidence.

Rationale: Local-first strict art reduces external failure/latency while supplemental mappings improve visual coverage without fabricating exact provenance.

Status: Implemented; visible artwork is 1,300/2,259 (57.55%).

## FDEC-024: Verify Profile C Through The Existing Server-Owned Presentation Path

Date: 2026-08-29

Decision: Keep all preference, behavior, popularity, exclusion, and hybrid computation in the backend. Use the existing `recommendationPresentation` map for Profile C and add one bounded MongoDB Playwright flow that signs into the three canonical showcase personas, disables passive tracking, verifies `personalized-hybrid-v1`, dominant Jazz/Rock/Soul genre, known-item exclusion and exact-feedback controls, then captures one screenshot per persona. Do not add client-side weights, scores, persona roles, or a second recommendation state path.

Rationale: The frontend already renders the complete mode contract. One real three-login flow proves the new classroom state and UI integration with less drift than duplicating recommender rules or running the full cross-browser matrix. The persona labels remain fixture metadata; authorization stays `customer` and recommendation quality is not implied.

Status: Implemented and verified in Chromium desktop against the Atlas-backed Profile C harness. Global teardown reported zero test residue and preserved all three users. The wider production browser baseline found no layout, keyboard, validation, overflow, or console defect; backend candidate caching addresses the separate observed recommendation latency issue.
