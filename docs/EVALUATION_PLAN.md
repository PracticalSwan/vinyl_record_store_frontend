# Frontend Evaluation

This plan records the automated release evidence for the storefront. It does not substitute for recommender-quality evaluation.

## Automated Checks

| Check | Command | Current Evidence |
| --- | --- | --- |
| Unit and component tests | `npm run test:unit` | 61 tests passed on 2026-07-06, including artwork success/missing/broken/decorative cases. |
| Browser and integration tests | `npm run test:e2e` | 49 passed, 1 intentional mobile-only skip across Chromium desktop/mobile/tablet, Firefox, and WebKit on 2026-07-06. |
| Accessibility subset | `npm run test:a11y` | Representative axe checks passed within the full matrix on 2026-07-06. |
| ESLint | `npm run lint` | Passed on 2026-07-06. |
| Production bundle | `npm run build` | Passed on 2026-07-06. |

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
| FE-015 | Approved, missing, slow, or broken artwork renders. | The correct responsive image or stable local placeholder appears without loops, layout loss, or inaccessible duplicate text. |

## Recommendation Comprehension

Confirm that a reviewer can distinguish sample-profile results, product similarity, and cold-start suggestions. Do not treat UI behavior checks as ranking-quality evidence.

## Release Evidence Rule

Record live browser and cross-origin API results only when they were actually executed. Keep the Playwright web-server configuration on the real local frontend/backend contract; lint and build success alone do not prove runtime CORS or responsive behavior.
