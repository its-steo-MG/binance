"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/shell";
import { AppMark, Button, Skel } from "@/components/ui";
import { api, auth } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { accountVerification, profileIdentity } from "@/lib/profile-data";
import { ProfileAvatar, useAccountProfile } from "@/components/profile-avatar";

function Icon({ kind, art = false }: { kind: "copy" | "share" | "settings" | "person" | "gift" | "heart" | "close" | "arrow" | "scan" | "info" | "referral"; art?: boolean }) {
  const paths = { copy: "M9 9h11v11H9z M15 5V3H3v12h2", share: "M7 12l10-6M7 12l10 6 M7 12a2 2 0 1 0-4 0 2 2 0 1 0 4 0 M21 5a2 2 0 1 0-4 0 2 2 0 1 0 4 0 M21 19a2 2 0 1 0-4 0 2 2 0 1 0 4 0", settings: "M12 3l8 4.5v9L12 21l-8-4.5v-9z M15 12a3 3 0 1 0-6 0 3 3 0 1 0 6 0", person: "M15 7a4 4 0 1 0-8 0 4 4 0 1 0 8 0 M3 21v-2a7 7 0 0 1 14 0v2 M20 10v6 M17 13h6", gift: "M3 9h18v4H3z M5 13v8h14v-8 M12 9v12 M12 9C3 9 5 1 9 4z M12 9c9 0 7-8 3-5z", heart: "M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M12 22s-7-4-7-8c0-4 5-5 7-1 2-4 7-3 7 1 0 4-7 8-7 8 M12 11C2 7 0 19 7 22 M12 11c10-4 12 8 5 11", close: "M5 5l14 14 M19 5L5 19", arrow: "M9 5l7 7-7 7", scan: "M3 9V3h6 M15 3h6v6 M21 15v6h-6 M9 21H3v-6 M5 12h14", info: "M12 10v7 M12 7h.01 M22 12a10 10 0 1 0-20 0 10 10 0 1 0 20 0", referral: "M6 2h13v20H6z M8 4h9 M8 20h9 M12 7v10 M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9 M6 13c-8 5-5 8 4 5s17-9 11-10" };
  return <svg aria-hidden="true" className={art ? "profile-art" : ""} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={art ? "0.7" : "1.7"} strokeLinecap="round" strokeLinejoin="round"><path d={paths[kind]} /></svg>;
}

export default function ProfilePage() {
  const home = useApi(() => api.home());
  const { profile } = useAccountProfile();
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState(false);
  const router = useRouter();
  const identity = profileIdentity(home.data, profile);
  const verification = accountVerification(home.data);
  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setNotice(`${label} copied`); }
    catch { setNotice(`Unable to copy ${label.toLowerCase()}.`); }
  }
  return <Screen nav={false} onRefresh={home.reload}>
    <div className="profile-reference">
    <header className="profile-toolbar flex items-center justify-between px-5 pb-4 pt-8">
      <Link href="/" aria-label="Close profile"><Icon kind="close" /></Link>
      <div className="flex items-center gap-5 text-muted">
        <Button aria-label="Referral information" onClick={() => setNotice("Referrals are not available for this account.")}><Icon kind="person" /></Button>
        <Button aria-label="Scan code" onClick={() => setNotice("Code scanning is not available for this account.")}><Icon kind="scan" /></Button>
        <Button aria-label="Account settings" onClick={() => setSettings(true)}><Icon kind="settings" /></Button>
      </div>
    </header>
    <section className="flex items-start gap-5 px-5 pb-5 pt-2">
      <Link href="/profile/account" aria-label="Edit profile photo"><ProfileAvatar profile={profile} large className="profile-avatar" /></Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2"><h1 className="min-w-0 break-words text-[22px] font-semibold leading-tight">{identity.name}</h1><Button aria-label="Share UID" disabled={!identity.uid} className="mt-1 shrink-0 text-muted" onClick={() => copy(identity.uid || "", "UID")}><Icon kind="share" /></Button></div>
        <div className="mt-1 flex items-center gap-1 text-[13px] text-muted">UID: {home.loading && !home.data ? <Skel className="h-4 w-24" /> : <span className="tnum break-all">{identity.uid || "—"}</span>}{identity.uid && <Button aria-label="Copy UID" className="[&_svg]:size-3.5" onClick={() => copy(identity.uid || "", "UID")}><Icon kind="copy" /></Button>}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {home.loading && !home.data ? <Skel className="h-7 w-20" /> : <Link href="/profile/account" aria-label={`Verification: ${verification.label}`} className={`inline-flex min-h-7 items-center rounded-[4px] px-2.5 py-1 text-sm leading-5 ${verification.verified ? "bg-verified-surface text-verified" : "bg-card2 text-muted"}`}>{verification.label}</Link>}
          {verification.tier && <span className="inline-flex min-h-7 items-center rounded-[4px] bg-card2 px-2.5 py-1 text-sm leading-5">{verification.tier}</span>}
          <Link href="/profile/account" aria-label="Open account information" className="ml-auto text-muted"><Icon kind="arrow" /></Link>
        </div>
      </div>
    </section>
    {home.error && <div role="alert" className="mx-4 mb-4 flex items-center justify-between gap-3 text-sm text-down"><span>{home.error}</span><Button onClick={home.reload} className="text-fg">Retry</Button></div>}
    <div className="px-5">
      <div className="flex items-center gap-2 rounded-lg bg-profile-panel px-3 py-3.5">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-brand-fg">B</span>
        <span className="min-w-0 flex-1 text-[15px] font-medium">Binance Support</span>
        <Button className="shrink-0 rounded-[4px] bg-profile-inset px-3 py-2 text-xs" onClick={() => setNotice("No support contact has been configured yet.")}>Get Support</Button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="min-h-[190px] rounded-lg bg-profile-panel p-4"><div className="mb-7 text-brand"><Icon kind="referral" art /></div><h2 className="text-[15px] text-muted">Refer&Earn Together</h2><p className="mt-1 text-[15px] leading-6">No referral rewards available</p></div>
        <div className="relative min-h-[190px] rounded-lg bg-profile-panel p-4"><div className="mb-7 text-brand"><Icon kind="heart" art /></div><h2 className="text-[15px] text-muted">For You</h2><p className="mt-1 text-[15px] leading-6">No offers available</p></div>
      </div>
      <section className="mt-5 bg-profile-panel px-4 py-4">
        <div className="flex items-center justify-between"><h2 className="text-muted">My Tasks</h2><Button aria-label="Task information" className="text-muted" onClick={() => setNotice("No tasks are available for this account.")}><Icon kind="arrow" /></Button></div>
        <p className="mt-3 text-[15px]">No tasks available</p><p className="mt-1 text-xs text-muted">Rewards unavailable</p>
        <div aria-hidden="true" className="mt-4 grid grid-cols-7 gap-1.5">{Array.from({ length: 7 }, (_, i) => <div key={i} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[4px] bg-profile-inset text-dim"><span className="flex size-5 items-center justify-center rounded-full border border-dim text-[11px]">{i === 4 ? <span className="[&_svg]:size-3"><Icon kind="gift" /></span> : i + 1}</span><span className="text-[10px]">—</span></div>)}</div>
        <div className="mt-4 flex items-center gap-3 bg-profile-inset px-3 py-4"><span className="w-9 shrink-0 text-center text-brand">—<span className="block text-[11px]">PTS</span></span><div className="min-w-0 flex-1"><h3 className="text-sm">Daily Convert trading</h3><p className="mt-1 text-xs text-muted">Progress unavailable</p></div><Link href="/trade" className="rounded-[4px] bg-brand px-4 py-2 text-xs font-medium text-brand-fg">Go</Link></div>
        <div className="mt-3 bg-profile-inset px-3 py-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm leading-6">Daily Spot trading rewards</h3><span className="shrink-0 text-muted"><Icon kind="info" /></span></div><p className="mt-3 text-xs text-muted">Progress unavailable</p><div aria-hidden="true" className="relative my-5 h-1 bg-line"><span className="absolute -top-1 left-0 size-3 rounded-full border border-dim bg-profile-inset" /><span className="absolute -top-1 right-0 size-3 rounded-full border border-dim bg-profile-inset" /></div><div className="flex justify-between text-xs text-dim"><span>— USDT</span><span>— PTS</span></div></div>
      </section>
      <div className="mt-5 grid grid-cols-2 gap-4">{[{ title: "Spot Copy", href: "/trade" }, { title: "Futures Copy", href: "/futures" }].map(item => <div key={item.title} className="min-h-[102px] rounded-lg bg-profile-panel p-4"><Button className="w-full justify-between text-left text-sm text-muted" onClick={() => setNotice(`${item.title} is not available for this account.`)}>{item.title}<Icon kind="arrow" /></Button><p className="mt-4 text-xs text-muted">No traders available</p></div>)}</div>
    </div>
    <footer className="mt-8 flex items-center justify-between gap-4 border-t border-line px-5 pb-2 pt-5"><div><div className="flex items-center gap-2 text-brand"><span className="flex size-8 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-brand-fg">B</span><span className="text-xl font-semibold">BINANCE</span></div><p className="mt-2 text-xs leading-5 text-muted">Your Binance account.</p></div><Link href="/history" aria-label="Open transaction history" className="flex size-12 shrink-0 items-center justify-center rounded-[4px] bg-profile-inset text-muted"><Icon kind="arrow" /></Link></footer>
    </div>
    {notice && <div role="status" className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-[448px] items-center justify-between gap-3 rounded-lg border border-line bg-card2 p-4 text-sm"><span>{notice}</span><Button aria-label="Dismiss message" onClick={() => setNotice("")}><Icon kind="close" /></Button></div>}
    {settings && <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 px-4"><div role="dialog" aria-modal="true" aria-labelledby="settings-title" className="w-full max-w-sm rounded-lg border border-line bg-card p-5"><div className="flex items-center justify-between"><h2 id="settings-title" className="font-semibold">Account settings</h2><Button aria-label="Close settings" onClick={() => setSettings(false)}><Icon kind="close" /></Button></div><p className="my-4 break-all text-sm text-muted">{identity.email || identity.name}</p><Link href="/profile/account" className="flex items-center justify-between border-b border-line py-3 text-sm">Account information<Icon kind="arrow" /></Link><section className="py-4"><h3 className="mb-2 text-sm font-medium">Wallet details</h3><p className="text-xs text-muted">{identity.network || "Network unavailable"}</p><div className="mt-2 flex items-start gap-3"><p className="min-w-0 flex-1 break-all text-xs">{identity.address || "Address unavailable"}</p>{identity.address && <Button aria-label="Copy wallet address" className="shrink-0 text-muted" onClick={() => copy(identity.address || "", "Address")}><Icon kind="copy" /></Button>}</div></section><Button className="w-full rounded-md bg-card2 py-3 text-down" onClick={() => { auth.clear(); router.replace("/login"); }}>Log out</Button></div></div>}
  </Screen>;
}