# Frontend Documentation

These files describe the implemented Groovehaus storefront and its current backend contract.

- `PROJECT_CONTEXT.md`: canonical frontend status and boundaries.
- `PRODUCT_REQUIREMENTS.md`: requirements and implementation status.
- `UI_UX_PLAN.md`: implemented routes, components, states, and accessibility behavior.
- `API_CONTRACT_PLAN.md`: backend endpoints consumed or available to the frontend.
- `DATA_MODEL_PLAN.md`: actual client-facing product and recommendation shapes.
- `AMAZON_REVIEWS_DATA_INTEGRATION_PLAN.md`: DATA-00 through DATA-15 frontend compatibility, Admin boundary, nullable-field behavior, validation evidence, and link to the backend runbook.
- `RECOMMENDER_SYSTEM_PLAN.md`: recommendation presentation and honesty rules.
- `ARCHITECTURE_PLAN.md`: current source and state ownership.
- `EVALUATION_PLAN.md`: automated and manual frontend checks.
- `FUTURE_IMPLEMENTATION_PLAN.md`: completed FFP-01 through FFP-11 records plus remaining deferred work and the cross-repository order.
- `PERSONALIZATION_IMPLEMENTATION_PLAN.md`: PERS-00 through PERS-05 / FFP-09 through FFP-11 completed 2026-08-10 behind default-off flags; PERS-06 through PERS-09 remain planned, with no quality claim.
- `INTERACTION_LOGGING_PLAN.md`: implemented FFP-01 queue, privacy, attribution, and verification design.
- `ROADMAP.md` and `TASK_BACKLOG.md`: completed implementation and explicitly deferred work.
- `DECISION_LOG.md`, `RISK_REGISTER.md`, and `PRESENTATION_NOTES.md`: durable decisions, risks, and course-facing summary.
- `SETUP_LATER.md`: remaining deferred setup.

Backend implementation details belong in `../../vinyl_record_store_backend/docs/`. Update both API contract documents when the shared contract changes.
