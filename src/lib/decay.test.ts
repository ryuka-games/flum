import { describe, it, expect } from "vitest";
import { getFreshnessStage, isExpired, getDecayStyle } from "./decay";

const NOW = new Date("2025-06-15T12:00:00Z").getTime();

function ago(hours: number): string {
  return new Date(NOW - hours * 3_600_000).toISOString();
}

describe("getFreshnessStage", () => {
  it("0-1h → fresh", () => {
    expect(getFreshnessStage(ago(0), NOW)).toBe("fresh");
    expect(getFreshnessStage(ago(0.5), NOW)).toBe("fresh");
  });

  it("1-6h → recent", () => {
    expect(getFreshnessStage(ago(1), NOW)).toBe("recent");
    expect(getFreshnessStage(ago(5.9), NOW)).toBe("recent");
  });

  it("6-12h → aging", () => {
    expect(getFreshnessStage(ago(6), NOW)).toBe("aging");
    expect(getFreshnessStage(ago(11.9), NOW)).toBe("aging");
  });

  it("12-18h → old", () => {
    expect(getFreshnessStage(ago(12), NOW)).toBe("old");
    expect(getFreshnessStage(ago(17.9), NOW)).toBe("old");
  });

  it("18h+ → stale", () => {
    expect(getFreshnessStage(ago(18), NOW)).toBe("stale");
    expect(getFreshnessStage(ago(23), NOW)).toBe("stale");
  });

  it("null publishedAt → stale", () => {
    expect(getFreshnessStage(null, NOW)).toBe("stale");
  });

  it("invalid date → fresh (safe fallback)", () => {
    expect(getFreshnessStage("not-a-date", NOW)).toBe("fresh");
  });
});

describe("isExpired", () => {
  it("24h 未満 → false", () => {
    expect(isExpired(ago(23), 0, NOW)).toBe(false);
  });

  it("24h 以上 → true", () => {
    expect(isExpired(ago(24), 0, NOW)).toBe(true);
    expect(isExpired(ago(48), 0, NOW)).toBe(true);
  });

  it("publishedAt が null → fetchedAt でフォールバック", () => {
    const fetchedAt = NOW - 25 * 3_600_000;
    expect(isExpired(null, fetchedAt, NOW)).toBe(true);
  });

  it("publishedAt が null + fetchedAt が新しい → false", () => {
    const fetchedAt = NOW - 1 * 3_600_000;
    expect(isExpired(null, fetchedAt, NOW)).toBe(false);
  });

  it("invalid date → false (safe fallback)", () => {
    expect(isExpired("not-a-date", 0, NOW)).toBe(false);
  });
});

describe("getDecayStyle", () => {
  it("fresh → null (スタイル変更なし)", () => {
    expect(getDecayStyle(ago(0.5), NOW)).toBeNull();
  });

  it("recent → filter + opacity あり", () => {
    const style = getDecayStyle(ago(3), NOW);
    expect(style).not.toBeNull();
    expect(style!.freshness).toBe("recent");
    expect(style!.filter).toContain("saturate");
    expect(style!.opacity).toBeGreaterThan(0);
  });

  it("stale → glitch-text className", () => {
    const style = getDecayStyle(ago(20), NOW);
    expect(style!.className).toBe("glitch-text");
  });

  it("noDecay → null", () => {
    expect(getDecayStyle(ago(20), NOW, true)).toBeNull();
  });

  it("シャドウ色は鮮度で変わる（warm → cold）", () => {
    const recent = getDecayStyle(ago(3), NOW)!;
    const old = getDecayStyle(ago(15), NOW)!;
    const stale = getDecayStyle(ago(20), NOW)!;

    expect(recent.shadowColor).toContain("pink");
    expect(old.shadowColor).toContain("cyan");
    expect(stale.shadowColor).toContain("old-color");
  });
});
