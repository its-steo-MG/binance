"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Screen } from "@/components/shell";
import { FlowHeader } from "@/components/flow";

const Ico = ({ d }: { d: ReactNode }) => <span className="flex h-10 w-10 shrink-0 items-center justify-center">{d}</span>;
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const withdraw = [
  { t: "Withdraw Asset", s: "Withdraw Crypto from Binance to other exchanges/wallets", h: "/send/address",
    i: <svg width="30" height="30" viewBox="0 0 30 30" {...stroke}><rect x="4" y="9" width="22" height="16" rx="2" /><path d="M15 3v10M11 7l4-4 4 4" stroke="var(--color-brand)" /><circle cx="20" cy="17" r="2" /></svg> },
  { t: "Send to Binance users", s: "Binance internal transfer, send via Email/Phone/ID", h: "/send/address",
    i: <svg width="30" height="30" viewBox="0 0 30 30" {...stroke}><path d="M4 22l7-4h8a2 2 0 0 0 0-4h-5" /><path d="M4 26h18l6-6" /><circle cx="21" cy="8" r="4" stroke="var(--color-brand)" /></svg> },
  { t: "Withdraw to Binance Wallet", s: "Withdraw your asset to your Binance wallet", h: "/send/address",
    i: <svg width="30" height="30" viewBox="0 0 30 30" {...stroke}><rect x="4" y="8" width="22" height="17" rx="2" /><path d="M4 13h22" /><path d="M15 3v7" stroke="var(--color-brand)" /></svg> },
];

export default function SelectMethod() {
  const r = useRouter();
  const Row = ({ t, s, h, i }: { t: string; s: string; h: string; i: ReactNode }) => (
    <Link href={h} className="mb-3 flex items-center gap-3 rounded-xl bg-card px-4 py-4">
      <Ico d={i} /><div><div className="text-[15px] font-medium">{t}</div><div className="mt-[2px] text-[12px] text-dim">{s}</div></div>
    </Link>
  );
  return (
    <Screen nav={false}>
      <FlowHeader title="Select Method" onBack={() => r.back()} />
      <div className="px-4">
        <div className="mb-3 mt-3 text-[13px] text-muted">Withdraw to Wallet</div>
        {withdraw.map((w) => <Row key={w.t} {...w} />)}
        <div className="mb-3 mt-6 text-[13px] text-muted">Sell Crypto</div>
        <Row t="Sell to KES" s="Sell crypto easily to your account" h="/sell"
          i={<svg width="30" height="30" viewBox="0 0 30 30" {...stroke}><rect x="3" y="8" width="24" height="15" rx="2" /><circle cx="15" cy="15.5" r="3.5" stroke="var(--color-brand)" /><path d="M7 12v7M23 12v7" /></svg>} />
      </div>
    </Screen>
  );
}
