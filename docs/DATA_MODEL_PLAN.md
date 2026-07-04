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

The backend returns request/list metadata plus `{ product, rank, score, reasons, algorithmVersion }` items. Recommendation mapping flattens the product fields for existing cards and adds:

- `reason`: first display reason.
- `recommendationReasons`: all returned reasons.
- `recommendationScore` and `recommendationRank`: debug/evaluation fields, not currently shown as claims to users.
- `recommendationContext`: `{ requestId, listId, algorithmVersion, mode, rank }` used only for analytics attribution.

## Client State

- URL-backed filters, sort, search query, page, and mobile-filter visibility.
- Versioned session-only guest wishlist IDs, cart IDs/quantities, ratings/timestamps, and optional pending registration `mergeId`.
- Loading and error state for remote requests.
- A versioned usage-data preference, pseudonymous anonymous ID, per-tab session ID, and bounded unsent interaction queue.

Product lists also carry `page`, `limit`, `total`, `totalPages`, `sort`, and full-catalog facet metadata. Authenticated wishlist/cart/rating state is normalized into the same public Store shape but remains authoritative on the backend.

## Authenticated Session Shape

The frontend receives only `{ publicId, username, displayName, role, onboardingComplete, preferences, seeded }` inside the safe session/profile envelope. It never receives password hashes, salts, session tokens, internal database IDs, raw events, or another user's state.

`AuthProvider` stores the safe user in memory and reports `loading`, `authenticated`, `anonymous`, or `error`. The signed cookie remains HttpOnly and browser-managed. `authMethod` distinguishes registration, login, and restore so `StoreProvider` can apply the approved guest-state policy without reading the cookie.

Interaction wire events contain controlled IDs, type, product, time, source, surface, optional numeric value, and bounded recommendation/search context. They never contain auth cookies, usernames, display names, passwords, IP addresses, or free-form search text.
