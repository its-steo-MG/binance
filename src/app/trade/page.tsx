"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Screen } from "@/components/shell";
import { api, num, fmt } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { fmtPrice } from "@/lib/market";
import { Change, Tabs } from "@/components/ui";
import { ChevronD, MoreI } from "@/components/icons";

type Book = { bids: [string, string][]; asks: [string, string][] };
function TradeInner() {
  const s = (useSearchParams().get("s") || "BTC").toUpperCase(); const sym = `${s}USDT`;
  const [side, setSide] = useState<"buy" | "sell">("buy"); const [mode, setMode] = useState("Spot");
  const [book, setBook] = useState<Book | null>(null); const [px, setPx] = useState(0); const [chg, setChg] = useState(0);
  const [amt, setAmt] = useState(""); const [msg, setMsg] = useState("");
  const home = useApi(() => api.home());
  const usdt = num(home.data?.total_balance);
  useEffect(() => {
    let a = true;
    const load = () => {
      fetch(`https://api.binance.com/api/v3/depth?symbol=${sym}&limit=8`).then((r) => r.json()).then((d) => a && d.bids && setBook(d)).catch(() => {});
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`).then((r) => r.json()).then((d) => { if (a && d.lastPrice) { setPx(+d.lastPrice); setChg(+d.priceChangePercent); } }).catch(() => {});
    };
    load(); const t = setInterval(load, 3000); return () => { a = false; clearInterval(t); };
  }, [sym]);
  const max = Math.max(1, ...(book ? [...book.bids, ...book.asks].map((r) => +r[1]) : [1]));
  return (
    <Screen>
      <div className="px-4">
        <div className="flex items-center justify-between"><Tabs size="lg" items={["Convert", "Spot", "Margin", "Buy/Sell", "P2P"]} value={mode} onChange={setMode} /><MoreI className="text-muted" /></div>
        <div className="mt-4 flex items-center gap-2"><span className="text-[19px] font-semibold">{s}/USDT</span><ChevronD size={14} /><Change v={chg} /></div>
        <div className="mt-3 grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-3">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 rounded-md bg-card2 text-[14px] font-semibold">
              <button onClick={() => setSide("buy")} className={`rounded-md py-2 ${side === "buy" ? "bg-up text-on-change" : "text-muted"}`}>Buy</button>
              <button onClick={() => setSide("sell")} className={`rounded-md py-2 ${side === "sell" ? "bg-down text-on-change" : "text-muted"}`}>Sell</button>
            </div>
            <div className="flex h-10 items-center justify-between rounded-md bg-card2 px-3 text-[14px]">Market <ChevronD size={12} /></div>
            <div className="flex h-10 items-center justify-center rounded-md bg-card2 text-[13px] text-muted">Market Price</div>
            <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder={`Total (USDT)`} className="h-10 min-w-0 rounded-md bg-card2 px-3 text-[14px] outline-none placeholder:text-muted" />
            <div className="flex justify-between text-[11px] text-muted">{[25, 50, 75, 100].map((p) => <button key={p} onClick={() => setAmt(((usdt * p) / 100).toFixed(2))} className="rounded border border-line px-2 py-[2px]">{p}%</button>)}</div>
            <div className="flex justify-between text-[12px]"><span className="text-muted">Avbl</span><span className="tnum">{fmt(usdt, 2)} USDT</span></div>
            <div className="flex justify-between text-[12px]"><span className="text-muted">Est. {s}</span><span className="tnum">{px ? (num(amt) / px).toFixed(6) : "--"}</span></div>
            <button onClick={() => setMsg(num(amt) > usdt ? "Insufficient balance" : "Order submission is not enabled for this account.")} className={`h-10 rounded-md text-[14px] font-semibold text-on-change ${side === "buy" ? "bg-up" : "bg-down"}`}>{side === "buy" ? "Buy" : "Sell"} {s}</button>
            {msg && <p className="text-[12px] text-brand">{msg}</p>}
          </div>
          <div className="text-[12px]">
            <div className="flex justify-between text-[10px] text-dim"><span>Price (USDT)</span><span>Amount ({s})</span></div>
            {book?.asks.slice(0, 7).reverse().map(([p, q]) => (
              <div key={p} className="relative flex justify-between py-[3px] tnum"><div className="absolute inset-y-0 right-0 bg-down/10" style={{ width: `${(+q / max) * 100}%` }} /><span className="relative text-down">{fmtPrice(+p)}</span><span className="relative">{(+q).toFixed(4)}</span></div>
            ))}
            <div className={`tnum py-2 text-[17px] font-semibold ${chg >= 0 ? "text-up" : "text-down"}`}>{px ? fmtPrice(px) : "--"}</div>
            {book?.bids.slice(0, 7).map(([p, q]) => (
              <div key={p} className="relative flex justify-between py-[3px] tnum"><div className="absolute inset-y-0 right-0 bg-up/10" style={{ width: `${(+q / max) * 100}%` }} /><span className="relative text-up">{fmtPrice(+p)}</span><span className="relative">{(+q).toFixed(4)}</span></div>
            ))}
          </div>
        </div>
        <div className="mt-6 border-b border-line pb-2 text-[14px]"><span className="border-b-2 border-brand pb-2 font-semibold">Open Orders (0)</span><span className="ml-5 text-muted">Holdings</span><span className="ml-5 text-muted">Bots</span></div>
        <div className="py-12 text-center text-[13px] text-dim">No open orders</div>
      </div>
    </Screen>
  );
}
export default function Trade() { return <Suspense><TradeInner /></Suspense>; }
