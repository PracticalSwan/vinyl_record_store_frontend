# Frontend Evaluation Plan

## Evaluation Goals

- Check whether users can find products.
- Check whether recommendation reasons are visible and understandable.
- Check whether frontend states work for loading, empty, and error cases.
- Check accessibility and responsive behavior.
- Support the academic explanation of decision support.

## UI Evaluation Ideas

- Product cards show enough information to decide whether to open a record.
- Search and filters are easy to understand.
- Recommendation reasons are readable.
- Users can tell when recommendations are generic versus personalized.
- Mobile layout does not hide key information.

## Manual Test Scenarios

| ID | Scenario | Expected Frontend Result |
| --- | --- | --- |
| FE-001 | Product API returns records. | Catalog grid displays product cards. |
| FE-002 | Product API returns empty list. | Empty state appears. |
| FE-003 | Backend recommendation API returns reasons. | Recommendation row shows product cards and reasons. |
| FE-004 | Backend API returns error. | User sees a safe error state. |
| FE-005 | Mobile viewport. | Filters, cards, and recommendation rows remain usable. |
| FE-006 | Keyboard navigation. | Main controls can be reached and used. |

## Explanation Quality Checks

- Reasons are short and clear.
- Reasons match the recommendation context returned by the backend.
- Reasons are text, not only icons.
- UI does not imply personalization if the backend returned generic cold-start results.

## Documentation Update Rules

Update this file when frontend evaluation checks, UI test scenarios, accessibility expectations, responsive checks, or recommendation display checks change.

