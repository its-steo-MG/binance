import { test, expect } from "bun:test";
import { BALANCE_UNITS, BALANCE_CURRENCY_KEY, parseBalanceUnit, readBalanceCurrency, setBalanceCurrency, subscribeBalanceCurrency, formatBalance } from "./balance-currency";

test("Assets selection is shared with Home for KES and every offered unit", () => {
  const stored = new Map<string, string>();
  const events = new EventTarget();
  const browser = Object.assign(events, { localStorage: {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => { stored.set(key, value); },
  } });
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  try {
    let homeUnit = readBalanceCurrency();
    const unsubscribe = subscribeBalanceCurrency(() => { homeUnit = readBalanceCurrency(); });
    for (const unit of BALANCE_UNITS) {
      setBalanceCurrency(unit);
      expect(homeUnit).toBe(unit);
      expect(readBalanceCurrency()).toBe(unit); // remount/reload reads saved selection
      expect(stored.get(BALANCE_CURRENCY_KEY)).toBe(unit);
    }
    unsubscribe();
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("KES converts the balance rather than only changing the label", () => {
  expect(formatBalance(100, "KES", 130, null)).toBe("KSh13,000.00");
});

test("other available currencies use their corresponding prices", () => {
  const prices = [{ base: "BTC", price: 50000 }, { base: "ETH", price: 2500 }, { base: "BNB", price: 500 }];
  expect(formatBalance(100, "BTC", 130, prices)).toBe("0.00200000");
  expect(formatBalance(100, "ETH", 130, prices)).toBe("0.04000000");
  expect(formatBalance(100, "BNB", 130, prices)).toBe("0.20000000");
  expect(formatBalance(100, "USDT", 130, prices)).toBe("100.00");
});

test("invalid saved units default to BTC and missing prices never display a fake zero", () => {
  expect(parseBalanceUnit("invalid")).toBe("BTC");
  expect(formatBalance(100, "BTC", 130, null)).toBe("--");
});