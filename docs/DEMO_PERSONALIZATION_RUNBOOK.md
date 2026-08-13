# Frontend Demo Configuration Reference

The canonical final classroom procedure is the backend document `../vinyl_record_store_backend/docs/DEMO_PERSONALIZATION_RUNBOOK.md` when both repositories are checked out beneath the CSX4207 project root.

The selected profile is **Profile B: Selective Personalization** against explicit MongoDB/v3 mode. The frontend uses:

```text
VITE_API_BASE_URL=http://localhost:3000
VITE_PERS_ME_ENDPOINT=true
VITE_PERS_PROFILE_DOMAIN=true
VITE_PERS_NEGATIVE_FEEDBACK=true
VITE_TRACKING_ENABLED=true
```

Behavior, popularity, hybrid, profile scoring, and catalog selection are backend decisions; the client never recomputes them. Backend behavior, popularity, and hybrid flags are intentionally false for this presentation. Committed feature defaults are unchanged.

Start the backend first, verify its health response says `catalogMode: "mongodb"`, then start this frontend with `npm.cmd run dev -- --host 127.0.0.1`. Use a freshly registered temporary customer with saved preferences; do not modify the three protected showcase customers.

Expected UI states:

- signed out: `Anonymous fallback`;
- untouched protected showcase: `Session-owned cold-start`;
- new customer with a saved genre: `Saved preferences` on Recommendations and `Saved preference profile` on Home;
- `Not interested`: `Removed from recommendations.` plus focused `Undo`;
- `Already own`: `Marked as already owned.` plus focused `Undo`;
- tracking opt-out: passive analytics off, direct account actions still available;
- administrator: customer `/me` denied.

Run the exact-profile desktop/mobile verification with:

```powershell
$env:E2E_ENABLE_PERS_FIRST_BATCH='1'
$env:E2E_PERS_CATALOG_DATA_SOURCE='mongodb'
npm.cmd run test:e2e:seed -- tests/e2e/personalization.spec.js tests/e2e/recommendation-contract.spec.js
```

The test exercises desktop and 375x667 Chromium plus tablet, Firefox, and WebKit smoke with the same configuration. It produces loaded Home and Recommendations screenshots plus confirmed `Not interested` and `Already own` states. Global teardown uses the backend's approved Atlas test-residue cleanup. Follow it with `npm.cmd run db:clean:test` from the backend and require zero pending residue.

If MongoDB is unavailable, explicitly switch the backend to `CATALOG_DATA_SOURCE=seed`, set the frontend profile and feedback flags to false, and restart both servers. That emergency path demonstrates the 116-record catalog and anonymous/restricted showcase fallback only; it is not equivalent to the primary account-backed personalization flow.
