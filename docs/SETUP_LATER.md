# Deferred Frontend Setup

The current frontend setup is complete for the integrated academic demo and deployed Netlify storefront. This file lists work that has not started and requires a separate explicit task.

The approved design and dependency gates are documented in `FUTURE_IMPLEMENTATION_PLAN.md`. That document does not authorize implementation by itself.

## Deferred

- A separately approved recommendation experiment over the versioned historical dataset. The current `ready` result is data validation only.
- Additional order UI beyond the implemented checkout preview.
- Real checkout and payment integration.
- TypeScript migration.
- Future image/CDN optimization only if measured production evidence justifies another dependency; current strict local-first dataset art plus bounded proxy/supplemental fallback is sufficient.
- PERS-00 through PERS-09 / FFP-09 through FFP-14 are complete. Keep the PERS-04 through PERS-08 ranking flags default-off unless a separate rollout is authorized; preserve honesty wording and the evidence boundary.

Do not install packages or begin these changes solely because they appear here. Recheck current framework versions and update decisions before any future dependency work.
