# Frontend Data Shape Plan

This file describes frontend-facing data shapes. Backend MongoDB models belong in `../../vinyl_record_store_backend/docs/DATA_MODEL_PLAN.md`.

## Product Card Shape

Frontend product cards expect:

| Field | Purpose |
| --- | --- |
| `id` | Open product detail. |
| `title` | Display record title. |
| `artistName` | Display artist. |
| `genres` | Show genre labels. |
| `releaseYear` or `releaseEra` | Show era context. |
| `price` | Show price. |
| `currency` | Format price. |
| `condition` | Show item condition. |
| `stock` or `inStock` | Show availability. |
| `imageUrl` | Display approved image or placeholder. |

## Product Detail Shape

Product detail UI may need:

- Basic product card fields.
- Album.
- Label.
- Country.
- Tags.
- Mood.
- Format.
- Longer description, if added.
- Related recommendation results.

## Recommendation Item Shape

Recommendation UI expects:

| Field | Purpose |
| --- | --- |
| `product` | Product card data. |
| `rank` | Display order. |
| `score` | Optional debug or evaluation value. |
| `reasons` | User-facing explanation strings. |
| `algorithmVersion` | Optional evaluation/debug field. |

## Client-Only State

Client-only state may include:

- Active filters.
- Sort choice.
- Search text.
- Loading flags.
- Error messages.
- Open/closed filter panel state.
- Locally selected UI tab.

Persistent product, user, interaction, order, wishlist, and recommendation data belongs to the backend.

## Documentation Update Rules

Update this file when frontend data expectations, API response assumptions, card fields, detail fields, or recommendation display fields change.

