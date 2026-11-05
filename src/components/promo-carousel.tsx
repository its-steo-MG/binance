"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BinanceMark, CloseI } from "@/components/icons";

type Slide = { title: string; text: string; cta: string; href: string };

const SLIDES: Slide[] = [
  { title: "Predict. Climb. Earn Rewards.", text: "Binance Pick: $1,000,000 Reward Pool!", cta: "Join", href: "/markets" },
  { title: "Buy Crypto with M-PESA", text: "Fund your account in KES in seconds", cta: "Buy", href: "/buy" },
  { title: "Invite Friends. Earn Together.", text: "Share your referral link and get rewards", cta: "Invite", href: "/profile" },
];

const INTERVAL = 4000;

export function PromoCarousel({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((n) => (n + 1) % SLIDES.length), INTERVAL);
    return () => clearTimeout(t);
  }, [i, paused]);

  const go = (d: number) => setI((n) => (n + d + SLIDES.length) % SLIDES.length);

  return (
    <div
      className="mx-4 mt-4 overflow-hidden rounded-lg bg-card py-3"
      onPointerDown={(e) => { startX.current = e.clientX; setPaused(true); }}
      onPointerUp={(e) => {
        if (startX.current !== null) {
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 30) go(dx < 0 ? 1 : -1);
        }
        startX.current = null;
        setPaused(false);
      }}
      onPointerCancel={() => { startX.current = null; setPaused(false); }}
      style={{ touchAction: "pan-y" }}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {SLIDES.map((s) => (
          <div key={s.title} className="w-full shrink-0 px-3">
            <div className="flex items-center justify-between text-[12px] text-muted">
              {s.title}
              <button onClick={onClose} aria-label="Close banner"><CloseI size={14} /></button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2 font-medium"><BinanceMark size={24} />{s.text}</span>
              <Link href={s.href} className="rounded bg-card2 px-3 py-1 text-[12px]">{s.cta}</Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1">
        {SLIDES.map((s, n) => (
          <button
            key={s.title}
            aria-label={`Show banner ${n + 1}`}
            onClick={() => setI(n)}
            className={`h-1 rounded-full transition-all duration-300 ${n === i ? "w-2 bg-fg" : "w-1 bg-dim"}`}
          />
        ))}
      </div>
    </div>
  );
}
