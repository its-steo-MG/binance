"use client";
import Link from "next/link";
import { AssetButton } from "./assets-controls";
import { BackI } from "./icons";
import { useRouter } from "next/navigation";
import { eatTimestamp, signedAmount, transactionAmount, transactionKind, transactionStatus, type MessageCategory } from "@/lib/transaction-display";
import type { Tx } from "@/lib/api";

export function MessageIcon({ category }: { category: MessageCategory | "Chat" }) {
  return <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${category === "Marketing & Activities" ? "bg-card2 text-fg" : "bg-brand/10 text-brand"}`}><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {category === "Price Alert" ? <><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5z" fill="currentColor"/><path d="M10 20h4"/></> : category === "Account" ? <><path d="M12 2l8 3v6c0 5-8 10-8 10S4 16 4 11V5z" fill="currentColor"/><rect x="9" y="9" width="6" height="6" stroke="var(--color-bg)"/><path d="M10 9V7a2 2 0 0 1 4 0v2" stroke="var(--color-bg)"/></> : category === "Marketing & Activities" ? <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M7 2v5m10-5v5m-5 7v4m-2-2h4"/></> : category === "Chat" ? <><path d="M4 5h16v12H9l-5 4z"/><path d="M8 9h8m-8 4h5"/></> : <><circle cx="9" cy="14" r="5" fill="currentColor"/><path d="M12 4a6 6 0 0 1 8 8"/><path d="M8 12v4m2-4v4" stroke="var(--color-bg)"/></>}
  </svg></span>;
}
export function MessageHeader({ title, onBack, children }: { title: string; onBack?: () => void; children?: React.ReactNode }) {
  const router = useRouter();
  return <header className="flex min-h-12 items-center justify-between gap-3 px-4 pb-3"><AssetButton aria-label="Back" onClick={onBack || (() => router.back())} className="h-8 w-8 justify-center"><BackI/></AssetButton><h1 className="text-center text-[18px] font-semibold">{title}</h1><div className="flex min-w-8 justify-end">{children}</div></header>;
}
export function TransactionCard({ tx }: { tx: Tx }) {
  const incoming = signedAmount(tx) >= 0;
  const status = transactionStatus(tx);
  return <Link href={`/history/details?id=${tx.id}`} className="block rounded-lg bg-card px-4 py-3">
    <div className="flex items-center justify-between gap-3 text-[14px]"><span className="font-medium">{transactionKind(tx)} Crypto</span><span className={`text-[11px] ${status === "Completed" ? "text-up" : status === "Failed" ? "text-down" : "text-muted"}`}>{status}</span></div>
    <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2"><span className="tnum text-[18px] font-semibold">{transactionAmount(tx)}</span><span className="text-[11px] text-muted">{incoming ? "Received" : "Sent"}</span></div>
    <p className="mt-2 line-clamp-2 break-words text-[12px] text-muted">{tx.description || tx.transaction_type}</p>
    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-dim"><span>{eatTimestamp(tx.created_at)}</span><span className="text-brand">View Details ›</span></div>
  </Link>;
}