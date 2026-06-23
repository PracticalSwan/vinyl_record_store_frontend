# Frontend Risk Register

| ID | Risk | Impact | Likelihood | Mitigation | Status |
| --- | --- | --- | --- | --- | --- |
| FR-001 | Frontend exposes backend secrets. | High | Medium | Keep MongoDB and server secrets out of frontend env files. | open |
| FR-002 | API contract drifts from backend. | Medium | High | Update frontend and backend API docs together. | open |
| FR-003 | Recommendation reasons are unclear. | Medium | Medium | Keep reasons short and test readability. | open |
| FR-004 | UI implies false personalization. | Medium | Medium | Clearly handle cold-start or generic recommendation states. | open |
| FR-005 | Responsive layout breaks product cards or filters. | Medium | Medium | Test mobile and desktop layouts. | open |
| FR-006 | Accessibility gaps. | Medium | Medium | Use semantic markup, labels, keyboard controls, and visible focus states. | open |
| FR-007 | External design copying risk. | High | Medium | Follow `docs/DESIGN_REFERENCE_POLICY.md`. | open |
| FR-008 | Scope creep into backend work. | Medium | Medium | Keep API, database, and recommender implementation in backend folder. | open |
| FR-009 | Framework version drift. | Medium | Medium | Verify latest React before dependency work. | open |
| FR-010 | Inconsistent agent instructions. | Medium | Medium | Keep `AGENTS.md` and `CLAUDE.md` similar in context. | open |
| FR-011 | Accidental deletion during cleanup. | High | Low | Remove only exact intended files after path verification inside the frontend folder. | open |
