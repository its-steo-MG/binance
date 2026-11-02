"use client";
import Link from "next/link";
import { useState } from "react";
import { Screen } from "@/components/shell";
import { api, num, fmt } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { BALANCE_UNITS, formatBalance } from "@/lib/balance-currency";
import { useBalanceCurrency } from "@/lib/use-balance-currency";
import { useTickers, useKesRate, COINS } from "@/lib/market";
import { CoinIcon, Skel } from "@/components/ui";
import { AssetButton, PnlValue } from "@/components/assets-controls";
import { TransactionCard } from "@/components/transaction-ui";
import { newestFirst } from "@/lib/transaction-display";
import { accountWallets, accountPnl, assetAmount, type AssetTab, type AssetWallet, type AssetMetrics } from "@/lib/assets-data";
import { DownI, UpI, SwapI, EarnI, HistoryI, EyeI, EyeOffI, ChevronD, ChevronR, MenuI, SearchI, ScanI, FuturesI } from "@/components/icons";

export default function Assets() {
  const wallets = useApi(() => api.wallets());
  const home = useApi(() => api.home());
  const activity = useApi(() => api.transactions());
  const prices = useTickers(); const kes = useKesRate();
  const [tab, setTab] = useState<AssetTab>("Overview");
  const [spot, setSpot] = useState("Spot");
  const [earnView, setEarnView] = useState("By Assets");
  const [unit, setUnit] = useBalanceCurrency();
  const [pick, setPick] = useState(false); const [hide, setHide] = useState(false);
  const [filters, setFilters] = useState(false); const [hideZero, setHideZero] = useState(false);
  const [search, setSearch] = useState(false); const [query, setQuery] = useState("");
  const [allocation, setAllocation] = useState(true);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [notice, setNotice] = useState("");
  const bucket = accountWallets((wallets.data || []) as AssetWallet[], tab);
  const scoped = tab === "Spot" && spot !== "Spot" ? [] : bucket;
  // Preserve the backend's USDT-denominated balance contract.
  const total = scoped.reduce((sum, wallet) => sum + num(wallet.balance), 0);
  const list = scoped.filter(w => (!hideZero || num(w.balance) > 0) && (!query || `${w.currency} ${w.label}`.toLowerCase().includes(query.toLowerCase())));
  const pnl = accountPnl(home.data as AssetMetrics | null, tab);
  const shown = unit === "USDT" ? assetAmount(total) : formatBalance(total, unit, kes, prices);
  const actions = tab === "Earn"
    ? [{ l: "Earn", I: EarnI }, { l: "Redeem", I: UpI }, { l: "Borrow", I: EarnI }]
    : [{ l: "Add Funds", I: DownI, h: "/deposit" }, { l: "Send", I: UpI, h: "/send" }, { l: "Transfer", I: SwapI }, ...(tab === "Spot" ? [] : [{ l: tab === "Funding" ? "Stock Transfer" : "Earn", I: tab === "Funding" ? FuturesI : EarnI }])];
  const unavailable = (label: string) => setNotice(`${label} is not available for this account.`);
  return <Screen onRefresh={async () => { await Promise.all([wallets.reload(), home.reload(), activity.reload()]); }}>
    <main className="assets-page px-4">
      <div className="-mx-4 border-b border-line px-4 pb-2">
        <div role="tablist" aria-label="Asset accounts" className="flex gap-4 overflow-x-auto no-scrollbar">
          {(["Overview", "Spot", "Earn", "Funding"] as AssetTab[]).map(name => <AssetButton key={name} role="tab" aria-selected={tab === name} onClick={() => { setTab(name); setNotice(""); }} className={`shrink-0 pb-2 text-[19px] ${tab === name ? "font-semibold text-fg" : "text-muted"}`}>{name}</AssetButton>)}
        </div>
      </div>
      {tab === "Spot" && <div role="tablist" aria-label="Spot account type" className="my-3 flex gap-2 text-[14px] text-muted">{["Spot", "Cross Margin", "Isolated Margin"].map(name => <AssetButton key={name} role="tab" aria-selected={spot === name} onClick={() => setSpot(name)} className={`rounded-md px-2 py-1.5 ${spot === name ? "bg-card2 text-fg" : ""}`}>{name}</AssetButton>)}</div>}
      <div className="mt-4 flex items-center justify-between text-[14px]">
        <span className="flex items-center gap-2">Est. Total Value <AssetButton aria-label={hide ? "Show balances" : "Hide balances"} onClick={() => setHide(!hide)} className="text-muted">{hide ? <EyeOffI size={17}/> : <EyeI size={17}/>}</AssetButton></span>
        <Link href="/history" aria-label="Transaction history"><HistoryI size={25}/></Link>
      </div>
      <div className="relative mt-2">
        {wallets.loading && !wallets.data ? <Skel className="h-11 w-44"/> : <AssetButton aria-label="Change balance currency" aria-expanded={pick} onClick={() => setPick(!pick)} className="flex max-w-full flex-wrap items-baseline gap-1.5"><span className="assets-total tnum font-semibold leading-tight">{hide ? "******" : shown}</span><span className="text-[15px]">{unit === "KES" ? "" : unit}</span><ChevronD size={13}/></AssetButton>}
        {pick && <div className="absolute left-0 top-full z-20 mt-1 w-32 rounded-lg border border-line bg-card2 py-1 text-[14px] shadow-xl">{BALANCE_UNITS.map(u => <AssetButton key={u} onClick={() => { setUnit(u); setPick(false); }} className="flex w-full justify-between px-3 py-2">{u}{u === unit && <span className="text-brand">✓</span>}</AssetButton>)}</div>}
      </div>
      <div className="tnum mt-1 text-[15px] text-muted">{hide ? "****" : `≈ KSh${fmt(total * kes, total > 0 && total * kes < .01 ? 8 : 2)}`}</div>
      <div className="mt-2 flex flex-wrap items-center gap-1 text-[14px]"><Link href="/history" className="border-b border-dotted border-muted pb-1">Today's PNL</Link><PnlValue pnl={pnl} unit={unit} kes={kes} prices={prices} hidden={hide}/><Link href="/history" aria-label="PNL history" className="text-muted"><ChevronR size={17}/></Link></div>
      {wallets.error && <p role="alert" className="mt-2 text-[12px] text-down">{wallets.error}</p>}
      <div className={`mt-6 grid ${actions.length === 3 ? "grid-cols-3" : "grid-cols-4"} text-center text-[13px]`}>
        {actions.map(({ l, I, ...action }) => { const content = <><span className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-card"><I size={28}/></span><span>{l}</span></>; return "h" in action ? <Link key={l} href={String(action.h)} className="flex flex-col items-center gap-2">{content}</Link> : <AssetButton key={l} onClick={() => unavailable(l)} className="flex flex-col items-center gap-2">{content}</AssetButton>; })}
      </div>
      {notice && <div role="status" className="mt-3 flex items-center justify-between gap-3 text-[13px] text-muted">{notice}<AssetButton aria-label="Dismiss message" onClick={() => setNotice("")}>×</AssetButton></div>}
      {tab === "Funding" && <AssetButton onClick={() => unavailable("Manual Transfer to Spot Account")} className="mt-5 flex w-full items-center gap-2 rounded-lg bg-transfer px-3 py-4 text-left text-[14px]"><ScanI size={23}/>Manual Transfer to Spot Account<ChevronR size={17} className="ml-auto"/></AssetButton>}
      {tab === "Earn" && <section className="mt-5 rounded-lg bg-card px-3 py-3"><div className="flex items-center gap-2 text-[15px]"><EarnI size={22}/>Auto-Subscribe<AssetButton onClick={() => unavailable("Auto-Subscribe")} className="ml-auto rounded bg-brand px-3 py-1 text-[13px] font-medium text-brand-fg">Activate</AssetButton></div></section>}
      {tab === "Overview" && <section className="mt-6"><div className="mb-3 flex items-center justify-between text-[15px]"><h2>Recent Transactions</h2><Link href="/history" aria-label="All transactions" className="text-muted"><HistoryI size={21}/></Link></div>{activity.loading && !activity.data && <Skel className="h-24"/>}{activity.error && <p className="text-[12px] text-down">{activity.error}</p>}{activity.data?.length === 0 && <p className="py-4 text-[13px] text-muted">No transactions</p>}<div className="space-y-3">{newestFirst(activity.data || []).slice(0, 2).map(tx => hide ? <Link key={tx.id} href={`/history/details?id=${tx.id}`} className="flex justify-between rounded-lg bg-card p-4 text-[13px]"><span>{tx.transaction_type}</span><span>**** ›</span></Link> : <TransactionCard key={tx.id} tx={tx}/>)}</div></section>}
      {tab === "Overview" && <section className="mt-4 rounded-lg bg-card px-3 py-3"><AssetButton onClick={() => setAllocation(!allocation)} aria-expanded={allocation} className="flex w-full items-center justify-between text-[15px] text-muted">Allocation<ChevronD size={18}/></AssetButton>{allocation && <div aria-label="Wallet allocation" className="mt-3 flex h-2 overflow-hidden rounded-sm bg-card2">{scoped.filter(w => num(w.balance) > 0).map((w, i) => <div key={w.id} title={hide ? w.currency : `${w.currency} ${fmt(num(w.balance) / total * 100)}%`} className={`asset-allocation ${i % 2 ? "bg-brand" : "bg-allocation"}`} style={{ flexGrow: num(w.balance) }}/>)}</div>}</section>}
      <section className="mt-4 rounded-lg bg-card px-3 pb-1">
        <div className="flex items-center justify-between gap-2 border-b border-line py-3 text-[15px] text-muted">
          {tab === "Earn" ? <div className="flex gap-4">{["By Assets", "By Product"].map(name => <AssetButton key={name} onClick={() => setEarnView(name)} className={`relative pb-1 ${earnView === name ? "text-fg after:absolute after:bottom-[-13px] after:left-1/3 after:h-0.5 after:w-4 after:bg-brand" : ""}`}>{name}</AssetButton>)}</div> : <span>Balance</span>}
          <div className="flex gap-3">{tab === "Earn" && <AssetButton aria-label="Search assets" onClick={() => setSearch(!search)}><SearchI size={20}/></AssetButton>}<AssetButton aria-label="Refresh balances" onClick={() => wallets.reload()}><ScanI size={19}/></AssetButton><AssetButton aria-label="Balance filters" aria-expanded={filters} onClick={() => setFilters(!filters)}><MenuI size={19}/></AssetButton></div>
        </div>
        {filters && <label className="flex items-center gap-2 py-3 text-[13px] text-muted"><input type="checkbox" checked={hideZero} onChange={e => setHideZero(e.target.checked)}/>Hide 0 balances</label>}
        {search && <input aria-label="Search assets" value={query} onChange={e => setQuery(e.target.value)} className="my-3 w-full rounded border border-line bg-bg px-3 py-2 text-[14px]"/>}
        {wallets.loading && !wallets.data && [1, 2].map(i => <Skel key={i} className="my-4 h-14"/>)}
        {wallets.data && list.length === 0 && <div className="flex flex-col items-center gap-2 py-7 text-[12px] text-dim"><HistoryI size={35}/>{hideZero ? "Small balances are hidden" : "No assets in this account"}</div>}
        {list.map(w => <div key={w.id} className="border-b border-line py-4 last:border-0">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/history?wallet=${w.id}`} className="flex min-w-0 items-center gap-2"><CoinIcon sym={w.currency} size={27}/><div><div className="text-[15px] font-medium">{tab === "Earn" && earnView === "By Product" ? "Flexible" : w.currency}</div><div className="mt-1 text-[12px] text-muted">{tab === "Earn" ? "1 holdings" : w.currency === "USDT" ? "TetherUS" : COINS[w.currency] || w.label}</div></div></Link>
            <div className="text-right"><div className="flex items-center justify-end gap-2 text-[16px] font-medium tnum">{hide ? "****" : assetAmount(num(w.balance))}{tab === "Earn" && <AssetButton aria-label={`Toggle ${w.currency} holdings`} aria-expanded={expanded[w.id] !== false} onClick={() => setExpanded({ ...expanded, [w.id]: expanded[w.id] === false })}><ChevronD size={17}/></AssetButton>}</div>{tab === "Overview" && <div className="mt-1 text-[12px] text-muted tnum">{hide ? "****" : `${assetAmount(num(w.balance))} USDT`}</div>}</div>
          </div>
          {w.unrealized_pnl && tab !== "Earn" && <div className="mt-2 flex flex-wrap justify-between gap-1 pl-9 text-[12px]"><span className="text-muted">Unrealized PNL</span><PnlValue pnl={w.unrealized_pnl} hidden={hide}/></div>}
          {tab === "Earn" && expanded[w.id] !== false && <div className="ml-9 mt-3 border-t border-line pt-3 text-[13px]"><div className="flex justify-between"><span>Flexible</span><span className="tnum">{hide ? "****" : assetAmount(num(w.balance))}</span></div><div className="mt-2 flex justify-between"><span className="text-muted">APR</span><span>{w.apr == null ? "--" : `${w.apr}%`}</span></div><div className="mt-2 flex justify-between gap-2"><span className="text-muted">Cumulative Interest</span>{w.cumulative_interest == null ? <span className="text-muted">--</span> : <PnlValue pnl={{ amount: w.cumulative_interest }} hidden={hide}/>}</div></div>}
          {tab === "Overview" && <div className="mt-2 flex justify-end gap-2 text-[12px]"><AssetButton onClick={() => setTab("Earn")} className="rounded bg-card2 px-5 py-1">Earn</AssetButton><Link href={`/trade?s=${w.currency === "USDT" ? "BTC" : w.currency}`} className="rounded bg-card2 px-5 py-1">Trade</Link></div>}
        </div>)}
      </section>
    </main>
  </Screen>;
}
