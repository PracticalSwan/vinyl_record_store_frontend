# Frontend Documentation

These files describe the deployed Groovehaus storefront, current backend contract, presentation overlay, and production boundaries.

- `PROJECT_CONTEXT.md`: canonical frontend status and boundaries.
- `PRODUCT_REQUIREMENTS.md`: requirements and implementation status.
- `UI_UX_PLAN.md`: implemented routes, components, states, and accessibility behavior.
- `API_CONTRACT_PLAN.md`: backend endpoints consumed or available to the frontend.
- `DATA_MODEL_PLAN.md`: actual client-facing product and recommendation shapes.
- `AMAZON_REVIEWS_DATA_INTEGRATION_PLAN.md`: DATA-00 through DATA-15 frontend compatibility, Admin boundary, nullable-field behavior, validation evidence, and link to the backend runbook.
- `RECOMMENDER_SYSTEM_PLAN.md`: recommendation presentation and honesty rules.
- `ARCHITECTURE_PLAN.md`: current source and state ownership.
- `EVALUATION_PLAN.md`: automated and manual frontend checks.
- `FUTURE_IMPLEMENTATION_PLAN.md`: completed FFP-01 through FFP-14 records plus remaining deferred work and the cross-repository order.
- `PERSONALIZATION_IMPLEMENTATION_PLAN.md`: PERS-00 through PERS-09 / FFP-09 through FFP-14 completed through 2026-08-13; ranking flags remain default-off and no quality claim is made.
- `INTERACTION_LOGGING_PLAN.md`: implemented FFP-01 queue, privacy, attribution, and verification design.
- `ROADMAP.md` and `TASK_BACKLOG.md`: completed implementation, production deployment/presentation hardening, cleanup, and explicitly deferred work.
- `DECISION_LOG.md`, `RISK_REGISTER.md`, and `PRESENTATION_NOTES.md`: durable decisions, risks, and course-facing summary.
- `SETUP_LATER.md`: remaining deferred setup.

Backend implementation details belong in `../../vinyl_record_store_backend/docs/`. Update both API contract documents when the shared contract changes.
