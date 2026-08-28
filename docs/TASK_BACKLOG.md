# Frontend Task Status

Statuses are `done` or `deferred`. Deferred items are not active work.

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| F-001 | Establish frontend repository and instructions. | done | Agent, lesson, license, and GitHub-facing files exist. |
| F-002 | Implement Groovehaus routes and components. | done | Twelve routes with responsive UI. |
| F-003 | Connect catalog to backend. | done | Route query hooks and API client. |
| F-004 | Connect user and product recommendations. | done | Demo-profile and similarity endpoints. |
| F-005 | Add remote loading, empty, error, and retry states. | done | Catalog and recommendation surfaces. |
| F-006 | Align docs with implementation. | done | Current-state docs synchronized through the 2026-08-19 production/deployment/presentation cleanup; historical evidence remains intact. |
| F-007 | Validate tests, lint, and production build. | done | Unit, browser, accessibility, lint, and build commands pass. |
| F-008 | Add authenticated persistence and guest-state merge. | done | FFP-03 completed with session guests and sign-up-only keyed merge. |
| F-009 | Add checkout and order preview. | done | Completed 2026-07-09 and copy-refined 2026-07-12: four-step preview wizard, `PREVIEW-` reference confirmation, sessionStorage persistence, availability blocking, and cart clear. No real payment or backend order. |
| F-010 | Add the browser, integration, and accessibility test matrix. | done | FFP-04 completed 2026-07-03 with Vitest, Playwright, and axe. |
| F-011 | Add recommendation interaction analytics. | done | FFP-01 completed with opt-out, bounded delivery, and request attribution. |
| F-012 | Add onboarding and preference management. | done | FFP-02 completed with onboarding and protected editing. |
| F-013 | Move catalog search, filters, sort, and pagination to the backend. | done | FFP-05 completed 2026-07-03 with URL-backed server queries. |
| F-014 | Add approved Cover Art Archive images and fallbacks. | done | FFP-06 completed 2026-07-06; hardened 2026-07-21 with a stale-safe proxy -> verified local endpoint -> placeholder chain, all-116 decode coverage, screenshots, and independent review. |
| F-015 | Add the integrated administrator UI. | done | Completed 2026-07-09 in FFP-07: RequireRole guard, AdminLayout/dashboard/product table/create-edit form with conflict re-fetch/import UX/artwork refresh. |
| F-016 | Switch the storefront to the session-owned recommendation endpoint. | done | PERS-02 / FFP-09 completed 2026-07-10 with `/api/recommendations/me`, auth gating, subject keys, abort/generation stale protection, anonymous-only IDs, honest copy, and browser coverage. |
| F-017 | Preserve the frontend contract during unified-profile setup. | done | PERS-03; backend-only profile prerequisite shipped without public profile fields or UI changes. |
| F-018 | Add preference-aware mode labels and verify fresh post-save navigation. | done | PERS-04 / FFP-10; `preference-profile` label/intro, no off-surface reload, next Home/Recommendations request uses saved preferences, no relaxation UI. |
| F-019 | Add negative-feedback controls. | done | PERS-05 / FFP-11; exact-item not-interested, already-own, undo with pessimistic accessible card state; show-fewer deferred. |
| F-020 | Render behavioral mode honestly and preserve attribution. | done | PERS-06 / FFP-12 completed 2026-08-10; `behavior-profile`, up-to-two server reasons, and passive opt-out/direct-action boundary. |
| F-021 | Render popularity and anonymous-fallback modes honestly. | done | PERS-07 consumed via API and completed 2026-08-10; popularity is aggregate research-rating evidence; existing deterministic fallback remains. |
| F-022 | Render the hybrid mode with truthful reasons. | done | PERS-08 / FFP-13 completed 2026-08-10; hybrid only for preference + behavior; lower modes distinct; exact version attribution. |
| F-023 | Integrate, harden, and close personalization documentation. | done | PERS-09 / FFP-14 completed 2026-08-13 with user/surface stale-response regressions, neutral exact-feedback copy, explicit full-gate E2E, accessibility/browser/data verification, and docs closure; ranking flags stay off. |
| F-024 | Render the current Amazon Reviews 2023 dataset safely. | done | Immutable v3 is active: research-only facets/sorts/actions, 208 authoritative original years, accepted-art local fallback or placeholder, Admin dataset status/read-only rows, v2 immediate rollback, v1 identity base, and exactly three showcase customers preserved. |
| F-025 | Freeze the final classroom personalization presentation. | done | NEXT-04 selected explicit MongoDB/v3 Profile B: saved-preference ranking and exact feedback on, behavior/popularity/hybrid off, temporary ordinary customer only, source defaults unchanged. |
| F-026 | Complete final cross-browser and release-readiness verification. | done | NEXT-05 passed 112/112 unit tests, lint/build, default seed 77 pass/3 skips, selected Profile B 10 pass/2 intentional hybrid skips across five projects, dataset/failure/live contracts, accessibility checks, and cleanup. |

| F-027 | Deploy the production storefront. | done | GitHub-linked Netlify `groovehaus-store` from sole `master`, same-origin `/api/*` proxy, production presentation flags, security headers, and live smoke. |
| F-028 | Harden customer catalog presentation. | done | Hide 46 high-confidence duplicate display rows, preserve 2,305 source rows, consume 1,124 supplemental validated artwork mappings, and clarify Admin source metrics. |
| F-029 | Harden narrow production layouts. | done | 360px navigation/recommendation spacing and long research-label wrapping fixed and regression-covered. |
| F-030 | Clean generated release/runtime residue. | done | Removed old worktrees/builds/Playwright/runtime staging/temp files while preserving source, dependencies, credentials, and evidence. |
| F-031 | Verify role-aligned showcase personalization. | done | Added one bounded MongoDB Profile C browser flow that signs into Jazz/Rock/Soul personas, checks hybrid mode, dominant genre, known-item exclusion and controls, disables tracking, captures screenshots, and preserves canonical state through cleanup. |
