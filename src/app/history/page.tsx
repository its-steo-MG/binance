"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Screen } from "@/components/shell";
import { MessageHeader, TransactionCard } from "@/components/transaction-ui";
import { AssetButton } from "@/components/assets-controls";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { Skel } from "@/components/ui";
import { newestFirst, transactionKind } from "@/lib/transaction-display";
const TABS = ["All", "Deposits", "Withdrawals", "Buy", "Sell"];
const TYPE_LABELS: Record<string, string> = { Deposits: "Deposit", Withdrawals: "Withdrawal" };
function Inner() {
  const params = useSearchParams(); const wid = Number(params.get("wallet")) || undefined;
  const initialTab = params.get("tab") || "All";
  const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : "All");
  const tx = useApi(() => api.transactions(wid), [wid]);
  const rows = newestFirst(tx.data || []).filter(t => tab === "All" || transactionKind(t) === (TYPE_LABELS[tab] || tab));
  return <Screen nav={false} onRefresh={tx.reload}><MessageHeader title="Transaction History"/><div className="px-4"><div role="tablist" aria-label="Transaction types" className="no-scrollbar mb-6 flex gap-4 overflow-x-auto border-b border-line">{TABS.map(name => <AssetButton key={name} role="tab" aria-selected={tab === name} onClick={() => setTab(name)} className={`shrink-0 pb-3 text-[13px] ${tab === name ? "border-b-2 border-brand text-fg" : "text-muted"}`}>{name}</AssetButton>)}</div>
  {tx.loading && !tx.data && [1, 2, 3].map(i => <Skel key={i} className="my-4 h-24"/>)}{tx.error && <p role="alert" className="text-down">{tx.error}</p>}{tx.data && rows.length === 0 && <p className="py-16 text-center text-[13px] text-dim">No records</p>}<div className="space-y-4">{rows.map(t => <TransactionCard key={t.id} tx={t}/>)}</div></div></Screen>;
}
export default function History() { return <Suspense><Inner/></Suspense>; }
