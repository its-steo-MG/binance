import { describe, expect, it } from "vitest";
import { balanceHistory, historyLine, historyPath } from "./balance-history";
const now = Date.parse("2026-11-05T12:00:00Z");
describe("account balance history", () => {
  it("uses only the backend snapshots inside the selected period", () => {
    const rows = [{ timestamp: "2026-11-01T12:00:00Z", balance: "100" }, { timestamp: "2026-11-05T08:00:00Z", balance: "125" }, { timestamp: "2026-11-05T10:00:00Z", balance: "120" }];
    expect(balanceHistory(rows, "1D", now).map((p) => p.balance)).toEqual([125, 120]);
    expect(balanceHistory(rows, "1W", now).map((p) => p.balance)).toEqual([100, 125, 120]);
  });
  it("does not fabricate a line for missing or invalid account data", () => {
    expect(balanceHistory(undefined, "ALL", now)).toEqual([]);
    expect(balanceHistory([{ timestamp: "invalid", balance: "5" }, { timestamp: "2026-11-05T10:00:00Z", balance: "" }], "ALL", now)).toEqual([]);
    expect(historyLine([])).toBe("");
  });
  it("keeps a flat backend balance flat and orders observations", () => {
    const points = balanceHistory([{ timestamp: "2026-11-05T10:00:00Z", balance: "0" }, { timestamp: "2026-11-05T08:00:00Z", balance: "0" }], "1D", now);
    expect(historyLine(points)).toBe("8,60 392,60");
  });
  it("keeps unchanged balances flat even with smoothing", () => {
    expect(historyPath([{ timestamp: 0, balance: 100 }, { timestamp: 1, balance: 100 }])).toBe("M8,60 C136,60 264,60 392,60");
    expect(historyPath([])).toBe("");
    expect(historyPath([{ timestamp: 0, balance: 100 }])).toBe("");
  });
  it("curves through every real snapshot without overshooting its segment", () => {
    const points = [{ timestamp: 0, balance: 100 }, { timestamp: 1, balance: 110 }, { timestamp: 4, balance: 101 }, { timestamp: 5, balance: 120 }];
    const coords = historyLine(points).split(" ").map((pair) => pair.split(",").map(Number));
    const segments = historyPath(points).split(" C").slice(1);
    expect(segments).toHaveLength(3);
    segments.forEach((segment, i) => {
      const values = segment.split(/[ ,]/).map(Number);
      const start = coords[i], end = coords[i + 1];
      if (!start || !end) throw new Error("Missing real snapshot");
      expect(values.slice(4)).toEqual(end);
      for (let step = 0; step <= 100; step++) {
        const t = step / 100, u = 1 - t;
        const y = u ** 3 * start[1] + 3 * u ** 2 * t * values[1] + 3 * u * t ** 2 * values[3] + t ** 3 * end[1];
        expect(y).toBeGreaterThanOrEqual(Math.min(start[1], end[1]) - 1e-8);
        expect(y).toBeLessThanOrEqual(Math.max(start[1], end[1]) + 1e-8);
      }
    });
  });
});