# Frontend Lessons

Read this file before every frontend session.

## Project Position

- The project is split into separate frontend and backend folders.
- `vinyl_record_store_frontend` owns React UI, screens, reusable components, client-side API consumption, accessibility, responsive behavior, and recommendation explanation display.
- `vinyl_record_store_backend` owns Next.js API routes, MongoDB Atlas access, server validation, recommender logic, and backend evaluation support.
- The frontend currently has a Vite React starter. Do not treat starter files as finished product behavior.
- The current phase remains planning/setup unless the user explicitly asks for implementation.

## User Preferences

- Be careful and verify the actual folder on disk before editing.
- Keep frontend and backend responsibilities separate.
- Keep `AGENTS.md` and `CLAUDE.md` similar in context.
- Check `LESSONS.md` at the start of every session.
- Keep docs synchronized with behavior, setup, architecture, API consumption, UI, recommendation display, risk, and environment changes.
- Make small, focused changes. Avoid unrelated rewrites.
- Use beginner-friendly explanations for academic work.

## Mistakes And Corrections

- Earlier planning docs were created in the frontend folder with full-stack scope. After the project split, frontend docs should focus on UI and API consumption, while backend docs own APIs, database, and recommender implementation.
- Do not assume a folder name from memory. The active folders are `vinyl_record_store_frontend` and `vinyl_record_store_backend`.
- Do not assume git is valid. The parent `.git` folder has previously failed `git status`.
- Do not put backend secrets, MongoDB logic, or recommender algorithms in the frontend.

## Technical Lessons

- Before dependency work, verify the latest stable React version from official docs or the npm registry.
- If frontend work touches backend integration, also verify the backend's Next.js version.
- As of 2026-06-24, npm registry metadata showed React `19.2.7` and Next.js `16.2.9` as latest. Recheck later because this can change.
- Keep components small and focused.
- Keep API consumption in a documented helper boundary.
- Add loading, empty, and error states for data-driven UI.
- Display recommendation reasons clearly.
- Run frontend lint/build checks when implementation changes make them relevant.

## Safety Lessons

- Do not commit real credentials.
- Do not store MongoDB credentials in frontend files.
- Do not scrape or copy external design, product data, images, logos, or layouts.
- Treat user interactions, orders, ratings, and emails as privacy-sensitive in the UI.
- Clean up obsolete files, caches, and temporary artifacts after tasks, but only when the exact intended removal path is verified inside the frontend folder.
