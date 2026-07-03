# Frontend API Contract

The backend base URL comes from `VITE_API_BASE_URL` and defaults locally to `http://localhost:3000`. Every request uses `credentials: "include"` so signed HttpOnly sessions work across the configured frontend/backend origins.

## Response Envelopes

Success:

```json
{ "data": {}, "meta": {} }
```

Error:

```json
{ "error": { "code": "ERROR_CODE", "message": "Safe message" } }
```

## Implemented Catalog And Recommendation Calls

| Frontend Need | Method | Path | Current Use |
| --- | --- | --- | --- |
| Catalog | `GET` | `/api/products` | Catalog, Search, Home, and cart suggestions use bounded server queries. |
| Product detail | `GET` | `/api/products/:id` | Detail and ID-based local-list hydration. |
| Search alias | `GET` | `/api/search` | Shares the product query service and response shape. |
| Similar products | `GET` | `/api/recommendations/product/:id?limit=6` | Product detail recommendation row. |
| User recommendations | `GET` | `/api/recommendations/user/demo-user?limit=12` | Home and recommendation demo routes. |
| Health | `GET` | `/api/health` | Operational check. |

Product query parameters are `q`, repeated `genre`, repeated `era`, repeated `condition`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`, and `limit`. Search is a bounded, case-insensitive literal substring. Supported sorts are `newest`, `price-asc`, `price-desc`, and `artist-asc`.

Product-list metadata includes `page`, `limit`, `total`, `totalPages`, `sort`, and full-active-catalog facets for genres, conditions, stock, prices, and years. Repeated values are ORed within a facet and different facets are ANDed.

## Implemented Authentication Calls

| Frontend Need | Method | Path | Current Use |
| --- | --- | --- | --- |
| Restore session | `GET` | `/api/auth/session` | `AuthProvider` startup/retry state. |
| Register customer | `POST` | `/api/auth/register` | `/register`; successful registration signs in. |
| Login | `POST` | `/api/auth/login` | `/login`; safe local `returnTo` is honored. |
| Logout | `POST` | `/api/auth/logout` | Protected `/account` page. |
| Safe profile | `GET` | `/api/me` | Available through `fetchMe`; account summary currently uses restored session data. |

Registration accepts `{ username, password, displayName? }`; login accepts `{ username, password }`. The frontend never reads or stores the session cookie directly and never sends a role or user ID.

## Implemented Write Client Calls

| Frontend Need | Method | Path | API Helper Status |
| --- | --- | --- | --- |
| Preferences | `PATCH` | `/api/me/preferences` | Implemented; onboarding UI remains FFP-02. |
| Interactions | `POST` | `/api/interactions` | Implemented; capture/queue remains FFP-01. |
| Wishlist | `GET`, `PUT`, `DELETE` | `/api/wishlist`, `/api/wishlist/:productId` | Implemented; local UI migration remains FFP-03. |
| Cart | `GET`, `PUT`, `DELETE` | `/api/cart`, `/api/cart/:productId` | Implemented; local UI migration remains FFP-03. |
| Ratings | `GET`, `PUT`, `DELETE` | `/api/ratings`, `/api/ratings/:productId` | Implemented; local UI migration remains FFP-03. |
| Guest state merge | `POST` | `/api/me/merge-guest-state` | Implemented; automatic login merge remains FFP-03. |

The backend derives ownership from the session, requires the exact configured origin for mutations, rejects unexpected fields, and returns stable safe errors. Guest merge requires a stable `mergeId`; interaction batches require unique stable event IDs.

## Deferred Calls

Demo orders, recommendation-request logs, and administrator catalog endpoints are not implemented. The current wishlist/cart/rating pages remain local and must not claim server persistence until FFP-03 wires the implemented helpers into the store providers.

## Error Handling

`src/lib/api.js` converts connection, abort, malformed payload, and backend envelope failures into safe client behavior. API-backed screens preserve loading, empty, error, retry, and success behavior; superseded search requests cannot replace newer results.

## Change Rule

Any path or response-shape change must update this file, the backend contract, and the API client in the same task.
