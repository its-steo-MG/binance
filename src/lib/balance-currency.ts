export const BALANCE_UNITS = ["BTC", "ETH", "BNB", "USDT", "KES"] as const;
export type BalanceUnit = (typeof BALANCE_UNITS)[number];
export const BALANCE_CURRENCY_KEY = "bn_balance_currency";
const CHANGE_EVENT = "bn_balance_currency_changed";

export function parseBalanceUnit(value: string | null): BalanceUnit {
  return BALANCE_UNITS.find((unit) => unit === value) ?? "BTC";
}

export function readBalanceCurrency(): BalanceUnit {
  if (typeof window === "undefined") return "BTC";
  try { return parseBalanceUnit(window.localStorage.getItem(BALANCE_CURRENCY_KEY)); }
  catch { return "BTC"; }
}

export function setBalanceCurrency(unit: BalanceUnit) {
  try { window.localStorage.setItem(BALANCE_CURRENCY_KEY, unit); }
  catch { return; }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeBalanceCurrency(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === BALANCE_CURRENCY_KEY || event.key === null) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Backend totals are denominated in USDT; crypto uses live USDT prices. */
export function formatBalance(total: number, unit: BalanceUnit, kesRate: number, prices: { base: string; price: number }[] | null) {
  const price = unit === "USDT" ? 1 : prices?.find((ticker) => ticker.base === unit)?.price;
  const value = unit === "KES" ? total * kesRate : price && price > 0 ? total / price : null;
  if (value === null || !Number.isFinite(value)) return "--";
  if (unit === "KES" || unit === "USDT") {
    const amount = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return unit === "KES" ? `KSh${amount}` : amount;
  }
  return value.toFixed(8);
}