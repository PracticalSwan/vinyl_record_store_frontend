# Frontend Roadmap

## Phase 0: Frontend Planning/Setup

Status: in progress.

Must-do tasks:

- Add frontend agent instructions.
- Add frontend lessons.
- Update frontend docs for frontend-only ownership.
- Keep env placeholders frontend-safe.

Should-do tasks:

- Record frontend/backend boundary.
- Note current Vite starter state.

Likely docs updated:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `LESSONS.md`
- All frontend docs
- `.env.example`

## Phase 1: Frontend Scaffold Review

Must-do tasks:

- Confirm whether the frontend remains Vite.
- Verify latest React version before dependency work.
- Decide JavaScript versus TypeScript.

Should-do tasks:

- Confirm lint/build commands.
- Decide API client helper structure.

Likely docs updated:

- `docs/ARCHITECTURE_PLAN.md`
- `docs/DECISION_LOG.md`
- `docs/SETUP_LATER.md`

## Phase 2: API Consumption Layer

Must-do tasks:

- Add API base URL configuration.
- Add product listing API client.
- Add product detail API client.
- Add recommendation API client.

Should-do tasks:

- Normalize backend response shapes.
- Add safe frontend error handling.

Likely docs updated:

- `docs/API_CONTRACT_PLAN.md`
- `docs/DATA_MODEL_PLAN.md`
- `.env.example`

## Phase 3: Catalog UI

Must-do tasks:

- Product grid.
- Product card.
- Search and filter controls.
- Loading, empty, and error states.

Should-do tasks:

- Responsive filter behavior.
- Accessibility pass.

Likely docs updated:

- `docs/UI_UX_PLAN.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/EVALUATION_PLAN.md`

## Phase 4: Product Detail And Recommendation UI

Must-do tasks:

- Product detail layout.
- Similar records section.
- Recommendation reason display.

Should-do tasks:

- Mobile recommendation row behavior.
- Empty recommendation state.

Likely docs updated:

- `docs/UI_UX_PLAN.md`
- `docs/RECOMMENDER_SYSTEM_PLAN.md`
- `docs/API_CONTRACT_PLAN.md`

## Phase 5: Wishlist, Cart, And Interaction UI

Must-do tasks:

- Wishlist action UI.
- Cart action UI.
- Interaction-triggering UI hooks.

Should-do tasks:

- Rating or like/dislike UI if backend supports it.

Likely docs updated:

- `docs/UI_UX_PLAN.md`
- `docs/API_CONTRACT_PLAN.md`
- `docs/RISK_REGISTER.md`

## Phase 6: Frontend Evaluation And Polish

Must-do tasks:

- Accessibility review.
- Responsive review.
- Recommendation explanation readability check.
- Lint/build checks.

Should-do tasks:

- Presentation-ready demo flow.
- User satisfaction survey UI notes.

Likely docs updated:

- `docs/EVALUATION_PLAN.md`
- `docs/PRESENTATION_NOTES.md`
- `docs/RISK_REGISTER.md`

