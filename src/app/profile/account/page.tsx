"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/shell";
import { Button } from "@/components/ui";
import { ProfileAvatar, useAccountProfile } from "@/components/profile-avatar";
import { api, auth } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { accountVerification, avatarError, profileIdentity } from "@/lib/profile-data";

function Glyph({ kind }: { kind: "back" | "edit" | "copy" | "eye" | "person" | "shield" | "link" | "arrow" }) {
  const paths = { back: "M20 12H4m6-6-6 6 6 6", edit: "m4 16 12-12 4 4L8 20H4z M14 6l4 4", copy: "M8 8h12v12H8z M16 4H4v12", eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M14 12a2 2 0 1 0-4 0 2 2 0 1 0 4 0", person: "M16 6a4 4 0 1 0-8 0 4 4 0 1 0 8 0 M4 21v-2a8 8 0 0 1 16 0v2", shield: "M12 2l9 4v8c0 5-9 8-9 8s-9-3-9-8V6z M9 10h6v6H9z M10 10V8a2 2 0 0 1 4 0v2", link: "m10 14 4-4 M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0 M16 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0", arrow: "m9 5 7 7-7 7" };
  return <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[kind]} /></svg>;
}
export default function AccountInfo() {
  const { profile, error, setProfile } = useAccountProfile();
  const home = useApi(() => api.home());
  const identity = profileIdentity(home.data, profile);
  const verification = accountVerification(home.data);
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const router = useRouter();
  useEffect(() => { if (!file) { setPreview(null); return; } const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  async function save() {
    if (!file) return;
    setSaving(true); setNotice("");
    try { const p = await api.uploadAvatar(file); if (!p.avatar_url) throw new Error("No saved photo returned"); auth.saveProfile(p); setProfile(p); setFile(null); setNotice("Profile photo saved."); }
    catch { setNotice("Photo was not saved. Check that your server supports profile-photo uploads."); }
    finally { setSaving(false); }
  }
  return <Screen nav={false}>
    <div className="flex min-h-[calc(100dvh-40px)] flex-col px-4">
      <header className="mb-6 grid grid-cols-[32px_1fr_32px] items-center py-3"><Link href="/profile" aria-label="Back to profile"><Glyph kind="back" /></Link><h1 className="text-center text-xl font-semibold">Account Info</h1><span className="text-muted"><Glyph kind="person" /></span></header>
      <section className="relative rounded-lg border border-line p-4">
        {verification.tier && <span className="absolute right-0 top-0 rounded-bl-lg bg-card2 px-2 py-1 text-xs">{verification.tier}</span>}
        <div className="flex items-center gap-3">
          <Button aria-label="Change profile photo" disabled={saving} onClick={() => input.current?.click()} className="relative shrink-0">
            <ProfileAvatar profile={preview ? { name: identity.name, username: profile?.username || "", email: identity.email, avatar_url: preview } : profile} large />
            <span className="absolute bottom-0 right-0 rounded-full bg-card2 p-1"><Glyph kind="edit" /></span>
          </Button>
          <h2 className="min-w-0 break-words text-xl font-semibold">{identity.name}</h2>
        </div>
        <input ref={input} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Select profile photo" onChange={e => { const selected = e.target.files?.[0]; e.target.value = ""; if (!selected) return; const invalid = avatarError(selected); setNotice(invalid || ""); if (!invalid) setFile(selected); }} />
        <div className="mt-5 flex items-center justify-between gap-3 text-sm"><span className="shrink-0 text-muted">Account ID (UID)</span><div className="flex min-w-0 items-center gap-2"><span className="tnum break-all">{identity.uid || "—"}</span><Button aria-label="Copy UID" disabled={!identity.uid} className="shrink-0 text-muted" onClick={async () => { try { await navigator.clipboard.writeText(identity.uid || ""); setNotice("UID copied."); } catch { setNotice("Unable to copy UID."); } }}><Glyph kind="copy" /></Button></div></div>
        <div className="mt-5 flex items-center justify-between gap-3 text-sm"><span className="shrink-0 text-muted">Reg. Info</span><div className="flex min-w-0 items-center gap-2"><span className="break-all text-right">{identity.email ? showEmail ? identity.email : "••••••••" : "—"}</span><Button aria-label={showEmail ? "Hide email" : "Show email"} className="shrink-0 text-muted" onClick={() => setShowEmail(v => !v)}><Glyph kind="eye" /></Button></div></div>
      </section>
      {file && <div className="mt-4 flex gap-3"><Button className="flex-1 rounded-md bg-brand py-3 text-sm font-semibold text-brand-fg" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save photo"}</Button><Button className="rounded-md bg-card2 px-4 text-sm" disabled={saving} onClick={() => setFile(null)}>Cancel</Button></div>}
      {error && <p className="mt-4 text-sm text-muted">{error}</p>}
      {notice && <p role="status" className="mt-4 text-sm text-muted">{notice}</p>}
      <div className="mt-4">
        <Button className="w-full justify-between py-5 text-left" onClick={() => setNotice(verification.verified ? "Your primary wallet is verified." : verification.label === "Unverified" ? "Your primary wallet is not verified. Contact support to request verification." : "Verification status is unavailable. Try refreshing your account.")}><span className="flex items-center gap-3"><Glyph kind="person" />Verification Center</span><span className={`flex items-center gap-2 text-sm ${verification.verified ? "text-verified" : "text-muted"}`}>{verification.label}<Glyph kind="arrow" /></span></Button>
        <Button className="w-full justify-between py-5" onClick={() => setNotice("Security settings are not available from your server yet.")}><span className="flex items-center gap-3"><Glyph kind="shield" />Security</span><Glyph kind="arrow" /></Button>
        <Button className="w-full justify-between py-5" onClick={() => setNotice("Social account linking is not configured.")}><span className="flex items-center gap-3"><Glyph kind="link" />Link Social Account</span><Glyph kind="arrow" /></Button>
      </div>
      <div className="mt-auto pt-12"><Button className="w-full rounded-lg bg-card2 py-4 text-lg" onClick={() => { auth.clear(); router.replace("/login"); }}>Log Out</Button></div>
    </div>
  </Screen>;
}