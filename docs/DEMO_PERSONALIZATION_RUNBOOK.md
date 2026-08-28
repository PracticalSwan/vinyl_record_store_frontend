# Frontend Demo Configuration Reference

The canonical procedure is the backend document `../vinyl_record_store_backend/docs/DEMO_PERSONALIZATION_RUNBOOK.md` when both repositories are checked out beneath the CSX4207 project root.

The selected environment is **Profile C: Showcase Hybrid** against explicit MongoDB/v3 mode. The frontend uses:

```text
VITE_API_BASE_URL=http://localhost:3000
VITE_PERS_ME_ENDPOINT=true
VITE_PERS_PROFILE_DOMAIN=true
VITE_PERS_NEGATIVE_FEEDBACK=true
VITE_TRACKING_ENABLED=true
```

Preference, behavior, aggregate popularity, hybrid scoring, and catalog selection remain backend decisions; the client never recomputes them. Committed feature defaults remain unchanged.

Start the backend first, verify its health response says `catalogMode: "mongodb"`, apply the canonical showcase seed, then start this frontend with `npm.cmd run dev -- --host 127.0.0.1`.

Expected UI states:

- signed out: `Popularity picks` when aggregate v3 evidence is available;
- `jazzlistener`: `Personalized picks`, Jazz-dominant results, wishlist count 2;
- `rockcollector`: `Personalized picks`, Rock-dominant results, wishlist count 2;
- `soulseeker`: `Personalized picks`, Soul-dominant results, wishlist count 2;
- all showcase accounts: `personalized-hybrid-v1`, known signal items absent, server-owned reasons visible;
- `Not interested`: `Removed from recommendations.` plus focused `Undo`;
- `Already own`: neutral ownership confirmation plus focused `Undo`;
- tracking opt-out: passive analytics and recommendation logging off, direct account actions still available;
- administrator: customer `/me` denied.

Run the bounded real-flow verification with:

```powershell
$env:E2E_ENABLE_PERS_INTEGRATION='1'
$env:E2E_PERS_CATALOG_DATA_SOURCE='mongodb'
npm.cmd run test:e2e -- tests/e2e/showcase-personalization.spec.js --project=chromium-desktop
```

The test signs into all three protected users, disables passive tracking, asserts the role-aligned hybrid contract, and captures one full-page screenshot per persona. It does not modify their canonical preferences, ratings, wishlist, cart, or feedback. Global teardown invokes the backend's approved Atlas cleanup, which preserves durable showcase state.

Do not over-engineer, over-complicate, or over-test. Use the broader personalization and route-contract matrices only when their boundaries changed.

If MongoDB is unavailable, explicitly switch the backend to `CATALOG_DATA_SOURCE=seed`, set the frontend profile and feedback flags to false, and restart both servers. That emergency path demonstrates the 116-record catalog and anonymous/restricted showcase fallback only; it is not equivalent to Profile C.

Behavior checks and screenshots prove integration and presentation, not recommendation quality. The historical Amazon experiment does not evaluate these live customer profiles, and the permanently consumed final test must not be rerun.
