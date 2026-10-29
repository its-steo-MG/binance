"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Screen } from "@/components/shell";
import { api, fmt, num } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { Skel } from "@/components/ui";
import { BackI } from "@/components/icons";

const LABEL: Record<string, string> = { credit: "Deposit", deposit: "Deposit", withdrawal_credit: "Deposit", debit: "Withdrawal", withdrawal: "Withdrawal", admin_adjustment: "Adjustment" };
function Inner() {
  const r = useRouter(); const wid = Number(useSearchParams().get("wallet")) || undefined;
  const tx = useApi(() => api.transactions(wid), [wid]);
  return (
    <Screen nav={false} onRefresh={() => tx.reload()}>
      <div className="flex items-center px-4 py-2"><button onClick={() => r.back()}><BackI /></button><h1 className="flex-1 text-center text-[17px] font-semibold">Transaction History</h1><span className="w-6" /></div>
      <div className="px-4">
        {tx.loading && !tx.data && [1, 2, 3, 4].map((i) => <Skel key={i} className="my-4 h-12" />)}
        {tx.error && <p className="mt-4 text-[13px] text-down">{tx.error}</p>}
        {tx.data?.length === 0 && <p className="py-16 text-center text-[13px] text-dim">No records</p>}
        {tx.data?.map((t) => { const a = num(t.amount); return (
          <div key={t.id} className="border-b border-line py-4">
            <div className="flex justify-between"><span className="text-[15px] font-medium">{LABEL[t.transaction_type] || t.transaction_type}</span><span className={`tnum text-[15px] font-medium ${a >= 0 ? "text-up" : "text-down"}`}>{a >= 0 ? "+" : ""}{fmt(a, 2)} USDT</span></div>
            <div className="mt-1 flex justify-between text-[12px] text-dim"><span>{new Date(t.created_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</span><span className="text-up">Completed</span></div>
            <div className="mt-1 text-[12px] text-muted">{t.description}</div>
            <div className="text-[11px] text-dim">Ref {t.reference} · Bal {fmt(num(t.balance_after), 2)}</div>
          </div>); })}
      </div>
    </Screen>
  );
}
export default function History() { return <Suspense><Inner /></Suspense>; }
