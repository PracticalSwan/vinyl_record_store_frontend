# Frontend Evaluation

This plan records the automated release evidence for the storefront. It does not substitute for recommender-quality evaluation.

## Automated Checks

| Check | Command | Current Evidence |
| --- | --- | --- |
| Unit and component tests | `npm run test:unit` | 112/112 passed across 19 test files in the final NEXT-05 run, including research display/purchase rules, identity A-to-B stale-response protection, no off-surface recommendation request, exact feedback kind/Undo state, and accepted-art local fallback isolation. |
| Seed browser regression/contract suite (default-off personalization) | `npm.cmd run test:e2e:seed` | 77 passed with 3 intentional project-specific skips across Chromium desktop/mobile/tablet, Firefox, and WebKit. The matrix covers recommendation route/privacy/failure contracts, responsive and keyboard flows, all 116 seed-art checks, and ordinary Admin write UI; teardown preserved protected data. |
| Prior full-stack personalization integration | `$env:E2E_ENABLE_PERS_INTEGRATION='1'; npm.cmd run test:e2e:seed -- --project=chromium-desktop --project=chromium-mobile tests/e2e/personalization.spec.js` | 4/4 passed after correcting the test's Home-mode expectation from pure preference to the actual enabled hybrid. This is full-gate integration evidence, not the selected classroom configuration. |
| Selected MongoDB/v3 Profile B | `$env:E2E_ENABLE_PERS_FIRST_BATCH='1'; $env:E2E_PERS_CATALOG_DATA_SOURCE='mongodb'; npm.cmd run test:e2e:seed -- tests/e2e/personalization.spec.js tests/e2e/recommendation-contract.spec.js` | 12 discovered: 10 passed and 2 full-hybrid cases intentionally skipped across Chromium desktop/mobile/tablet, Firefox, and WebKit. The run verified preference mode, anonymous fallback, exact feedback and Undo focus, privacy-safe response fields, no serious/critical axe findings, no horizontal overflow, 20 captured state screenshots, and cleanup. |
| Current MongoDB/v3 Profile C showcase flow | `$env:E2E_ENABLE_PERS_INTEGRATION='1'; $env:E2E_PERS_CATALOG_DATA_SOURCE='mongodb'; npm.cmd run test:e2e:seed -- --project=chromium-desktop tests/e2e/showcase-personalization.spec.js` | 1/1 passed on 2026-08-29. One bounded test signed in as all three protected showcase customers, required `personalized-hybrid-v1`, checked role-aligned dominant genres and known-item exclusions, captured Jazz/Rock/Soul screenshots, signed out, and completed ownership-scoped Atlas teardown. This is functional evidence, not a quality metric. |
| Live MongoDB recommendation contract | `$env:E2E_ENABLE_PERS_INTEGRATION='1'; $env:E2E_PERS_CATALOG_DATA_SOURCE='mongodb'; npm.cmd run test:e2e:seed -- --project=chromium-desktop tests/e2e/recommendation-contract.spec.js` | 1/1 passed on 2026-08-13 against active v3 research mode; the harness forbids server reuse and asserts `research-only` mode before checking safe public fields, mode/version/reasons, null commercial data, opt-out, and cleanup. |
| MongoDB failure contract | `npm.cmd run test:e2e:mongodb-failure` | 1/1 passed on 2026-08-13 against an isolated unreachable MongoDB backend; the API returned safe `503 PERSISTENCE_UNAVAILABLE` and did not fall back to seed data. |
| Dataset browser and integration tests | `npm run test:e2e:dataset` | 10 passed with 2 intentional project-specific skips on 2026-08-13 across desktop/mobile Chromium. Invented deterministic v3 fixtures cover research-only facets/actions, original/edition years, accepted-local/placeholder art, Admin read-only rows, and axe checks. |
| Accessibility and responsive coverage | Full seed matrix plus selected Profile B and full-gate flows | Axe reported no serious or critical findings in the tested routes/states; tablet/Firefox/WebKit keyboard smoke passed; selected-profile desktop/mobile Home, Recommendations, Not interested, and Already own states were inspected without visible overflow. |
| ESLint | `npm run lint` | Passed with zero warnings in the final NEXT-05 run. |
| Production bundle | `npm run build` | Passed with Vite 8.1.0; 92 modules transformed and the primary JS bundle was 477.02 kB (144.32 kB gzip). |

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
| FE-019 | Authenticated identity changes while a recommendation request is unresolved. | The earlier response is aborted or generation-discarded; only the current subject can update the shared resource and visible cards. |
| FE-020 | Every personalization gate is enabled only in the test harness. | A new registered account can reach the true hybrid mode; opt-out suppresses passive delivery/use/logging while rating, wishlist, cart, feedback, and Undo remain functional. |
| FE-021 | Explicit MongoDB mode cannot connect. | The recommendation contract returns a safe `503 PERSISTENCE_UNAVAILABLE`; the UI does not receive seed fallback content. |
| FE-022 | Each canonical showcase customer signs in under Profile C. | The API and UI expose `personalized-hybrid-v1`; Jazz/Rock/Soul dominate the corresponding result list, and rated/wishlisted records are not recommended back to the customer. |

## Recommendation Comprehension

Confirm that a reviewer can distinguish sample-profile results, product similarity, session-owned cold-start, preference, behavior, popularity, hybrid, and anonymous fallback. Verify auth restoration gating, identity-transition stale-response protection, exact feedback/Undo copy, and passive-only opt-out semantics. Historical-data readiness and UI behavior checks are not ranking-quality evidence.

## Release Evidence Rule

Record live browser and cross-origin API results only when they were actually executed. Keep the Playwright web-server configuration on the real local frontend/backend contract; lint and build success alone do not prove runtime CORS or responsive behavior.

## Production Verification Addendum â€” 2026-08-19

The NEXT-05 counts above remain historical evidence for 2026-08-14. Later production work deployed the GitHub-linked Netlify storefront, added source-specific artwork ordering and the 2,259-record presentation overlay, fixed Admin source-metric labels and 360px layout defects, and ran targeted production regressions plus live smoke. These changes do not add recommendation-quality evidence; the live evaluator remains `insufficient-evidence`.

## Profile C Maintenance Addendum - 2026-08-29

Profile C supersedes only the current classroom/production environment. It uses three deliberately small synthetic Jazz/Rock/Soul profiles and the existing deterministic preference, behavior, aggregate-popularity, exact-feedback, and hybrid paths. The focused showcase flow and screenshots prove the real signed-in UI contract; they do not establish production recommendation quality, and the historical final test remains permanently consumed.
