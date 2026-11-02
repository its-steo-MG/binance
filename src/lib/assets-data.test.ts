import { describe, expect, it } from "vitest";
import { pnlTone, accountPnl } from "./assets-data";
describe("Assets profit and loss", () => {
  it("shows negative Today's PNL in red", () => { expect(pnlTone("-0.00006967")).toBe("text-down"); });
  it("shows positive Today's PNL in green", () => { expect(pnlTone("0.01437535")).toBe("text-up"); });
  it("does not invent profit for missing data", () => { expect(pnlTone(undefined)).toBe("text-muted"); expect(accountPnl(null, "Overview")).toBeUndefined(); });
  it("keeps account PNL separate from Overview", () => { expect(accountPnl({ today_pnl: { amount: -1 }, account_metrics: { Spot: { today_pnl: { amount: 2 } } } }, "Spot")?.amount).toBe(2); });
});