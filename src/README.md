# Frontend Source

This is the canonical Groovehaus application source.

- `pages/`: routed screens.
- `components/`: reusable UI and state surfaces.
- `context/`: API-backed catalog state and local demo store state.
- `hooks/`: reusable request behavior.
- `lib/api.js`: backend client boundary.
- `data/records.js`: retained design-era fixture; active catalog data comes from the backend.

Do not add server routes, database credentials, or recommender scoring here.
