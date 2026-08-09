# Personalization Implementation Plan (Frontend)

This roadmap is the frontend half of converting the existing deterministic demo recommender into a genuine personalized recommender system for the Vinyl Record Store (CSX4207). PERS-00 through PERS-05 / FFP-11 were implemented on 2026-08-10 behind default-off backend flags. DATA-00 through DATA-15 were re-verified with final lifecycle and browser evidence on 2026-08-08. PERS-06 through PERS-09 remain planning-only, were explicitly excluded from the dataset implementation, and authorize no implementation by themselves.

This plan is scheduled AFTER the entire existing documented roadmap: BFP-07 (admin backend), FFP-07 (admin frontend), FFP-08 (simulated checkout), and any backend support already planned for the simulated checkout. It does not reorder, replace, remove, or silently redefine any existing BFP/FFP plan.

This frontend plan contains the SAME cross-repository milestone order (PERS-00 through PERS-09) as the backend plan at `../vinyl_record_store_backend/docs/PERSONALIZATION_IMPLEMENTATION_PLAN.md`. The backend plan owns identity, routes, services, algorithms, data models, indexes, and privacy. This plan owns routing, the API client, auth integration, recommendation state, feedback controls, loading/error/fallback UI, attribution, accessibility, and browser tests.

Audience: the developers implementing the Vite/React storefront and the backend developers providing its contracts.

Source of truth for current state: live frontend source (`src/` only; `code_for_website/` is a retained design snapshot, not production), `PROJECT_CONTEXT.md`, `API_CONTRACT_PLAN.md`, `RECOMMENDER_SYSTEM_PLAN.md`, `UI_UX_PLAN.md`, `INTERACTION_LOGGING_PLAN.md`, and the matching backend personalization plan. Re-verify every file path against the source before implementing any milestone.

## DATA-15 Adaptation Gate (2026-08-08)

The active MongoDB catalog is immutable `amazon-reviews-2023-cds-vinyl-5core-v3`: 2,305 research-only products, with v2 as the immediate rollback release and v1 as the identity/legacy base. Price/currency/stock/condition are absent for research products; artist/genre/format/year can still be nullable; facets are dynamic; 208 accepted dataset-art decisions have verified local fallbacks while ambiguous/unresolved rows use the placeholder; commerce controls are absent. V3 has 208 non-null original-release years from MusicBrainz release-group evidence. Historical Amazon subjects/ratings remain backend-only. The 116-record legacy catalog, `content-demo-v1`, and exactly three showcase customers are preserved.

The remaining frontend milestones are revised as follows:

- PERS-03 adds no frontend contract or UI. The unified profile stays backend-internal; historical subject keys/rows/counts never enter the frontend.
- PERS-04/07/08 mode and reason copy must name the actual backend mode and remain valid when artist/genre/format/stock is unknown.
- PERS-05/06 controls remain live-account behavior and must never imply that Amazon history belongs to the signed-in customer.
- PERS-09 adds active-dataset/v1/legacy rollback, dynamic-facet, original-versus-edition-year, nullable-field, accepted-art/placeholder, Admin read-only-row, and exact-three-user browser regressions.

Historical data-readiness does not establish recommendation quality. The PERS-03 through PERS-05 / FFP-10 through FFP-11 batch is implemented behind default-off backend flags; a new explicit implementation request is required for PERS-06 through PERS-09.

## PERS-04 Through PERS-09 Re-review (2026-08-09)

This revision is authoritative when older wording conflicts with it.

- PERS-04 has no hard preference-relaxation UI. Stored genres/artists/formats are soft ranking signals; budget/condition appear only when the active catalog supports commercial fields. Do not call `reloadRecommendations()` from Profile/Onboarding: `CatalogProvider` disables recommendation loading off `/` and `/recommendations`, so those calls would be no-ops. The next recommendation-surface navigation already performs a fresh `/me` request.
- PERS-05 initial UI has only `Not interested`, `Already own`, and `Undo`. `Show fewer like this` is deferred.
- PERS-06 tracking opt-out continues to suppress the frontend analytics queue. Rating/wishlist/cart/feedback remain direct functional API actions and can still influence ranking from their durable server state; do not send duplicate tracking events just to make personalization work.
- PERS-07 `popularity` copy describes aggregate research ratings, not recent live activity. `anonymous-fallback` remains deterministic catalog browsing when popularity evidence is unavailable.
- PERS-08 renders `personalized-hybrid` only when preference + behavioral affinity are both available; historical popularity may join that hybrid when available. Lower modes remain pure and product-to-product content similarity stays separate.
- PERS-09 verifies the existing PERS-02 auth/resource-key endpoint flow; it does not switch endpoints again or mutate DATA-15.

## Hard Scope Boundaries

Included: routing/provider ordering for identity-safe recommendation loading; the session-owned API client call; auth-aware recommendation state with stale-response prevention; fresh recommendation loading after preference-save navigation; first-class exact-item feedback UI; honest mode labels/reasons; loading/empty/error/retry/fallback states; recommendation attribution; accessibility/responsive behavior; browser, component, unit, and a11y tests.

Explicitly excluded (mirroring the backend plan): gathering real users or additional real-world evaluation data; user studies; any claim of measured recommendation quality; completing the live evidence threshold; publishing Precision@k, Recall@k, MAP@k, NDCG@k, or other quality results without an approved model experiment; collaborative filtering and matrix factorization. The existing historical source is isolated evaluation input, not a customer profile or quality result. Synthetic fixtures and clearly labelled classroom demo profiles may be used for development and testing, never presented as real evaluation evidence.

## Current State (Re-Verified Against Source On 2026-08-08)

These facts were verified by reading `src/`, not by trusting doc status tables.

- Routes include the completed administrator workspace and simulated checkout. Home and Recommendations remain public recommendation surfaces; customer identity comes from the optional-session API rather than route protection.
- `RouterProvider` owns the data router; the root route shell then nests `AuthProvider > TrackingProvider > CatalogProvider > StoreProvider`. Recommendation loading is also explicitly disabled while auth status is `loading`.
- `fetchMyRecommendations` calls `/api/recommendations/me` without a user ID and omits `X-Anonymous-Id` when authenticated. The only legacy helper is fixed to `/api/recommendations/user/demo-user`; it has no user-ID parameter.
- `CatalogProvider` keys recommendation state by surface, endpoint flag, auth status, and authenticated `publicId`; it aborts identity changes and uses request generations so a transport that ignores abort cannot overwrite current results.
- `AuthProvider` restores the session, guards auth-operation races, and exposes the safe user. `CatalogProvider` consumes `publicId` only as a local resource key; it is never sent as recommendation identity.
- `StoreProvider` (`src/context/StoreProvider.jsx`) uses session-only guest state, merges guest state only on sign-up, and tracks wishlist/cart/rating events with recommendation attribution. Preference saves do not refresh recommendations (intentional today).
- Tracking lives in `src/lib/tracking.js` and `src/context/TrackingProvider.jsx`: anonymous id in localStorage, session id in sessionStorage, a durable queue (max 500, batch 25), opt-out (env + per-user), fire-and-forget, impression dedupe, full recommendation attribution (`requestId`/`listId`/`rank`/`mode`/`algorithmVersion`), and `prepareTrackingIdentityChange` which flushes/discards before identity changes.
- Home and Recommendations render `demo-profile`, `cold-start`, `preference-profile`, and `anonymous-fallback` honestly; product detail continues to render product-based similarity separately.
- Default-off PERS-05 adds only not-interested, already-own, and undo with a pessimistic status placeholder; `show-fewer-like-this` is deferred. `recommendation_dismiss` remains an analytics event concept, not durable feedback state.
- Preference UI fields (`src/lib/preferences.js`): `favoriteGenres`, `dislikedGenres`, `favoriteArtists`, `budget.{min,max}`, `conditions`, `formats`. Onboarding is a 3-step wizard; profile preferences is a single page. The visible mode/copy stays honest when the backend preference flag is disabled and names `preference-profile` when it is enabled.
- Tests include API and `CatalogProvider` identity/race contracts plus browser coverage for authenticated `/me`, anonymous/tampered fallback, admin denial, cross-user legacy parity, analytics attribution, and prerequisite account cleanup.
- Env adds default-on `VITE_PERS_ME_ENDPOINT` beside `VITE_API_BASE_URL`, `VITE_TRACKING_ENABLED`, and `VITE_TRACKING_DEBUG`.

## Dependency-Safe Milestone Order And ID Mapping

The order is identical to the backend plan. Each PERS milestone maps to the same backend and/or frontend plan IDs.

| Milestone | Title | Backend subplan | Frontend subplan |
| --- | --- | --- | --- |
| PERS-00 | Audit and decision freeze | (BDEC-016; BR-020/BR-021) | (FDEC-011; FR-013/FR-014) |
| PERS-01 | Proper identity enforcement | BFP-08 | (contract tests only) |
| PERS-02 | Session-owned signed-in-user endpoint | BFP-09 | FFP-09 |
| PERS-03 | Unified recommendation profile and feedback domain | BFP-10 | (no frontend change) |
| PERS-04 | Preference-aware ranking | BFP-11 | FFP-10 |
| PERS-05 | Negative-feedback capture and durable suppression | BFP-12 | FFP-11 |
| PERS-06 | Behavioral-signal personalization | BFP-13 | FFP-12 |
| PERS-07 | Popularity baseline and fallback | BFP-14 | (consumed via API) |
| PERS-08 | Hybrid recommendation orchestration | BFP-15 | FFP-13 |
| PERS-09 | Cross-repository integration, migration, regression protection, documentation closure | BFP-16 | FFP-14 |

Frontend uses FFP-09 through FFP-14. Backend uses BFP-08 through BFP-16. Do not reuse IDs allocated by later admin/dataset work. As of this re-review, the next unused supporting frontend IDs are F-025, FDEC-018, and FR-030. Existing PERS task/risk IDs stay as already registered; allocate a new ID only for a genuinely new item.

## Milestone Template

Every milestone below contains the 22 required sections: ID and title, Status, Goal, Why required, Current gap, Dependencies, Non-goals, Backend changes, Frontend changes, API contract, Data-model changes, Algorithm/business rules, Privacy/security rules, Edge cases, Failure/recovery, Migration strategy, Tests, Documentation updates, Definition of done, Rollback criteria, Risks, Decisions still requiring approval.

---

## PERS-00: Audit And Decision Freeze

### ID And Title

PERS-00 — Repository audit and architecture decision freeze (cross-cutting). Registers frontend decision FDEC-011 and risks FR-013, FR-014. Mirror of the backend PERS-00.

### Status

Completed 2026-07-10 after FFP-08; the user explicitly opened PERS-00 through PERS-02.

### Goal

Freeze the frontend architecture decisions later milestones depend on, and record current behavior that must not regress.

### Why It Is Required

PERS-02 onward changes provider ordering, the API client, recommendation state, and feedback UI. Those decisions must be fixed before implementation to avoid rework.

### Current Implementation Gap

Closed for identity/session architecture. The authenticated path, anonymous fallback, provider order, resource-key, abort/generation, copy, and rollback decisions are frozen. Feedback and preference-refresh remain assigned to later milestones.

### Dependencies

- FFP-08 complete.
- Backend PERS-00 decisions frozen (endpoint name, durable-vs-TTL split, opt-out model, version/mode names, demo account labelling).

### Non-goals

- Implementing code, components, routes, or tests.
- Changing the honesty wording that the current ranker is not personalized (true today; only changes when PERS-04+ actually personalizes).

### Backend Changes

None in PERS-00. Backend decisions are recorded in the backend plan.

### Frontend Changes

None. Decisions recorded in FDEC-011.

### API Contract

No change in PERS-00. Decisions define the contracts FFP-09 onward implements.

### Data-Model Changes

None.

### Algorithm Or Business Rules

Frontend decisions to freeze (FDEC-011):

- Authenticated storefront uses `GET /api/recommendations/me`; anonymous visitors use the documented anonymous fallback; the explicitly labelled showcase keeps the `demo-profile` showcase path until PERS-09 removes demo-profile language from true personalized surfaces.
- Recommendation loading must not start before auth restoration resolves. Provider ordering or a gating flag fixes this.
- The recommendation resource key includes the authenticated subject so sign-in/sign-out invalidates results.
- Sign-out clears personalized recommendations; in-flight requests are aborted on identity change; stale responses cannot overwrite new-user results.
- Tracking queues are flushed or discarded before identity changes (already implemented; preserved).
- Recommendation attribution stays attached to cards and detail-page navigation.
- Preference edits affect the next authenticated recommendation load (new in PERS-04). FDEC-011's refresh intent is satisfied by the existing route/resource-key load when the user next enters Home/Recommendations; do not add an off-surface reload from Profile/Onboarding.
- Negative feedback updates the displayed list (new in PERS-05).
- Loading, empty, retry, partial, and fallback states are distinct.
- Demo-profile language is removed from true personalized surfaces; synthetic showcase accounts remain clearly labelled as demonstrations.
- Mode labels include `demo-profile`, `cold-start`, `content-similarity`, `preference-profile`, `behavior-profile`, `popularity`, `personalized-hybrid`, `anonymous-fallback` (rendered as they become available).
- Accessibility and responsive behavior are covered for every new control and state.

### Privacy And Security Rules

- The frontend never sends another user's identity; it relies on the session cookie.
- Tracking opt-out is honored for passive analytics; explicit functional actions (ratings, wishlist, cart, feedback) are still sent because they are user actions, not tracking.

### Edge Cases

PERS-00 records the "existing behavior that must not regress" checklist:

- The showcase `demo-user` request still renders `demo-profile`.
- Anonymous and non-`demo-user` requests still render cold-start.
- Detail page "Similar records" content-similarity output is unchanged.
- Recommendation attribution (requestId/listId/rank/mode/version) still attaches to cards and navigation.
- Tracking flush-before-identity-change still works.
- Opt-out still stops passive capture.
- Catalog URL-backed queries, facets, pagination, and stale-request cancellation are unchanged.

### Failure And Recovery Behavior

PERS-00 records that every later milestone preserves safe failure: backend unavailable, session expired, and identity change mid-request all leave the UI in a recoverable state.

### Migration Strategy

No migration in PERS-00. The release pattern for later milestones is in the appendix.

### Tests

No tests in PERS-00. The regression checklist becomes baseline assertions for FFP-09 onward.

### Documentation Updates

- Create this plan.
- Record FDEC-011.
- Record FR-013, FR-014.
- Add PERS placeholder rows to `FUTURE_IMPLEMENTATION_PLAN.md`, `ROADMAP.md`, `TASK_BACKLOG.md`.
- Leave the honesty wording intact until PERS-04+ makes personalization real.

### Definition Of Done

- This plan exists with the same milestone order as the backend plan.
- FDEC-011 and the new risks are recorded.
- The existing roadmap is unchanged; personalization is appended after FFP-08.
- No source code changed.

### Rollback Criteria

PERS-00 is documentation only. Rollback deletes the added plan and entries; no code is affected.

### Risks

- FR-013: Personalization is presented as real measured quality. Mitigation: honesty wording locked here and enforced in every milestone.
- FR-014: Stale frontend responses overwrite a new user's recommendations after identity change. Mitigation: resource-key + abort design fixed in FFP-09.

### Decisions Still Requiring Approval

None for PERS-00. The implementation request confirms opening after FFP-08, the opt-out split, and both provider reorder plus auth gating.

---

## PERS-01: Proper Identity Enforcement (Contract Tests Only)

### ID And Title

PERS-01 — Backend identity enforcement (BFP-08). Frontend contributes no UI in this milestone; it only adds contract awareness.

### Status

Completed 2026-07-10 as a contract boundary; no standalone UI was added.

### Goal

Ensure the frontend cannot choose another registered user's id and that recommendation loading remains safe while the backend hardens identity.

### Why It Is Required

Before PERS-01/02 the frontend hard-coded `demo-user`. The completed contract ensures future profile work cannot let a client select another account's subject.

### Current Implementation Gap

Closed. Production calls fixed `/me`; the rollback showcase helper is fixed to `demo-user`, and `publicId` is used only as a client resource key, never sent as recommendation identity.

### Dependencies

- PERS-00 decisions.

### Non-goals

- Adding `/api/recommendations/me` consumption (that is FFP-09 in PERS-02).
- Changing UI.

### Backend Changes

See backend plan (BFP-08).

### Frontend Changes

The final FFP-09 client removes the parameterized helper. No production surface can choose another user's ID.

### API Contract

No frontend-visible change. The old route remains `demo-user` → `demo-profile`, others → `cold-start`.

### Data-Model Changes

None.

### Algorithm Or Business Rules

None.

### Privacy And Security Rules

- The frontend must not introduce any way to pass an arbitrary user id to the recommendation path.

### Edge Cases

The frontend must keep working while the backend restricts the old route: `demo-user` showcase unchanged; anonymous still cold-start.

### Failure And Recovery Behavior

Unchanged.

### Migration Strategy

No frontend migration in PERS-01.

### Tests

- `tests/unit/api.test.js` proves `/me` has no identity parameter and the only legacy path is fixed to `demo-user`; browser integration proves an arbitrary legacy ID yields the same cold-start list.

### Documentation Updates

- Note in this plan that the frontend has no identity-selection surface today and must not gain one.

### Definition Of Done

- Achieved: no frontend path can select another user's ID, and API/browser contract tests pass.

### Rollback Criteria

No rollback needed; no behavior change.

### Risks

- FR-015 (carried): future code accidentally parameterizes the user id. Mitigation: invariant test.

### Decisions Still Requiring Approval

None frontend-specific.

---

## PERS-02: Session-Owned Signed-In-User Endpoint (FFP-09)

### ID And Title

PERS-02 / FFP-09 (frontend) + BFP-09 (backend) — Switch the storefront to the session-owned `GET /api/recommendations/me`.

### Status

Completed and verified 2026-07-10 after backend BFP-09.

### Goal

Make authenticated users receive their own recommendations via `/api/recommendations/me`, anonymous visitors receive the documented fallback, and ensure recommendation loading never starts before auth resolves.

### Why It Is Required

Before FFP-09 the hard-coded `demo-user` call and provider ordering prevented a session-owned, auth-safe request.

### Current Implementation Gap

- Closed. `/me` is the production call, `AuthProvider` wraps `CatalogProvider`, loading is gated on auth restoration, and `publicId` participates only in stale-safe resource identity.

### Dependencies

- Backend BFP-09 (`/api/recommendations/me`).
- PERS-00 provider-ordering decision.

### Non-goals

- Changing ranking output (parity first).
- Removing the showcase `demo-profile` path (retained, clearly labelled).

### Backend Changes

See backend plan (BFP-09).

### Frontend Changes

- Implemented provider reorder and an explicit `auth.status !== 'loading'` gate.
- Added credentialed `fetchMyRecommendations`; anonymous IDs are sent only for anonymous calls.
- `CatalogProvider` now uses `/me` for authenticated and anonymous states, while the fixed `demo-user` helper remains rollback-only; Home and Recommendations render the returned mode honestly.
- Identity changes abort in-flight requests and clear mismatched state.
- The resource key includes the public subject, and a request generation guard prevents stale settlement even when transport ignores abort.

### API Contract

Consumes backend `GET /api/recommendations/me` (see backend plan). Frontend reads `mode`, `algorithmVersion`, `requestId`, `listId`, `recommendationLogged`, `profileSummary`, `recommendations`.

### Data-Model Changes

None.

### Algorithm Or Business Rules

Parity first: a registered user with no preferences/interactions renders the same cold-start content as today; the showcase renders `demo-profile`.

### Privacy And Security Rules

- No client-supplied subject; the session cookie is the only identity.
- Anonymous id sent only when anonymous.

### Edge Cases

- Auth restoration slow: loader gated until `auth.status` resolves; show the existing loading skeleton, never a stale demo result for an authenticated user.
- Sign-in during an in-flight anonymous request: abort and re-request as authenticated.
- Sign-out during an in-flight authenticated request: abort and clear.
- Multiple tabs: each tab resolves independently; no cross-tab leakage.
- Stale response after identity change: resource-key mismatch discards it.
- Backend returns `PERSISTENCE_UNAVAILABLE`: show recoverable error with retry; do not fall back to demo silently for an authenticated user.

### Failure And Recovery Behavior

- Backend unavailable: distinct error state with retry (`catalog.reloadRecommendations`); anonymous fallback only for anonymous visitors.
- Session expired mid-session: next request treated as anonymous; UI reflects anonymous fallback.

### Migration Strategy

- `VITE_PERS_ME_ENDPOINT` is enabled by default after the backend endpoint and parity tests passed. Explicit `false` restores the fixed, labelled showcase helper.

### Tests

- `tests/components/CatalogProvider.test.jsx`: auth-before-load, authenticated/anonymous selection, sign-in abort, sign-out cleanup, stale transport settlement, and retry.
- `tests/unit/api.test.js`: fixed `/me`, credentials, authenticated anonymous-ID omission, opt-out, and fixed showcase path.
- Browser tests: authenticated `/me`, anonymous and tampered-cookie fallback, admin denial, legacy cross-user parity, request-only-on-rendered-surfaces, and attribution.

### Documentation Updates

- `API_CONTRACT_PLAN.md`: consume `/api/recommendations/me`.
- `ARCHITECTURE_PLAN.md`: provider ordering.
- `RECOMMENDER_SYSTEM_PLAN.md`: session-owned path.
- `implementation_plan_order.txt`.

### Definition Of Done

- Achieved: authenticated users and anonymous visitors use `/me` with distinct honest modes; recommendation loading waits for auth; identity changes abort and generation-invalidate stale work; regression suites pass.

### Rollback Criteria

Disable frontend `VITE_PERS_ME_ENDPOINT` with backend `PERS_ME_ENDPOINT`; revert to the fixed `demo-user` showcase. No data rolls back.

### Risks

- FR-014: stale identity responses overwrite current results. Controlled by abort plus generation/resource-key guards.
- FR-016: recommendation loading races auth restoration. Controlled by provider order, auth gating, and component/browser tests.

### Decisions Still Requiring Approval

None. The implementation uses both provider reorder and an explicit gating condition.

---

## PERS-03: Unified Recommendation Profile And Feedback Domain (Consumed Via API)

### ID And Title

PERS-03 / BFP-10 (backend) — Unified profile and feedback domain. No frontend change in this milestone.

### Status

Implemented on 2026-08-10 with no frontend profile-field or public API change; the backend profile remains server-internal behind `PERS_PROFILE_DOMAIN`.

### Goal

Keep the new profile domain server-internal. Preserve the current frontend `/me` handling and existing `profileSummary` UI until PERS-04+ introduces an actual new ranking mode/reason.

### Dependencies

- Backend BFP-10.

### Frontend Changes

None.

### API Contract

No public frontend contract change in PERS-03. Do not add `dataSourceFlags`, profile completeness, raw profile signals, or source counts.

### Tests

- Existing recommendation/profile-summary tests remain regression gates; no new frontend PERS-03 test file is required.

### Definition Of Done

- Backend PERS-03 can ship without a frontend diff; current cold-start/demo rendering remains unchanged.

### Rollback Criteria

No frontend rollback is needed.

### Decisions Still Requiring Approval

None frontend-specific.

---

## PERS-04: Preference-Aware Ranking (FFP-10)

### ID And Title

PERS-04 / FFP-10 (frontend) + BFP-11 (backend) — Preference-aware ranking surfaces and fresh post-save recommendation loading.

### Status

Implemented on 2026-08-10 behind the backend preference flag; the frontend labels `preference-profile` and leaves Profile/Onboarding independent from recommendation loading.

### Goal

Render `preference-profile` honestly and rely on the existing route-scoped recommendation load after preferences are saved. Do not add an off-surface refresh or constraint-relaxation UI.

### Why It Is Required

Preferences become real; the UI must reflect that without overclaiming.

### Current Implementation Gap

- Current mode rendering already handles `demo-profile`, `content-similarity`, `cold-start`, and `anonymous-fallback`, but not `preference-profile`.
- Preference pages are off the recommendation surfaces; their saves do not need to refresh CatalogProvider. The missing regression is proving that the next Home/Recommendations route load uses the persisted preferences.

### Dependencies

- Backend BFP-11.
- FFP-09 (`/me`).

### Non-goals

- Behavioral/popularity/hybrid UI (later milestones).

### Backend Changes

See backend plan (BFP-11).

### Frontend Changes

- Add `preference-profile` to Home/Recommendations mode rendering with honest copy such as `Based on the preferences you saved.`
- Remove/replace any copy that says saved preferences do not affect ranking once the backend flag is enabled.
- Do not import/use `useCatalog()` from `ProfilePreferencesPage.jsx` or `OnboardingPage.jsx` just to refresh recommendations. `CatalogProvider` sets its recommendation resource `enabled` only on `/` and `/recommendations`, so `reloadRecommendations()` on those preference routes is intentionally a no-op.
- Keep the existing save flows: persist preferences, then stay on Profile or continue Onboarding navigation. When the user next enters `/` or `/recommendations`, the existing route/resource-key effect performs a fresh `/api/recommendations/me` request and uses the saved preferences.
- Failed preference save keeps the existing error behavior and must not navigate as successful. Do not add a second recommendation store, provider coupling, or manual cache invalidation.
- Research-only preference UI remains genre/artist/format only. Do not show budget/condition ranking explanations while the active catalog has no commercial fields.
- Do not add relaxed-constraint notices or controls.

### API Contract

Consumes `mode: "preference-profile"`, `algorithmVersion: "preference-profile-v1"`, and server-owned `reasons[]`; preference writes remain `PATCH /api/me/preferences`.

### Data-Model Changes

None.

### Algorithm Or Business Rules

Frontend never reproduces preference scoring. It renders the returned mode/reasons only and refreshes after successful persisted preference changes.

### Privacy And Security Rules

- Explanations reveal only the user's own preferences.

### Edge Cases

- Empty preferences after save: backend returns the appropriate lower mode; frontend renders that mode, not `preference-profile`.
- Partial onboarding: only successfully persisted fields affect the next recommendation-surface request.
- Preference save occurs off the recommendation surfaces, so there is no active recommendation request to refresh there. When the user later navigates to Home/Recommendations, the route/resource-key effect starts the fresh request.
- Research-only catalog: no budget/condition controls or reasons.
- Showcase/demo path remains clearly labelled and is not converted into a registered-user profile by UI logic.

### Failure And Recovery Behavior

- Preference save fails: keep prior saved preferences, show the existing recoverable error, and do not treat the save as successful.
- The next Home/Recommendations request can fail independently; use the existing recommendation error/retry state without rolling preferences back.

### Migration Strategy

- UI behavior is additive and follows backend `PERS_PREFERENCE_RANKING`; no localStorage migration or new provider.

### Tests

- `tests/components/RecommendationsPage.test.jsx`: `preference-profile` versus current cold-start/anonymous fallback labels; server reason rendering; no relaxation UI.
- `tests/components/ProfilePreferencesPage.test.jsx`: successful save persists state without importing/calling catalog reload; failed save keeps error behavior; unsaved-change blocker still passes.
- Add/extend onboarding test: successful save keeps the existing navigation; failed save does not navigate. No catalog-reload dependency is introduced.
- `tests/components/PreferencesForm.test.jsx`: research-only keeps budget/condition hidden and stale saved values safe.
- E2E: save preferences, then navigate to Home/Recommendations and assert that the route-scoped `/api/recommendations/me` request is fresh and reflects the persisted preference mode/reasons.

### Exact Implementation Order

1. Add mode/reason rendering tests first.
2. Keep Profile/Onboarding save flows independent from CatalogProvider; add regression tests that no off-surface reload is introduced.
3. Update obsolete "preferences do not affect ranking" copy only when the feature is enabled/live.
4. Verify research-only preference form remains unchanged.
5. Add E2E save → navigate to Home/Recommendations → fresh `/me` load, then run frontend test/lint/build.

### Documentation Updates

- `RECOMMENDER_SYSTEM_PLAN.md`, `UI_UX_PLAN.md`: new mode and refresh behavior.
- `PRODUCT_REQUIREMENTS.md`: preference-aware success criterion.

### Definition Of Done

- `preference-profile` renders honestly; Profile/Onboarding remain uncoupled from the route-scoped recommendation resource; the next Home/Recommendations navigation fetches fresh persisted preferences; research-only commercial controls/reasons stay absent; no relaxation UI exists; obsolete non-personalization copy is replaced when the feature is live.

### Rollback Criteria

Disable backend preference ranking; UI renders the lower returned mode. The save flow remains valid and no client data rollback is required.

### Risks

- FR-018: preference copy is stale or implementation adds a no-op/off-surface catalog reload that obscures the real route-scoped refresh behavior. Mitigation: feature-aware copy tests plus save → navigate → fresh `/me` E2E.

### Decisions Still Requiring Approval

None. Post-success automatic refresh is selected.

---

## PERS-05: Negative Feedback (FFP-11)

### ID And Title

PERS-05 / FFP-11 (frontend) + BFP-12 (backend) — First-class negative-feedback controls.

### Status

Implemented on 2026-08-10 behind the backend feedback flag with pessimistic exact-item controls and contextual Undo; `Show fewer like this` remains deferred.

### Goal

Add accessible `Not interested`, `Already own`, and `Undo` controls for exact-item feedback. Keep writes pessimistic, replace the confirmed card with a local status+Undo placeholder, and defer `Show fewer like this`.

### Why It Is Required

Negative feedback must be a real feature, not just analytics. The UI is where users express it.

### Current Implementation Gap

The first-batch durable feedback controls are implemented behind the backend flag. `recommendation_dismiss` remains only an analytics event type; it is not authoritative feedback state.

### Dependencies

- Backend BFP-12 (feedback routes).
- Existing FFP-09 `/me` recommendation surface and PERS-04/FFP-10 mode handling. No special refresh pattern is required for feedback.

### Non-goals

- Adding a new genre-level feedback control. Broad taste preferences stay in the existing `dislikedGenres` preference UI; one item action never edits that preference.
- Adding a persistent feedback-management/history screen. V1 Undo is contextual to the confirmed placeholder in the current rendered list; after navigation/reload, stored feedback remains active and a later management surface would be a separate task.
- Queueing feedback as analytics (it is a functional action).

### Backend Changes

See backend plan (BFP-12).

### Frontend Changes

- Add `src/lib/feedback.js` helpers only for `putFeedback(productId, { kind })` and `deleteFeedback(productId)`. One current feedback row exists per product; choosing the other kind replaces it. Do not add a feedback-list helper or global persisted-feedback store in v1.
- Add one reusable `FeedbackControls.jsx` with exactly `Not interested`, `Already own`, and `Undo`. Do not add `Show fewer like this`.
- Initial placement: recommendation cards only. Add detail-page controls only under a later explicit task; do not widen scope for symmetry.
- Create is pessimistic: disable controls while pending. After durable success, keep the card component mounted but replace its product content with a compact `role="status"` placeholder such as `Removed from recommendations.` plus `Undo`; move focus to that Undo button so keyboard focus is not lost when the original control disappears.
- Undo is also pessimistic: after successful DELETE, restore the card locally and return focus to the restored feedback control. If create/delete fails, keep the prior visible state/focus and show a recoverable inline error.
- Do not call `reloadRecommendations()` solely for feedback. The local placeholder updates the current list; the next normal Home/Recommendations load is server-authoritative and will omit stored feedback items. Do not hand-rerank/refill the list in the browser.
- Do not add window-focus polling/cross-tab feedback synchronization in v1.
- Functional feedback must not depend on `track()`. If analytics attribution is desired and tracking is enabled, emit it only after durable feedback succeeds; analytics failure cannot revert feedback.

### API Contract

Consumes only `PUT /api/me/feedback/:productId` and `DELETE /api/me/feedback/:productId`. `PUT` sends only `{ kind: "not-interested" | "already-own" }`; changing kind replaces the current row. `DELETE` needs no kind query and may return `removed: false` on repeated undo. There is no public feedback-list route and no scope/reason/show-fewer payload in v1.

### Data-Model Changes

None frontend-side.

### Algorithm Or Business Rules

Frontend only sends exact-item feedback kinds and renders server state. Backend owns exclusion/taste semantics.

### Privacy And Security Rules

- Feedback is a user action; sent regardless of passive opt-out.
- No PII in feedback payloads.

### Edge Cases

- Rapid duplicate create: pending button prevents it; backend idempotency remains authoritative.
- Undo twice: second request is harmless/idempotent and UI stays consistent.
- Product becomes inactive after feedback was stored: the current confirmed placeholder remains harmless; the next normal recommendation load simply omits the product.
- A separate recommendation reload occurs while the placeholder is shown: backend state is authoritative; the item stays omitted if feedback still exists.
- Rating 5 plus not-interested: UI permits both; item remains excluded and no "you dislike this artist" copy is invented.
- Tracking disabled: feedback still succeeds; no passive/analytics queue requirement.

### Failure And Recovery Behavior

- Create/delete fails: keep the prior card/placeholder state and show a recoverable inline error.
- After confirmed create, the placeholder is the current source of UI truth until the next normal recommendation load. Do not trigger a special reload or automatically undo durable feedback because another request fails.

### Migration Strategy

- Additive UI behind backend `PERS_NEGATIVE_FEEDBACK`; no local persistence migration.

### Tests

- `tests/components/FeedbackControls.test.jsx`: two allowed kinds, contextual undo, pending/double-click prevention, create/delete errors, keyboard/focus/touch semantics, `aria-live` announcement.
- Recommendation card/page tests: confirmed create replaces the card content with status+Undo without calling catalog reload; failed create keeps the original card; confirmed undo restores it; failed undo keeps the placeholder; tracking disabled does not disable functional feedback; no show-fewer control.
- E2E: not-interested/already-own create the confirmed placeholder; navigate away/back (or otherwise perform a normal recommendation load) and assert backend suppression omits the item; undo restores future eligibility; stale requests cannot overwrite a newer recommendation resource generation.

### Exact Implementation Order

1. Add feedback API helper tests for exact v1 payloads and one-row-per-product replacement/undo behavior.
2. Add reusable controls on recommendation cards with pessimistic create/delete and local status+Undo placeholder state.
3. Verify confirmed create hides product content locally without calling catalog reload; confirmed undo restores it. A later normal recommendation load must enforce backend suppression.
4. Add optional analytics mirror only through the existing tracker and only if enabled; never make it required.
5. Run component/a11y tests, full frontend test/lint/build, then feedback E2E with tracking both on and off.

### Documentation Updates

- `UI_UX_PLAN.md`: control placement, states, accessibility.
- `RECOMMENDER_SYSTEM_PLAN.md`: feedback semantics summary.
- `INTERACTION_LOGGING_PLAN.md`: document that durable feedback is a functional API and any `recommendation_dismiss`/feedback analytics mirror is optional, tracking-gated, and never authoritative.

### Definition Of Done

- Only `Not interested`, `Already own`, and `Undo` ship; create/delete writes are pessimistic; confirmed create becomes an accessible local status+Undo placeholder without a special recommendation reload; next normal load enforces backend suppression; errors are recoverable; tracking opt-out does not disable feedback; keyboard/screen-reader/mobile behavior passes.

### Rollback Criteria

Hide controls/disable backend feedback flag. Existing durable feedback rows remain server-side and harmless; no client data rollback.

### Risks

- FR-019: UI state diverges from durable feedback or Undo becomes unreachable after suppression. Mitigation: pessimistic writes plus a confirmed in-card status+Undo placeholder; the next normal recommendation load remains server-authoritative.
- FR-020: feedback controls are inaccessible. Mitigation: component a11y + keyboard/focus/touch-target tests.

### Decisions Still Requiring Approval

None for v1. Pessimistic create is selected; `Show fewer like this` and genre-level feedback are deferred.

---

## PERS-06: Behavioral-Signal Personalization (FFP-12)

### ID And Title

PERS-06 / FFP-12 (frontend) + BFP-13 (backend) — Honest rendering of behavior-driven recommendations and continued correct attribution.

### Status

Planned. Blocked by backend BFP-13.

### Goal

Render `behavior-profile` honestly, preserve attribution for passive events that are actually captured, and verify tracking opt-out stops passive analytics without disabling direct rating/wishlist/cart/feedback features.

### Why It Is Required

Behavioral affinity combines durable account actions with optional weak passive activity. The UI must not imply that opting out disables functional account state or that every behavioral reason came from passive tracking.

### Current Implementation Gap

Mode rendering does not handle `behavior-profile`. Frontend opt-out already disables the tracking queue; direct account actions use separate APIs and must stay separate.

### Dependencies

- Backend BFP-13.
- Existing tracking attribution.

### Non-goals

- Quality claims.
- Changing the tracking queue design.

### Backend Changes

See backend plan (BFP-13).

### Frontend Changes

- Add `behavior-profile` to Home/Recommendations mode rendering. Use neutral copy such as `Based on activity and account signals available for this profile.`; specific evidence belongs in server `reasons[]`.
- Keep the existing tracker rule: when tracking is disabled, `track()` returns false and no passive analytics queue is sent.
- Do not force ratings, wishlist, cart, or feedback through `track()`. Those direct functional APIs must continue to work while tracking is disabled.
- Preserve recommendation attribution only on passive events that are actually captured; do not invent attribution for durable account state.
- Render backend reason strings as-is within normal UI escaping. A behavior reason may still be valid under opt-out when it came from durable rating/wishlist/cart/feedback state.

### API Contract

Consumes `mode: "behavior-profile"`, `algorithmVersion: "behavior-profile-v1"`, and server-owned `reasons[]`. Frontend does not receive raw interaction rows or signal weights.

### Data-Model Changes

None.

### Algorithm Or Business Rules

Frontend does not infer behavioral taste or hide all behavioral reasons under opt-out. It renders the backend-selected mode/reasons.

### Privacy And Security Rules

- Opt-out means no passive analytics capture/delivery.
- Direct account actions still call their functional endpoints; this is not tracking bypass.
- Never render raw search text, raw interaction rows, historical Amazon identity, or component weights.

### Edge Cases

- Opt-out active + user has ratings/wishlist: `behavior-profile` may still appear with durable-state reasons.
- Opt-out active + no usable behavioral state: render the lower mode the backend actually returns. Before PERS-07 this is preference/cold-start/anonymous fallback; popularity becomes possible only after PERS-07.
- Anonymous visitor: no live-customer behavioral profile.
- Identity change during queued delivery: existing generation guard discards stale batches.
- Tracking enabled but passive queue delivery fails: direct account actions and current recommendation UI remain functional.

### Failure And Recovery Behavior

- No behavioral evidence: backend returns a lower mode; UI does not force a behavior label.
- Passive tracking failure is non-blocking UI analytics failure, not a recommendation-page fatal error.

### Migration Strategy

- Additive mode/reason handling behind backend `PERS_BEHAVIORAL_RANKING`; no tracker storage migration.

### Tests

- `tests/unit/tracking.test.js`: opt-out suppresses passive capture/queue/delivery; identity-change generation guard remains; tracking-enabled attribution stays complete.
- Functional store/feedback tests: rating/wishlist/cart/feedback APIs still execute with tracking disabled and do not require `track()` success.
- Recommendation page tests: `behavior-profile` label/reasons; durable-state reason allowed under opt-out; lower mode rendered when backend returns one.
- E2E: tracking off → no passive `/interactions` delivery, direct account actions still succeed, recommendation refresh can reflect durable state.

### Exact Implementation Order

1. Add tests proving direct functional actions do not depend on tracking.
2. Add `behavior-profile` label/reason rendering only; do not redesign tracking provider.
3. Update opt-out copy/tests to distinguish passive analytics from direct account features.
4. Run tracking/unit/component tests, full frontend test/lint/build, then opt-out E2E.

### Documentation Updates

- `RECOMMENDER_SYSTEM_PLAN.md`: behavioral mode copy.
- `INTERACTION_LOGGING_PLAN.md`: opt-out boundary update.

### Definition Of Done

- `behavior-profile` renders honestly; passive attribution is preserved only when captured; opt-out stops passive analytics; direct account actions still work and durable-state reasons remain allowed when truthful.

### Rollback Criteria

Disable backend behavioral ranking; UI renders the lower returned mode. Existing tracking opt-out behavior remains unchanged.

### Risks

- FR-021: UI wrongly treats opt-out as "disable all personalization" or disables functional actions. Mitigation: durable-state-under-opt-out and direct-action tests.

### Decisions Still Requiring Approval

None frontend-specific.

---

## PERS-07: Popularity Baseline And Fallback (Consumed Via API)

### ID And Title

PERS-07 / BFP-14 (backend) — Popularity baseline and fallback. Frontend renders the modes honestly.

### Status

Planned. Blocked by backend BFP-14.

### Goal

Add honest rendering for the new `popularity` mode while preserving the already implemented `anonymous-fallback` and cold-start handling.

### Why It Is Required

PERS-07 replaces plain catalog ordering with active-dataset historical popularity when aggregate evidence is available. The UI must distinguish that research-data aggregate from both personalization and the existing deterministic fallback.

### Current Implementation Gap

`anonymous-fallback` is already implemented. Only `popularity` mode/version/reason handling is new.

### Dependencies

- Backend BFP-14.

### Non-goals

- Popularity scoring (backend-owned).

### Backend Changes

See backend plan (BFP-14).

### Frontend Changes

- Add only the new `popularity` branch where recommendation mode labels are rendered. Use copy such as `Popular in the research ratings dataset.`; never say `recent`, `trending`, or `popular with users like you`.
- Keep existing `anonymous-fallback`/cold-start copy unchanged unless backend wording requires a contract-safe update.
- Render server reasons without exposing raw rating counts/means or historical subject information.
- Anonymous and authenticated lower-fallback surfaces use the same mode renderer; do not add authenticated-only controls to popularity cards.

### API Contract

Consumes `mode: "popularity"`, `algorithmVersion: "popularity-v1"`, or the already supported lower fallback modes.

### Data-Model Changes

None.

### Algorithm Or Business Rules

Frontend does not calculate popularity or infer recency. It renders the backend mode/reasons only.

### Privacy And Security Rules

- Popularity wording describes aggregate research ratings only; it never implies the signed-in customer's history or exposes historical users.

### Edge Cases

- Historical evidence available → `popularity`.
- No evidence/seed mode → existing `anonymous-fallback` or `cold-start` according to the backend response.
- Backend returns popularity to an authenticated empty-profile user → render it as non-personal aggregate, not "for you".

### Failure And Recovery Behavior

- Backend request failure uses the existing recoverable recommendation error/retry state; frontend must not fabricate catalog results locally.

### Migration Strategy

- One additive mode label behind backend `PERS_POPULARITY`; no provider/state migration.

### Tests

- Recommendation page/Home tests: popularity label/version/reason; no `recent`/personalized wording; existing anonymous-fallback copy regression.
- E2E MongoDB anonymous: popularity rendered when backend returns it. Seed/no-evidence fixture: deterministic fallback label remains.

### Exact Implementation Order

1. Add mode-label tests for popularity vs anonymous/cold-start.
2. Add the popularity label/reason branch only.
3. Run focused components, full frontend test/lint/build, then anonymous Home/Recommendations E2E.

### Documentation Updates

- `RECOMMENDER_SYSTEM_PLAN.md`: fallback copy.

### Definition Of Done

- `popularity` is clearly labeled as aggregate research-rating popularity; existing cold-start/anonymous fallback still renders correctly; no recency or personalization claim is introduced.

### Rollback Criteria

Disable backend popularity; frontend simply renders the lower mode returned by the existing API.

### Risks

- FR-022: historical aggregate popularity is mislabeled as recent or personalized. Mitigation: exact copy assertions.

### Decisions Still Requiring Approval

None frontend-specific.

---

## PERS-08: Hybrid Recommendation Orchestration (FFP-13)

### ID And Title

PERS-08 / FFP-13 (frontend) + BFP-15 (backend) — Render the `personalized-hybrid` mode with truthful, contribution-based reasons.

### Status

Planned. Blocked by backend BFP-15.

### Goal

Render `personalized-hybrid` only when the backend actually combined preference and behavioral components, show server-owned reasons, and preserve hybrid version attribution without exposing scores/weights.

### Why It Is Required

The hybrid is one authenticated mode, not a permanent label for every signed-in request. Preference-only, behavior-only, popularity, and deterministic fallback must remain independently visible when the backend selects them.

### Current Implementation Gap

No `personalized-hybrid` mode handling.

### Dependencies

- Backend BFP-15.
- FFP-09 through FFP-12.

### Non-goals

- Exposing raw component weights.
- Quality claims.

### Backend Changes

See backend plan (BFP-15).

### Frontend Changes

- Add `personalized-hybrid` to the shared mode renderer. Use neutral copy such as `Personalized from the preferences and account activity available for this profile.` Do not mention product-content similarity as a separate hybrid source.
- Render up to the existing maximum two `reasons[]` per card; do not compute/order reasons by client-side weights.
- Preserve the response `algorithmVersion`; when mode is hybrid it must be `personalized-hybrid-v1`. Lower modes preserve their own versions.
- Keep request/list/mode/version/rank attribution attached to the rendered item and supported passive events.
- Do not add or render profile-completeness/source-flag fields; the hybrid surface needs only the existing recommendation envelope, mode/version, and reasons.
- Remove demo-profile wording only from registered personalized surfaces; keep the restricted synthetic demo path clearly labeled.

### API Contract

Consumes the existing recommendation envelope plus `mode`, `algorithmVersion`, and `reasons[]`. No profile-completeness/source-flag/component-score/weight contract is added to the frontend.

### Data-Model Changes

None.

### Algorithm Or Business Rules

Frontend trusts backend mode selection. It never labels preference-only/behavior-only/popularity results as hybrid.

### Privacy And Security Rules

- Reasons reveal only safe user-facing statements returned by backend; no raw weights, component scores, historical identity, or interaction rows.

### Edge Cases

- Hybrid; preference-only; behavior-only; popularity; deterministic fallback; opt-out with durable behavior still available; all reasons empty; one reason; two reasons; old/stale request aborted by current generation guard.
- If `mode !== "personalized-hybrid"`, do not force hybrid copy because the user is authenticated.

### Failure And Recovery Behavior

- Backend returns a lower mode when evidence is unavailable; UI uses that mode's existing copy/reasons.
- Request failure uses existing error/retry state; frontend does not combine locally cached component results.

### Migration Strategy

- One additive hybrid mode branch behind backend `PERS_HYBRID`; no provider/state migration.

### Tests

- Recommendation page/Home tests: hybrid exact label/version; up-to-two reasons; lower mode not mislabeled hybrid; no raw weight/score/profile-quality text.
- Attribution test: hybrid mode/version/rank survives into supported passive event payload.
- E2E: user fixture with preference+behavior returns hybrid; remove one personalized component and verify frontend renders the returned component mode instead.

### Exact Implementation Order

1. Add mode-matrix component tests before UI changes.
2. Add hybrid label/reason/version branch in the existing renderer only.
3. Verify attribution carries the response mode/version without client recomputation.
4. Run focused component tests, full frontend test/lint/build, then hybrid/lower-mode E2E.

### Documentation Updates

- `RECOMMENDER_SYSTEM_PLAN.md`, `UI_UX_PLAN.md`: hybrid copy and reason rendering.
- `PRESENTATION_NOTES.md`: honest updated wording (still no quality claim).

### Definition Of Done

- Hybrid renders only for backend hybrid responses; lower modes remain distinct; up to two server reasons render; attribution carries the exact mode/version; no raw scoring details or quality percentage appear; synthetic demo copy stays isolated.

### Rollback Criteria

Disable backend hybrid; frontend renders whatever lower component/fallback mode the API returns. No client rollback.

### Risks

- FR-022: an authenticated lower-mode result is mislabeled hybrid or reason/version drifts from the response. Mitigation: full mode-matrix fixtures and attribution assertions.
- FR-023: demo-profile language leaks onto a registered personalized surface. Mitigation: route/mode-specific copy tests.

### Decisions Still Requiring Approval

None. Show at most two reasons per card, matching the existing UI limit.

---

## PERS-09: Integration, Regression Protection, Documentation Closure (FFP-14)

### ID And Title

PERS-09 / FFP-14 (frontend) + BFP-16 (backend) — Full frontend integration, regression protection, and documentation closure.

### Status

PERS-01, PERS-02, and DATA-15 are complete; PERS-03 through PERS-05 are implemented and verified for this batch, while PERS-09 remains planned until the later PERS-06 through PERS-08 work.

### Goal

Verify PERS-03 through PERS-08 end-to-end on top of the already implemented PERS-02 `/me` resource flow, close cross-repository regressions/accessibility/documentation, and leave new ranking flags default-off until a separate enablement task.

### Why It Is Required

Each later feature is independently reversible. PERS-09 proves their contracts and UI states coexist without redoing auth/provider architecture, mutating DATA-15, or overstating recommendation quality.

### Current Implementation Gap

PERS-06 through PERS-08 are still planning-only. The PERS-03 through PERS-05 batch and endpoint/auth restoration/resource-key/stale-response foundation are implemented and should be regression-tested, not replaced.

### Dependencies

- PERS-03 through PERS-08 implemented and individually verified.
- PERS-01/PERS-02 identity and `/me` contracts remain regression gates, not unfinished dependencies.

### Non-goals

- Quality evaluation with sufficient evidence.
- Removing `content-demo-v1` showcase or the restricted old route.

### Backend Changes

See backend plan (BFP-16).

### Frontend Changes

- Re-verify existing PERS-02 behavior instead of rebuilding it: auth restoration gates loading; `/me` is used for authenticated customers; anonymous fallback remains public; identity changes abort/stale-guard old requests; sign-out clears personalized recommendation state.
- Verify Profile/Onboarding preference saves do not call the disabled off-surface recommendation reload. After a successful save, the next navigation to Home/Recommendations must trigger the existing fresh route/resource-key request.
- Verify `Not interested`/`Already own`/`Undo` controls are server-confirmed and cannot be undone by an older in-flight recommendation response.
- Verify all backend-returned modes render distinctly: `preference-profile`, `behavior-profile`, `popularity`, `personalized-hybrid`, `cold-start`, `anonymous-fallback`, plus the restricted `demo-profile` path.
- Verify passive recommendation attribution remains correct through Home/Recommendations → card click/view tracking; direct account actions do not depend on the tracking queue.
- Verify tracking opt-out removes passive analytics but does not disable rating/wishlist/cart/feedback or durable-state personalization.
- Keep one recommendation state/provider. Do not add a second cache/store for personalization components.
- Keep loading, empty, retry, and fallback states; lower component modes represent partial evidence, so no separate `partial hybrid` UI is required.
- Re-run keyboard/focus/screen-reader/touch/mobile checks for new controls and states.

### API Contract

Mirror the final backend `/api/recommendations/me` and feedback contracts in `API_CONTRACT_PLAN.md`; frontend never consumes raw component weights/scores/historical identity.

### Data-Model Changes

None frontend-side; no localStorage migration for recommendation/profile data.

### Algorithm Or Business Rules

Frontend renders backend-selected modes only. Product detail continues to use the separate product-similarity API; `content-demo-v1` demo behavior remains regression-only and is not substituted for a registered customer.

### Privacy And Security Rules

- Full opt-out boundary enforced end-to-end.
- No PII sent; no private raw events rendered; no cross-user inference.
- Account deletion clears local personalization state on the client (sign-out flow already clears local state).

### Edge Cases

Minimum final frontend matrix: anonymous; registered; showcase demo; admin denial; expired/tampered/disabled/deleted session; sign-in/sign-out during request; preference save success/failure then fresh-load navigation; feedback duplicate/double undo/stale request; tracking on/off; durable-state behavior under opt-out; popularity vs deterministic fallback; each hybrid component availability mode; research-only null commercial fields; seed mode; explicit MongoDB failure; product removed during refresh; mobile/keyboard/screen-reader states.

### Failure And Recovery Behavior

- Backend returns a lower recommendation mode because evidence is unavailable → render it honestly.
- Backend/catalog/persistence request fails → use existing recoverable error/retry state; do not fabricate a lower list in the browser.
- Auth changes → existing resource-key/generation guard owns cancellation and stale-response rejection.

### Migration Strategy

No frontend endpoint/provider migration: PERS-02 already switched to `/api/recommendations/me`. PERS-09 is integration/verification only. No dataset action and no local recommendation-profile persistence.

### Tests

- Unit/component: current PERS-02 auth/resource-key/stale guards; all mode labels/reasons; Profile/Onboarding have no catalog-reload coupling; feedback create/undo/error; opt-out vs direct actions; attribution; loading/empty/retry/fallback; accessibility/keyboard/mobile.
- E2E both repos: registered preference ordering; rating/wishlist behavioral effect; exact not-interested/already-own exclusion + undo; opt-out no passive delivery while direct state works; anonymous MongoDB popularity; seed deterministic fallback; lower hybrid modes; cross-user denial; admin rejection; legacy demo and product similarity regression; checkout/admin unrelated functionality unchanged.
- Browser/read-only data regressions: v3 active response metadata, v2/v1/legacy boundaries where surfaced, research null fields, dynamic facets, 208 accepted artwork fallback vs placeholder behavior, exactly three showcase customers. Do not mutate dataset lifecycle.
- Synthetic fixture tests are regression/function evidence only, never recommendation-quality evaluation.

### Exact Implementation Order

1. Verify backend PERS-03 through PERS-08 contracts are stable; do not code around an unstable response in frontend.
2. Run focused component tests for each new mode/control, then audit one shared mode renderer and one recommendation state provider.
3. Run full frontend tests/lint/build.
4. Run both repos and execute authenticated, anonymous, feedback, opt-out, identity-transition, popularity, hybrid/lower-mode E2E cases.
5. Run accessibility/mobile checks for changed controls/states.
6. Review the final frontend semantic diff for stale demo/non-personalization copy and duplicate state logic.
7. Synchronize frontend plan/contract/UI/tracking/backlog/status docs only. Leave new PERS ranking flags off pending separate authorization.

### Documentation Updates

- `FUTURE_IMPLEMENTATION_PLAN.md`, `ROADMAP.md`, `TASK_BACKLOG.md`: PERS rows.
- `API_CONTRACT_PLAN.md`: final contracts.
- `RECOMMENDER_SYSTEM_PLAN.md`: final algorithm copy.
- `UI_UX_PLAN.md`: final states and controls.
- `PROJECT_CONTEXT.md`, `PRODUCT_REQUIREMENTS.md`: honest personalization scope.
- `DECISION_LOG.md`: all PERS decisions.
- `RISK_REGISTER.md`: all PERS risks.
- `SETUP_LATER.md`: post-personalization deferred items.
- `PRESENTATION_NOTES.md`: honest updated wording.
- `README.md`: register the new plan doc.
- `CLAUDE.md`/`AGENTS.md`: only if instructions genuinely need updating.
- `implementation_plan_order.txt`: verify the existing PERS sequence/status is still correct; update only if implementation status changed.

### Definition Of Done

- PERS-03 through PERS-08 work through the existing PERS-02 recommendation provider with one state/resource path; all modes/feedback/opt-out states pass focused + full tests and required E2E/a11y/mobile checks.
- Research-only v3 behavior, existing anonymous/cold-start paths, legacy demo route, product similarity, admin/checkout surfaces, and exactly three showcase customers do not regress.
- Frontend docs consistently treat hard relaxation, show-fewer v1, recent-live popularity, and duplicate content hybrid scoring as excluded/deferred rather than planned behavior, and make no recommendation-quality claim.
- New PERS-04 through PERS-08 ranking flags remain default-off until separately authorized.

### Rollback Criteria

Each backend algorithm flag disables independently; frontend renders the lower returned mode using the same provider. No endpoint/provider/local-data rollback is required.

### Risks

- FR-022 / FR-023: cross-repo mode/version/reason/copy contracts drift from the selected approach. Mitigation: shared response fixtures, full E2E mode matrix, and final stale-term review.
- FR-013 / FR-014: integration overstates recommendation quality or regresses identity-transition stale-response protection. Mitigation: existing honesty wording plus auth/resource-generation regression tests.

### Decisions Still Requiring Approval

Production enablement only. Default at closure is off; enabling new ranking flags requires a separate explicit task.

---

## Edge-Case Appendix (Consolidated)

Every case below is covered by at least one milestone's tests.

- Identity and authorization: anonymous; expired; tampered; disabled; deleted; admin; seeded; MongoDB demo; registered; cross-user attempt (frontend cannot select another user); auth transition during request; multiple tabs; concurrent login/logout.
- Preferences: empty; partial onboarding; conflicting favorite/disliked genres; unsupported condition/format; preference edits during ranking; preference deletion; no matching products; extremely narrow preferences; missing metadata.
- Behavior: duplicate events; refresh-generated views; passive tracking disabled; anonymous-to-authenticated transition; guest-state merge retry; interaction references deleted product; interaction references unknown recommendation list.
- Negative feedback: duplicate create; undo twice; product deleted after stored feedback; rating-5 plus not-interested conflict; confirmed card becomes status+Undo; failed undo keeps placeholder; later normal load enforces suppression; tracking disabled.
- Popularity and fallback: anonymous visitor; authenticated empty profile; active historical evidence; no evidence; seed mode; v2/v3 coexistence; no historical identity in UI.
- Hybrid: preference+behavior hybrid; preference-only; behavior-only; popularity-only; all unavailable; exact exclusion; reason/item mismatch; stable ordering.
- Persistence and availability: MongoDB unavailable; seed mode; missing env vars; retry after timeout; account deleted during ranking; product changed during ranking.
- Privacy: tracking opt-out; no PII; no raw events rendered; no cross-user inference; account deletion; TTL expiration; durable suppression vs expiring analytics; synthetic data clearly labelled.
- Accessibility and responsive: keyboard operation; screen-reader announcements; mobile layout; visible focus; touch targets.

## Test And Verification Plan

Deterministic synthetic fixtures and labelled classroom demo profiles only. No real-user data, no user studies, no quality claims, no completion of the evidence threshold.

- Unit (`tests/unit/`), component (`tests/components/`), e2e (`tests/e2e/`), and axe accessibility tests per milestone.
- End-to-end integration tests with both repos running (PERS-09).
- Synthetic fixture tests are never labeled recommendation-quality evaluation.
- The offline evaluator is preserved and remains `insufficient-evidence`; it is not part of this roadmap.

## Migration And Rollout Plan

Each stage is reversible. PERS-02 already moved recommendation loading to the stable `/api/recommendations/me` resource, so later frontend work is additive mode/control integration rather than another endpoint switch. Backend contracts are implemented first for each later milestone; frontend then consumes the stable contract. PERS-04 through PERS-08 flags remain independently reversible and default-off until separately enabled. No frontend recommendation/profile localStorage migration is planned; `content-demo-v1` and the restricted legacy path remain regression behavior.

## Decision Register (Recorded Or Proposed)

Completed PERS-00 through PERS-02 resolve FDEC-011, provider order/auth gating, limit 12, customer-only `/me`, and identity-transition protection. This 2026-08-09 re-review additionally fixes the frontend choices for PERS-04 through PERS-08: no off-surface preference reload (fresh route-scoped load on next recommendation navigation); pessimistic exact-item feedback with only not-interested/already-own/undo; tracking opt-out does not disable direct account actions; popularity copy refers to research ratings; hybrid renders only the backend three-component mode and at most two reasons. Remaining approval is production enablement of the new ranking flags.

## Honesty Contract

No milestone, doc, test, or UI copy may claim measured recommendation quality, real-customer personalization beyond the authenticated session-owned ranking defined here, or that behavior tests equal quality evidence. Synthetic fixtures and showcase accounts are clearly labelled as demonstrations. The existing `insufficient-evidence` evaluator status and its evidence threshold are unchanged and not completed by this roadmap.
