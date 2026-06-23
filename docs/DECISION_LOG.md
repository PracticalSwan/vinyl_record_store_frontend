# Frontend Decision Log

Use this file for frontend decisions that affect setup, architecture, UI, API consumption, recommendation display, or workflow.

## Decision Template

```text
### FDEC-XXX: Title

Date: YYYY-MM-DD
Status: Proposed | Accepted | Changed | Replaced

Context:
What situation caused this decision?

Decision:
What was decided?

Rationale:
Why is this the preferred choice?

Impact:
What files, workflow, or future tasks does this affect?

Review Trigger:
When should this decision be revisited?
```

## Initial Decisions

### FDEC-001: Frontend Owns React UI And API Consumption

Date: 2026-06-24
Status: Accepted

Context:
The project is split into frontend and backend folders.

Decision:
The frontend folder owns React UI, components, client-side API consumption, accessibility, responsive behavior, and recommendation display.

Rationale:
This keeps UI concerns separate from backend APIs, MongoDB Atlas access, and recommender algorithms.

Impact:
Frontend docs should not claim ownership of database or recommender implementation.

Review Trigger:
Review if the folder split changes.

### FDEC-002: Backend Owns API, Database, And Recommender Logic

Date: 2026-06-24
Status: Accepted

Context:
The backend folder was added for server-side work.

Decision:
API routes, MongoDB Atlas access, interaction logging, and recommender scoring belong in `../vinyl_record_store_backend`.

Rationale:
This keeps secrets and server logic out of the frontend.

Impact:
Frontend API docs describe consumption expectations only.

Review Trigger:
Review when API contracts change.

### FDEC-003: Keep AGENTS.md And CLAUDE.md Similar In Context

Date: 2026-06-24
Status: Accepted

Context:
The user requested both instruction files to stay similar in context.

Decision:
When either `AGENTS.md` or `CLAUDE.md` changes, check and update the other when relevant.

Rationale:
Different agents should receive consistent frontend guidance.

Impact:
Instruction-file edits require a paired check.

Review Trigger:
Review when workflow rules change.

### FDEC-004: Read LESSONS.md Before Every Frontend Session

Date: 2026-06-24
Status: Accepted

Context:
The user requested durable lessons in both frontend and backend folders.

Decision:
Future agents must read `LESSONS.md` before frontend work.

Rationale:
The file records user preferences, project position, and mistakes to avoid.

Impact:
Startup workflow in `AGENTS.md` and `CLAUDE.md` includes `LESSONS.md`.

Review Trigger:
Review when lessons become stale.

### FDEC-005: Use Safe Cleanup After Every Frontend Task

Date: 2026-06-24
Status: Accepted

Context:
The user requested cleanup instructions that remove obsolete files, caches, and temporary files after tasks without accidental deletion.

Decision:
Frontend agents must clean only exact intended removal files after each task, verify paths are inside the frontend folder, avoid broad deletion, and leave uncertain files in place.

Rationale:
This keeps the repository tidy while protecting source files, docs, assets, config, and user work.

Impact:
`AGENTS.md`, `CLAUDE.md`, and `LESSONS.md` include the cleanup rule.

Review Trigger:
Review if cleanup rules need to cover new generated folders.

### FDEC-006: Keep Agentic Workflow Files Trackable

Date: 2026-06-24
Status: Accepted

Context:
The user wants a friend to receive as many project files as possible and asked not to ignore agentic workflow files.

Decision:
Frontend `.gitignore` must ignore dependencies, environment files, generated output, logs, and local editor/OS files only. It must not ignore `AGENTS.md`, `CLAUDE.md`, `LESSONS.md`, docs, or planning files.

Rationale:
Future contributors need the same project guidance and planning context.

Impact:
`.gitignore` was simplified.

Review Trigger:
Review if new generated files appear.
