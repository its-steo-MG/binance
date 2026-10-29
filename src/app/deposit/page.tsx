"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Screen } from "@/components/shell";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { CoinIcon, Skel } from "@/components/ui";
import { BackI, CopyI } from "@/components/icons";

export default function Deposit() {
  const r = useRouter(); const w = useApi(() => api.wallets()); const [copied, setCopied] = useState(false);
  const wallet = w.data?.find((x) => x.is_primary) || w.data?.[0];
  return (
    <Screen nav={false}>
      <div className="flex items-center px-4 py-2"><button onClick={() => r.back()}><BackI /></button><h1 className="flex-1 text-center text-[17px] font-semibold">Deposit {wallet?.currency || "USDT"}</h1><span className="w-6" /></div>
      <div className="px-4">
        {w.loading && <Skel className="mt-6 h-64" />}
        {w.error && <p className="mt-6 text-[13px] text-down">{w.error}</p>}
        {w.data && !wallet && <p className="mt-10 text-center text-muted">No wallet found on your account.</p>}
        {wallet && (<>
          <div className="mx-auto mt-6 flex h-52 w-52 items-center justify-center rounded-xl bg-white p-3">
            <img alt="Deposit QR" className="h-full w-full" src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(wallet.address)}`} />
          </div>
          <div className="mt-6 rounded-xl bg-card p-4">
            <div className="flex items-center gap-2"><CoinIcon sym={wallet.currency} size={22} /><span className="font-semibold">{wallet.currency}</span></div>
            <div className="mt-4 text-[12px] text-muted">Network</div><div className="text-[15px]">{wallet.network}</div>
            <div className="mt-4 text-[12px] text-muted">Deposit Address</div>
            <div className="mt-1 flex items-start justify-between gap-3"><span className="break-all text-[15px]">{wallet.address}</span>
              <button onClick={() => { navigator.clipboard?.writeText(wallet.address); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-muted"><CopyI size={18} /></button></div>
            {copied && <p className="mt-2 text-[12px] text-up">Address copied</p>}
          </div>
          <p className="mt-4 text-[12px] text-muted">Send only {wallet.currency} via {wallet.network} to this address. Other assets will be lost.</p>
        </>)}
      </div>
    </Screen>
  );
}
