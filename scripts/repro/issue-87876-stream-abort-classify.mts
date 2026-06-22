// Real behavior proof for #87876: verifies stream abort errors are classified
// as transient (timeout) so the fallback chain rotates.
//
// Run: node --import tsx scripts/repro/issue-87876-stream-abort-classify.mts
import { isStreamAbortErrorMessage } from "../../src/agents/embedded-agent-helpers/errors.ts";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

// The exact error message from the issue: Bedrock Converse stream drops after ~6 min.
const bedrockAbort = "This operation was aborted";
if (!isStreamAbortErrorMessage(bedrockAbort)) {
  fail(`expected "${bedrockAbort}" to be classified as stream abort`);
}
console.log(`PASS: "${bedrockAbort}" -> isStreamAbortError=true`);

// Case-insensitive.
if (!isStreamAbortErrorMessage("this operation was aborted")) {
  fail("expected case-insensitive match");
}
console.log("PASS: case-insensitive match works");

// Embedded in a longer message.
if (!isStreamAbortErrorMessage("ConverseStream failed: This operation was aborted at connection drop")) {
  fail("expected embedded match");
}
console.log("PASS: embedded in longer message -> true");

// Negative: unrelated abort messages.
if (isStreamAbortErrorMessage("Request was aborted")) {
  fail("should not match unrelated abort");
}
if (isStreamAbortErrorMessage("aborted by user")) {
  fail("should not match unrelated abort");
}
console.log("PASS: unrelated abort messages -> false");

console.log("\nALL CHECKS PASSED — stream abort errors classified as transient for fallback rotation.");
