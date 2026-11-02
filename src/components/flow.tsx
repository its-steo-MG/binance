"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BackI, CloseI, HistoryI } from "./icons";

export function FlowHeader({ title, onBack, right, close }: { title?: string; onBack?: () => void; right?: ReactNode; close?: boolean }) {
  return (
    <div className="flex h-12 items-center px-4">
      <button aria-label={close ? "Close" : "Back"} onClick={onBack} className="w-8">{close ? null : <BackI />}</button>
      <h1 className="flex-1 text-center text-[17px] font-semibold">{title}</h1>
      <span className="flex w-8 justify-end">{close ? <button aria-label="Close" onClick={onBack}><CloseI /></button> : right}</span>
    </div>
  );
}
export const HistoryLink = ({ onClick }: { onClick: () => void }) => <button aria-label="Order history" onClick={onClick}><HistoryI size={22} /></button>;

export function Keypad({ onKey }: { onKey: (k: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];
  return (
    <div className="grid grid-cols-3 gap-y-2 px-4">
      {keys.map((k) => (
        <button key={k} onClick={() => onKey(k)} aria-label={k === "del" ? "Delete" : k} className="flex h-14 items-center justify-center text-[24px] font-medium active:bg-card rounded-lg">
          {k === "del" ? <svg width="26" height="20" viewBox="0 0 26 20"><path d="M8 1h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8L1 10z" fill="currentColor" /><path d="M12 6l8 8M20 6l-8 8" stroke="var(--color-bg)" strokeWidth="2.2" strokeLinecap="round" /></svg> : k === "." ? "•" : k}
        </button>
      ))}
    </div>
  );
}

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button aria-label="Close" className="absolute inset-0 bg-bg/70" onClick={onClose} />
      <div className="relative mx-auto w-full max-w-[480px] rounded-t-2xl bg-card px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />{children}
      </div>
    </div>
  );
}

export function Dialog({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg/70 px-10">
      <div className="w-full max-w-[320px] rounded-2xl bg-card p-5 text-center">{children}</div>
    </div>
  );
}

export const Warn = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" className="mx-auto"><circle cx="22" cy="22" r="20" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" /><rect x="20.3" y="11" width="3.4" height="15" rx="1.7" fill="var(--color-brand)" /><circle cx="22" cy="31.5" r="2.1" fill="var(--color-brand)" /></svg>
);

export const MpesaLogo = ({ size = 24 }: { size?: number }) => (
  <span className="inline-flex items-center justify-center rounded-[5px] bg-up font-bold text-on-change" style={{ width: size, height: size, fontSize: size * 0.28 }}>M-PESA</span>
);

/** Slide right to confirm. Shows a countdown; when it reaches 0 the quote expires. */
export function SlideConfirm({ seconds, onConfirm, onExpired, expired, label, disabled = false }: { seconds: number; onConfirm: () => void; onExpired: () => void; expired: boolean; label: string; disabled?: boolean }) {
  const [left, setLeft] = useState(seconds);
  const [x, setX] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; startX: number } | null>(null);
  const deadline = useRef(0);
  const completed = useRef(false);
  const callbacks = useRef({ onConfirm, onExpired });
  useEffect(() => { callbacks.current = { onConfirm, onExpired }; }, [onConfirm, onExpired]);
  useEffect(() => {
    setLeft(seconds);
    setX(0);
    drag.current = null;
    completed.current = false;
    if (expired) return;
    deadline.current = Date.now() + seconds * 1000;
    const id = setInterval(() => {
      if (completed.current) return;
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        completed.current = true;
        drag.current = null;
        setX(0);
        clearInterval(id);
        callbacks.current.onExpired();
      }
    }, 250);
    return () => clearInterval(id);
  }, [seconds, expired]);
  const max = () => Math.max(0, (track.current?.clientWidth ?? 300) - 48);
  const confirm = () => {
    if (expired || disabled || completed.current) return;
    completed.current = true;
    if (Date.now() >= deadline.current) {
      setLeft(0);
      callbacks.current.onExpired();
      return;
    }
    callbacks.current.onConfirm();
  };
  const reset = () => { drag.current = null; setX(0); };
  return (
    <div ref={track} className="relative h-12 w-full touch-none select-none overflow-hidden rounded-lg bg-brand/40">
      <div className="absolute inset-y-0 left-0 bg-brand" style={{ width: x + 48 }} />
      <span className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-brand-fg/70">{label} ({left}s)</span>
      <button type="button" aria-label="Slide to confirm" disabled={disabled || expired || left === 0}
        onPointerDown={(e) => {
          if (e.button !== 0 || disabled || expired || completed.current || drag.current) return;
          e.preventDefault();
          drag.current = { pointerId: e.pointerId, startX: e.clientX - x };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const active = drag.current;
          if (!active || active.pointerId !== e.pointerId) return;
          setX(Math.min(max(), Math.max(0, e.clientX - active.startX)));
        }}
        onPointerUp={(e) => {
          const active = drag.current;
          if (!active || active.pointerId !== e.pointerId) return;
          const distance = Math.min(max(), Math.max(0, e.clientX - active.startX));
          reset();
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          if (max() > 0 && distance >= max() - 4) confirm();
        }}
        onPointerCancel={reset} onLostPointerCapture={reset}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); confirm(); } }}
        className="absolute top-1 flex h-10 w-10 touch-none items-center justify-center rounded-md bg-brand-fg/10" style={{ left: x + 4 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-brand-fg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h13M11 5l5 5-5 5" /></svg>
      </button>
    </div>
  );
}

export const Hourglass = () => (
  <svg width="72" height="84" viewBox="0 0 72 84" className="bn-hourglass mx-auto" aria-hidden>
    <defs><clipPath id="hg-top"><path d="M17 14h38c-1 9-8 16-19 26C25 30 18 23 17 14z" /></clipPath><clipPath id="hg-bot"><path d="M36 44c11 10 18 17 19 26H17c1-9 8-16 19-26z" /></clipPath></defs>
    <g>
      <rect x="8" y="5" width="56" height="7" rx="3.5" fill="none" stroke="var(--color-fg)" strokeWidth="2.6" />
      <rect x="8" y="72" width="56" height="7" rx="3.5" fill="none" stroke="var(--color-fg)" strokeWidth="2.6" />
      <path d="M15 12c0 13 9 21 18 30-9 9-18 17-18 30M57 12c0 13-9 21-18 30 9 9 18 17 18 30" fill="none" stroke="var(--color-fg)" strokeWidth="2.6" strokeLinecap="round" />
      <g clipPath="url(#hg-top)"><rect className="bn-sand-top" x="10" y="14" width="52" height="28" fill="var(--color-brand)" /></g>
      <g clipPath="url(#hg-bot)"><rect className="bn-sand-bot" x="10" y="44" width="52" height="28" fill="var(--color-brand)" /></g>
      <rect className="bn-sand-stream" x="34" y="38" width="4" height="32" fill="var(--color-brand)" />
    </g>
  </svg>
);
export const OrderSpin = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto">
    <path d="M14 14A26 26 0 1 1 7 32" fill="none" stroke="var(--color-fg)" strokeWidth="3" strokeLinecap="round" /><path d="M6 10v9h9" fill="none" stroke="var(--color-fg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="32" r="11" fill="var(--color-brand)" /><rect x="28.5" y="28.5" width="7" height="7" transform="rotate(45 32 32)" fill="var(--color-brand-fg)" />
  </svg>
);
export const SuccessTick = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" className="mx-auto"><circle cx="50" cy="50" r="50" fill="var(--color-up)" /><path d="M32 51l12 12 24-25" fill="none" stroke="var(--color-brand-fg)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const PasskeyArt = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" className="mx-auto"><circle cx="48" cy="48" r="44" fill="none" stroke="var(--color-fg)" strokeWidth="3" /><circle cx="48" cy="34" r="11" fill="var(--color-brand)" /><path d="M24 70c2-13 12-20 24-20s22 7 24 20" fill="none" stroke="var(--color-fg)" strokeWidth="3" /><path d="M30 62h36M28 70h40" stroke="var(--color-fg)" strokeWidth="3" /></svg>
);

export { CloseI };
