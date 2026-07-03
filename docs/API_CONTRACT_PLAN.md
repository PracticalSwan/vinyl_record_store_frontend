# Frontend API Contract

The backend base URL comes from `VITE_API_BASE_URL` and defaults locally to `http://localhost:3000`.

## Response Envelopes

Success:

```json
{ "data": {}, "meta": {} }
```

Error:

```json
{ "error": { "code": "ERROR_CODE", "message": "Safe message" } }
```

## Implemented Read Calls

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

## Deferred Write Calls

Interaction, wishlist, cart, order, authentication, and admin write endpoints are not implemented. The frontend must keep those actions local or disabled and must not pretend that data was saved.

## Error Handling

`src/lib/api.js` converts connection, abort, malformed payload, and backend envelope failures into safe client behavior. API-backed screens preserve loading, empty, error, retry, and success behavior; superseded search requests cannot replace newer results.

## Change Rule

Any path or response-shape change must update this file, the backend contract, and the API client in the same task.
