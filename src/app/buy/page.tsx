"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/shell";
import { ChevronD } from "@/components/icons";
import { FlowHeader, HistoryLink, Hourglass, Keypad, MpesaLogo, SuccessTick } from "@/components/flow";
import { api, fmt, num } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { useKesRate } from "@/lib/market";
import { MIN_BUY_KES, buyQuantity, maskPhone, mobileAccount, pressKey, type MobileAccount } from "@/lib/fiat";

type Step = "amount" | "method" | "processing" | "done";
const METHODS = [
  { id: "mpesa", label: "mPesa(Mobile Money)", group: "card", k: 1 },
  { id: "applepay", label: "Apple Pay", group: "card", k: 1.03 },
] as const;

export default function Buy() {
  const r = useRouter();
  const wallets = useApi(() => api.wallets());
  const wallet = wallets.data?.find((w) => w.currency === "USDT") || wallets.data?.[0];
  const base = useKesRate() * 1.04; // buy spread above mid rate
  const [rate, setRate] = useState(base);
  useEffect(() => setRate(base), [base]);
  const [kes, setKes] = useState("");
  const [step, setStep] = useState<Step>("amount");
  const [method, setMethod] = useState<string>("mpesa");
  const [acct, setAcct] = useState<MobileAccount | null>(null);
  const [got, setGot] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => setAcct(mobileAccount.get()), []);
  const k = num(kes);
  const qty = (m = 1) => buyQuantity(k, rate * m);
  const valid = k >= MIN_BUY_KES;

  const pay = async () => {
    if (!wallet) return;
    if (method === "mpesa" && !acct) { setErr("Add your M-PESA number first from Sell to KES."); return; }
    setStep("processing"); setErr("");
    try {
      const res = await api.buy({ wallet_id: wallet.id, kes_amount: String(k), amount: qty().toFixed(8), phone: acct?.phone || "", method, rate: rate.toFixed(8) });
      setGot(res.amount || qty().toFixed(8)); setStep("done");
    } catch (e) { setErr(e instanceof Error ? e.message : "Payment failed"); setStep("method"); }
  };

  if (step === "processing") return <Screen nav={false}><div className="px-6 pt-24 text-center"><Hourglass /><h2 className="mt-5 text-[17px] font-semibold">Processing</h2><p className="mt-2 text-[13px] text-muted">Complete the M-PESA prompt on your phone. This will take no more than 30 seconds.</p></div></Screen>;
  if (step === "done") return (
    <Screen nav={false}>
      <div className="mx-4 mt-2 flex items-center justify-between rounded-xl bg-card2 px-4 py-3"><div><div className="text-[15px]">Buy Crypto Successful</div><div className="text-[12px] text-muted">Your purchase of {got} USDT is successful.</div></div><span className="text-muted">›</span></div>
      <div className="px-6 pt-10 text-center"><SuccessTick /><h2 className="mt-6 text-[17px] font-semibold">Successful</h2><div className="mt-3 text-[28px] font-semibold">{got} USDT</div><p className="mt-3 text-[14px] text-muted">Your assets are now in your Spot Account</p>
        <button onClick={() => r.push("/assets")} className="mt-6 rounded-full bg-brand px-4 py-2 text-[14px] font-semibold text-brand-fg">Check Assets</button></div>
    </Screen>);

  if (step === "method") return (
    <Screen nav={false}>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col">
        <FlowHeader title="Select Payment Method" onBack={() => setStep("amount")} />
        <div className="px-4 text-center"><div className="mt-4 text-[14px] text-muted">You will pay</div><div className="mt-1 text-[28px] font-semibold">{k.toLocaleString()} KES</div></div>
        <div className="mx-4 mt-6 rounded-xl border border-line p-4">
          <div className="text-[14px] text-muted">Card/Bank Accounts/Others</div>
          {METHODS.map((m) => (
            <button key={m.id} onClick={() => setMethod(m.id)} className="mt-5 flex w-full items-center gap-3 text-left">
              {m.id === "mpesa" ? <MpesaLogo size={26} /> : <span className="flex h-[26px] w-[26px] items-center justify-center rounded bg-fg text-[8px] font-bold text-bg">Pay</span>}
              <span className="flex-1"><span className="block text-[15px]">{m.label}</span>{m.id === "mpesa" && acct && <span className="text-[12px] text-muted">{maskPhone(acct.phone)} ›</span>}</span>
              <span className="tnum text-[13px]">{fmt(qty(m.k), 8)} USDT</span>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${method === m.id ? "border-fg bg-fg" : "border-muted"}`}>{method === m.id && <span className="h-2 w-2 rounded-full bg-bg" />}</span>
            </button>
          ))}
        </div>
        {err && <p className="mx-4 mt-3 text-[13px] text-down">{err}</p>}
        <div className="mt-auto flex items-center justify-between border-t border-line px-4 py-4">
          <div><div className="text-[13px] text-muted">You will pay</div><div className="text-[17px] font-semibold">{k.toLocaleString()} <span className="text-[12px]">KES</span></div></div>
          <button onClick={pay} className="h-12 rounded-full bg-brand px-7 font-semibold text-brand-fg">Pay</button>
        </div>
      </div>
    </Screen>);

  return (
    <Screen nav={false}>
      <div className="flex min-h-[calc(100dvh-60px)] flex-col">
        <FlowHeader title="Buy" onBack={() => r.back()} right={<HistoryLink onClick={() => r.push("/history?tab=Buy")} />} />
        <div className="px-4">
          <div className="mt-2 flex justify-between text-[13px]"><span className="text-muted">I want to pay</span><span>By Crypto ⇆</span></div>
          <div className="mt-2 flex h-14 items-center rounded-lg bg-card px-4"><span className={`tnum flex-1 text-[18px] ${kes ? "" : "text-dim"}`}>{kes ? Number(kes).toLocaleString() : `${MIN_BUY_KES} - 150,000`}</span><span className="flex items-center gap-2 border-l border-line pl-4 font-semibold"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-up text-[9px] font-bold text-brand-fg">KSh</span>KES <ChevronD size={12} /></span></div>
          <p className="mt-3 text-[12px] text-muted">{k ? `Estimated quantity ${fmt(qty(), 2)} USDT` : ""}</p>
          {wallets.error && <p className="mt-2 text-[13px] text-down">{wallets.error}</p>}
        </div>
        <div className="mt-auto pb-4"><Keypad onKey={(key) => setKes((c) => pressKey(c, key, 0).replace(".", ""))} />
          <div className="mt-3 px-4"><button disabled={!valid} onClick={() => setStep("method")} className="h-12 w-full rounded-full bg-brand font-semibold text-brand-fg disabled:opacity-40">Select Payment method</button></div></div>
      </div>
    </Screen>
  );
}
