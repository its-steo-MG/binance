"use client";
import Link from "next/link";
import { useState } from "react";
import { Screen } from "@/components/shell";
import { api, num, fmt } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { useTickers, useKesRate, useKlines, fmtPrice, COINS } from "@/lib/market";
import { CoinIcon, Change, Skel, Sparkline, Tabs } from "@/components/ui";
import { BinanceMark, SearchI, ScanI, HeadsetI, ChatI, EyeI, ChevronD, CloseI, HistoryI } from "@/components/icons";

export default function Home() {
  const home = useApi(() => api.home());
  const notifs = useApi(() => api.notifications());
  const tickers = useTickers();
  const kes = useKesRate();
  const spark = useKlines("BNBUSDT", "1h", 40);
  const [tab, setTab] = useState("Hot");
  const [hide, setHide] = useState(false);
  const [banner, setBanner] = useState(true);
  const [unit, setUnit] = useState<"BTC" | "USDT">("BTC");
  const total = num(home.data?.total_balance);
  const btc = tickers?.find((t) => t.base === "BTC")?.price || 0;
  const bnb = tickers?.find((t) => t.base === "BNB");
  const unread = notifs.data?.filter((n) => !n.is_read).length || 0;
  let rows = tickers ? [...tickers] : [];
  if (tab === "Gainers") rows.sort((a, b) => b.change - a.change);
  else if (tab === "Losers") rows.sort((a, b) => a.change - b.change);
  else if (tab === "New") rows = rows.slice(-8);
  else rows.sort((a, b) => b.volume - a.volume);

  return (
    <Screen onRefresh={() => Promise.all([home.reload(), notifs.reload()])}>
      <header className="flex items-center gap-3 px-4 py-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-card2"><BinanceMark size={16} /></div>
        <HeadsetI size={22} className="text-fg" />
        <div className="mx-auto flex rounded-md bg-card p-[3px] text-[13px]">
          <span className="rounded-sm bg-card2 px-4 py-1 font-semibold">Exchange</span>
          <span className="px-4 py-1 text-muted">Wallet</span>
        </div>
        <ScanI size={22} className="text-muted" />
        <Link href="/notifications" className="relative text-muted"><ChatI size={20} />{unread > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-down" />}</Link>
      </header>
      <div className="mx-4 mt-2 flex h-9 items-center gap-2 rounded-lg bg-card2 px-3 text-[13px] text-muted"><SearchI size={16} /> Search coins and trends</div>

      <section className="px-4 pt-4">
        <button onClick={() => setHide(!hide)} aria-label="Toggle balance visibility" className="flex items-center gap-1 text-[12px] text-muted">Est. Total Value({unit}) <EyeI size={12} /></button>
        <div className="mt-1 flex items-end justify-between">
          {home.loading && !home.data ? <Skel className="h-9 w-40" /> : <div className="tnum text-[28px] font-semibold leading-none">{hide ? "******" : (unit === "BTC" ? (btc ? (total / btc).toFixed(8) : "--") : fmt(total, 2))}</div>}
          <Link href="/deposit" className="rounded-md bg-brand px-3 py-[7px] text-[13px] font-semibold text-brand-fg">Add Funds</Link>
        </div>
        <div className="tnum mt-1 text-[13px] text-muted">{hide ? "****" : `≈ KSh${fmt(total * kes)}`}</div>
        <div className="mt-1 text-[12px] text-muted">Today&apos;s PNL <span className="text-muted">KSh0.00 (0.00%)</span></div>
        {home.error && <p className="mt-2 text-[12px] text-down">{home.error}</p>}
      </section>

      <button aria-label="Change balance currency" onClick={() => setUnit(unit === "BTC" ? "USDT" : "BTC")} className="mx-auto mt-2 block text-muted"><ChevronD size={12} /></button>
      {banner && (
        <div className="mx-4 mt-4 rounded-lg bg-card p-3">
          <div className="flex items-center justify-between text-[12px] text-muted">Predict. Climb. Earn Rewards. <button onClick={() => setBanner(false)}><CloseI size={14} /></button></div>
          <div className="mt-2 flex items-center justify-between text-[12px]"><span className="flex items-center gap-2 font-medium"><BinanceMark size={24} />Binance Pick: $1,000,000 Reward Pool!</span><span className="rounded bg-card2 px-3 py-1 text-[12px]">Join</span></div><div className="mt-3 flex justify-center gap-1"><span className="size-1 rounded-full bg-dim" /><span className="h-1 w-2 rounded-full bg-fg" /><span className="size-1 rounded-full bg-dim" /></div>
        </div>
      )}

      <div className="mx-4 mt-3 grid grid-cols-2 gap-3">
        <div className="min-h-[150px] rounded-lg bg-card p-3">
          <div className="flex items-center gap-2 text-[13px] text-muted"><CoinIcon sym="USD" size={22} /> USD</div>
          <div className="mt-7 inline-block rounded bg-up/15 px-1 text-[10px] text-up">Deposit</div>
          <div className="mt-1 text-[13px] font-medium">Bank Transfer (SWIFT)</div>
        </div>
        <div className="min-h-[150px] rounded-lg bg-card p-3">
          <div className="flex items-center gap-2 text-[13px] text-muted"><CoinIcon sym="BNB" size={22} /> BNB</div>
          <div className="tnum mt-2 text-[16px] font-semibold">{bnb ? fmtPrice(bnb.price) : "--"}</div>
          {bnb && <Change v={bnb.change} />}
          <div className="mt-4 overflow-hidden"><Sparkline pts={spark} w={130} h={35} /></div>
        </div>
      </div>

      <section className="mx-4 mt-4 rounded-lg bg-card px-3 pt-3">
        <Tabs items={["Favorites", "Hot", "TradFi", "Alpha", "New", "Gainers", "Losers"]} value={tab} onChange={setTab} />
        <div className="mt-3 flex gap-4 text-[13px]"><span className="rounded bg-card2 px-2 py-[2px]">Crypto</span><span className="text-muted">Futures</span><span className="text-muted">Stocks</span></div>
        <div className="mt-3 flex justify-between text-[11px] text-dim"><span>Name</span><span className="flex gap-12"><span>Last Price</span><span>24h chg%</span></span></div>
        <div className="mt-1">
          {!tickers && Array.from({ length: 6 }).map((_, i) => <Skel key={i} className="my-3 h-10" />)}
          {rows.slice(0, 6).map((t) => (
            <Link href={`/trade?s=${t.base}`} key={t.symbol} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2"><CoinIcon sym={t.base} size={24} /><div><div className="text-[15px] font-semibold">{t.base}</div><div className="text-[11px] text-dim">{COINS[t.base]}</div></div></div>
              <div className="flex items-center gap-3">
                <div className="text-right"><div className="tnum text-[15px] font-medium">{fmtPrice(t.price)}</div><div className="tnum text-[11px] text-dim">KSh{fmtPrice(t.price * kes)}</div></div>
                <Change v={t.change} box />
              </div>
            </Link>
          ))}
        </div>
        <Link href="/markets" className="block py-3 text-center text-[13px] text-muted">View More</Link>
      </section>
    </Screen>
  );
}
