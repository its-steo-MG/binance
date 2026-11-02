import { describe, expect, it } from "vitest";
import { buyQuantity, normalizeKePhone, pressKey, sellQuote } from "./fiat";

describe("fiat rules", () => {
  it("sell fee is 1% of KES, rounded up", () => {
    expect(sellQuote(10, 126.1)).toEqual({ gross: 1261, fee: 13, receive: 1248 });
  });
  it("buy quantity is KES divided by the rate", () => {
    expect(buyQuantity(1300, 130)).toBe(10);
  });
  it("accepts Kenyan numbers and rejects others", () => {
    expect(normalizeKePhone("0797341831")).toBe("254797341831");
    expect(normalizeKePhone("+254 797341831")).toBe("254797341831");
    expect(normalizeKePhone("079734")).toBeNull();
  });
  it("keypad allows only one dot", () => {
    expect(pressKey("1.5", ".")).toBe("1.5");
    expect(pressKey("0", "7")).toBe("7");
  });
});
