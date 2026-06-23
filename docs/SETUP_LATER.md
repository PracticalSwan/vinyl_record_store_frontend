# Frontend Setup Later

This file records frontend setup work for future implementation tasks.

## Current State

The frontend folder contains a Vite React starter with `package.json`, `package-lock.json`, and default source files.

No product UI has been implemented by this planning task.

## Version Check Requirement

Before dependency work:

- Check official docs or npm registry for latest stable React.
- If frontend work touches backend integration, also check the backend Next.js version.
- Confirm compatibility with the current project.
- Update `docs/DECISION_LOG.md` if the latest stable version cannot be used.

As of 2026-06-24, npm registry metadata showed:

- React: `19.2.7`
- Next.js: `16.2.9`

Recheck before acting because these values can change.

## Future Commands

Possible future commands:

```bash
npm run lint
npm run build
```

Do not install packages or run setup-changing commands unless the user approves implementation or dependency work.

## Frontend Environment Notes

Future frontend setup should:

- Use `NEXT_PUBLIC_APP_NAME` or the equivalent public env variable for display name if needed.
- Use `NEXT_PUBLIC_APP_URL` or the equivalent public env variable for app URL if needed.
- Use `NEXT_PUBLIC_API_BASE_URL` or the equivalent public env variable for backend API base URL.
- Keep backend secrets out of frontend env files.

## Documentation Updates Required During Setup

If frontend setup changes packages, scripts, framework versions, environment variables, API base URL strategy, or commands, update:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `LESSONS.md`
- `docs/ARCHITECTURE_PLAN.md`
- `docs/API_CONTRACT_PLAN.md`
- `docs/DECISION_LOG.md`
- `docs/TASK_BACKLOG.md`
- `.env.example`

