# Frontend API Consumption Plan

This file describes how the frontend expects to consume backend APIs. Backend route implementation belongs in `../../vinyl_record_store_backend/docs/API_CONTRACT_PLAN.md`.

## API Consumption Principles

- Treat the backend as the source of truth.
- Keep API calls in a documented frontend helper boundary when implementation begins.
- Handle loading, empty, and error states for every data request.
- Do not expose backend secrets in frontend code.
- Update this file when frontend expectations change.

## Planned Backend Calls

| Frontend Need | Method | Backend Path | Frontend Use |
| --- | --- | --- | --- |
| Product listing | `GET` | `/api/products` | Catalog grid and pagination. |
| Product detail | `GET` | `/api/products/:id` | Product detail page. |
| Search and filters | `GET` | `/api/search` | Search results and filter UI. |
| Interaction logging | `POST` | `/api/interactions` | Record views, wishlist, cart, ratings, and purchases through backend. |
| Product recommendations | `GET` | `/api/recommendations/product/:id` | Similar records on product detail pages. |
| User recommendations | `GET` | `/api/recommendations/user/:userId` | Personalized recommendation page or section. |
| Wishlist | `POST` or `DELETE` | `/api/wishlist/:recordId` | Wishlist UI actions. |
| Cart | `POST` or `DELETE` | `/api/cart/:recordId` | Cart UI actions. |
| Orders | `POST` | `/api/orders` | Simulated or future order action. |

## Expected Frontend States

For each request, the frontend should plan:

- Loading state.
- Success state.
- Empty state.
- Error state.
- Retry or recovery behavior when useful.

## Recommendation Response Expectations

The frontend expects recommendation responses to include:

- Product data needed for display.
- Rank or score when safe to show or debug.
- Explanation reasons.
- Stock status.

Example display reason:

```text
Recommended because it shares the same genre and release era.
```

## Documentation Update Notes

Update this file when frontend API consumption, response expectations, loading states, error handling, or backend paths change. Update backend API docs when the contract itself changes.

