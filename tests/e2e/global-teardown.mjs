// Playwright globalTeardown: after the E2E suite, remove the test-generated
// documents it wrote to the Atlas `vinyl_record_store` database. This keeps the
// classroom DB clean for offline evaluation and inspection. It deliberately
// shells out to the backend cleanup script (which owns the MongoDB connection
// and the protected-collection safety assertions) instead of duplicating DB
// code here, per the frontend "no MongoDB code in this repo" boundary.
//
// Behavior:
//   - Skipped when E2E_SKIP_CLEANUP=1 (set this if you are intentionally
//     accumulating interaction evidence for evaluation between runs).
//   - No-op when Atlas is unreachable (e.g. CI, seed-only checkout): the script
//     catches the missing connection and exits 0 with a "skipped" line, so this
//     teardown never fails the test run.
//   - Targets only test residue: `e2e_` users, full-wipe test-only collections
//     (interactions/recommendationLogs/guestMerges), and carts/wishlists/ratings/
//     feedback rows owned by matched test users. It never deletes vinylRecords
//     (the catalog) or the demo users.
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(here, "..", "..");
const backendDirectory = path.resolve(frontendDirectory, "..", "vinyl_record_store_backend");
const script = path.join(backendDirectory, "scripts", "clean-test-residue.mjs");

export default async function globalTeardown() {
  if (process.env.E2E_SKIP_CLEANUP === "1") {
    console.log("[globalTeardown] E2E_SKIP_CLEANUP=1 — skipping Atlas test-residue cleanup.");
    return;
  }
  console.log("[globalTeardown] cleaning Atlas test residue via backend script (--apply)...");
  // The script exits 0 when Atlas is unavailable, so a non-zero status here means
  // a real cleanup failure. Fail the Playwright run instead of claiming clean state.
  const result = spawnSync(
    process.execPath,
    ["--env-file-if-exists=.env.local", script, "--apply"],
    { cwd: backendDirectory, encoding: "utf8" },
  );
  const out = (result.stdout || "").trim();
  const err = (result.stderr || "").trim();
  if (out) console.log(out);
  if (err) console.error(err);
  if (result.error || result.status !== 0) {
    const detail = result.error
      ? `spawn error ${result.error.code || "unknown"}`
      : `exit ${result.status}`;
    throw new Error(`[globalTeardown] Atlas test-residue cleanup failed (${detail}).`);
  }
}
