"use client";
import Link from "next/link";
import { useState } from "react";
import { Screen } from "@/components/shell";
import { useTickers, useKesRate, fmtPrice, COINS } from "@/lib/market";
import { CoinIcon, Change, Skel, Tabs } from "@/components/ui";
import { SearchI, MoreI } from "@/components/icons";

export default function Markets() {
  const t = useTickers(); const kes = useKesRate();
  const [top, setTop] = useState("Markets"); const [tab, setTab] = useState("Hot"); const [sort, setSort] = useState<"vol" | "price" | "chg">("vol");
  const [q, setQ] = useState("");
  let rows = (t || []).filter((r) => !q || r.base.includes(q.toUpperCase()) || COINS[r.base]?.toLowerCase().includes(q.toLowerCase()));
  rows = [...rows].sort((a, b) => sort === "price" ? b.price - a.price : sort === "chg" ? b.change - a.change : b.volume - a.volume);
  return (
    <Screen>
      <div className="px-4">
        <div className="flex h-9 items-center gap-2 rounded-md bg-card px-3 text-[13px] text-muted"><SearchI size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search coins and trends" className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-muted" /></div>
        <div className="mt-4 flex items-center justify-between"><Tabs size="lg" items={["Favorites", "Markets", "Alpha", "Grow", "Square", "Data"]} value={top} onChange={setTop} /><MoreI className="text-muted" /></div>
        <div className="mt-3"><Tabs size="sm" items={["Crypto", "Spot", "USDⓈ-M", "COIN-M", "Options", "Zones"]} value={tab === "Hot" ? "Crypto" : tab} onChange={setTab} /></div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto text-[12px]">{["All", "Hot", "BNB Chain", "Solana", "AI", "Meme", "RWA"].map((c, i) => <span key={c} className={`whitespace-nowrap rounded px-2 py-[3px] ${i === 0 ? "bg-card2 text-fg" : "text-muted"}`}>{c}</span>)}</div>
        <div className="mt-4 flex justify-between text-[11px] text-dim">
          <button onClick={() => setSort("vol")}>Name / Vol {sort === "vol" && "↓"}</button>
          <span className="flex gap-10"><button onClick={() => setSort("price")}>Last Price {sort === "price" && "↓"}</button><button onClick={() => setSort("chg")}>24h Chg% {sort === "chg" && "↓"}</button></span>
        </div>
        {!t && Array.from({ length: 10 }).map((_, i) => <Skel key={i} className="my-3 h-10" />)}
        {rows.map((r) => (
          <Link href={`/trade?s=${r.base}`} key={r.symbol} className="flex items-center justify-between py-[11px]">
            <div className="flex items-center gap-2"><CoinIcon sym={r.base} size={22} /><div><div className="text-[15px]"><b className="font-semibold">{r.base}</b><span className="text-[12px] text-dim"> /USDT</span></div><div className="tnum text-[11px] text-dim">{(r.volume / 1e6).toFixed(2)}M</div></div></div>
            <div className="flex items-center gap-3"><div className="text-right"><div className="tnum text-[15px]">{fmtPrice(r.price)}</div><div className="tnum text-[11px] text-dim">KSh{fmtPrice(r.price * kes)}</div></div><Change v={r.change} box /></div>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
