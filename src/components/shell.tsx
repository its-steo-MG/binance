"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { sessionValid, touch, auth } from "@/lib/api";
import { BinanceMark, MarketsI, TradeI, FuturesI, AssetsI } from "./icons";

const NAV = [
  { href: "/", label: "Home", I: BinanceMark },
  { href: "/markets", label: "Markets", I: MarketsI },
  { href: "/trade", label: "Trade", I: TradeI },
  { href: "/futures", label: "Futures", I: FuturesI },
  { href: "/assets", label: "Assets", I: AssetsI },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-line bg-bg">
      <div className="grid grid-cols-5 pt-[6px]">
        {NAV.map(({ href, label, I }) => {
          const on = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-[3px] py-1 text-[10px] ${on ? "text-fg" : "text-muted"}`}>
              <I size={22} className={on ? "text-brand" : ""} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Auth-guarded screen with pull-to-refresh and safe-area padding. */
export function Screen({ children, onRefresh, nav = true }: { children: ReactNode; onRefresh?: () => Promise<unknown> | void; nav?: boolean }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!sessionValid()) { auth.clear(); router.replace("/login"); return; }
    setOk(true); touch();
    const act = () => touch();
    const vis = () => { if (document.visibilityState === "visible" && !sessionValid()) { auth.clear(); router.replace("/login"); } else touch(); };
    ["pointerdown", "keydown", "scroll"].forEach((e) => window.addEventListener(e, act, { passive: true }));
    document.addEventListener("visibilitychange", vis);
    const iv = setInterval(() => { if (!sessionValid()) { auth.clear(); router.replace("/login"); } }, 30000);
    return () => { ["pointerdown", "keydown", "scroll"].forEach((e) => window.removeEventListener(e, act)); document.removeEventListener("visibilitychange", vis); clearInterval(iv); };
  }, [router]);

  if (!ok) return <div className="min-h-dvh bg-bg" />;
  return (
    <div
      className={`safe-top mx-auto min-h-dvh max-w-[480px] bg-bg ${nav ? "pb-24" : "pb-6"}`}
      onTouchStart={(e) => { if (window.scrollY <= 0 && onRefresh) startY.current = e.touches[0].clientY; }}
      onTouchMove={(e) => { if (startY.current != null) setPull(Math.max(0, Math.min(80, (e.touches[0].clientY - startY.current) / 2))); }}
      onTouchEnd={async () => {
        if (pull > 55 && onRefresh) { setRefreshing(true); setPull(48); await onRefresh(); setRefreshing(false); }
        setPull(0); startY.current = null;
      }}
    >
      <div className="flex items-center justify-center overflow-hidden transition-[height]" style={{ height: refreshing ? 48 : pull }}>
        <div className={`h-6 w-6 rounded-full border-2 border-brand border-t-transparent ${refreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${pull * 4}deg)` }} />
      </div>
      {children}
      {nav && <BottomNav />}
    </div>
  );
}