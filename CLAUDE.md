# CLAUDE.md

Instructions for Claude Code or any Claude-based coding agent working in the frontend folder.

## Project Summary

This folder owns the frontend for the Vinyl Record Store Recommender System. Frontend work covers React UI, customer-facing screens, reusable components, client-side state, API consumption, accessibility, responsive behavior, and recommendation display.

The project is academic. Frontend changes should help users understand recommendation reasons and make better browsing or buying decisions.

## Current Phase

The frontend is in planning/setup only.

Do not implement UI pages, production components, API logic, database logic, recommender algorithms, authentication, scraping scripts, or production behavior unless the user explicitly asks for implementation later.

## Folder Boundary

- `vinyl_record_store_frontend` owns React UI, screens, components, client-side API consumption, and recommendation explanation display.
- `vinyl_record_store_backend` owns Next.js backend routes, MongoDB Atlas access, server validation, interaction logging, recommender algorithms, and backend evaluation support.
- Do not add MongoDB credentials, database connection logic, or recommender algorithms to the frontend folder.
- Do not add customer-facing frontend features to the backend folder unless the architecture changes.

## Required Startup Reads

Before starting every frontend session, read:

1. `LESSONS.md`
2. `AGENTS.md`
3. `CLAUDE.md`
4. Relevant files in `docs/`
5. `package.json` and lockfiles when setup, dependencies, scripts, or framework versions may be affected

## Planned Tech Stack

- ReactJS for frontend UI.
- Current scaffold: Vite React starter.
- Separate Next.js backend folder as the API provider.
- Backend-only MongoDB Atlas access.
- Backend-only recommender logic.

## Latest React And Next.js Version Rule

When implementation or dependency work begins, use the latest stable React version compatible with the frontend. If frontend work touches backend integration or shared framework assumptions, also verify the latest stable Next.js version used by the backend.

- Verify current versions from official docs or the npm registry before installing, upgrading, or changing framework APIs.
- As of 2026-06-24, npm registry metadata showed React `19.2.7` and Next.js `16.2.9` as latest.
- Do not rely on those exact numbers later without rechecking.
- If the latest stable version cannot be used, document the reason in `docs/DECISION_LOG.md`.

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

Before editing:

1. Resolve the actual frontend root.
2. Check whether this folder or its parent is a valid git repository.
3. Read `LESSONS.md`, `AGENTS.md`, this file, `README.md`, and relevant docs.
4. Read setup files when the task touches dependencies, scripts, commands, or framework versions.
5. Inspect only files related to the task.
6. Prefer frontend-specific docs over backend assumptions.

## Future Task Workflow

1. Identify the task type: planning, UI, component, API consumption, accessibility, testing, setup, or docs.
2. Make a short plan for multi-file work.
3. Edit only files needed for the task.
4. Validate with the smallest useful check.
5. Update affected frontend documentation.
6. Check whether backend API docs need updates if an API contract changes.
7. Summarize changed files, validation, assumptions, and next steps.

## Documentation Synchronization Rule

Frontend documents are living files. Keep them synchronized with frontend changes.

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

Update relevant docs in the same task when frontend behavior, architecture, API consumption, client data shapes, UI flows, recommendation display, environment variables, commands, package choices, risks, or scope changes.

## No Scraping Or Copying Policy

Do not copy proprietary design, HTML, CSS, images, logos, branding, product data, or layout pixel-for-pixel from any external website. Do not add scraping scripts to the frontend.

## No Secrets Policy

Do not commit real secrets, API keys, MongoDB connection strings, passwords, tokens, or private keys. The frontend must not contain MongoDB credentials.

## No Destructive Commands Policy

Do not run destructive commands such as mass deletion, `git reset --hard`, `git checkout --`, or history rewriting unless the user explicitly asks for that exact action.

Do not commit, push, publish, or sync unless the user explicitly asks.

## Handling Uncertainty

If missing information can be handled safely, make a small reversible assumption and document it. If the missing information changes risk, security, cost, project direction, or implementation shape, ask before editing.

## Work Summary After Every Task

After each frontend task, summarize:

- Files changed.
- What changed.
- Validation performed or why it was skipped.
- Assumptions and TODOs.
- Recommended next task.
