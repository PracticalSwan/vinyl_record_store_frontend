# Deferred Frontend Setup

The current frontend setup is complete for the integrated academic demo. This file lists work that has not started and requires a separate explicit task.

The approved design and dependency gates are documented in `FUTURE_IMPLEMENTATION_PLAN.md`. That document does not authorize implementation by itself.

## Deferred

- A separately approved recommendation experiment over the versioned historical dataset. The current `ready` result is data validation only.
- Additional order UI beyond the implemented checkout preview.
- Real checkout and payment integration.
- TypeScript migration.
- Future image optimization service only if deployment requirements justify it; the current backend proxy and committed local-artwork endpoint need no added frontend dependency.
- PERS-09 integration/closure remains deferred. PERS-00 through PERS-08 / FFP-09 through FFP-13 are complete behind default-off flags. Do not enable the new ranking flags or start PERS-09 without a separate explicit task; preserve honesty wording and the evidence boundary.

Do not install packages or begin these changes solely because they appear here. Recheck current framework versions and update decisions before any future dependency work.
