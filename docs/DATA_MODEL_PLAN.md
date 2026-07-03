# Frontend Data Shapes

These are the current API, authentication, and client-only shapes used by the storefront.

## Product

| Field | Type | Use |
| --- | --- | --- |
| `id` | number | Routing and local state references. |
| `title`, `artist`, `genre`, `label` | string | Product identity and filtering. |
| `year` | number | Display, sorting, and era filtering. |
| `price` | number | USD display and cart totals. |
| `currency` | string | Current API returns `USD`. |
| `stock` | `in`, `low`, or `out` | Availability and action state. |
| `condition`, `format`, `pressing`, `description` | string | Card or detail metadata. |
| `imageUrl` | string or null | Reserved for approved artwork; placeholders are used now. |

## Recommendation Item

The backend returns `{ product, rank, score, reasons, algorithmVersion }`. Recommendation mapping flattens the product fields for existing cards and adds:

- `reason`: first display reason.
- `recommendationReasons`: all returned reasons.
- `recommendationScore` and `recommendationRank`: debug/evaluation fields, not currently shown as claims to users.

## Client-Only State

- URL-backed filters, sort, search query, page, and mobile-filter visibility.
- Wishlist IDs, cart IDs/quantities, and demo rating.
- Loading and error state for remote requests.

Product lists also carry `page`, `limit`, `total`, `totalPages`, `sort`, and full-catalog facet metadata. Persistent identity and interaction data remains a backend concern and is not present in the current demo.

## Authenticated Session Shape

The frontend receives only `{ publicId, username, displayName, role, onboardingComplete, preferences, seeded }` inside the safe session/profile envelope. It never receives password hashes, salts, session tokens, internal database IDs, raw events, or another user's state.

`AuthProvider` stores the safe user in memory and reports `loading`, `authenticated`, `anonymous`, or `error`. The signed cookie remains HttpOnly and browser-managed. Wishlist/cart/rating API shapes are available through `src/lib/api.js`, but the current pages still use the client-only state above until FFP-03.
