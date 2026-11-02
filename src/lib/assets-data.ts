import type { Wallet } from "./api";
export type AssetTab = "Overview" | "Spot" | "Earn" | "Funding";
export type Pnl = { amount: string | number; percentage?: string | number | null };
export type AssetWallet = Wallet & {
  account_type?: string;
  unrealized_pnl?: Pnl;
  apr?: string | number;
  cumulative_interest?: string | number;
};
export type AssetMetrics = {
  today_pnl?: Pnl;
  account_metrics?: Partial<Record<Exclude<AssetTab, "Overview">, { today_pnl?: Pnl }>>;
};
export function pnlTone(value: unknown): "text-down" | "text-up" | "text-fg" | "text-muted" {
  if (value === null || value === undefined || value === "") return "text-muted";
  const n = Number(value);
  return !Number.isFinite(n) ? "text-muted" : n < 0 ? "text-down" : n > 0 ? "text-up" : "text-fg";
}
export function walletAccount(w: AssetWallet): Exclude<AssetTab, "Overview"> {
  const category = (w.account_type || w.label || "").trim().toLowerCase();
  if (category === "earn") return "Earn";
  if (category === "funding") return "Funding";
  return "Spot";
}
export function accountWallets(wallets: AssetWallet[], tab: AssetTab) {
  return tab === "Overview" ? wallets : wallets.filter((w) => walletAccount(w) === tab);
}
export function accountPnl(metrics: AssetMetrics | null, tab: AssetTab): Pnl | undefined {
  return tab === "Overview" ? metrics?.today_pnl : metrics?.account_metrics?.[tab]?.today_pnl;
}
export function assetAmount(value: number, fiat = false) {
  if (!Number.isFinite(value)) return "--";
  if (fiat) return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value === 0 ? "0.00" : value.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}