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
| Catalog | `GET` | `/api/products?limit=100` | Loaded by `CatalogProvider`. |
| Product detail | `GET` | `/api/products/:id` | Available contract; current UI reads the loaded catalog. |
| Search | `GET` | `/api/search?q=...` | Available contract; current UI filters the loaded catalog locally. |
| Similar products | `GET` | `/api/recommendations/product/:id?limit=6` | Product detail recommendation row. |
| User recommendations | `GET` | `/api/recommendations/user/demo-user?limit=12` | Home and recommendation demo routes. |
| Health | `GET` | `/api/health` | Operational check. |

## Deferred Write Calls

Interaction, wishlist, cart, order, authentication, and admin write endpoints are not implemented. The frontend must keep those actions local or disabled and must not pretend that data was saved.

## Error Handling

`src/lib/api.js` converts connection and backend envelope failures into `ApiError`. API-backed screens must preserve loading, empty, error, retry, and success behavior.

## Change Rule

Any path or response-shape change must update this file, the backend contract, and the API client in the same task.
