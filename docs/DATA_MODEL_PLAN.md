# Frontend Data Shapes

These are the current API, authentication, and client-only shapes used by the storefront.

## Product

| Field | Type | Use |
| --- | --- | --- |
| `id` | number | Stable routing/state reference and canonical local-artwork key when `localArtworkAvailable` is true. |
| `title` | string | Required product identity. |
| `artist` | string or null | Displayed through the shared `Unknown artist` fallback when absent. |
| `genre`, `label` | string or null | Filtering and metadata; explicit UI fallback when absent. |
| `year` | number or null | Original-release year used for sorting and era filtering; explicit UI fallback when absent. |
| `originalReleaseYear`, `editionReleaseYear` | number or null | Separate truthful year labels; an edition year is never presented as the original release year. |
| `price` | number or null | Money display and totals only when known; missing price blocks purchase. |
| `currency` | string or null | Currency paired with price; legacy records use `USD`. |
| `stock` | `in`, `low`, `out`, or null | Availability and action state; unknown stock blocks purchase. |
| `condition`, `format` | string or null | Display/filter metadata with explicit Unknown fallback. |
| `pressing`, `description` | string or null | Optional imported detail metadata with explicit fallbacks. |
| `imageUrl` | string or null | Compatibility detail image URL. |
| `image` | object or null | Approved thumbnail/detail URLs, `cover-art-archive` source, and MusicBrainz source link. |
| `localArtworkAvailable` | boolean | Backend-confirmed reviewed local fallback; unresolved dataset rows never borrow legacy art. |
| `source`, `datasetKey`, `sourceVersion` | string or null | Safe catalog ownership/version labels used by the Admin and artwork policy. |
| `catalogMode` | `research-only` or `commerce-preview` | Controls truthful commerce, facet, and action presentation. |
| `fieldOrigins` | object | Safe per-field provenance labels; never source reviewer identity. |
| `qualityFlags` | string array | Bounded source-quality notices. |

`src/lib/productDisplay.js` centralizes artist, value, money, availability, and purchase rules so cards, detail, lists, cart, checkout, and confirmation cannot disagree. Dataset products with unknown commercial fields remain browseable, wishlistable, and rateable but cannot enter the purchase preview.

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

Product lists also carry `page`, `limit`, `total`, `totalPages`, `sort`, and full-catalog facet metadata including dynamic genres and formats. Authenticated wishlist/cart/rating state is normalized into the same public Store shape but remains authoritative on the backend.

## Authenticated Session Shape

The frontend receives only `{ publicId, username, displayName, role, onboardingComplete, preferences, seeded }` inside the safe session/profile envelope. It never receives password hashes, salts, session tokens, internal database IDs, raw events, or another user's state.

`AuthProvider` stores the safe user in memory and reports `loading`, `authenticated`, `anonymous`, or `error`. The signed cookie remains HttpOnly and browser-managed. `authMethod` distinguishes registration, login, and restore so `StoreProvider` can apply the approved guest-state policy without reading the cookie.

Interaction wire events contain controlled IDs, type, product, time, source, surface, optional numeric value, and bounded recommendation/search context. They never contain auth cookies, usernames, display names, passwords, IP addresses, or free-form search text.
