// Regression coverage for coercing legacy boolean jitter in RetryConfigSchema.
// See https://github.com/openclaw/openclaw/issues/52130 — a stray `jitter: true`
// previously failed Zod validation and crashed gateway startup on every restart.
import { describe, expect, it } from "vitest";

import { RetryConfigSchema } from "./zod-schema.core.js";

describe("RetryConfigSchema: coerce legacy boolean jitter (#52130)", () => {
  it("coerces jitter: true to 0.1", () => {
    expect(RetryConfigSchema.parse({ jitter: true })).toEqual({ jitter: 0.1 });
  });

  it("coerces jitter: false to 0", () => {
    expect(RetryConfigSchema.parse({ jitter: false })).toEqual({ jitter: 0 });
  });

  it("preserves numeric jitter across the valid range", () => {
    expect(RetryConfigSchema.parse({ jitter: 0 })).toEqual({ jitter: 0 });
    expect(RetryConfigSchema.parse({ jitter: 0.25 })).toEqual({ jitter: 0.25 });
    expect(RetryConfigSchema.parse({ jitter: 1 })).toEqual({ jitter: 1 });
  });

  it("omits jitter when not provided", () => {
    expect(RetryConfigSchema.parse({ attempts: 3 })).toEqual({ attempts: 3 });
    expect(RetryConfigSchema.parse(undefined)).toBeUndefined();
  });

  it("still rejects invalid jitter values (regression guard)", () => {
    expect(RetryConfigSchema.safeParse({ jitter: "high" }).success).toBe(false);
    expect(RetryConfigSchema.safeParse({ jitter: 2 }).success).toBe(false);
    expect(RetryConfigSchema.safeParse({ jitter: -0.5 }).success).toBe(false);
  });
});
