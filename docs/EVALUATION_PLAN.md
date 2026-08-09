# Frontend Evaluation

This plan records the automated release evidence for the storefront. It does not substitute for recommender-quality evaluation.

## Automated Checks

| Check | Command | Current Evidence |
| --- | --- | --- |
| Unit and component tests | `npm run test:unit` | 99/99 passed on 2026-08-10 across 18 test files, including research display/purchase rules, dynamic active preference choices, feedback-card state and focus recovery, and accepted-art local fallback isolation. |
| Seed browser and integration tests | `npm run test:e2e:seed` | 69 passed with 1 intentional skip on 2026-08-10 across Chromium desktop/mobile/tablet, Firefox, and WebKit. The matrix retains all 116 seed-art checks and the ordinary Admin write UI; teardown preserved the dataset collections. |
| Dataset browser and integration tests | `npm run test:e2e:dataset` | 10 passed with 2 intentional project-specific skips on 2026-08-10 across desktop/mobile Chromium. Invented deterministic v3 fixtures cover research-only facets/actions, original/edition years, accepted-local/placeholder art, Admin read-only rows, and axe checks. |
| Accessibility subset | `npm run test:a11y` | 20/20 passed on 2026-08-10 across desktop/mobile Chromium with no serious or critical axe violations. |
| ESLint | `npm run lint` | Passed on 2026-08-10. |
| Production bundle | `npm run build` | Passed on 2026-08-10 with Vite 8.1.0. |

## Browser Scenarios

| ID | Scenario | Expected Result |
| --- | --- | --- |
| FE-001 | Backend available. | Catalog loads and counts reflect the API response. |
| FE-002 | Backend unavailable. | Safe catalog error and retry action appear. |
| FE-003 | Recommendation request succeeds. | Mode, profile summary, ranks, and reasons render. |
| FE-004 | Recommendation request fails or is empty. | Independent error or empty state renders without hiding the catalog. |
| FE-005 | Product detail opened. | Similar products load from the product recommendation route. |
| FE-006 | 375px viewport. | Navigation, cards, filters, lists, and recommendation rows remain usable without page-level horizontal overflow. |
| FE-007 | Keyboard-only navigation. | Search, navigation, filters, product actions, rating, and retry controls are reachable with visible focus. |
| FE-008 | Rapid server search and browser history. | Superseded responses stay hidden; canonical query state restores on back/forward navigation. |
| FE-009 | Multi-value filters and pagination. | Repeated facets, deterministic pages, page reset, and result focus behave consistently. |
| FE-010 | Representative accessibility scan. | No serious or critical axe findings on the tested routes and states. |
| FE-011 | Guest registers, merge fails, then refreshes. | Persisted merge key resumes without losing the session snapshot. |
| FE-012 | Existing account signs in or restores. | Guest state is discarded and account state loads without cross-account leakage. |
| FE-013 | Usage-data opt-out or auth change. | Capture stops immediately; queued events cannot cross identity boundaries. |
| FE-014 | Non-recommendation route loads. | No user-recommendation request or unseen-list request log is created. |
| FE-015 | Approved, missing, slow, or broken artwork renders. | The responsive proxy image, decoded canonical-ID local JPEG, or final placeholder appears in that order without loops, stale-event skips, layout loss, or inaccessible duplicate text. |
| FE-016 | Active dataset returns nullable fields and dynamic facets. | Unknown values render consistently, genre/format queries round-trip, and unknown price/stock prevents cart/checkout without breaking browse/wishlist/rating. |
| FE-017 | Admin opens an active dataset. | Dashboard shows source/version/counts; dataset rows show CLI-managed state and no mutation controls; ordinary records retain existing actions. |
| FE-018 | Seed and dataset modes run independently. | The original multi-browser suite remains green and the deterministic dataset suite does not require raw Amazon data or Atlas dataset rows. |

## Recommendation Comprehension

Confirm that a reviewer can distinguish sample-profile results, product similarity, session-owned cold-start, and anonymous fallback. Verify auth restoration gating and identity-transition stale-response protection. Historical-data readiness and UI behavior checks are not ranking-quality evidence.

## Release Evidence Rule

Record live browser and cross-origin API results only when they were actually executed. Keep the Playwright web-server configuration on the real local frontend/backend contract; lint and build success alone do not prove runtime CORS or responsive behavior.
