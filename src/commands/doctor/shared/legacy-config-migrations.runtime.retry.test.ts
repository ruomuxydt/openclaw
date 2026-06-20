import { describe, expect, it } from "vitest";
import { applyLegacyDoctorMigrations } from "./legacy-config-compat.js";

describe("retry.jitter boolean migration (#52130)", () => {
  it("coerces boolean true jitter to 0.1 at a provider retry path", () => {
    const raw = {
      models: {
        providers: {
          "openai": {
            retry: { jitter: true, attempts: 3 },
          },
        },
      },
    };
    const result = applyLegacyDoctorMigrations(raw);
    expect(result.next?.models?.providers?.openai?.retry?.jitter).toBe(0.1);
    expect(result.next?.models?.providers?.openai?.retry?.attempts).toBe(3);
    expect(result.changes.some((c) => c.includes("retry.jitter"))).toBe(true);
  });

  it("coerces boolean false jitter to 0", () => {
    const raw = { models: { providers: { anthropic: { retry: { jitter: false } } } } };
    const result = applyLegacyDoctorMigrations(raw);
    expect(result.next?.models?.providers?.anthropic?.retry?.jitter).toBe(0);
  });

  it("leaves numeric jitter unchanged", () => {
    const raw = { models: { providers: { openai: { retry: { jitter: 0.25 } } } } };
    const result = applyLegacyDoctorMigrations(raw);
    // Numeric jitter never triggers the boolean migration.
    expect(result.changes.some((c) => c.includes("retry.jitter"))).toBe(false);
    // When no migration fires, the runner returns null (nothing changed).
    if (result.next) {
      expect(result.next.models?.providers?.openai?.retry?.jitter).toBe(0.25);
    }
  });

  it("coerces jitter across multiple nested provider retry configs", () => {
    const raw = {
      models: {
        providers: {
          openai: { retry: { jitter: true } },
          anthropic: { retry: { jitter: false } },
        },
      },
      channels: {
        telegram: { retry: { jitter: true } },
      },
    };
    const result = applyLegacyDoctorMigrations(raw);
    expect(result.next?.models?.providers?.openai?.retry?.jitter).toBe(0.1);
    expect(result.next?.models?.providers?.anthropic?.retry?.jitter).toBe(0);
    expect(result.next?.channels?.telegram?.retry?.jitter).toBe(0.1);
  });
});
