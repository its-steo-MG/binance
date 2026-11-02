import type { Notif, Tx } from "./api";

export const MESSAGE_CATEGORIES = ["Price Alert", "Transaction", "Account", "Marketing & Activities"] as const;
export type MessageCategory = typeof MESSAGE_CATEGORIES[number];
export function notificationCategory(n: Notif): MessageCategory {
  const text = `${String(n.data?.type || "")} ${n.title}`.toLowerCase();
  if (/price|alert/.test(text)) return "Price Alert";
  if (/account|login|security|password/.test(text)) return "Account";
  if (/marketing|campaign|promotion|earn|flexible|product/.test(text)) return "Marketing & Activities";
  return "Transaction";
}
export function transactionKind(t: Tx) {
  if (/^sell\b/i.test(t.description)) return "Sell";
  if (/^buy\b/i.test(t.description)) return "Buy";
  if (["debit", "withdrawal"].includes(t.transaction_type)) return "Withdrawal";
  if (["credit", "deposit", "withdrawal_credit"].includes(t.transaction_type)) return "Deposit";
  return "Adjustment";
}
export function signedAmount(t: Tx): number {
  const n = Number(t.amount);
  if (!Number.isFinite(n)) return 0;
  return ["Sell", "Withdrawal"].includes(transactionKind(t)) ? -Math.abs(n) : n;
}
export function transactionAmount(t: Tx) {
  const amount = signedAmount(t);
  return `${amount > 0 ? "+" : ""}${new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 }).format(amount)} USDT`;
}
export function transactionStatus(t: Tx) {
  // Ledger entries alone do not prove an external payment completed.
  const status = t.status?.toLowerCase();
  if (["completed", "successful", "success"].includes(status || "")) return "Completed";
  if (["pending", "processing"].includes(status || "")) return "Processing";
  if (["failed", "rejected", "cancelled"].includes(status || "")) return "Failed";
  return "Recorded";
}
export function eatTimestamp(value: string) {
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return "—";
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const part = (name: string) => parts.find(p => p.type === name)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}:${part("second")}`;
}
export function newestFirst<T extends { created_at: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}