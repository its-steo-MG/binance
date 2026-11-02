// Fiat (KES / M-Pesa) helpers shared by the Sell and Buy flows.
export const SELL_FEE_RATE = 0.01; // 1% of the KES amount, rounded up to whole shillings
export const MIN_SELL_KES = 1200;
export const MAX_SELL_KES = 150000;
export const MIN_BUY_KES = 500;

export type SellQuote = { gross: number; fee: number; receive: number };
export function sellQuote(usdt: number, kesPerUsdt: number): SellQuote {
  const gross = Math.floor(usdt * kesPerUsdt);
  const fee = gross > 0 ? Math.ceil(gross * SELL_FEE_RATE) : 0;
  return { gross, fee, receive: Math.max(0, gross - fee) };
}
export function buyQuantity(kes: number, kesPerUsdt: number) {
  if (!kesPerUsdt || kes <= 0) return 0;
  return Math.floor((kes / kesPerUsdt) * 1e8) / 1e8;
}

/** Accepts 07XXXXXXXX, 01XXXXXXXX, 7XXXXXXXX or 2547XXXXXXXX; returns 2547XXXXXXXX or null. */
export function normalizeKePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  const local = d.startsWith("254") ? d.slice(3) : d.startsWith("0") ? d.slice(1) : d;
  return /^[17]\d{8}$/.test(local) ? `254${local}` : null;
}
export const maskPhone = (p: string) => `****${p.slice(-4)}`;

export type MobileAccount = { phone: string; email: string };
const KEY = "bn_mobile_money";
export const mobileAccount = {
  get: (): MobileAccount | null => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } },
  save: (a: MobileAccount) => localStorage.setItem(KEY, JSON.stringify(a)),
};

/** Keypad input: digits, one dot, limited decimals. */
export function pressKey(cur: string, key: string, decimals = 8): string {
  if (key === "del") return cur.slice(0, -1);
  if (key === ".") return cur.includes(".") ? cur : (cur || "0") + ".";
  const next = cur === "0" ? key : cur + key;
  const dec = next.split(".")[1];
  return dec && dec.length > decimals ? cur : next;
}
