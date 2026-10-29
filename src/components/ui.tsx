"use client";
import { BinanceMark } from "./icons";
export function CoinIcon({ sym, size = 28 }: { sym: string; size?: number }) {
  const special = ["BTC", "BNB", "USD", "USDT", "ETH"].includes(sym);
  return (
    <div aria-label={sym} className={`flex shrink-0 items-center justify-center rounded-full font-bold ${special ? (sym === "BTC" ? "bg-coin-btc text-on-change" : sym === "USDT" ? "bg-coin-usdt text-on-change" : sym === "ETH" ? "bg-coin-eth text-on-change" : "bg-brand text-brand-fg") : "bg-card2 text-fg"}`} style={{ width: size, height: size, fontSize: size * 0.5 }}>
      {sym === "BNB" ? <BinanceMark size={size * .7} className="coin-bnb" /> : sym === "USDT" ? <svg width={size * .75} height={size * .75} viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14v3h-5.5v3.4c4.9.2 8.5.9 8.5 1.8 0 .9-3.6 1.6-8.5 1.8V21h-3v-7c-4.9-.2-8.5-.9-8.5-1.8 0-.9 3.6-1.6 8.5-1.8V7H5zm7 6.9c-4.5 0-8.1.5-8.1 1.1s3.6 1.1 8.1 1.1 8.1-.5 8.1-1.1-3.6-1.1-8.1-1.1z" /></svg> : sym === "ETH" ? <svg width={size * .7} height={size * .7} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l7 11-7 4-7-4zm0 17l7-4-7 9-7-9z" /></svg> : sym === "BTC" ? "₿" : sym === "USD" ? "$" : sym.slice(0, 1)}
    </div>
  );
}
export function Sparkline({ pts, w = 120, h = 40, color }: { pts: number[]; w?: number; h?: number; color?: string }) {
  if (pts.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...pts), max = Math.max(...pts), r = max - min || 1;
  const d = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / r) * (h - 4) - 2}`).join(" ");
  const c = color || (pts[pts.length - 1] >= pts[0] ? "var(--color-up)" : "var(--color-down)");
  return <svg width={w} height={h}><polyline points={d} fill="none" stroke={c} strokeWidth={1.4} /></svg>;
}
export const Skel = ({ className = "" }: { className?: string }) => <div className={`skeleton ${className}`} />;
export function Change({ v, box }: { v: number; box?: boolean }) {
  const up = v >= 0; const t = `${up ? "+" : ""}${v.toFixed(2)}%`;
  if (box) return <span className={`tnum inline-block min-w-[78px] rounded-[4px] px-2 py-[7px] text-center text-[13px] font-semibold text-on-change ${up ? "bg-up" : "bg-down"}`}>{t}</span>;
  return <span className={`tnum text-[13px] ${up ? "text-up" : "text-down"}`}>{t}</span>;
}
export function Tabs({ items, value, onChange, size = "md" }: { items: string[]; value: string; onChange: (v: string) => void; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-[17px]" : size === "sm" ? "text-[13px]" : "text-[15px]";
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto">
      {items.map((i) => (
        <button key={i} onClick={() => onChange(i)} className={`shrink-0 whitespace-nowrap pb-2 ${cls} ${value === i ? "font-semibold text-fg" : "text-muted"}`}>{i}</button>
      ))}
    </div>
  );
}
