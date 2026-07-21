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

Product envelopes may include `image: { thumbnailUrl, detailUrl, source, sourceUrl }` only after backend approval. `imageUrl` remains a nullable compatibility field. `ProductImage` accepts only approved Cover Art Archive/MusicBrainz metadata and derives the stable local route from the record's canonical public ID. Its source order is remote backend proxy, local backend endpoint, then the generic vinyl placeholder. Missing or rejected remote metadata skips directly to the local endpoint when the ID is valid.

| Frontend Need | Method | Path | Current Use |
| --- | --- | --- | --- |
| Catalog | `GET` | `/api/products` | Catalog, Search, Home, and cart suggestions use bounded server queries. |
| Product detail | `GET` | `/api/products/:id` | Detail and ID-based local-list hydration. |
| Search alias | `GET` | `/api/search` | Shares the product query service and response shape. |
| Remote cover art | `GET` | `/api/artwork?u=` | Preferred source. `ProductImage` asks the bounded backend proxy instead of loading `coverartarchive.org` directly. |
| Local cover art | `GET` | `/api/artwork/local/:publicId` | Second source. Canonical bundled IDs redirect to immutable, content-addressed JPEGs; 400/404/image errors advance to the placeholder. |
| Similar products | `GET` | `/api/recommendations/product/:id?limit=6&surface=product-detail` | Product detail row with request/list attribution. |
| Session-owned recommendations | `GET` | `/api/recommendations/me?limit=12&surface=...` | Home and recommendation routes only; customer identity comes from the cookie, otherwise anonymous fallback. |
| Legacy showcase | `GET` | `/api/recommendations/user/demo-user?limit=12&surface=...` | Fixed rollback/showcase path only; no production helper accepts another user ID. |
| Health | `GET` | `/api/health` | Operational check. |

Product query parameters are `q`, repeated `genre`, repeated `era`, repeated `condition`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`, and `limit`. Search is a bounded, case-insensitive literal substring. Supported sorts are `newest`, `price-asc`, `price-desc`, and `artist-asc`.

Product-list metadata includes `page`, `limit`, `total`, `totalPages`, `sort`, and full-active-catalog facets for genres, conditions, stock, prices, and years. Repeated values are ORed within a facet and different facets are ANDed.

Recommendation responses include `requestId`, `listId`, `algorithmVersion`, `mode`, ordered ranked items, and `recommendationLogged`. The client sends `X-Tracking-Enabled`; enabled user requests also send a pseudonymous `X-Anonymous-Id`. Opt-out suppresses both interaction capture and MongoDB recommendation-request logging.

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
| Preferences | `PATCH` | `/api/me/preferences` | Used by onboarding and profile preference editing. |
| Interactions | `POST` | `/api/interactions` | Used by the bounded analytics queue. |
| Wishlist | `GET`, `PUT`, `DELETE` | `/api/wishlist`, `/api/wishlist/:productId` | Used by authenticated `StoreProvider`. |
| Cart | `GET`, `PUT`, `DELETE` | `/api/cart`, `/api/cart/:productId` | Used by authenticated `StoreProvider`. |
| Ratings | `GET`, `PUT`, `DELETE` | `/api/ratings`, `/api/ratings/:productId` | Used by authenticated `StoreProvider`. |
| Guest state merge | `POST` | `/api/me/merge-guest-state` | Used only after new-account registration; keyed failure retries survive refresh. |

The backend derives ownership from the session, requires the exact configured origin for mutations, rejects unexpected fields, and returns stable safe errors. Guest merge requires a stable `mergeId`; interaction batches require unique stable event IDs.

## Deferred Calls

Backend order/payment calls are not implemented. Administrator catalog calls are implemented under `/api/admin/*`. Recommendation-request logs, catalog imports outside the admin UI, metadata enrichment, and offline evaluation are backend operator/internal paths rather than public frontend calls. Guest state is session-only; authenticated wishlist/cart/rating state is server-backed.

## Personalization Calls

PERS-00 through PERS-02 / FFP-09 are implemented. Remaining entries in `PERSONALIZATION_IMPLEMENTATION_PLAN.md` stay planned.

- `GET /api/recommendations/me` (implemented PERS-02 / FFP-09): verified customers receive `cold-start`, visitors or invalid/expired sessions receive `anonymous-fallback`, and administrators receive `403`. The client never sends a user ID; authenticated requests omit `X-Anonymous-Id`.
- `PUT`, `DELETE /api/me/feedback/:productId` and `GET /api/me/feedback` (PERS-05 / FFP-11): not-interested, already-own, optional show-fewer-like-this, and undo.
- Current mode labels render `demo-profile`, `content-similarity`, `cold-start`, and `anonymous-fallback` honestly. Future milestones add `preference-profile`, `behavior-profile`, `popularity`, and `personalized-hybrid`; no raw weights are displayed.

## Error Handling

`src/lib/api.js` converts connection, abort, malformed payload, and backend envelope failures into safe client behavior. API-backed screens preserve loading, empty, error, retry, and success behavior; superseded search requests cannot replace newer results.

## Change Rule

Any path or response-shape change must update this file, the backend contract, and the API client in the same task.
