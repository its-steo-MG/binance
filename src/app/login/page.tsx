"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, auth } from "@/lib/api";
import { BinanceMark, EyeI, EyeOffI, CloseI } from "@/components/icons";

export default function Login() {
  const router = useRouter();
  const [splash, setSplash] = useState(false);
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [show, setShow] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    // Splash only when launched from the installed app icon, once per launch.
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    if (standalone && !sessionStorage.getItem("bn_splash")) { sessionStorage.setItem("bn_splash", "1"); setSplash(true); setTimeout(() => setSplash(false), 1800); }
    auth.clear();
    const prev = localStorage.getItem("bn_last_user"); if (prev) setU(prev);
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await api.login(u.trim(), p); localStorage.setItem("bn_last_user", u.trim()); router.replace("/"); }
    catch (x) { setErr((x as Error).message || "Login failed"); } finally { setBusy(false); }
  }
  if (splash) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-bg">
      <div className="splash-logo flex flex-col items-center gap-3"><BinanceMark size={64} /><span className="text-[30px] font-bold tracking-[0.12em] text-brand">BINANCE</span></div>
    </div>
  );
  return (
    <div className="safe-top mx-auto flex min-h-dvh max-w-[480px] flex-col bg-bg px-5">
      <div className="flex justify-between py-3"><CloseI className="text-muted" /></div>
      <div className="mt-6 flex items-center gap-2"><BinanceMark size={30} /><span className="text-[20px] font-bold tracking-[0.1em] text-brand">BINANCE</span></div>
      <h1 className="mt-8 text-[28px] font-semibold">Log in</h1>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="text-[14px] text-muted">Email / Phone Number / Username
          <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" className="mt-2 h-12 w-full rounded-lg border border-line bg-transparent px-3 text-[15px] text-fg outline-none focus:border-brand" placeholder="Email / Phone (without country code)" />
        </label>
        <label className="text-[14px] text-muted">Password
          <div className="relative mt-2">
            <input value={p} onChange={(e) => setP(e.target.value)} type={show ? "text" : "password"} autoComplete="current-password" className="h-12 w-full rounded-lg border border-line bg-transparent px-3 pr-11 text-[15px] text-fg outline-none focus:border-brand" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-muted">{show ? <EyeI /> : <EyeOffI />}</button>
          </div>
        </label>
        {err && <p className="text-[13px] text-down">{err}</p>}
        <button disabled={busy || !u || !p} className="mt-2 h-12 rounded-lg bg-brand text-[16px] font-semibold text-brand-fg disabled:opacity-50">{busy ? "Logging in..." : "Log In"}</button>
        <button type="button" className="text-left text-[14px] text-brand">Forgot password?</button>
      </form>
      <div className="mt-auto pb-10 text-center text-[14px] text-muted">Don&apos;t have an account? <span className="text-brand">Sign up</span></div>
    </div>
  );
}
