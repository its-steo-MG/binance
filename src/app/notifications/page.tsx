"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Screen } from "@/components/shell";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { Skel, Tabs } from "@/components/ui";
import { BackI } from "@/components/icons";

export default function Notifications() {
  const r = useRouter(); const n = useApi(() => api.notifications()); const [tab, setTab] = useState("Chat"); const [unread, setUnread] = useState(false); const [open, setOpen] = useState<number | null>(null);
  const items = (n.data || []).filter((x) => !unread || !x.is_read);
  return (
    <Screen nav={false} onRefresh={() => n.reload()}>
      <div className="flex items-center px-4 py-2"><button onClick={() => r.back()}><BackI /></button><h1 className="flex-1 text-center text-[17px] font-semibold">Message</h1><span className="w-6" /></div>
      <div className="px-4">
        <Tabs size="sm" items={["Chat", "Square", "Notifications"]} value={tab} onChange={setTab} />
        <div className="mt-2 flex gap-2 text-[11px]"><button onClick={() => setUnread(false)} className={`rounded-full px-3 py-1 ${!unread ? "bg-brand/20 text-brand" : "bg-card2 text-muted"}`}>All</button><button onClick={() => setUnread(true)} className={`rounded-full px-3 py-1 ${unread ? "bg-brand/20 text-brand" : "bg-card2 text-muted"}`}>Unread</button></div>
        {n.loading && !n.data && [1, 2, 3].map((i) => <Skel key={i} className="my-4 h-16" />)}
        {n.error && <p className="mt-4 text-[13px] text-down">{n.error}</p>}
        {n.data && items.length === 0 && <p className="py-16 text-center text-[13px] text-dim">No notifications</p>}
        {items.map((x) => (
          <button key={x.id} onClick={async () => { setOpen(open === x.id ? null : x.id); if (!x.is_read) { await api.markRead(x.id).catch(() => {}); n.reload(); } }} className="block w-full py-3 text-left">
            <div className="flex items-center gap-2">{!x.is_read && <span className="h-2 w-2 rounded-full bg-brand" />}<span className="text-[14px] font-medium">{x.title}</span></div>
            <p className={`mt-1 whitespace-pre-line text-[13px] text-muted ${open === x.id ? "" : "line-clamp-2"}`}>{x.body}</p>
            <div className="mt-1 text-[11px] text-dim">{new Date(x.created_at).toLocaleDateString("en-KE", { timeZone: "Africa/Nairobi", month: "2-digit", day: "2-digit" })}</div>
          </button>
        ))}
      </div>
    </Screen>
  );
}
