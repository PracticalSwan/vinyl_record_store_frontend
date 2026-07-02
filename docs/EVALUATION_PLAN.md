# Frontend Evaluation

This plan separates completed static checks from runtime browser evidence.

## Automated Checks

| Check | Command | Current Evidence |
| --- | --- | --- |
| ESLint | `npm run lint` | Passed on 2026-07-02. |
| Production bundle | `npm run build` | Passed on 2026-07-02. |

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

## Recommendation Comprehension

Confirm that a reviewer can distinguish sample-profile results, product similarity, and cold-start suggestions. Do not treat UI behavior checks as ranking-quality evidence.

## Release Evidence Rule

Record live browser and cross-origin API results only when they were actually executed. Lint and build success alone do not prove runtime CORS or responsive behavior.
