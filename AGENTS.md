# AGENTS.md

Project-specific frontend instructions for Codex and future coding agents.

## Project Summary

This folder owns the frontend for the Vinyl Record Store Recommender System. The frontend is responsible for React UI, customer-facing screens, frontend components, client-side state, API consumption, accessibility, responsive behavior, and recommendation display.

The academic focus is Decision Support and Recommender Systems. Frontend work must help users understand recommendations and make better record browsing or buying decisions.

## Current Phase

The frontend is in planning/setup only.

Do not implement UI pages, production components, API logic, database logic, recommender algorithms, authentication, scraping scripts, or production behavior unless the user explicitly asks for implementation later.

## Folder Boundary

- `vinyl_record_store_frontend` owns React UI, screens, frontend components, client-side API consumption, and recommendation explanation display.
- `vinyl_record_store_backend` owns Next.js backend routes, MongoDB Atlas access, server validation, interaction logging, recommender algorithms, and backend evaluation support.
- Do not put MongoDB credentials, database connection logic, or recommender algorithms in the frontend folder.
- Do not put customer-facing React UI work in the backend folder unless the user changes the architecture.

## Required Startup Reads

Before starting every session in this frontend folder, read:

1. `LESSONS.md`
2. `AGENTS.md`
3. `CLAUDE.md`
4. Relevant files in `docs/`
5. `package.json` and lockfiles when setup, dependencies, scripts, or framework versions may be affected

## Planned Tech Stack

- Frontend: ReactJS.
- Current scaffold: Vite React starter.
- Backend consumer: separate Next.js backend folder.
- API access: frontend calls backend APIs.
- Database access: backend only.
- Recommender logic: backend only; frontend displays results and explanations.

## Latest React And Next.js Version Rule

When implementation or dependency work begins, use the latest stable React version compatible with the frontend. If frontend work touches backend integration or shared framework assumptions, also verify the latest stable Next.js version used by the backend.

- Verify current versions from official docs or the npm registry before installing, upgrading, or changing framework APIs.
- As of 2026-06-24, npm registry metadata showed React `19.2.7` and Next.js `16.2.9` as latest.
- Do not rely on those exact numbers later without rechecking.
- If a task cannot use the latest stable version, document the reason in `docs/DECISION_LOG.md`.

## Code Quality And Component Expectations

For future frontend code:

- Keep components small and focused.
- Separate presentational components from API/client-state logic when practical.
- Keep API calls in a documented client helper boundary.
- Add loading, empty, and error states for data-driven UI.
- Keep recommendation explanations visible and understandable.
- Use accessible markup, labels, alt text, keyboard-friendly controls, and visible focus states.
- Avoid text overlap and layout shifts across mobile and desktop.
- Avoid unrelated rewrites.
- Run `npm run lint` and `npm run build` when frontend implementation changes make those checks relevant.

## File Cleanup Rule

After every task, remove obsolete files, cache output, temporary files, and throwaway artifacts created during the task.

Cleanup must be exact and safe:

- Remove only files that are clearly intended for removal.
- Verify the resolved path is inside the current project folder before deleting.
- Prefer explicit file paths over broad globs.
- Do not delete source files, docs, config files, assets, or user work unless the user explicitly asks.
- Do not delete `node_modules` unless the user asks for a dependency reset.
- If unsure whether a file is safe to remove, leave it and mention it in the final summary.
- There must be no accidental deletion.

## Agent Instruction Consistency

`AGENTS.md` and `CLAUDE.md` must be similar in context and must not contradict each other. If one instruction file changes, check the other in the same task and update it when relevant.

## Repository Inspection Workflow

Before changing files:

1. Resolve the actual frontend root.
2. Check whether this folder or its parent is a valid git repository.
3. Read `LESSONS.md`, `AGENTS.md`, `CLAUDE.md`, `README.md`, and relevant files in `docs/`.
4. Read setup files only when the task may affect dependencies, scripts, commands, or framework versions.
5. Inspect only files related to the task.
6. Prefer frontend-specific docs over backend assumptions.

## Future Task Workflow

1. Identify the task type: planning, UI, component, API consumption, accessibility, testing, setup, or docs.
2. Make a short plan for multi-file work.
3. Modify only relevant frontend files.
4. Validate when practical.
5. Update affected frontend docs in the same task.
6. Check whether backend API docs need updates if an API contract changes.
7. Summarize changed files, validation, assumptions, and next steps.

## Documentation Synchronization Rule

Frontend documentation is part of the work. If a task changes frontend setup, UI behavior, component structure, API consumption, recommendation display, environment variables, package choices, commands, risks, or project scope, update the relevant docs before finishing.

Before finishing any frontend task, check whether these files need updates:

- `README.md`
- `LESSONS.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/UI_UX_PLAN.md`
- `docs/API_CONTRACT_PLAN.md`
- `docs/DATA_MODEL_PLAN.md`
- `docs/RECOMMENDER_SYSTEM_PLAN.md`
- `docs/ARCHITECTURE_PLAN.md`
- `docs/ROADMAP.md`
- `docs/TASK_BACKLOG.md`
- `docs/DECISION_LOG.md`
- `docs/EVALUATION_PLAN.md`
- `docs/PRESENTATION_NOTES.md`
- `docs/RISK_REGISTER.md`
- `.env.example`

## Documentation Update Checklist

- Frontend behavior or usage changed: update `README.md`.
- Frontend architecture changed: update `docs/ARCHITECTURE_PLAN.md` and `docs/DECISION_LOG.md`.
- API consumption changed: update `docs/API_CONTRACT_PLAN.md`.
- Client data shape changed: update `docs/DATA_MODEL_PLAN.md`.
- Recommendation display changed: update `docs/RECOMMENDER_SYSTEM_PLAN.md`, `docs/UI_UX_PLAN.md`, and `docs/EVALUATION_PLAN.md`.
- UI behavior changed: update `docs/UI_UX_PLAN.md`.
- Project status changed: update `docs/ROADMAP.md` and `docs/TASK_BACKLOG.md`.
- Risk introduced or changed: update `docs/RISK_REGISTER.md`.
- Frontend environment variable changed: update `.env.example` and setup docs.

## Git Safety Rules

- Check git status before commit-oriented or publish-oriented work.
- Do not assume the parent `.git` folder is valid.
- Do not run destructive commands such as `git reset --hard`, `git checkout --`, mass deletion, or history rewriting unless the user explicitly asks.
- Do not commit, push, publish, or sync unless the user explicitly asks.
- Do not overwrite user work.

## Secrets And Privacy

- Do not commit real secrets.
- Do not put MongoDB credentials in frontend files.
- Keep `.env.example` as placeholders only.
- Keep `.env`, `.env.local`, and other local secret files ignored.
- Treat user behavior, order history, ratings, and email addresses as privacy-sensitive even when shown through UI.

## Design Reference Rules

- Do not copy proprietary design, HTML, CSS, images, logos, branding, product data, or layout pixel-for-pixel from external websites.
- Use similar websites only for general research and inspiration.
- Record observations as patterns, not copied assets.
- Respect robots.txt, terms of service, copyright, and rate limits.
- Do not add scraping code in the frontend.

## Academic Explanation Expectations

Future frontend implementation summaries should explain:

- What user-facing behavior changed.
- How the UI supports decision-making.
- How recommendation explanations are displayed.
- What assumptions were made.
- How the result can be tested or evaluated.
