# Personalization Implementation Plan (Frontend)

This roadmap is the frontend half of converting the existing deterministic demo recommender into a genuine personalized recommender system for the Vinyl Record Store (CSX4207). PERS-00 through PERS-02 / FFP-09 were implemented and verified on 2026-07-10. PERS-03 through PERS-09 remain planning-only and authorize no implementation by themselves.

This plan is scheduled AFTER the entire existing documented roadmap: BFP-07 (admin backend), FFP-07 (admin frontend), FFP-08 (simulated checkout), and any backend support already planned for the simulated checkout. It does not reorder, replace, remove, or silently redefine any existing BFP/FFP plan.

This frontend plan contains the SAME cross-repository milestone order (PERS-00 through PERS-09) as the backend plan at `../vinyl_record_store_backend/docs/PERSONALIZATION_IMPLEMENTATION_PLAN.md`. The backend plan owns identity, routes, services, algorithms, data models, indexes, and privacy. This plan owns routing, the API client, auth integration, recommendation state, feedback controls, loading/error/fallback UI, attribution, accessibility, and browser tests.

Audience: the developers implementing the Vite/React storefront and the backend developers providing its contracts.

Source of truth for current state: live frontend source (`src/` only; `code_for_website/` is a retained design snapshot, not production), `PROJECT_CONTEXT.md`, `API_CONTRACT_PLAN.md`, `RECOMMENDER_SYSTEM_PLAN.md`, `UI_UX_PLAN.md`, `INTERACTION_LOGGING_PLAN.md`, and the matching backend personalization plan. Re-verify every file path against the source before implementing any milestone.

## Hard Scope Boundaries

Included: routing and provider ordering for identity-safe recommendation loading; a session-owned API client call; auth-aware recommendation state with stale-response prevention; preference-edit refresh; first-class negative-feedback UI; honest mode labels and reasons; loading/empty/error/retry/fallback states; recommendation attribution; accessibility and responsive behavior; browser, component, unit, and a11y tests.

Explicitly excluded (mirroring the backend plan): gathering real users or real-world evaluation data; user studies; any claim of measured recommendation quality; completing the evidence threshold; publishing Precision@k, Recall@k, MAP@k, NDCG@k, or other quality results without evidence; collaborative filtering and matrix factorization. Synthetic fixtures and clearly labelled classroom demo profiles may be used for development and testing, never presented as real evaluation evidence.

## Current State (Re-Verified Against Source On 2026-07-10)

These facts were verified by reading `src/`, not by trusting doc status tables.

- Routes include the completed administrator workspace and simulated checkout. Home and Recommendations remain public recommendation surfaces; customer identity comes from the optional-session API rather than route protection.
- `RouterProvider` owns the data router; the root route shell then nests `AuthProvider > TrackingProvider > CatalogProvider > StoreProvider`. Recommendation loading is also explicitly disabled while auth status is `loading`.
- `fetchMyRecommendations` calls `/api/recommendations/me` without a user ID and omits `X-Anonymous-Id` when authenticated. The only legacy helper is fixed to `/api/recommendations/user/demo-user`; it has no user-ID parameter.
- `CatalogProvider` keys recommendation state by surface, endpoint flag, auth status, and authenticated `publicId`; it aborts identity changes and uses request generations so a transport that ignores abort cannot overwrite current results.
- `AuthProvider` restores the session, guards auth-operation races, and exposes the safe user. `CatalogProvider` consumes `publicId` only as a local resource key; it is never sent as recommendation identity.
- `StoreProvider` (`src/context/StoreProvider.jsx`) uses session-only guest state, merges guest state only on sign-up, and tracks wishlist/cart/rating events with recommendation attribution. Preference saves do not refresh recommendations (intentional today).
- Tracking lives in `src/lib/tracking.js` and `src/context/TrackingProvider.jsx`: anonymous id in localStorage, session id in sessionStorage, a durable queue (max 500, batch 25), opt-out (env + per-user), fire-and-forget, impression dedupe, full recommendation attribution (`requestId`/`listId`/`rank`/`mode`/`algorithmVersion`), and `prepareTrackingIdentityChange` which flushes/discards before identity changes.
- Home and Recommendations render `demo-profile`, `cold-start`, and `anonymous-fallback` honestly; product detail continues to render product-based similarity separately.
- No negative-feedback UI exists (no not-interested, already-own, show-fewer-like-this). `recommendation_dismiss` is deferred on the frontend (`INTERACTION_LOGGING_PLAN.md`).
- Preference UI fields (`src/lib/preferences.js`): `favoriteGenres`, `dislikedGenres`, `favoriteArtists`, `budget.{min,max}`, `conditions`, `formats`. Onboarding is a 3-step wizard; profile preferences is a single page. Visible copy states preferences do not change the current demo ranking.
- Tests include API and `CatalogProvider` identity/race contracts plus browser coverage for authenticated `/me`, anonymous/tampered fallback, admin denial, cross-user legacy parity, analytics attribution, and prerequisite account cleanup.
- Env adds default-on `VITE_PERS_ME_ENDPOINT` beside `VITE_API_BASE_URL`, `VITE_TRACKING_ENABLED`, and `VITE_TRACKING_DEBUG`.

## Dependency-Safe Milestone Order And ID Mapping

The order is identical to the backend plan. Each PERS milestone maps to the same backend and/or frontend plan IDs.

| Milestone | Title | Backend subplan | Frontend subplan |
| --- | --- | --- | --- |
| PERS-00 | Audit and decision freeze | (BDEC-016; BR-020/BR-021) | (FDEC-011; FR-013/FR-014) |
| PERS-01 | Proper identity enforcement | BFP-08 | (contract tests only) |
| PERS-02 | Session-owned signed-in-user endpoint | BFP-09 | FFP-09 |
| PERS-03 | Unified recommendation profile and feedback domain | BFP-10 | (consumed via API) |
| PERS-04 | Preference-aware ranking | BFP-11 | FFP-10 |
| PERS-05 | Negative-feedback capture and durable suppression | BFP-12 | FFP-11 |
| PERS-06 | Behavioral-signal personalization | BFP-13 | FFP-12 |
| PERS-07 | Popularity baseline and fallback | BFP-14 | (consumed via API) |
| PERS-08 | Hybrid recommendation orchestration | BFP-15 | FFP-13 |
| PERS-09 | Cross-repository integration, migration, regression protection, documentation closure | BFP-16 | FFP-14 |

Frontend uses FFP-09 through FFP-14. Backend uses BFP-08 through BFP-16. No existing BFP, FFP, task, decision, or risk ID is reused. Next-unused task ID is F-016; decision FDEC-011; risk FR-013.

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
- Preference edits refresh recommendations for authenticated users (new in PERS-04).
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

PERS-03 / BFP-10 (backend) — Unified profile and feedback domain. Frontend consumes the safe surface; no new UI yet.

### Status

Planned. Blocked by PERS-02.

### Goal

Render the safe `profileSummary` and `dataSourceFlags` the backend now returns, without exposing raw signals.

### Why It Is Required

The unified profile produces a richer (but still safe) summary the frontend should surface honestly.

### Current Implementation Gap

`profileSummary` is rendered as signal-pills today (`RecommendationsPage.jsx`, `ProfileSummary`). New data-source flags are not yet handled.

### Dependencies

- Backend BFP-10.

### Non-goals

- New feedback UI (that is FFP-11 in PERS-05).
- Exposing raw signals or counts that leak private behavior.

### Backend Changes

See backend plan (BFP-10).

### Frontend Changes

- Extend `ProfileSummary` to render safe `dataSourceFlags` (for example "preferences", "ratings", "wishlist", "cart", "feedback", "behavioral") as labelled pills, with copy that never claims measured quality.
- Continue to treat the summary as explanatory, not as a quality claim.

### API Contract

Consumes the extended `/me` response (`profileSummary`, `dataSourceFlags`). No new route.

### Data-Model Changes

None.

### Algorithm Or Business Rules

None.

### Privacy And Security Rules

- Render only the allow-listed safe fields.

### Edge Cases

- Empty profile summary (cold-start): render the existing cold-start copy.
- Unknown flag: ignored.

### Failure And Recovery Behavior

- Missing fields: render what is available; never error.

### Migration Strategy

- Additive UI behind the same backend flag; no standalone frontend flag needed.

### Tests

- `tests/components/ProfileSummary.test.jsx` (new): renders safe flags; ignores unknown; cold-start copy when empty; no raw signal text.

### Documentation Updates

- `UI_UX_PLAN.md`: data-source pills.

### Definition Of Done

- Safe summary and flags render honestly; no raw signals; cold-start copy intact.

### Rollback Criteria

Hide the flags; summary reverts to today's pills.

### Risks

- FR-017: a flag leaks private behavior. Mitigation: allow-list test.

### Decisions Still Requiring Approval

- Which flags to surface initially (proposed allow-list above).

---

## PERS-04: Preference-Aware Ranking (FFP-10)

### ID And Title

PERS-04 / FFP-10 (frontend) + BFP-11 (backend) — Preference-aware ranking surfaces and preference-edit refresh.

### Status

Planned. Blocked by backend BFP-11.

### Goal

Render the `preference-profile` mode honestly, refresh recommendations when preferences change, and explain relaxed constraints.

### Why It Is Required

Preferences become real; the UI must reflect that without overclaiming.

### Current Implementation Gap

- Mode label only handles `demo-profile`/cold-start.
- Saving preferences does not refresh recommendations (intentional today; the copy says so).

### Dependencies

- Backend BFP-11.
- FFP-09 (`/me`).

### Non-goals

- Behavioral/popularity/hybrid UI (later milestones).

### Backend Changes

See backend plan (BFP-11).

### Frontend Changes

- Add `preference-profile` to the mode-label branch in `RecommendationsPage.jsx` and `HomePage.jsx` with honest copy (for example "Based on the preferences you saved.").
- Remove/replace the existing copy that says preferences do not affect ranking (`ProfilePreferencesPage.jsx:37`, `OnboardingPage.jsx:30`) once preference ranking is live for authenticated users.
- Wire `savePreferences` (in `AuthProvider` or the page) to call `reloadRecommendations` for authenticated users after a successful save; keep the showcase `demo-profile` copy where applicable.
- Render relaxed-constraint notices when the backend reports them (distinct, honest, non-alarmist).

### API Contract

Consumes `mode: "preference-profile"` and reason strings; sends preference changes via `PATCH /api/me/preferences` (unchanged).

### Data-Model Changes

None.

### Algorithm Or Business Rules

None (backend-owned).

### Privacy And Security Rules

- Explanations reveal only the user's own preferences.

### Edge Cases

- Empty preferences after save: fall through to next ladder rung; copy reflects it.
- Partial onboarding: refresh uses whatever is saved.
- Preference edit during an in-flight recommendation request: next request reflects it; in-flight not mutated.
- Relaxed constraints: notice shown.
- Showcase account: keeps labelled `demo-profile` or its seeded preference profile, clearly a demonstration.

### Failure And Recovery Behavior

- Preference save fails: keep prior preferences; show recoverable error; do not refresh.

### Migration Strategy

- Behind the same backend flag `PERS_PREFERENCE_RANKING`.

### Tests

- `tests/components/RecommendationsPage.test.jsx` (new): `preference-profile` label; relaxed-constraint notice; cold-start fallback copy.
- `tests/components/ProfilePreferencesPage.test.jsx` extended: successful save triggers `reloadRecommendations`; failed save does not.
- `tests/e2e/analytics.spec.js` extended: authenticated user with preferences sees `preference-profile`.

### Documentation Updates

- `RECOMMENDER_SYSTEM_PLAN.md`, `UI_UX_PLAN.md`: new mode and refresh behavior.
- `PRODUCT_REQUIREMENTS.md`: preference-aware success criterion.

### Definition Of Done

- `preference-profile` rendered honestly; preference saves refresh recommendations; relaxed-constraint notices work; old "preferences do not affect ranking" copy replaced for authenticated users.

### Rollback Criteria

Disable backend flag; UI reverts to cold-start/demo copy.

### Risks

- FR-018: copy still claims preferences do not work after they do. Mitigation: copy-update checklist in Definition of Done.
- FR-019: refresh double-fires or races. Mitigation: gate refresh on save success and abort in-flight.

### Decisions Still Requiring Approval

- Whether to auto-refresh on every preference save or require a user action (proposed auto-refresh).

---

## PERS-05: Negative Feedback (FFP-11)

### ID And Title

PERS-05 / FFP-11 (frontend) + BFP-12 (backend) — First-class negative-feedback controls.

### Status

Planned. Blocked by backend BFP-12 and ideally after FFP-10.

### Goal

Add accessible, robust not-interested / already-own / show-fewer-like-this / undo controls that update the displayed list and recover from failure.

### Why It Is Required

Negative feedback must be a real feature, not just analytics. The UI is where users express it.

### Current Implementation Gap

No feedback controls exist. `recommendation_dismiss` is deferred.

### Dependencies

- Backend BFP-12 (feedback routes).
- FFP-09 (`/me`), FFP-10 (refresh pattern).

### Non-goals

- Permanent broad genre suppression from one item (backend-owned; UI only offers explicit genre dislike if approved).
- Queueing feedback as analytics (it is a functional action).

### Backend Changes

See backend plan (BFP-12).

### Frontend Changes

- Add `src/lib/feedback.js` API helpers: `putFeedback(productId, { kind, scope, reason })`, `deleteFeedback(productId, { kind })`, `fetchFeedback()`.
- Add `src/components/FeedbackControls.jsx` (or extend `ProductCard.jsx` and `DetailPage.jsx`) with accessible buttons: "Not interested", "Already own", optional "Show fewer like this", and "Undo".
- Placement: card footer and detail-page actions; visible keyboard focus; adequate touch-target size; mobile layout verified.
- States: loading (disable while pending), disabled, error with recovery. Prevent double-click.
- Update strategy: pessimistic for creates (await server confirmation before removing from the list) so a late network failure cannot strand a removed item; undo is optimistic with rollback on error. Final choice in FDEC-012.
- On success: remove or re-rank the item; announce via an `aria-live` region; update explanations.
- Error/offline: keep the item; show a recoverable error; do not queue.
- Cross-tab consistency: refresh feedback state on window focus when authenticated.
- Send `recommendation_dismiss` (or the new explicit feedback event type) with full attribution when the user acts.

### API Contract

Consumes backend feedback routes. Sends attributed interaction events.

### Data-Model Changes

None.

### Algorithm Or Business Rules

UI sends `{ kind, scope?, reason? }`; backend owns suppression semantics.

### Privacy And Security Rules

- Feedback is a user action; sent regardless of passive opt-out.
- No PII in feedback payloads.

### Edge Cases

- Duplicate dismiss (rapid double-click): disabled-while-pending prevents; idempotent anyway.
- Undo twice: idempotent.
- Dismiss a since-deleted product: backend handles; UI shows success then removes.
- Network failure after optimistic removal: pessimistic strategy avoids for creates; undo rollback handles its own failure.
- Feedback during a refreshing recommendation request: next request reflects it.
- Conflict (rating 5 and not-interested): UI allows both; suppression wins on the item.

### Failure And Recovery Behavior

- Backend unavailable: create rejected with recoverable error; existing list unchanged.
- Partial failure: rollback optimistic state.

### Migration Strategy

- Additive UI behind the same backend flag `PERS_NEGATIVE_FEEDBACK`.

### Tests

- `tests/components/FeedbackControls.test.jsx` (new): submission, undo, loading/disabled, error recovery, keyboard operation, screen-reader announcement, double-click prevention.
- `tests/components/ProductCard.test.jsx` (new or extended): controls render with attribution; pessimistic removal.
- `tests/e2e/` extended: not-interested removes and suppresses; already-own excludes without implying dislike; undo restores.

### Documentation Updates

- `UI_UX_PLAN.md`: control placement, states, accessibility.
- `RECOMMENDER_SYSTEM_PLAN.md`: feedback semantics summary.
- `INTERACTION_LOGGING_PLAN.md`: `recommendation_dismiss`/feedback event un-deferred.

### Definition Of Done

- All controls work accessibly; pessimistic creates; undo idempotent; list updates; announcements fire; mobile/keyboard verified; events attributed.

### Rollback Criteria

Hide controls; backend flag off. No data to roll back.

### Risks

- FR-020: optimistic removal strands items on network failure. Mitigation: pessimistic creates.
- FR-021: controls inaccessible. Mitigation: axe + keyboard tests.

### Decisions Still Requiring Approval

- Pessimistic vs optimistic create (proposed pessimistic).
- Genre-level dislike control (proposed optional, off by default).

---

## PERS-06: Behavioral-Signal Personalization (FFP-12)

### ID And Title

PERS-06 / FFP-12 (frontend) + BFP-13 (backend) — Honest rendering of behavior-driven recommendations and continued correct attribution.

### Status

Planned. Blocked by backend BFP-13.

### Goal

Render `behavior-profile` mode honestly, ensure attribution continues to flow, and verify opt-out stops passive capture while explicit actions still send.

### Why It Is Required

Behavioral ranking is the largest signal source; the UI must be honest and must not break attribution or opt-out.

### Current Implementation Gap

Mode label does not handle `behavior-profile`. Opt-out is frontend-enforced for passive events already.

### Dependencies

- Backend BFP-13.
- Existing tracking attribution.

### Non-goals

- Quality claims.
- Changing the tracking queue design.

### Backend Changes

See backend plan (BFP-13).

### Frontend Changes

- Add `behavior-profile` to the mode-label branch with honest copy (for example "Based on records you have viewed and saved.").
- Verify opt-out stops passive event capture (already implemented) and that explicit functional actions (ratings, wishlist, cart, feedback) still send under opt-out.
- Preserve full attribution on every event.

### API Contract

Consumes `mode: "behavior-profile"` and behavioral reasons. Under opt-out, the backend will not return behavioral reasons.

### Data-Model Changes

None.

### Algorithm Or Business Rules

None (backend-owned).

### Privacy And Security Rules

- Opt-out honored for passive events; explicit actions still sent.

### Edge Cases

- Opt-out active: no passive events sent; no behavioral reasons rendered.
- Anonymous visitor: no behavioral profile; anonymous fallback rendered.
- Identity change during queued delivery: generation guard discards stale batches (already implemented).

### Failure And Recovery Behavior

- No behavioral evidence: backend returns a different mode; UI renders accordingly.

### Migration Strategy

- Additive label behind the same backend flag `PERS_BEHAVIORAL_RANKING`.

### Tests

- `tests/unit/tracking.test.js` extended: opt-out suppresses passive; explicit actions still sent.
- `tests/components/RecommendationsPage.test.jsx` extended: `behavior-profile` label; no behavioral reason under opt-out.
- `tests/e2e/analytics.spec.js` extended: opt-out stops passive delivery; explicit actions still delivered.

### Documentation Updates

- `RECOMMENDER_SYSTEM_PLAN.md`: behavioral mode copy.
- `INTERACTION_LOGGING_PLAN.md`: opt-out boundary update.

### Definition Of Done

- `behavior-profile` rendered honestly; attribution preserved; opt-out boundary correct.

### Rollback Criteria

Disable backend flag; UI reverts to prior modes.

### Risks

- FR-022: behavioral reason rendered under opt-out. Mitigation: backend-suppression + UI test.

### Decisions Still Requiring Approval

None frontend-specific.

---

## PERS-07: Popularity Baseline And Fallback (Consumed Via API)

### ID And Title

PERS-07 / BFP-14 (backend) — Popularity baseline and fallback. Frontend renders the modes honestly.

### Status

Planned. Blocked by backend BFP-14.

### Goal

Render `popularity` and `anonymous-fallback` modes honestly for anonymous visitors and fallback cases.

### Why It Is Required

Anonymous visitors and empty-profile users need an honest fallback label.

### Current Implementation Gap

No `popularity`/`anonymous-fallback` mode handling.

### Dependencies

- Backend BFP-14.

### Non-goals

- Popularity scoring (backend-owned).

### Backend Changes

See backend plan (BFP-14).

### Frontend Changes

- Add `popularity` and `anonymous-fallback` to the mode-label branch with honest copy (for example "Popular recent picks." and "Browse the catalog.").
- Ensure anonymous visitors see the fallback on Home and Recommendations without any authenticated-only affordance.

### API Contract

Consumes `mode: "popularity"` / `"anonymous-fallback"`.

### Data-Model Changes

None.

### Algorithm Or Business Rules

None.

### Privacy And Security Rules

- No per-user data in fallback responses.

### Edge Cases

- No popularity evidence: backend returns `anonymous-fallback`; UI renders catalog browsing copy.

### Failure And Recovery Behavior

- Backend unavailable: recoverable error with retry for anonymous fallback.

### Migration Strategy

- Additive label behind the same backend flag `PERS_POPULARITY`.

### Tests

- `tests/components/RecommendationsPage.test.jsx` extended: `popularity` and `anonymous-fallback` labels.
- `tests/e2e/routes.spec.js` extended: anonymous Home/Recommendations render fallback.

### Documentation Updates

- `RECOMMENDER_SYSTEM_PLAN.md`: fallback copy.

### Definition Of Done

- Fallback modes render honestly for anonymous and empty-profile users.

### Rollback Criteria

Disable backend flag; UI reverts to cold-start copy.

### Risks

- FR-023: fallback labeled as personalized. Mitigation: copy review + test.

### Decisions Still Requiring Approval

None frontend-specific.

---

## PERS-08: Hybrid Recommendation Orchestration (FFP-13)

### ID And Title

PERS-08 / FFP-13 (frontend) + BFP-15 (backend) — Render the `personalized-hybrid` mode with truthful, contribution-based reasons.

### Status

Planned. Blocked by backend BFP-15.

### Goal

Surface the hybrid result honestly with reasons drawn from actual score contributions, and carry the hybrid version in attribution.

### Why It Is Required

The hybrid is the final authenticated recommendation; the UI must explain it truthfully without exposing raw weights.

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

- Add `personalized-hybrid` to the mode-label branch with honest copy (for example "Based on your preferences, activity, and what is popular.").
- Render multiple reasons per card (the response carries `reasons[]`); keep explanations user-facing and non-numeric.
- Carry `algorithmVersion: "personalized-hybrid-v1"` in attribution.
- Remove demo-profile language from true personalized surfaces; keep synthetic showcase accounts clearly labelled as demonstrations.

### API Contract

Consumes `mode: "personalized-hybrid"`, `algorithmVersion`, `reasons[]`, fallback reason, `profileCompleteness`.

### Data-Model Changes

None.

### Algorithm Or Business Rules

None.

### Privacy And Security Rules

- Reasons reveal no more than the user's own data and safe aggregates.
- No raw weights.

### Edge Cases

- Fallback reason present (a lower ladder rung was used): render it honestly.
- Explanation does not match the visible item: backend guarantees contribution-based reasons; UI test asserts reason belongs to the item.

### Failure And Recovery Behavior

- Any component unavailable: backend returns a lower mode; UI renders accordingly.

### Migration Strategy

- Additive label behind the same backend flag `PERS_HYBRID`.

### Tests

- `tests/components/RecommendationsPage.test.jsx` extended: `personalized-hybrid` label; multi-reason rendering; fallback reason; no raw weight text.
- `tests/e2e/analytics.spec.js` extended: authenticated user with preferences + activity sees hybrid; attribution carries the version.

### Documentation Updates

- `RECOMMENDER_SYSTEM_PLAN.md`, `UI_UX_PLAN.md`: hybrid copy and reason rendering.
- `PRESENTATION_NOTES.md`: honest updated wording (still no quality claim).

### Definition Of Done

- Hybrid mode rendered honestly; reasons contribution-based; attribution carries version; demo-profile language removed from personalized surfaces; showcases labelled.

### Rollback Criteria

Disable backend flag; UI reverts to component modes then `content-demo-v1` parity.

### Risks

- FR-024: reason/score mismatch. Mitigation: backend guarantee + UI assertion.
- FR-025: demo-profile language lingers on personalized surface. Mitigation: copy-removal checklist.

### Decisions Still Requiring Approval

- How many reasons to show per card (proposed: up to two, consistent with today).

---

## PERS-09: Integration, Regression Protection, Documentation Closure (FFP-14)

### ID And Title

PERS-09 / FFP-14 (frontend) + BFP-16 (backend) — Full frontend integration, regression protection, and documentation closure.

### Status

Planned. Blocked by PERS-01 through PERS-08.

### Goal

Land the personalized storefront end-to-end with distinct states, correct attribution, honest labels, accessibility, and closed documentation.

### Why It Is Required

Each prior milestone is flag-gated; PERS-09 integrates, hardens, and closes documentation.

### Current Implementation Gap

Fragmented flag-gated changes; no end-to-end integration tests or closed docs yet.

### Dependencies

- All PERS-01 through PERS-08.

### Non-goals

- Quality evaluation with sufficient evidence.
- Removing `content-demo-v1` showcase or the restricted old route.

### Backend Changes

See backend plan (BFP-16).

### Frontend Changes

- Authenticated users use `/api/recommendations/me`; anonymous visitors use the documented fallback.
- Recommendation loading does not start before auth restoration resolves.
- Sign-in changes the resource key; sign-out clears personalized recommendations.
- In-flight requests aborted on identity changes; stale responses cannot overwrite new-user results.
- Tracking queues flushed or discarded before identity changes.
- Recommendation attribution remains attached to cards and detail navigation.
- Preferences update and refresh recommendations safely.
- Negative feedback updates the displayed list.
- Distinct loading/empty/retry/partial/fallback states.
- Demo-profile language removed from true personalized surfaces; synthetic showcase accounts clearly labelled.
- Accessibility and responsive behavior covered for every new control and state.

### API Contract

Final consolidated contract reflected in `API_CONTRACT_PLAN.md`.

### Data-Model Changes

None frontend-side.

### Algorithm Or Business Rules

All modes rendered; fallback ladder documented; `content-demo-v1` showcase retained.

### Privacy And Security Rules

- Full opt-out boundary enforced end-to-end.
- No PII sent; no private raw events rendered; no cross-user inference.
- Account deletion clears local personalization state on the client (sign-out flow already clears local state).

### Edge Cases

Consolidated coverage (see appendix). Notably: anonymous, expired, tampered, disabled, deleted, admin, seeded, MongoDB demo, registered; auth transition; multiple tabs; concurrent login/logout; MongoDB unavailable; seed mode; missing env vars; transaction failure; retry after timeout; cache corruption; account deleted during ranking; product changed during ranking; tracking opt-out; cross-tab/storage behavior.

### Failure And Recovery Behavior

Every mode fails safe to the next ladder rung; authenticated users never silently get demo results.

### Migration Strategy

Follow the release pattern in the appendix. Frontend switches over only after the backend endpoint is stable.

### Tests

- Unit/component: auth restoration before load; authenticated endpoint selection; anonymous fallback; sign-in refresh; sign-out cleanup; stale-response prevention; preference-edit refresh; feedback submission/undo; error recovery; loading/empty states; fallback labels; reason rendering; accessibility; keyboard; mobile; attribution; tracking opt-out; cross-tab/storage.
- E2E (both repos running): registered account with preferences; showcase demo accounts with distinct deterministic profiles; rating changes recommendation input; wishlist/cart affect profile per rules; not-interested removes and suppresses; already-own excludes without implying dislike; anonymous user receives popularity/catalog fallback; one account cannot access another's profile-derived results; historical `content-demo-v1` behavior remains testable; admin and checkout functionality do not regress.
- Synthetic fixture tests are never labeled recommendation-quality evaluation.

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
- `implementation_plan_order.txt`.

### Definition Of Done

- All milestones integrated; end-to-end tests pass; documentation closed and consistent; honesty constraints hold; no quality claim; `content-demo-v1` and old route retained and restricted.

### Rollback Criteria

Each flag disables independently; full rollback returns the storefront to `content-demo-v1` demo behavior.

### Risks

- FR-026: integration exposes a cross-repo contract gap. Mitigation: shared contract tests.
- FR-027: documentation drift after integration. Mitigation: documentation-closure checklist.

### Decisions Still Requiring Approval

- Whether to enable any PERS flag by default at closure (proposed: leave off; enable in a separate explicit step).

---

## Edge-Case Appendix (Consolidated)

Every case below is covered by at least one milestone's tests.

- Identity and authorization: anonymous; expired; tampered; disabled; deleted; admin; seeded; MongoDB demo; registered; cross-user attempt (frontend cannot select another user); auth transition during request; multiple tabs; concurrent login/logout.
- Preferences: empty; partial onboarding; conflicting favorite/disliked genres; unsupported condition/format; preference edits during ranking; preference deletion; no matching products; extremely narrow preferences; missing metadata.
- Behavior: duplicate events; refresh-generated views; passive tracking disabled; anonymous-to-authenticated transition; guest-state merge retry; interaction references deleted product; interaction references unknown recommendation list.
- Negative feedback: duplicate dismiss; undo twice; dismiss deleted product; already-owned becomes unavailable; conflicts; feedback during refreshing request; network failure after optimistic removal.
- Popularity and fallback: anonymous visitor; no evidence; cached score stale.
- Hybrid: missing component (lower mode); fallback reason; reason/item mismatch; stable ordering.
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

Each stage is reversible. Frontend switches over only after the backend endpoint is stable. Recommended pattern mirrors the backend plan: backend models/repositories first, then identity, endpoint, profile, preference, feedback, behavioral, popularity, hybrid, then frontend switch-over, then restrict legacy paths last. Feature flags per milestone; backward compatibility maintained; rollback to `content-demo-v1` retained.

## Decision Register (Recorded Or Proposed)

Completed PERS-00 through PERS-02 resolve FDEC-011, provider order plus auth gating, limit 12, customer-only access with administrator rejection, fixed `/me` identity, and default-on reversible endpoint flags. FDEC-012 and other later-milestone decisions remain proposed; see each milestone's final section.

## Honesty Contract

No milestone, doc, test, or UI copy may claim measured recommendation quality, real-customer personalization beyond the authenticated session-owned ranking defined here, or that behavior tests equal quality evidence. Synthetic fixtures and showcase accounts are clearly labelled as demonstrations. The existing `insufficient-evidence` evaluator status and its evidence threshold are unchanged and not completed by this roadmap.
