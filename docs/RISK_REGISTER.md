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
| FR-008 | Unapproved, mismatched, or broken artwork enters the UI. | High | Consume only complete backend mappings, validate approved hosts, use one image boundary, retain source links, and fall back locally. | controlled |
| FR-009 | Analytics exposes identity or ignores opt-out. | High | Reject direct PII, keep opt-out authoritative in memory, clear the queue, and send only bounded pseudonymous fields. | controlled |
| FR-010 | Rapid or crafted search input produces stale or unsafe results. | High | Bound literal queries, canonicalize facets, abort superseded requests, and test stale-response behavior. | controlled |
| FR-011 | A failed registration merge loses guest state. | High | Persist the merge key before POST, retain the snapshot on failure, and resume a keyed merge after refresh. | controlled |
| FR-012 | Events or request logs are attributed to unseen lists or the wrong identity. | High | Fetch only rendered recommendation surfaces, use request/list context, and flush/discard queues before auth changes. | controlled |
| FR-013 | Planned personalization is presented as real measured quality. | High | Honesty wording locked in PERS-00; mode labels stay truthful; no quality claim; synthetic showcases labelled. | open |
| FR-014 | Stale frontend responses overwrite a new user's recommendations after identity change. | High | PERS-02 makes the recommendation resource key include the authenticated subject, aborts in-flight requests on identity change, and discards stale responses. | open |
| FR-015 | A future change parameterizes the recommendation user id, recreating an identity-selection surface. | High | PERS-01 invariant test forbids any production caller from passing an arbitrary user id. | open |
| FR-016 | Recommendation loading races auth restoration. | Medium | PERS-02 gates loading on `auth.status` or reorders providers so loading cannot start before auth resolves. | open |
| FR-017 | A data-source flag leaks private behavior. | High | PERS-03 renders only an allow-listed safe summary; no raw signals or counts. | open |
| FR-018 | Copy still claims preferences do not work after they do, or auto-refresh double-fires. | Medium | PERS-04 copy-update checklist and refresh gated on save success with in-flight abort. | open |
| FR-019 | Optimistic negative-feedback removal strands items on network failure. | High | PERS-05 uses pessimistic creates and rollback on undo failure. | open |
| FR-020 | Negative-feedback controls are inaccessible. | Medium | PERS-05 axe and keyboard tests, visible focus, adequate touch targets, screen-reader announcements. | open |
| FR-021 | A behavioral reason is rendered under tracking opt-out. | Medium | PERS-06 backend suppression plus a UI assertion that no behavioral reason appears when opt-out is active. | open |
| FR-022 | A fallback is labeled as personalized, or a hybrid reason does not match the item. | Medium | PERS-07/PERS-08 copy review and contribution-based reason assertions. | open |
| FR-023 | Demo-profile language lingers on a true personalized surface. | Medium | PERS-08/PERS-09 copy-removal checklist removes demo-profile language from personalized surfaces while keeping showcases labelled. | open |
