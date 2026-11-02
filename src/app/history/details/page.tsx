"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Screen } from "@/components/shell";
import { AssetButton } from "@/components/assets-controls";
import { MessageHeader } from "@/components/transaction-ui";
import { Skel } from "@/components/ui";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { eatTimestamp, signedAmount, transactionAmount, transactionStatus } from "@/lib/transaction-display";
function Details() {
  const params = useSearchParams(); const id = Number(params.get("id"));
  const transactions = useApi(() => api.transactions());
  const tx = transactions.data?.find(t => t.id === id);
  const [copyState, setCopyState] = useState("");
  const status = tx ? transactionStatus(tx) : "Recorded";
  const reference = tx?.order_id || tx?.reference;
  return <Screen nav={false} onRefresh={transactions.reload}><MessageHeader title="Payment Details"/>
    {transactions.loading && !transactions.data ? <div className="px-4"><Skel className="mt-8 h-40"/></div> : transactions.error ? <p role="alert" className="px-4 py-8 text-down">{transactions.error}</p> : !tx ? <p className="py-16 text-center text-muted">Transaction not found</p> : <main className="px-4">
      <section className="pt-5 text-center"><p className="text-[13px] text-muted">Amount</p><h2 className="tnum mt-4 break-words text-[29px] font-semibold">{transactionAmount(tx)}</h2><p className={`mt-3 flex items-center justify-center gap-2 text-[16px] ${status === "Completed" ? "text-up" : status === "Failed" ? "text-down" : "text-muted"}`}>{status === "Completed" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m6 12 4 4 8-8"/></svg>}{status}</p><p className="mt-4 text-[13px] text-muted">{status === "Completed" ? signedAmount(tx) >= 0 ? "Crypto has been sent to your account" : "Crypto has been sent from your account" : "Wallet transaction"}</p></section>
      <dl className="mt-14 space-y-6 text-[14px]">{[[signedAmount(tx) >= 0 ? "From" : "To", signedAmount(tx) >= 0 ? tx.sender : tx.recipient], ["Note", tx.note], ["Time", eatTimestamp(tx.created_at)]].map(([label, value]) => <div key={label} className="flex justify-between gap-6"><dt className="text-muted">{label}</dt><dd className="max-w-[72%] break-words text-right">{value || "—"}</dd></div>)}
        <div className="flex justify-between gap-4"><dt className="shrink-0 text-muted">{tx.order_id ? "Order ID" : "Reference"}</dt><dd className="flex min-w-0 items-start justify-end gap-2"><span className="break-all text-right">{reference || "—"}</span>{reference && <AssetButton aria-label="Copy reference" className="shrink-0 text-muted" onClick={async () => { try { await navigator.clipboard.writeText(reference); setCopyState("Copied"); } catch { setCopyState("Could not copy"); } }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="14" height="14"/><path d="M7 3h14v14"/></svg></AssetButton>}</dd></div>
      </dl><p role="status" className="mt-3 text-right text-[12px] text-brand">{copyState}</p>{tx.description && <p className="mt-8 break-words border-t border-line pt-4 text-[13px] text-muted">{tx.description}</p>}
    </main>}
  </Screen>;
}
export default function PaymentDetails() { return <Suspense><Details/></Suspense>; }