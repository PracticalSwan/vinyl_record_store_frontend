# Frontend Risk Register

| ID | Risk | Impact | Mitigation | Status |
| --- | --- | --- | --- | --- |
| FR-001 | Frontend exposes secrets. | High | Use public `VITE_` configuration only; keep database values backend-only. | controlled |
| FR-002 | API contract drifts. | High | Update both contract docs and the client together; build both repos. | controlled |
| FR-003 | UI implies real personalization. | High | Display demo-profile or cold-start language. | controlled |
| FR-004 | Local cart/wishlist looks persisted. | Medium | Document local-only state and disable checkout. | controlled |
| FR-005 | Duplicate source trees drift. | Medium | Keep `src/` canonical and `code_for_website/` snapshot-only. | controlled |
| FR-006 | Backend outage hides all content. | Medium | Catalog error with retry and independent recommendation status. | controlled |
| FR-007 | Mobile or keyboard regression. | Medium | Preserve responsive/focus rules and run browser scenarios when available. | open |
| FR-008 | Unapproved artwork or copied design enters the repo. | High | Preserve placeholders and design-reference policy. | controlled |
| FR-009 | Private interaction data appears in UI. | High | No persistent profile data exists; expose only safe summaries. | controlled |
