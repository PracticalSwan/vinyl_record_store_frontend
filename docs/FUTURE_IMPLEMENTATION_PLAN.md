# Frontend Future Implementation Plan

Status: FFP-01 through FFP-09 are complete. Personalization from FFP-10 onward remains future work pending a separate explicit task.

Audience: developers implementing the Groovehaus Vite/React storefront and backend developers maintaining the shared API contracts.

Source of truth: current frontend source, `PROJECT_CONTEXT.md`, `UI_UX_PLAN.md`, `API_CONTRACT_PLAN.md`, `INTERACTION_LOGGING_PLAN.md`, and the backend `FUTURE_IMPLEMENTATION_PLAN.md`. Recheck package versions and external service terms when implementation begins.

## User Decisions Recorded On 2026-07-03

- Use backend-enforced seeded customer and administrator sessions before durable user persistence.
- Add simple customer registration only after authentication and protected user-write routes exist. The MongoDB user repository boundary is now implemented, but registration is not.
- Keep numeric product IDs in URLs, API requests, and client state.
- Keep guest state session-only. Merge it only into a brand-new registration; discard it on existing-account login or ordinary restore, while resuming a keyed failed registration merge.
- Enable anonymous interaction tracking by default with a visible opt-out, no direct personal information, and a 90-day backend retention target.
- Put administrator pages under protected `/admin` routes in the existing app.
- Use MusicBrainz and Cover Art Archive as the artwork source, with local vinyl placeholders as the fallback.
- Add a simulated checkout that demonstrates the flow but never accepts payment or claims a real order.
- Do not add deployment work or a machine-readable API schema.

## Plan Status Summary

| ID | Plan | Status | Main Gate |
| --- | --- | --- | --- |
| FFP-01 | Recommendation interaction analytics | Completed | Privacy control, bounded queue, attribution, and browser coverage completed 2026-07-05. |
| FFP-02 | User onboarding and preference capture | Completed | Three-step onboarding and profile preference editing completed 2026-07-05. |
| FFP-03 | Local-to-server state migration | Completed | Session guest adapter, sign-up merge, and authenticated server adapter completed 2026-07-05. |
| FFP-04 | Browser, integration, and accessibility testing | Completed | Vitest, React Testing Library, Playwright, and axe gate established 2026-07-03. |
| FFP-05 | Full server-side search and pagination | Completed | Query-driven backend and frontend contract completed 2026-07-03. |
| FFP-06 | Artwork and image handling | Completed | Backend-approved mappings, shared rendering, attribution, accessibility, and fallbacks completed 2026-07-06. |
| FFP-07 | Integrated admin mode | Completed 2026-07-09 | Administrator workspace is implemented: `RequireRole` guard, `AdminLayout` + nav, dashboard (summary + recent audit), product table (soft-delete with confirm/restore), create/edit form with `updatedAt` optimistic concurrency and conflict re-fetch, import preview/apply UX, artwork refresh, and mongodb-only-write handling. |
| FFP-08 | Checkout and order preview | Completed; copy refined 2026-07-12 | Client-only preview is implemented: cart review, shipping, illustrative-payment, review, and confirmation steps with a `PREVIEW-` reference, sessionStorage persistence, availability blocking, and cart clear on confirm. No real payment or backend order. |

## Approved Cross-Repository Implementation Order

The first nine ordered items are complete. Continue the remaining plans in this order so each later surface builds on verified contracts and regression coverage:

| Order | Plan | Dependency-safe outcome |
| --- | --- | --- |
| 1 | FFP-04: browser, integration, and accessibility testing | Completed 2026-07-03. |
| 2 | BFP-01: MongoDB persistence | Completed 2026-07-03 with seed default preserved. |
| 3 | FFP-05: server-side search and pagination | Completed 2026-07-03. |
| 4 | BFP-04: simple authentication and authorization | Completed 2026-07-04. |
| 5 | BFP-03: write APIs | Completed 2026-07-04. |
| 6 | FFP-03: local-to-server state migration | Completed 2026-07-05 with the revised session-only, sign-up-only merge decision. |
| 7 | FFP-02: onboarding and preferences | Completed 2026-07-05. |
| 8 | BFP-02 Part A: recommendation-request logging | Completed 2026-07-05. |
| 9 | FFP-01: recommendation interaction analytics | Completed 2026-07-05. |
| 10 | BFP-06: catalog ingestion and metadata quality | Completed 2026-07-06 with validated preview/apply imports and approved metadata enrichment. |
| 11 | FFP-06: artwork and image handling | Completed 2026-07-06 with backend-approved mappings and resilient fallbacks. |
| 12 | BFP-02 Part B: offline evaluation dataset and benchmark | Completed 2026-07-06; current evidence remains below the metric-reporting threshold. |
| 13 | BFP-07, then FFP-07: integrated admin mode | Implement protected backend administration before exposing its frontend workspace. |
| 14 | FFP-08: simulated checkout and order demonstration | Add the low-risk classroom flow last, after catalog, state, identity, and testing are stable. |

BFP-05 remains on hold and is excluded from this order until the user selects a recommender approach. Deployment, real payments, and a production order system remain out of scope.

## FFP-01: Recommendation Interaction Analytics

Status: Completed and verified on 2026-07-05. See `INTERACTION_LOGGING_PLAN.md` for the active implementation record.

This plan defines the recommendation-specific evidence captured by the storefront.

### Goal

Extend the existing general interaction-logging plan so the project can reconstruct what recommendation was shown, what the user did, and where the action occurred without collecting direct personal information.

`INTERACTION_LOGGING_PLAN.md` remains the low-level plan for identity, queueing, batching, retry, and unload behavior. This section adds the recommendation-specific events and reflects the user's later privacy decision. If the older plan conflicts with this section, this section controls.

### Privacy And Control

- Tracking is enabled by default for the academic demo.
- Add an accessible “Usage data” control in the footer and profile/preferences page. It explains the captured event categories and provides an immediate opt-out.
- Store the choice under a versioned local key. Opting out stops new events and deletes the unsent local queue; it cannot promise immediate deletion of events already accepted by the backend.
- Events contain pseudonymous browser/session IDs, product IDs, ranks, modes, surfaces, and timestamps. They contain no name, username, address, search history beyond the bounded catalog query, free-form notes, cookie value, or IP address.
- Search queries are trimmed, length-limited, and used only for catalog analytics. The plan must not capture unrelated browser URLs or text fields.
- Backend storage follows the selected 90-day TTL target.

### Versioned Event Shape

Every event includes:

- `eventId`: client-generated UUID for idempotency.
- `v`: schema version.
- `type`: controlled event name.
- `anonymousId` and `sessionId`: pseudonymous identifiers.
- `productId`: numeric public product ID when applicable.
- `occurredAt`: ISO timestamp.
- `source`: `groovehaus-frontend`.
- `surface`: `home`, `recommendations`, `product-detail`, `catalog`, `search`, `wishlist`, `cart`, or `checkout`.
- Recommendation context when applicable: `requestId`, `algorithmVersion`, `mode`, `rank`, and `listId`.
- A small typed `value` only where required, such as rating or quantity delta.

The frontend never sends an authenticated user ID. The backend attaches session ownership after verifying the cookie.

### Required Events

| Event | Trigger | Important deduplication rule |
| --- | --- | --- |
| `recommendation_impression` | A recommendation card becomes meaningfully visible. | Once per request/list/product/surface during a page view. |
| `recommendation_click` | The user opens a recommended product. | Once per deliberate click; include rank and request ID. |
| `recommendation_wishlist_add` | A recommended item is saved. | Emit only after the local or server state change succeeds. |
| `recommendation_cart_add` | A recommended item is added to cart. | Emit only after the cart operation succeeds. |
| `recommendation_dismiss` | A future not-interested control is used. | One event per product and request; never infer dismissal from scrolling away. |
| `product_view` | A product detail route loads successfully. | Deduplicate React Strict Mode and repeated renders. |
| `wishlist_add` / `wishlist_remove` | Wishlist state changes outside recommendation surfaces. | Emit the final action once. |
| `cart_add` / `cart_remove` / `cart_quantity` | Cart state changes outside recommendation surfaces. | Record the accepted delta or final quantity. |
| `rating_set` / `rating_remove` | A rating is committed. | Record 1 through 5 only after successful state change. |
| `search_submit` | A debounced server search is committed. | Do not emit each keystroke. |
| `search_result_click` | A search result opens. | Include result rank and query length, with the bounded query when permitted. |
| `demo_checkout_complete` | The simulated checkout reaches confirmation. | Mark `demo: true`; never treat as a real purchase. |

### Proposed Frontend Files

- `src/lib/tracking.js`: versioned queue, preference check, event construction, deduplication, batch flush, and retry.
- `src/lib/api.js`: credential-aware `POST /api/interactions` helper.
- `src/context/TrackingProvider.jsx` and `useTracking.js`: preference state and surface-aware helpers.
- `src/components/TrackingPreference.jsx`: accessible explanation and opt-out control.
- `src/components/RecommendationList.jsx` or the existing grid components: impression and click instrumentation without changing visual order.
- Existing pages and `StoreProvider`: emit accepted actions with the correct surface and recommendation context.

### Implementation Phases

1. Reconcile the general interaction plan with this event schema before writing code.
2. Add tracking preference storage, queue deletion, and a debug mode that sends nothing.
3. Add stable recommendation request IDs to the data flattened by `CatalogProvider` and product-recommendation hooks.
4. Instrument product views, search, wishlist, cart, and ratings.
5. Add recommendation impressions, clicks, and downstream actions with rank, mode, surface, and algorithm version.
6. Connect bounded batch delivery to `POST /api/interactions` and preserve the UI when the endpoint is unavailable.
7. Verify opt-out, retry, duplicate suppression, refresh, Strict Mode, unload, and backend-unavailable behavior.

### Validation And Definition Of Done

- Tracking never blocks navigation, wishlist, cart, rating, or checkout interactions.
- Opt-out immediately stops new capture and clears the unsent queue.
- Duplicate impressions and Strict Mode effects do not inflate the same page-view event.
- Recommendation events include request ID, rank, mode, algorithm version, and surface when available.
- The backend can reject a batch without breaking the UI, and retries remain bounded.
- Debug output and stored events contain no direct personal information or session cookie.

## FFP-02: User Onboarding And Preference Capture

Status: Completed and verified on 2026-07-05. Preferences remain future-facing and do not alter the active demo recommender.

This plan defines the customer preference workflow without selecting a future recommender method.

### Goal

Collect a small, understandable preference profile that can support a later recommender decision without pretending that the current algorithm already uses the profile.

### User Flow

1. A signed-in customer with no completed profile is offered onboarding, with a visible “Skip for now” action.
2. Step 1 asks for one to five favorite genres and optional disliked genres.
3. Step 2 asks for up to five favorite artists, budget minimum/maximum, preferred condition values, and preferred formats.
4. Step 3 reviews the choices and explains that preferences are saved for future recommendations.
5. `/profile/preferences` allows later editing, clearing, or completing skipped fields.

Registration appears only after the backend user repository is implemented and healthy. Until then, a seeded customer may demonstrate login and the UI, but any preference persistence capability must be described honestly.

### Preference Shape

| Field | Rule |
| --- | --- |
| `favoriteGenres` | One through five controlled genre values when onboarding is completed. |
| `dislikedGenres` | Zero through five controlled values; cannot overlap favorites. |
| `favoriteArtists` | Zero through five trimmed strings selected from suggestions or safely entered. |
| `budget` | Optional minimum and maximum with minimum not exceeding maximum. |
| `conditions` | Controlled multi-select values supported by the catalog. |
| `formats` | Controlled multi-select values supported by the catalog. |
| `completedAt` | Server timestamp set only after explicit completion. |
| `schemaVersion` | Supports later preference migrations. |

### Honesty Boundary

- Saving preferences does not by itself change recommendations.
- Until the recommender decision is reopened and implemented, the UI says “Preferences saved for future recommendations.”
- Existing results continue to use truthful `demo-profile`, `content-similarity`, `cold-start`, or `anonymous-fallback` wording.
- When a chosen algorithm later consumes preferences, it must introduce a distinct documented mode such as `preference-profile` and explanations tied to actual fields used.

### Proposed Files

- `src/context/AuthProvider.jsx`, `authContext.js`, and `useAuth.js` for session and onboarding status.
- `src/pages/LoginPage.jsx`, `RegisterPage.jsx`, `OnboardingPage.jsx`, and `ProfilePreferencesPage.jsx`.
- `src/components/preferences/*` for focused accessible steps and controlled inputs.
- `src/lib/preferences.js` for pure validation and request mapping.
- `src/lib/api.js` helpers for session, registration, and preference updates.
- Routes in `src/App.jsx` plus authenticated navigation entries.

### Implementation Phases

1. Implement session restoration and protected-route behavior from the authentication plan.
2. Add login for seeded accounts and a disabled/unavailable registration state before user persistence.
3. Add pure preference validation and controlled value sources.
4. Build the three-step onboarding flow with skip, back, review, submit, error, and retry states.
5. Add the reusable profile/preferences editor.
6. After the user repository and registration endpoint are verified, enable registration and persisted preference requests.
7. Verify that recommendations remain honestly labeled until the algorithm plan resumes.

### Validation And Definition Of Done

- Keyboard and screen-reader users can complete, skip, revisit, edit, and clear preferences.
- Validation errors identify the relevant field and preserve previous entries.
- Refresh restores saved server preferences for an authenticated customer.
- Customers cannot submit unsupported genres, invalid budgets, or an administrator role.
- No UI copy claims personalization that the active backend algorithm does not perform.

## FFP-03: Local-To-Server State Migration

Status: Completed and verified on 2026-07-05 under the revised session-only, sign-up-only guest policy.

This plan defines the transition from guest browser state to authenticated persistence.

### Goal

Move wishlist, cart, quantity, and rating state from temporary React state to account-backed APIs while keeping guest browsing useful and preventing data loss during login.

### State Ownership

- Guest state persists in versioned `sessionStorage` for the current tab rather than starting from hard-coded demo items.
- Authenticated state is authoritative on the backend.
- The frontend keeps one Store interface so pages do not know whether the active adapter is guest or authenticated.
- Logout removes user-specific memory and starts a fresh guest store. It must never reveal the previous user's lists.

### Automatic Merge Decision

After successful new-account registration, call `POST /api/me/merge-guest-state` when guest state is non-empty. Existing-account login and ordinary session restore discard guest state. A stored keyed merge resumes after refresh when a registration merge previously failed.

- Wishlist uses set union.
- Matching cart quantities are added and capped at 99.
- Missing, deleted, or unavailable products return warnings; no product is silently substituted.
- Newer valid guest ratings replace older server ratings; otherwise server ratings remain.
- A stable `mergeId` makes retry idempotent.
- Guest storage is deleted only after the server confirms the merge. A failed merge preserves local data and offers retry.

### Client Mutation Behavior

- Use optimistic updates for wishlist, cart, and ratings after an authenticated baseline has loaded.
- Keep the previous snapshot and roll back on server rejection.
- Disable duplicate submissions for the same resource while a request is pending.
- Surface safe, specific errors without replacing the whole catalog page.
- Reconcile with the returned server state after every write rather than assuming the client result.
- Cart quantities use absolute server updates, not repeated deltas, to make retry predictable.

### Proposed Files

- Refactor `src/context/StoreProvider.jsx` into a stable facade over guest and server adapters.
- Add `src/lib/guestStore.js` for versioned local persistence and migration.
- Add `src/lib/api.js` helpers for wishlist, cart, ratings, and guest merge.
- Add focused hooks such as `useWishlistMutation`, `useCartMutation`, and `useRatingMutation` only if they reduce provider complexity.
- Add reusable inline mutation status/error components.

### Implementation Phases

1. Replace hard-coded wishlist/cart defaults with a versioned guest storage adapter.
2. Add unit tests for guest serialization, invalid stored data, quota errors, and version migration.
3. Add authenticated read methods while leaving guest behavior unchanged.
4. Implement automatic idempotent merge after session restoration/login.
5. Add authenticated optimistic wishlist and rating writes with rollback.
6. Add cart reads and absolute-quantity writes with availability warnings.
7. Verify logout isolation, account switching, offline errors, refresh, retry, and duplicate-click behavior.

### Validation And Definition Of Done

- Guest state survives same-tab refresh and malformed local data falls back safely; closing the tab clears it by design.
- Login merges exactly once even if the request or component retries.
- Failed merge or write never destroys the last known client state.
- Refresh after a successful authenticated write returns the same state from the backend.
- Logging out and logging into another account does not leak state between users.
- Existing wishlist, cart, product detail, and navigation components retain their public Store API where practical.

## FFP-04: Browser, Integration, And Accessibility Testing

Status: Completed on 2026-07-03 for the current storefront. Scenarios belonging to unimplemented future features remain acceptance gates for those later plans.

This plan defines the local quality gate that protects current and future behavior.

### Goal

Create a local regression gate that verifies the storefront, backend integration, responsive layouts, keyboard behavior, and failure states before and after each future feature. No deployment or deployment CI is included.

Automated tests reduce regressions but cannot guarantee that software has no defects. Completion means the documented critical scenarios pass and unresolved limitations are reported.

### Test Layers

| Layer | Implemented Tooling | Scope |
| --- | --- | --- |
| Pure unit tests | Vitest | Query mapping, validation, guest-state merge preparation, tracking deduplication, and formatting. |
| React component tests | React Testing Library with Vitest | Loading, empty, error, success, optimistic rollback, route guards, and form validation. |
| Browser flows | Playwright Test | Real frontend/backend navigation and critical user journeys. |
| Automated accessibility | `@axe-core/playwright` or current equivalent | Serious/critical axe findings on representative pages and states. |
| Exploratory verification | Playwright CLI plus manual keyboard/screen-reader checklist | Layout, focus order, visual regressions, and flows difficult to assert automatically. |

Installed versions are recorded in `package-lock.json`. Browser binaries and generated artifacts remain untracked.

### Required Browser Matrix

- Full critical suite: Chromium at 1440 by 900 and 375 by 667.
- Responsive/navigation smoke: Chromium at 768 by 1024.
- Cross-browser critical smoke: current Firefox and WebKit desktop engines.
- Keyboard-only pass: navigation, mobile menu, filters, product cards, rating controls, auth, onboarding, cart, checkout, and admin forms.

### Critical Scenarios

1. Home, catalog, product detail, search, recommendations, wishlist, and cart load from the backend.
2. Catalog loading, empty, API unavailable, retry, and success states render correctly.
3. Recommendation mode and explanation copy remain honest for demo-profile, similarity, session-owned cold-start, and anonymous-fallback results.
4. Product route not found, out-of-stock action, cart quantities, and wishlist removal behave safely.
5. Server search handles rapid typing, filters, pagination, empty results, back/forward navigation, and stale response cancellation.
6. Login, logout, expired/tampered session, seeded customer, seeded administrator, registration unavailable, and persistent registration states.
7. Guest-state automatic merge succeeds once, retries safely, and handles partial warnings.
8. Tracking opt-out clears the local queue and no request is sent afterward.
9. Artwork success, missing URL, broken URL, slow image, and placeholder fallback.
10. Customer denial and administrator success for `/admin` routes and mutations.
11. Simulated checkout validates fields, rejects an empty or stale cart, confirms no charge, and restores/clears state correctly.

### Accessibility Gates

- No serious or critical automated accessibility violations on representative routes.
- Every interactive element has an accessible name and visible keyboard focus.
- Focus moves to route/page headings after significant navigation and to the first invalid field after submit.
- Status, errors, stock, recommendation mode, and validation do not rely on color alone.
- Modal or disclosure focus is contained and restored when applicable.
- Horizontal recommendation rows remain operable without a pointer.
- Motion respects `prefers-reduced-motion` if new motion is introduced.

### Proposed Files And Commands

- `vitest.config.js`, `playwright.config.js`, and `tests/setup.js`.
- `tests/unit/`, `tests/components/`, and `tests/e2e/` with fixtures and page helpers kept small.
- Playwright web-server configuration launches both local repositories.
- `output/playwright/` for ignored local traces and screenshots.
- Package scripts: `test`, `test:unit`, `test:e2e`, `test:a11y`, and `test:all`.

### Implementation Phases

1. Record the current manual smoke baseline before adding test dependencies.
2. Add pure unit tests for existing API/query/state helpers.
3. Add Playwright configuration and one current-app smoke path against the real backend.
4. Cover all current routes and required remote-data states.
5. Add axe checks and the keyboard/manual matrix.
6. Add feature-specific tests with each later plan before that feature is considered complete.
7. Run the full local gate before merging or presenting the project.

### Validation And Definition Of Done

- Test commands work from a clean install with documented prerequisites.
- Failure artifacts identify the route, browser, and state without storing secrets or personal data.
- The suite fails on a deliberately broken API response, inaccessible control, and route regression.
- Current frontend lint/build and backend test/lint/build remain part of the full gate.
- Manual checks are reported separately from automated evidence.

## FFP-05: Full Server-Side Search And Pagination

Status: Completed on 2026-07-03. Recommendation/search result-click analytics was added by completed FFP-01 on 2026-07-05.

This plan defines the complete move from a preloaded catalog to query-driven backend results.

### Goal

Use URL-driven backend queries that scale, remain accessible, and preserve browser navigation without a global catalog preload.

### Shared Query Model

Use the URL as the source of truth for both `/catalog` and `/search`:

- `q`: bounded text query.
- `page`: positive integer, default 1.
- `limit`: controlled page size, default 24.
- Repeated `genre`, `era`, and `condition` parameters for the current multi-select filters.
- `minPrice`, `maxPrice`, and `inStock`.
- `sort`: `newest`, `price-asc`, `price-desc`, or `artist-asc`.

Changing query, filter, sort, or page size resets `page` to 1. Back/forward navigation restores the exact result state.

### Backend Additions Required

- Extend product validation to support repeated controlled filter values and the documented sort values.
- Add `totalPages` to response metadata.
- Provide catalog facets for genre, era, condition, price bounds, and stock counts, either as additive product metadata or a dedicated read endpoint. Facets must not require loading all products in the browser.
- Preserve `/api/search` as a documented alias or shared service, not a separate filtering implementation.
- Add deterministic secondary sorting by numeric public ID or title so pagination does not shuffle between requests.

### Frontend Architecture

- Replace `fetchProducts()` with `fetchProducts(query, { signal })` and a single URL serializer.
- Refactor `CatalogProvider` so it does not block every route on the first 100 products. Product detail may use `GET /api/products/:id` directly.
- Add a shared `useCatalogQuery` hook for URL parsing, defaults, updates, request cancellation, and response state.
- Reuse the same query model on Catalog and Search pages; their presentation may differ.
- Debounce text entry by approximately 300 milliseconds, but submit immediately on Enter.
- Abort superseded requests and ignore stale responses.
- Cache only small recent query responses in memory if necessary; correctness must not depend on cache.

### Pagination UX

- Use numbered pagination with Previous and Next rather than infinite scrolling.
- Render the current page and total pages, disable unavailable controls, and use real buttons or links with accessible labels.
- After a page change, move focus to the results heading and optionally restore the top of the result region.
- If filters make the current page invalid, replace the URL with page 1 and request once.
- Loading preserves the page frame and announces the update without clearing controls.
- Empty results distinguish “no products exist” from “no products match these filters.”

### Implementation Phases

1. Add backend query/sort/facet tests and update both API contract documents.
2. Add the frontend URL parser/serializer with round-trip unit tests.
3. Refactor API calls and remote catalog state behind the existing loading/error conventions.
4. Migrate Catalog filters and sorting to URL-backed server requests.
5. Migrate Search to the same hook with debounced text; defer result-click analytics to FFP-01.
6. Fetch product detail by ID so catalog pagination does not make valid detail routes appear missing.
7. Add numbered pagination, focus handling, back/forward restoration, and rapid-query race tests.

### Validation And Definition Of Done

- The frontend no longer requests `/api/products?limit=100` for normal browsing.
- Multi-select filters, sort, query, and page survive refresh and browser navigation.
- Rapid typing never displays an older response over a newer query.
- Catalog, Search, Home, Wishlist, Cart, and Product Detail do not assume all products are loaded at once.
- Backend and frontend totals, page counts, filters, and sort order agree.
- Loading, empty, error, retry, and success states pass the browser matrix.

## FFP-06: Artwork And Image Handling

This plan defines approved artwork flow, rendering, attribution, and fallback behavior.

Status: completed and verified on 2026-07-06.

### Goal

Display approved album artwork from MusicBrainz and Cover Art Archive while preserving the current placeholder for missing, ambiguous, slow, or broken images.

### Source And Ownership Rules

- The backend performs MusicBrainz matching and stores the selected release or release-group identifier and source metadata.
- The frontend receives approved artwork URLs in product responses and never searches external services directly.
- Use Cover Art Archive 500-pixel thumbnails for cards and up to 1200 pixels for detail views when available.
- Store URLs and attribution/provenance, not image binaries, in MongoDB.
- Respect the official MusicBrainz request limit and User-Agent requirement during backend enrichment.
- Cover art remains copyright-sensitive. Display a source link and keep placeholders for any image whose match or use is uncertain.
- Never use images copied from search results or unrelated storefronts.

### Product Image Shape

The product response may add:

```json
{
  "image": {
    "thumbnailUrl": "https://coverartarchive.org/...-500.jpg",
    "detailUrl": "https://coverartarchive.org/...-1200.jpg",
    "source": "cover-art-archive",
    "sourceUrl": "https://musicbrainz.org/release/..."
  }
}
```

`imageUrl` remains for compatibility, while the structured shape is canonical for responsive rendering and attribution.

### Frontend Components

- `ProductImage` is the only component responsible for artwork, loading state, fallback, size selection, and broken-image recovery.
- Use width and height or `aspect-ratio` to prevent layout shifts.
- Use lazy loading for off-screen catalog cards and eager/high-priority loading only for the main visible hero/detail image when justified.
- Alt text uses local product metadata, for example “Cover art for Kind of Blue by Miles Davis.” Decorative repeated thumbnails may use empty alt text when the surrounding card already has the same accessible name.
- A failed image switches once to the existing vinyl placeholder and does not retry forever.
- Product detail may show a small “Artwork source” link without implying endorsement.

### Implementation Phases

1. Add structured image fields to backend data and both API contracts while keeping `null` valid.
2. Add approved MusicBrainz/Cover Art mappings to the import/admin workflow; ambiguous records remain placeholders.
3. Build and unit-test `ProductImage` with success, missing, error, and decorative modes.
4. Replace card, detail, recommendation, wishlist, cart, and admin-preview placeholders through the shared component.
5. Add responsive sizing, loading behavior, source link, and layout-shift browser checks.
6. Verify external failure does not prevent product text or actions from rendering.

### Validation And Definition Of Done

- Every product surface shows either the approved artwork or the current placeholder.
- Broken URLs do not create broken-image icons, loops, or inaccessible controls.
- Cards and rows do not shift materially when images load.
- The selected art corresponds to the intended release or release group and retains source traceability.
- No secret, external API credential, copied image file, or unapproved host enters the frontend.

## FFP-07: Integrated Admin Mode

> Completed 2026-07-09. Implementation summary: a `RequireRole` guard (mirrors `RequireAuth`; customers see a forbidden page, anonymous redirect to login) wraps an `AdminLayout` with Dashboard/Products/Import navigation, shown only for `auth.user.role === 'admin'`. Dashboard renders the admin summary and recent safe audit actions. The products page paginates the admin product list, toggles soft-deleted rows, and soft-deletes (named confirmation modal with focus management and Escape) or restores. The shared create/edit form covers all catalog fields plus artwork refresh; edits send `updatedAt` for optimistic concurrency and re-fetch the current record on `409 CONFLICT`. The import page previews CSV/JSON (creates/updates/skips/warnings/errors/conflicts + an action sample) and applies via the one-time preview token. All admin API helpers live in `src/lib/api.js`. Verified: vitest 73/73, eslint clean, vite build green, Playwright admin + checkout specs pass on desktop and mobile (full suite 57 passed / 1 skipped / 0 failed). The backend `requireRole('admin')` is the real security boundary; catalog writes surface `PERSISTENCE_UNAVAILABLE` in seed-catalog mode.

This plan defines the administrator experience inside the existing storefront application.

### Goal

Add an administrator workspace inside the current Vite app while keeping customer routes visually and behaviorally separate.

### Routes

| Route | Purpose |
| --- | --- |
| `/admin` | Summary counts, warnings, and recent safe audit actions. |
| `/admin/products` | Server-paginated product management table. |
| `/admin/products/new` | Create a product. |
| `/admin/products/:id/edit` | Edit metadata, price, stock, provenance, and artwork mapping. |
| `/admin/import` | Upload CSV/JSON, review validation results, and explicitly apply an approved preview. |

No user-management, role-management, payment, deployment, or analytics-surveillance dashboard is included.

### Access And Navigation

- Restore the session before deciding whether to render administrator routes.
- Anonymous users go to login with a safe return path.
- Customers receive a clear forbidden page and never see administrator navigation.
- Administrator navigation appears only for a verified `admin` session.
- Backend `403` remains authoritative; the UI handles session expiry and role changes without leaking returned data.

### Product Editing

- Forms use backend-controlled enum options and client validation only as convenience.
- Numeric public product ID is read-only after creation.
- Edit submissions include the version or `updatedAt` value. A conflict shows the current server record and requires review instead of silently overwriting.
- Delete means soft delete and requires confirmation naming the product.
- Restore is explicit.
- Stock changes show how existing carts may receive warnings.
- Artwork refresh shows the matched MusicBrainz release and source before saving.

### Import UX

1. Select a CSV or JSON file under the documented size limit.
2. Request a non-mutating preview.
3. Display creates, updates, unchanged rows, warnings, duplicates, and errors.
4. Disable Apply while blocking errors remain.
5. Apply the one-time preview token after explicit confirmation.
6. Display the final result and refresh relevant catalog queries.

### Proposed Files

- `src/components/auth/RequireRole.jsx`.
- `src/layouts/AdminLayout.jsx` and admin navigation components.
- `src/pages/admin/AdminDashboardPage.jsx`, `AdminProductsPage.jsx`, `AdminProductFormPage.jsx`, and `AdminImportPage.jsx`.
- `src/components/admin/*` for forms, tables, conflict review, import report, and confirmation dialogs.
- `src/lib/adminValidation.js` and administrator API helpers.

### Implementation Phases

1. Add session/role route guards and customer-denial browser tests.
2. Build the read-only summary and product table.
3. Add product create/edit with full loading, validation, conflict, and retry states.
4. Add soft delete and restore confirmations.
5. Add import preview/apply.
6. Add artwork match/refresh controls.
7. Run customer-route regression, keyboard, mobile, and administrator authorization tests.

### Validation And Definition Of Done

- Customers cannot reveal admin data through URL entry, modified client state, or direct API calls.
- Admin pages remain keyboard-operable at supported widths.
- Stale edits cannot overwrite newer changes silently.
- Import preview never mutates the catalog and Apply cannot be repeated.
- Customer catalog, recommendation, wishlist, cart, and checkout routes remain unchanged for non-admin users.

## FFP-08: Simulated Checkout And Order Demonstration

> Completed 2026-07-09 and copy-refined 2026-07-12. Implementation summary: `/checkout` (RequireAuth-gated) runs a four-step wizard (cart review, shipping, illustrative payment, review) then a `/orders/preview/:reference` confirmation page. `src/lib/checkout.js` owns pure helpers (shipping validation, totals, blocking-item detection, `PREVIEW-` reference generation, order snapshot, and sessionStorage draft/order read-write). Shipping details are never sent to analytics; the compatibility analytics event remains `demo_checkout_complete` with reference, item count, and total. Availability changes (out-of-stock or missing records) block confirmation; an empty cart waits for the authenticated store to sync then redirects to `/cart` with a notice; the confirm button is disabled while a cart mutation is pending; and the cart is cleared via `StoreProvider.clearCart` on confirm. No real payment, no backend order, sessionStorage-only persistence. Verified by `tests/unit/checkout.test.js`, the Playwright checkout spec, and the empty-cart redirect spec.

This plan defines a safe classroom demonstration of checkout without real commerce.

### Goal

Show the intended checkout and order journey without accepting real payment, reserving stock, creating a commercial transaction, or requiring deployment.

### User Flow

1. Cart review confirms items, quantities, availability, subtotal, and demo shipping.
2. Shipping step collects only temporary demonstration fields: name, address lines, city, postal code, and country.
3. Payment explanation shows a fixed “Demonstration payment” method. It contains no card-number, bank, wallet, or real payment-provider fields.
4. Review step displays the entered shipping summary, item snapshots, and total with an explicit preview confirmation action.
5. Confirmation displays a generated `PREVIEW-...` reference and an illustrative status timeline: confirmed, processing, shipped.

Every step states that no charge or real order will occur.

### State And Privacy

- Checkout state may use React state plus `sessionStorage` for refresh recovery during the current browser session.
- Shipping fields are never sent to analytics and are cleared after confirmation, cancellation, or session expiry.
- The default plan creates no backend order. If the team later enables the optional demo-order endpoint, it must be a separate explicit phase and still set `demo: true`.
- Do not persist or display an order history unless the optional backend phase is approved.
- The cart clears only after successful local confirmation generation. A failed validation keeps the cart intact.

### Error And Edge States

- Empty cart redirects to Cart with a clear message.
- Removed, soft-deleted, or out-of-stock items block confirmation and return the user to review.
- Quantity or price changes require the user to review the recalculated total.
- Refresh during checkout restores only the active session flow.
- Direct navigation to confirmation without a completed preview returns safely to Cart.
- Browser storage failure keeps the flow usable in memory and warns that refresh recovery is unavailable.

### Proposed Files

- `src/pages/CheckoutPage.jsx` and `DemoOrderConfirmationPage.jsx`.
- `src/components/checkout/CartReviewStep.jsx`, `ShippingStep.jsx`, `DemoPaymentStep.jsx`, `ReviewStep.jsx`, and `OrderStatusExample.jsx`.
- `src/lib/checkout.js` for validation, totals, demo reference generation, and session serialization.
- Routes `/checkout` and `/orders/preview/:reference` plus an enabled Cart checkout link.

### Implementation Phases

1. Add pure shipping, cart snapshot, total, and session-serialization validation.
2. Build the step shell with keyboard focus management and progress text.
3. Add Cart review and temporary Shipping steps.
4. Add the non-interactive demo payment explanation and final Review step.
5. Generate confirmation locally, clear temporary shipping data, and clear the cart after success.
6. Add empty, stale cart, stock change, storage failure, refresh, back, and direct-route tests.

### Validation And Definition Of Done

- No real payment field, SDK, network call, or claim of purchase exists.
- The complete flow works by keyboard and announces step changes and validation errors.
- Cart totals match the active catalog and quantities at final review.
- Temporary shipping data is absent from tracking events, logs, URLs, and committed fixtures.
- The user can demonstrate checkout, confirmation, and example order status without order persistence or deployment.

## Frontend-Wide Validation Gate

After each implemented frontend plan or phase, run:

```powershell
npm run lint
npm run build
```

After FFP-04 establishes the test commands, also run the affected unit, component, browser, and accessibility tests. Any shared API behavior additionally requires the backend test, lint, and build commands. Report browser execution separately from static checks.

## Personalization Roadmap (PERS-00 - PERS-09)

This section records the frontend half of the dependency-safe personalization roadmap. PERS-00 through PERS-02 / FFP-09 were completed on 2026-07-10 after BFP-07, FFP-07, and FFP-08; PERS-03 through PERS-09 remain planned. The same cross-repository order is in `PERSONALIZATION_IMPLEMENTATION_PLAN.md` and the backend plan.

The honesty wording that the current ranker is not personalized stays in force until PERS-04 onward actually personalizes. No quality claim is made; the `insufficient-evidence` evaluator status is unchanged.

### Plan Status Summary (Personalization, Frontend Half)

| ID | Plan | Status | Main Gate |
| --- | --- | --- | --- |
| PERS-00 / FDEC-011 | Audit and decision freeze | Completed 2026-07-10 | Frontend endpoint, provider, identity-key, rollback, copy, and no-quality-claim decisions are frozen. |
| PERS-01 | Identity enforcement (frontend contract only) | Completed 2026-07-10 | Production has no arbitrary-user selection; the legacy helper is fixed to `demo-user`. |
| PERS-02 / FFP-09 | Session-owned endpoint | Completed 2026-07-10 | `/me`, auth gating, anonymous fallback, abort/generation stale protection, and browser coverage are active. |
| PERS-03 | Unified profile surface | Planned | Render safe data-source flags without raw signals. |
| PERS-04 / FFP-10 | Preference-aware ranking UI | Planned | Honest `preference-profile` label; refresh on preference save. |
| PERS-05 / FFP-11 | Negative feedback UI | Planned | Accessible not-interested, already-own, undo, show-fewer-like-this. |
| PERS-06 / FFP-12 | Behavioral mode UI | Planned | Honest `behavior-profile` label; opt-out boundary preserved. |
| PERS-07 | Popularity and fallback UI | Planned | Honest `popularity`/`anonymous-fallback` labels. |
| PERS-08 / FFP-13 | Hybrid mode UI | Planned | Honest `personalized-hybrid` label; contribution-based reasons; version attribution. |
| PERS-09 / FFP-14 | Integration and hardening | Planned | End-to-end integration; accessibility; documentation closure. |

### Dependency-Safe Personalization Order (Appended After FFP-08)

The frontend switched to the stable backend identity/session endpoint in PERS-02 and keeps a default-on reversible flag. The full cross-repository order (PERS-00 through PERS-09, orders 15 through 24) remains in both personalization plans. PERS-03 onward requires a separate explicit task and matching backend stability before frontend consumption.
