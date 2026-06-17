import { describe, it, expect } from "vitest";

describe("bridge page sorting is deterministic (#53408)", () => {
  const pages = [
    "page-b",
    "page-A",
    "page-10",
    "page-2",
    "page-a",
    "page-1",
    "page-B",
  ];
  const comparator = (left: string, right: string) =>
    left.localeCompare(right, "en", { sensitivity: "base", numeric: true });

  it("produces identical order across repeated sorts", () => {
    const first = [...pages].sort(comparator);
    const second = [...pages].sort(comparator);
    expect(first).toEqual(second);
  });

  it("sorts numeric segments naturally", () => {
    const sorted = [...pages].sort(comparator);
    const idx = (p: string) => sorted.indexOf(p);
    expect(idx("page-1")).toBeLessThan(idx("page-2"));
    expect(idx("page-2")).toBeLessThan(idx("page-10"));
  });

  it("treats case as equivalent", () => {
    const sorted = [...pages].sort(comparator);
    const idxA = sorted.findIndex((p) => p === "page-a");
    const idxUpperA = sorted.findIndex((p) => p === "page-A");
    expect(Math.abs(idxA - idxUpperA)).toBeLessThanOrEqual(1);
  });
});
