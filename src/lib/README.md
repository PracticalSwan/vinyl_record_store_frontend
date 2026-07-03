# Frontend Library

`api.js` is the canonical backend client. Keep request URLs, query serialization, envelope validation, connection errors, and public API configuration in this boundary.

`catalogQuery.js` owns the URL query defaults, parsing, canonical repeated facets, and serialization shared by Catalog and Search.

Database helpers and recommendation scoring belong in the backend repository.
