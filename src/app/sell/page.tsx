"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/shell";
import { CoinIcon } from "@/components/ui";
import { ChevronD, ChevronR } from "@/components/icons";
import { Dialog, FlowHeader, HistoryLink, Hourglass, Keypad, MpesaLogo, SuccessTick, PasskeyArt, Sheet, SlideConfirm, Warn } from "@/components/flow";
import { api, auth, fmt, num, type Wallet } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { useKesRate } from "@/lib/market";
import { MAX_SELL_KES, MIN_SELL_KES, maskPhone, mobileAccount, normalizeKePhone, pressKey, sellQuote, type MobileAccount } from "@/lib/fiat";

type Step = "amount" | "confirm" | "passkey" | "processing" | "done";

export default function Sell() {
  const r = useRouter();
  const wallets = useApi(() => api.wallets());
  const wallet: Wallet | undefined = wallets.data?.find((w) => w.currency === "USDT") || wallets.data?.[0];
  const balance = num(wallet?.balance);
  const rate = useKesRate() * 0.976; // Binance P2P-style sell spread vs. mid rate
  const [amt, setAmt] = useState("");
  const [step, setStep] = useState<Step>("amount");
  const [acct, setAcct] = useState<MobileAccount | null>(null);
  const [sheet, setSheet] = useState(false);
  const [ask, setAsk] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [expired, setExpired] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { setAcct(mobileAccount.get()); setEmail(auth.profile()?.email || ""); }, []);

  const usdt = num(amt);
  const q = useMemo(() => sellQuote(usdt, rate), [usdt, rate]);
  const tooMuch = usdt > balance;
  const tooLow = usdt > 0 && q.gross < MIN_SELL_KES;
  const tooHigh = q.gross > MAX_SELL_KES;
  const valid = usdt > 0 && !tooMuch && !tooLow && !tooHigh;
  const normPhone = normalizeKePhone(phone);

  const preview = () => { if (!valid) return; if (!acct) { setSheet(true); return; } setExpired(false); setStep("confirm"); };

  const submit = async () => {
    if (!wallet || !acct) return;
    setStep("passkey"); setErr("");
    await new Promise((res) => setTimeout(res, 1400));
    setStep("processing");
    try {
      const started = Date.now();
      await api.sell({ wallet_id: wallet.id, amount: usdt.toFixed(8), phone: acct.phone, email: acct.email, kes_amount: String(q.receive), fee_kes: String(q.fee), rate: rate.toFixed(8) });
      const wait = 20000 - (Date.now() - started); // keep the hourglass visible like the real app
      if (wait > 0) await new Promise((res) => setTimeout(res, wait));
      setStep("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sell failed"); setStep("confirm"); setExpired(true);
    }
  };

  if (step === "passkey") return (
    <Screen nav={false}><FlowHeader onBack={() => setStep("confirm")} />
      <div className="px-6"><h1 className="text-[24px] font-semibold">Verify with passkey</h1><p className="mt-1 text-[13px] text-muted">Your device will ask your fingerprint, face or screen lock.</p>
        <div className="mt-16"><PasskeyArt /></div><p className="mt-4 text-center text-[13px] text-muted"><span className="text-brand">••••</span> Verifying with passkey</p></div>
      <p className="fixed inset-x-0 bottom-8 text-center text-[11px] text-dim">Protected by Binance Risk</p>
    </Screen>);
  if (step === "processing") return (
    <Screen nav={false}><div className="px-6 pt-24 text-center"><Hourglass /><h2 className="mt-5 text-[17px] font-semibold">Processing</h2><p className="mt-2 text-[13px] text-muted">Please wait while we process your transaction. This will take no more than 30 seconds.</p></div></Screen>);
  if (step === "done") return (
    <Screen nav={false}>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col">
        <button onClick={() => r.push("/history?tab=Sell")} className="bn-banner mx-3 mt-3 flex items-center rounded-xl bg-card2 px-4 py-3 text-left">
          <span className="flex-1"><span className="block text-[14px] font-medium">Sell Crypto Successful</span><span className="mt-0.5 block text-[12px] text-muted">Your sell of {fmt(usdt, 8)} USDT is successful.</span></span><ChevronR size={14} />
        </button>
        <div className="px-6 pt-8 text-center">
          <div className="mx-auto w-[84px] [&>svg]:h-[84px] [&>svg]:w-[84px]"><SuccessTick /></div>
          <h2 className="mt-5 text-[17px] font-semibold">Successful</h2>
          <p className="mt-2 text-[26px] font-semibold tnum">{q.receive.toLocaleString("en-US", { useGrouping: false })} KES</p>
          <p className="mt-3 text-[13px] text-muted">Click View details to see order information.</p>
        </div>
        <div className="mt-auto px-4 pb-6">
          <button onClick={() => r.push("/history?tab=Sell")} className="h-12 w-full rounded-full bg-brand font-semibold text-brand-fg">View Details</button>
        </div>
      </div>
    </Screen>);

  if (step === "confirm" && acct) return (
    <Screen nav={false}>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col">
        <FlowHeader title="Confirm Order" onBack={() => setStep("amount")} />
        <div className="px-4 text-center">
          <div className="mt-4 flex items-center justify-center gap-3"><CoinIcon sym="USDT" size={32} /><span className="text-muted">→</span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-up text-[11px] font-bold text-brand-fg">KSh</span></div>
          <h2 className="mt-4 text-[24px] font-semibold">Sell {fmt(usdt, 8)} USDT</h2>
          <p className="mt-1 text-[12px] text-muted">1 USDT = {rate.toFixed(8)} KES</p>
        </div>
        <div className="mt-6 space-y-5 px-4 text-[14px]">
          {[["Receive", `${q.receive.toLocaleString()} KES`], ["Fee", `${q.fee.toLocaleString()} KES`]].map(([a, b]) => <div key={a} className="flex justify-between"><span className="text-muted">{a}</span><span>{b}</span></div>)}
          <div className="flex justify-between"><span className="text-muted">Receive Method</span><span className="flex items-center gap-2"><MpesaLogo size={18} />mPesa(Mobile Money)</span></div>
          <div className="flex justify-between"><span className="text-muted">Est. Arrival Time</span><span>Instant</span></div>
          <div className="flex justify-between pt-2"><span className="text-muted">Mobile Money Account</span><span>MPESA({maskPhone(acct.phone)})</span></div>
          <div className="rounded-lg bg-card px-3 py-3 text-[12px] text-muted">ⓘ Estimated to arrive within 5 minutes.</div>
          {err && <p className="text-[13px] text-down">{err}</p>}
        </div>
        <div className="mt-auto px-4 pb-6">
          <label className="mb-3 flex items-center gap-2 text-[11px] text-muted"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-[var(--color-brand)]" />I have read and agree to the <span className="text-brand">Buy&amp;Sell Crypto Services Terms</span></label>
          {expired ? <button onClick={() => { setExpired(false); setErr(""); }} className="h-12 w-full rounded-lg bg-brand font-semibold text-brand-fg">Refresh</button>
            : <SlideConfirm seconds={15} label="Slide to confirm" expired={expired} disabled={!agree} onExpired={() => setExpired(true)} onConfirm={() => agree && submit()} />}
        </div>
      </div>
    </Screen>);

  return (
    <Screen nav={false}>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col">
        <FlowHeader title="Buy / Sell" onBack={() => r.back()} right={<HistoryLink onClick={() => r.push("/history?tab=Sell")} />} />
        <div className="px-4">
          <div className="rounded-xl bg-card p-4">
            <div className="flex justify-between text-[12px] text-muted"><span>From</span><span className="tnum">{fmt(balance, 8)} USDT</span></div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-semibold"><CoinIcon sym="USDT" size={24} />USDT <ChevronD size={12} /></span>
              <span className={`tnum truncate text-right text-[22px] font-semibold ${amt ? "" : "text-dim text-[14px]"}`}>{amt || `${fmt(MIN_SELL_KES / rate, 2)} - ${fmt(MAX_SELL_KES / rate, 2)}`}</span>
            </div>
            <button onClick={() => setAmt(String(Math.floor(balance * 1e8) / 1e8))} className="mt-1 block w-full text-right text-[12px] text-brand">Max</button>
          </div>
          <div className="relative z-10 -my-3 mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-bg text-muted">⇅</div>
          <div className="rounded-xl bg-card p-4">
            <div className="text-[12px] text-muted">To</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-up text-[9px] font-bold text-brand-fg">KSh</span>KES <ChevronD size={12} /></span>
              <span className={`tnum text-[22px] font-semibold ${usdt ? "" : "text-[14px] text-dim"}`}>{usdt ? q.gross.toLocaleString() : `${MIN_SELL_KES.toLocaleString()} - ${MAX_SELL_KES.toLocaleString()}`}</span>
            </div>
          </div>
          <button onClick={() => setSheet(true)} className="mt-3 flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left">
            <MpesaLogo size={28} /><div className="flex-1"><div className="text-[11px] text-muted">Receive Method</div><div className="text-[14px]">mPesa(Mobile Money){acct ? ` ${maskPhone(acct.phone)}` : ""}</div></div><ChevronR size={14} />
          </button>
          {wallets.error && <p className="mt-3 text-[13px] text-down">{wallets.error}</p>}
          {tooMuch && <p className="mt-3 text-[12px] text-down">Insufficient balance</p>}
          {tooLow && <p className="mt-3 text-[12px] text-down">Minimum is {MIN_SELL_KES.toLocaleString()} KES</p>}
          {tooHigh && <p className="mt-3 text-[12px] text-down">Maximum is {MAX_SELL_KES.toLocaleString()} KES</p>}
        </div>
        <div className="mt-auto pb-4"><Keypad onKey={(k) => setAmt((c) => pressKey(c, k))} />
          <div className="mt-3 px-4"><button disabled={!valid} onClick={preview} className="h-12 w-full rounded-lg bg-brand font-semibold text-brand-fg disabled:opacity-40">Preview Order</button></div>
        </div>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)}>
        <h3 className="text-[17px] font-semibold">Add Mobile Money Account</h3>
        <p className="mt-2 text-[13px] text-muted">Please provide your mobile money account details below to proceed with the transaction.</p>
        <div className="mt-4 text-[12px] text-muted">Choose Mobile Money Account</div>
        <span className="mt-2 inline-flex items-center gap-2 rounded-md border border-fg px-6 py-2 text-[12px] font-semibold"><MpesaLogo size={16} />MPESA</span>
        <div className="mt-4 text-[12px] text-muted">Phone Number</div>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-card2 px-3">
          <span className="text-[14px] text-muted">🇰🇪 +254 ▾</span>
          <input inputMode="tel" autoFocus value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" className="h-11 flex-1 bg-transparent text-[14px] outline-none placeholder:text-dim" />
          {phone && <button aria-label="Clear" onClick={() => setPhone("")} className="text-muted">✕</button>}
        </div>
        {phone && !normPhone && <p className="mt-1 text-[12px] text-down">Enter a valid Kenyan phone number</p>}
        <div className="mt-4 text-[12px] text-muted">Email</div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-11 w-full rounded-lg bg-card2 px-3 text-[14px] outline-none" />
        <button disabled={!normPhone || !email.includes("@")} onClick={() => setAsk(true)} className="mt-5 h-12 w-full rounded-lg bg-brand font-semibold text-brand-fg disabled:opacity-40">Confirm</button>
      </Sheet>

      <Dialog open={ask}>
        <Warn />
        <p className="mt-4 text-[13px]">Please confirm that your funds will be sent to the phone number (+{normPhone}).</p>
        <button onClick={() => { const a = { phone: normPhone!, email }; mobileAccount.save(a); setAcct(a); setAsk(false); setSheet(false); if (valid) { setExpired(false); setStep("confirm"); } }} className="mt-4 h-11 w-full rounded-lg bg-brand font-semibold text-brand-fg">Confirm</button>
        <button onClick={() => setAsk(false)} className="mt-2 h-11 w-full rounded-lg bg-card2 font-semibold">Cancel</button>
      </Dialog>
    </Screen>
  );
}
