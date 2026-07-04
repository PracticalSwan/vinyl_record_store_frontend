# Frontend Risk Register

| ID | Risk | Impact | Mitigation | Status |
| --- | --- | --- | --- | --- |
| FR-001 | Frontend exposes secrets. | High | Use public `VITE_` configuration only; keep database values backend-only. | controlled |
| FR-002 | API contract drifts. | High | Update both contract docs and the client together; build both repos. | controlled |
| FR-003 | UI implies real personalization. | High | Display demo-profile or cold-start language. | controlled |
| FR-004 | Guest and authenticated state ownership is confused. | Medium | Label guest state as tab-scoped, use one Store facade, and document sign-up-only merge. | controlled |
| FR-005 | Duplicate source trees drift. | Medium | Keep `src/` canonical and `code_for_website/` snapshot-only. | controlled |
| FR-006 | Backend outage hides remote content. | Medium | Route-level errors with retry and independent recommendation status. | controlled |
| FR-007 | Mobile or keyboard regression. | Medium | Playwright responsive, keyboard, history, and axe coverage in the release gate. | controlled |
| FR-008 | Unapproved artwork or copied design enters the repo. | High | Preserve placeholders and design-reference policy. | controlled |
| FR-009 | Analytics exposes identity or ignores opt-out. | High | Reject direct PII, keep opt-out authoritative in memory, clear the queue, and send only bounded pseudonymous fields. | controlled |
| FR-010 | Rapid or crafted search input produces stale or unsafe results. | High | Bound literal queries, canonicalize facets, abort superseded requests, and test stale-response behavior. | controlled |
| FR-011 | A failed registration merge loses guest state. | High | Persist the merge key before POST, retain the snapshot on failure, and resume a keyed merge after refresh. | controlled |
| FR-012 | Events or request logs are attributed to unseen lists or the wrong identity. | High | Fetch only rendered recommendation surfaces, use request/list context, and flush/discard queues before auth changes. | controlled |
