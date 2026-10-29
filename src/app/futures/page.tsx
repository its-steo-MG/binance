"use client";
import { useEffect, useState } from "react";
import { Screen } from "@/components/shell";
import { fmtPrice } from "@/lib/market";
import { Change, Tabs } from "@/components/ui";
import { ChevronD, MenuI } from "@/components/icons";

export default function Futures() {
  const [tab, setTab] = useState("USDⓈ-M"); const [px, setPx] = useState(0); const [chg, setChg] = useState(0); const [fund, setFund] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  useEffect(() => {
    const load = () => {
      fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT").then((r) => r.json()).then((d) => { setPx(+d.lastPrice); setChg(+d.priceChangePercent); }).catch(() => {});
      fetch("https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT").then((r) => r.json()).then((d) => d.lastFundingRate && setFund((+d.lastFundingRate * 100).toFixed(5) + "%")).catch(() => {});
    };
    load(); const t = setInterval(load, 4000); return () => clearInterval(t);
  }, []);
  return (
    <Screen>
      <div className="px-4">
        <div className="flex items-center justify-between"><Tabs items={["USDⓈ-M", "COIN-M", "Options", "Smart Money"]} value={tab} onChange={setTab} /><MenuI className="text-muted" /></div>
        <div className="mt-4 flex items-center gap-2"><span className="text-[18px] font-semibold">BTCUSDT</span><span className="rounded bg-card2 px-1 text-[10px] text-muted">Perp</span><ChevronD size={14} /></div>
        <Change v={chg} />
        <div className="mt-3 grid grid-cols-[1.15fr_1fr] gap-3">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 rounded-md bg-card2 text-[14px] font-semibold">
              <button onClick={() => setSide("buy")} className={`rounded-md py-2 ${side === "buy" ? "bg-up text-white" : "text-muted"}`}>Buy</button>
              <button onClick={() => setSide("sell")} className={`rounded-md py-2 ${side === "sell" ? "bg-down text-white" : "text-muted"}`}>Sell</button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[12px]"><span className="rounded bg-card2 py-2">Cross</span><span className="rounded bg-card2 py-2">20x</span><span className="rounded bg-card2 py-2">S</span></div>
            <div className="flex h-10 items-center justify-between rounded-md bg-card2 px-3 text-[14px]">Limit <ChevronD size={12} /></div>
            <div className="flex h-10 items-center justify-between rounded-md bg-card2 px-3 text-[14px] tnum"><span>{px ? px.toFixed(1) : "--"}</span><span className="text-[12px] text-muted">BBO</span></div>
            <div className="flex h-10 items-center justify-between rounded-md bg-card2 px-3 text-[13px] text-muted">Amount <span className="text-fg">BTC</span></div>
            <label className="flex items-center gap-2 text-[12px] text-muted"><input type="checkbox" /> TP/SL</label>
            <label className="flex items-center gap-2 text-[12px] text-muted"><input type="checkbox" /> Reduce Only</label>
            <div className="rounded-md bg-brand/10 p-2 text-[11px] text-brand">⚡ Activate Futures Account to start Trading</div>
            <button className="h-10 rounded-md bg-up text-[14px] font-semibold text-white">Activate Futures Account</button>
          </div>
          <div className="text-[12px] text-muted">
            <div className="text-[10px]">Funding / Countdown</div><div className="text-fg">{fund || "--"}</div>
            <div className={`tnum mt-8 text-center text-[18px] font-semibold ${chg >= 0 ? "text-up" : "text-down"}`}>{px ? fmtPrice(px) : "--"}</div>
            <div className="text-center tnum">{px ? fmtPrice(px) : ""}</div>
          </div>
        </div>
        <div className="mt-6 border-b border-line pb-2 text-[14px]"><span className="border-b-2 border-brand pb-2 font-semibold">Positions (0)</span><span className="ml-5 text-muted">Open Orders (0)</span><span className="ml-5 text-muted">Bots</span></div>
        <div className="py-12 text-center text-[13px] text-dim">You have no positions</div>
      </div>
    </Screen>
  );
}
