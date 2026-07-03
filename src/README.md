# Frontend Source

This is the canonical Groovehaus application source.

- `pages/`: routed screens.
- `components/`: reusable UI and state surfaces.
- `context/`: shared recommendation state and local demo store state.
- `hooks/`: URL-backed catalog queries, product requests, and recommendation requests.
- `lib/api.js`: backend client boundary.
- `lib/catalogQuery.js`: canonical catalog query parsing and serialization.

Do not add server routes, database credentials, or recommender scoring here.
