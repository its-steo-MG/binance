"use client";
import Link from "next/link";
import { useState } from "react";
import { Screen } from "@/components/shell";
import { api, num, fmt, auth } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { useTickers, useKesRate, useKlines } from "@/lib/market";
import { CoinIcon, Skel, Tabs, Sparkline } from "@/components/ui";
import { DownI, UpI, SwapI, EarnI, HistoryI, EyeI, EyeOffI, ChevronD, ChevronR } from "@/components/icons";
import { useRouter } from "next/navigation";

const UNITS = ["BTC", "ETH", "BNB", "USDT", "KES"] as const;
export default function Assets() {
  const router = useRouter();
  const wallets = useApi(() => api.wallets());
  const t = useTickers(); const kes = useKesRate(); const line = useKlines("BTCUSDT", "1h", 30);
  const [tab, setTab] = useState("Overview"); const [unit, setUnit] = useState<(typeof UNITS)[number]>("BTC");
  const [pick, setPick] = useState(false); const [hide, setHide] = useState(false); const [hideZero, setHideZero] = useState(false);
  const total = (wallets.data || []).reduce((s, w) => s + num(w.balance), 0);
  const price = (b: string) => (b === "USDT" ? 1 : t?.find((x) => x.base === b)?.price || 0);
  const conv = unit === "USDT" ? total : unit === "KES" ? total * kes : price(unit) ? total / price(unit) : 0;
  const shown = unit === "KES" || unit === "USDT" ? fmt(conv, 2) : conv.toFixed(8);
  const list = (wallets.data || []).filter((w) => !hideZero || num(w.balance) > 0);
  const actions = [{ l: "Add Funds", I: DownI, h: "/deposit" }, { l: "Send", I: UpI, h: "/send" }, { l: "Transfer", I: SwapI, h: "/history" }, { l: "Earn", I: EarnI, h: "/history" }];
  return (
    <Screen onRefresh={() => wallets.reload()}>
      <div className="px-4">
        <div className="-mx-4 border-b border-line px-4 pb-3"><Tabs size="lg" items={["Overview", "Spot", "Funding"]} value={tab} onChange={setTab} /></div>
        <div className="mt-4 flex items-center justify-between text-[12px] text-muted"><span className="flex items-center gap-1">Est. Total Value <button onClick={() => setHide(!hide)}>{hide ? <EyeOffI size={14} /> : <EyeI size={14} />}</button></span><Link href="/history" aria-label="Transaction history"><HistoryI size={22} /></Link></div>
        <div className="mt-1 flex items-end justify-between">
          <div className="relative">
            {wallets.loading && !wallets.data ? <Skel className="h-9 w-44" /> :
              <button onClick={() => setPick(!pick)} className="flex items-end gap-1"><span className="tnum text-[28px] font-semibold leading-none">{hide ? "******" : unit === "KES" ? `KSh${shown}` : shown}</span><span className="pb-1 text-[13px]">{unit === "KES" ? "KES" : unit}</span><ChevronD size={12} className="mb-[6px]" /></button>}
            {pick && <div className="absolute left-24 top-9 z-20 w-28 rounded-lg bg-card2 py-1 text-[14px] shadow-xl">{UNITS.map((u) => <button key={u} onClick={() => { setUnit(u); setPick(false); }} className="flex w-full justify-between px-3 py-2">{u}{u === unit && <span className="text-brand">✓</span>}</button>)}</div>}
          </div>
          <Sparkline pts={line} w={80} h={30} color="var(--color-brand)" />
        </div>
        <div className="tnum mt-1 text-[13px] text-muted">{hide ? "****" : `≈ KSh${fmt(total * kes)}`}</div>
        <div className="text-[13px] text-muted">Today&apos;s PNL <span className="text-muted">KSh0.00 (0.00%)</span></div>
        {wallets.error && <p className="mt-2 text-[12px] text-down">{wallets.error}</p>}
        <div className="mt-6 grid grid-cols-4 text-center text-[12px]">
          {actions.map(({ l, I, h }) => <Link key={l} href={h} className="flex flex-col items-center gap-2"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-card"><I size={20} /></span>{l}</Link>)}
        </div>
        <section className="mt-6 rounded-lg bg-card px-3 pb-1"><div className="flex items-center justify-between pt-3"><span className="text-[14px] text-muted">Balance</span><label className="flex items-center gap-1 text-[12px] text-muted"><input type="checkbox" checked={hideZero} onChange={(e) => setHideZero(e.target.checked)} /> Hide 0 balances</label></div>
        {wallets.loading && !wallets.data && [1, 2].map((i) => <Skel key={i} className="my-4 h-14" />)}
        {wallets.data && list.length === 0 && <p className="py-10 text-center text-[13px] text-dim">No wallets yet</p>}
        {list.map((w) => {
          const b = num(w.balance); const p = price(w.currency) || 1;
          return (
            <div key={w.id} className="py-4">
              <Link href={`/history?wallet=${w.id}`} className="flex items-start justify-between">
                <div className="flex items-center gap-2"><CoinIcon sym={w.currency} size={24} /><div><div className="text-[15px] font-semibold">{w.currency}</div><div className="text-[12px] text-dim">{w.currency === "USDT" ? "TetherUS" : w.currency === "BTC" ? "Bitcoin" : w.label}</div></div></div>
                <div className="text-right"><div className="tnum text-[15px] font-medium">{hide ? "****" : w.currency === "USDT" ? b.toFixed(8) : b.toFixed(8)}</div><div className="tnum text-[12px] text-dim">≈ KSh{fmt(b * p * kes)}</div></div>
              </Link>
              <div className="mt-2 flex justify-end gap-2 text-[12px]"><Link href="/history" className="rounded bg-card2 px-4 py-[3px]">Earn</Link><Link href={`/trade?s=${w.currency === "USDT" ? "BTC" : w.currency}`} className="rounded bg-card2 px-4 py-[3px]">Trade</Link></div>
            </div>
          );
        })}
        </section>
        <button onClick={() => { auth.clear(); router.replace("/login"); }} className="mt-8 flex w-full items-center justify-between rounded-lg bg-card px-4 py-3 text-[14px]">Log Out <ChevronR size={16} /></button>
      </div>
    </Screen>
  );
}
