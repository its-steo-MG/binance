"use client";
import { useState } from "react";
import { PushControls } from "@/components/push-controls";
import { Screen } from "@/components/shell";
import { AssetButton } from "@/components/assets-controls";
import { MessageHeader, MessageIcon, TransactionCard } from "@/components/transaction-ui";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { Skel } from "@/components/ui";
import { MESSAGE_CATEGORIES, notificationCategory, newestFirst, eatTimestamp, type MessageCategory } from "@/lib/transaction-display";

export default function Notifications() {
  const notifications = useApi(() => api.notifications()); const transactions = useApi(() => api.transactions());
  const [tab, setTab] = useState("Chat"); const [unread, setUnread] = useState(false);
  const [category, setCategory] = useState<MessageCategory | null>(null); const [chatOpen, setChatOpen] = useState(false);
  const [squareTab, setSquareTab] = useState("All"); const [open, setOpen] = useState<number | null>(null);
  const [readIds, setReadIds] = useState<number[]>([]); const [notice, setNotice] = useState("");
  const ns = newestFirst(notifications.data || []).map(n => ({ ...n, is_read: n.is_read || readIds.includes(n.id) }));
  const txs = newestFirst(transactions.data || []);
  const markRead = async (id: number) => { try { await api.markRead(id); setReadIds(ids => [...ids, id]); } catch { setNotice("Could not mark message as read."); } };
  const groups = category ? ns.filter(n => notificationCategory(n) === category) : [];
  const shown = groups.filter(n => !unread || !n.is_read);
  const refresh = async () => { await Promise.all([notifications.reload(), transactions.reload()]); };
  return <Screen nav={false} onRefresh={refresh}>
    <MessageHeader title={chatOpen ? "Transaction" : category || "Message"} onBack={chatOpen ? () => setChatOpen(false) : category ? () => setCategory(null) : undefined}>
      {!category && !chatOpen && <AssetButton aria-label="Mark all notifications read" title="Mark all notifications read" onClick={async () => { await Promise.all(ns.filter(n => !n.is_read).map(n => markRead(n.id))); }} className="h-8 w-8 justify-center text-muted"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10 3h4v10h4v8H5l4-8h1zM7 17h10"/></svg></AssetButton>}
    </MessageHeader>
    {!category && !chatOpen && <div role="tablist" aria-label="Message sections" className="flex gap-5 border-b border-line px-4 text-[17px]">{["Chat", "Square", "Notifications"].map(name => <AssetButton key={name} role="tab" aria-selected={tab === name} onClick={() => { setTab(name); setUnread(false); }} className={`relative pb-3 ${tab === name ? "text-fg after:absolute after:bottom-0 after:left-1/3 after:h-[3px] after:w-4 after:bg-brand" : "text-muted"}`}>{name}{name === "Notifications" && ns.some(n => !n.is_read) && <span className="absolute -right-2 top-0 h-1.5 w-1.5 rounded-full bg-brand"/>}</AssetButton>)}</div>}
    {!category && !chatOpen && tab === "Notifications" && <PushControls/>}
    {(category || (!chatOpen && tab === "Chat")) && <div className="flex gap-2 px-4 py-3 text-[13px]">{[false, true].map(value => <AssetButton key={String(value)} onClick={() => setUnread(value)} className={`rounded-full border px-3 py-1.5 ${unread === value ? "border-brand bg-brand/10 text-brand" : "border-card2 bg-card2 text-muted"}`}>{value ? "Unread" : "All"}</AssetButton>)}</div>}
    {notice && <p role="alert" className="px-4 py-2 text-[12px] text-down">{notice}</p>}
    {!chatOpen && !category && tab === "Chat" && <div className="px-4">
      {transactions.loading && !transactions.data ? <Skel className="my-4 h-20"/> : transactions.error ? <p className="py-8 text-down">{transactions.error}</p> : txs.length > 0 && !unread ? <AssetButton onClick={() => setChatOpen(true)} className="flex w-full gap-4 py-4 text-left"><MessageIcon category="Chat"/><span className="min-w-0 flex-1 border-b border-line pb-5"><span className="flex justify-between gap-2"><span className="text-[16px] font-medium">Transaction</span><span className="text-[11px] text-dim">{eatTimestamp(txs[0].created_at).slice(5, 10).replace('-', '/')}</span></span><span className="mt-1 block truncate text-[14px] text-muted">{txs[0].description || txs[0].transaction_type}</span></span></AssetButton> : <p className="py-16 text-center text-[13px] text-dim">{unread ? "No unread messages" : "No transaction messages"}</p>}
    </div>}
    {chatOpen && <div className="space-y-5 px-4 pt-6">{txs.map(tx => <div key={tx.id}><p className="mb-2 text-center text-[11px] text-dim">{eatTimestamp(tx.created_at)}</p><TransactionCard tx={tx}/></div>)}</div>}
    {!chatOpen && !category && tab === "Square" && <><div className="flex gap-5 border-b border-line px-4 py-4 text-[13px]">{["All", "Replies & Mentions", "Assistant"].map(name => <AssetButton key={name} onClick={() => setSquareTab(name)} className={squareTab === name ? "rounded bg-card2 px-2 py-1 text-fg" : "text-muted"}>{name}</AssetButton>)}</div><p className="py-16 text-center text-[13px] text-dim">No messages</p></>}
    {!chatOpen && !category && tab === "Notifications" && <div className="px-4">{notifications.loading && !notifications.data ? [1, 2, 3].map(i => <Skel key={i} className="my-4 h-16"/>) : notifications.error ? <p className="py-8 text-down">{notifications.error}</p> : MESSAGE_CATEGORIES.map(name => {
      const rows = ns.filter(n => notificationCategory(n) === name); const latest = rows[0]; const count = rows.filter(n => !n.is_read).length;
      return <AssetButton key={name} onClick={() => { setCategory(name); setUnread(false); }} className="flex w-full gap-4 py-4 text-left"><span className="relative"><MessageIcon category={name}/>{count > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] text-brand-fg">{count}</span>}</span><span className="min-w-0 flex-1 border-b border-line pb-5"><span className="flex items-center justify-between gap-2"><span className="text-[16px] font-medium">{name}</span><span className="text-[11px] text-dim">{latest ? eatTimestamp(latest.created_at).slice(5, 10).replace('-', '/') : ""}</span></span><span className="mt-1 block truncate text-[14px] text-muted">{latest?.title || "No notifications"}</span></span></AssetButton>;
    })}</div>}
    {category && <div className="space-y-5 px-4 pt-3">{shown.length === 0 && <p className="py-16 text-center text-[13px] text-dim">No notifications</p>}{shown.map(n => <div key={n.id} className="flex items-start gap-3"><MessageIcon category={category}/><div className="min-w-0 flex-1"><AssetButton onClick={() => { setOpen(open === n.id ? null : n.id); if (!n.is_read) void markRead(n.id); }} aria-expanded={open === n.id} className="block w-full rounded-lg bg-card p-4 text-left"><span className="text-[14px] font-medium">{n.title}</span><p className={`mt-2 whitespace-pre-line break-words text-[13px] text-muted ${open === n.id ? "" : "line-clamp-2"}`}>{n.body}</p></AssetButton><p className="px-3 pt-2 text-[11px] text-dim">{eatTimestamp(n.created_at)}</p></div></div>)}</div>}
  </Screen>;
}
