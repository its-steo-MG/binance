"use client";
import type { ButtonHTMLAttributes } from "react";
import { pnlTone, assetAmount, type Pnl } from "@/lib/assets-data";
import { formatBalance, type BalanceUnit } from "@/lib/balance-currency";
import type { Ticker } from "@/lib/market";
export function AssetButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`asset-button ${className}`} {...props} />;
}
export function PnlValue({ pnl, unit = "USDT", kes = 1, prices = null, hidden = false }: { pnl?: Pnl; unit?: BalanceUnit; kes?: number; prices?: Ticker[] | null; hidden?: boolean }) {
  const amount = pnl?.amount == null ? null : Number(pnl.amount);
  if (hidden) return <span className="text-muted">******</span>;
  if (amount === null || !Number.isFinite(amount)) return <span className="text-muted">--</span>;
  const price = unit === "USDT" ? 1 : prices?.find((p) => p.base === unit)?.price;
  const value = unit === "KES" ? amount * kes : price && price > 0 ? amount / price : null;
  const displayed = value === null ? formatBalance(amount, unit, kes, prices) : assetAmount(value, unit === "KES");
  const percentage = pnl?.percentage == null ? null : Number(pnl.percentage);
  return <span data-testid="pnl-value" className={`tnum ${pnlTone(amount)}`}>{amount > 0 ? "+" : ""}{displayed} {unit === "KES" ? "KSh" : unit}{percentage !== null && Number.isFinite(percentage) ? ` (${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%)` : ""}</span>;
}