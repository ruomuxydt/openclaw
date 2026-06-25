// Real behavior proof for #96766: awaitPendingManagerWork must surface pending
// sync / provider-init errors during close() instead of silently swallowing them.
//
// Run: node --import tsx scripts/repro/issue-96766-close-pending-errors.mts
import { awaitPendingManagerWork } from "../../extensions/memory-core/src/memory/manager-async-state.js";

const surfaced: unknown[] = [];
const onError = (err: unknown) => surfaced.push(err);

// Simulate a manager.close() where the in-flight memory sync and provider init
// both reject (e.g. SQLite lock contention, disk full, provider init timeout).
// Before the fix these were swallowed by empty `catch {}` blocks; after the fix
// they must be reported through the onError callback.
await awaitPendingManagerWork({
  pendingSync: Promise.reject(new Error("simulated sync failure (sqlite lock)")),
  pendingProviderInit: Promise.reject(new Error("simulated provider init failure")),
  onError,
});

const checks: Array<[string, boolean]> = [
  [
    "pending sync error surfaced via onError (not swallowed)",
    surfaced[0] instanceof Error &&
      /simulated sync failure/.test((surfaced[0] as Error).message),
  ],
  [
    "provider init error surfaced via onError (not swallowed)",
    surfaced[1] instanceof Error &&
      /simulated provider init failure/.test((surfaced[1] as Error).message),
  ],
  ["both pending errors surfaced", surfaced.length === 2],
];

let allPass = true;
for (const [name, pass] of checks) {
  console.log(`${pass ? "PASS" : "FAIL"}: ${name}`);
  if (!pass) allPass = false;
}

console.log(
  allPass
    ? "\nALL CHECKS PASSED — close pending errors are observable, no longer silently swallowed."
    : "\nFAILED — some checks did not pass.",
);
process.exit(allPass ? 0 : 1);
