"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Screen } from "@/components/shell";
import { api, fmt, num } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { BackI, ScanI, ChevronR } from "@/components/icons";

export default function Send() {
  const r = useRouter(); const [addr, setAddr] = useState(""); const [msg, setMsg] = useState("");
  const tx = useApi(() => api.transactions());
  const recent = (tx.data || []).filter((t) => num(t.amount) < 0 || t.transaction_type === "withdrawal").slice(0, 5);
  return (
    <Screen nav={false}>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col">
        <div className="flex items-center px-4 py-2"><button onClick={() => r.back()}><BackI /></button><h1 className="flex-1 text-center text-[17px] font-semibold">Enter address</h1><ScanI /></div>
        <div className="px-4">
          <span className="mt-4 inline-block rounded bg-card2 px-2 py-1 text-[11px] text-muted">Select Network</span>
          <textarea value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Address" rows={2} className="mt-6 w-full resize-none bg-transparent text-[34px] font-medium outline-none placeholder:text-dim" />
          <div className="flex gap-2 text-[12px]"><span className="rounded border border-line px-2 py-1">Address book</span><button onClick={async () => setAddr((await navigator.clipboard?.readText?.()) || addr)} className="rounded border border-line px-2 py-1">Paste</button><span className="rounded border border-line px-2 py-1">Scan</span></div>
          {recent.length > 0 && <div className="mt-10"><div className="flex justify-between text-[14px] font-semibold">Recent Withdrawals <ChevronR size={14} /></div>
            {recent.map((t) => <div key={t.id} className="mt-3"><div className="break-all text-[13px]">{t.description}</div><div className="text-[11px] text-dim">{fmt(Math.abs(num(t.amount)))} USDT · {t.reference}</div></div>)}</div>}
          {msg && <p className="mt-4 text-[13px] text-brand">{msg}</p>}
        </div>
        <div className="mt-auto px-4 pb-6"><button disabled={addr.length < 10} onClick={() => setMsg("Withdrawals are processed by support for this account.")} className="h-12 w-full rounded-lg bg-brand font-semibold text-brand-fg disabled:opacity-40">Next</button></div>
      </div>
    </Screen>
  );
}
