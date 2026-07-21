# Frontend Task Status

Statuses are `done` or `deferred`. Deferred items are not active work.

| ID | Task | Status | Notes |
| --- | --- | --- | --- |
| F-001 | Establish frontend repository and instructions. | done | Agent, lesson, license, and GitHub-facing files exist. |
| F-002 | Implement Groovehaus routes and components. | done | Twelve routes with responsive UI. |
| F-003 | Connect catalog to backend. | done | Route query hooks and API client. |
| F-004 | Connect user and product recommendations. | done | Demo-profile and similarity endpoints. |
| F-005 | Add remote loading, empty, error, and retry states. | done | Catalog and recommendation surfaces. |
| F-006 | Align docs with implementation. | done | Updated through the 2026-07-21 local-artwork availability pass. |
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
| F-017 | Render the unified profile summary safely. | deferred | PERS-03; surface safe data-source flags without raw signals. |
| F-018 | Add preference-aware mode labels and refresh on preference save. | deferred | PERS-04 / FFP-10; `preference-profile` copy and reload after save. |
| F-019 | Add negative-feedback controls. | deferred | PERS-05 / FFP-11; not-interested, already-own, undo, show-fewer-like-this, accessible and robust. |
| F-020 | Render behavioral mode honestly and preserve attribution. | deferred | PERS-06 / FFP-12; `behavior-profile` label, opt-out boundary. |
| F-021 | Render popularity and anonymous-fallback modes honestly. | deferred | PERS-07; fallback labels for anonymous and empty-profile visitors. |
| F-022 | Render the hybrid mode with truthful reasons. | deferred | PERS-08 / FFP-13; `personalized-hybrid` label, contribution-based reasons, version attribution. |
| F-023 | Integrate, harden, and close personalization documentation. | deferred | PERS-09 / FFP-14; end-to-end integration, accessibility, documentation closure. |
