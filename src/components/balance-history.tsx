"use client";
import { useId, useState } from "react";
import { balanceHistory, historyPath, HISTORY_RANGES, type BalanceSnapshot, type HistoryRange } from "@/lib/balance-history";
import { formatBalance, type BalanceUnit } from "@/lib/balance-currency";
import { ChevronD } from "./icons";
import { Button } from "./ui";

export function BalanceHistory({ snapshots, unit, kes, prices, hidden = false, loading = false }: {
  snapshots?: BalanceSnapshot[]; unit: BalanceUnit; kes: number;
  prices: { base: string; price: number }[] | null; hidden?: boolean; loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<HistoryRange>("1D");
  const [selected, setSelected] = useState<number | null>(null);
  const fillId = useId().replace(/:/g, "");
  const points = balanceHistory(snapshots, range);
  const last = points[points.length - 1];
  const current = selected === null ? last : points[selected] ?? last;
  const curve = historyPath(points);
  const inspect = (clientX: number, element: SVGSVGElement) => {
    const rect = element.getBoundingClientRect(), first = points[0];
    if (!first || !last || rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, ((clientX - rect.left) / rect.width * 400 - 8) / 384));
    const timestamp = first.timestamp + ratio * (last.timestamp - first.timestamp);
    let nearest = 0;
    points.forEach((point, i) => { if (Math.abs(point.timestamp - timestamp) < Math.abs((points[nearest]?.timestamp ?? timestamp) - timestamp)) nearest = i; });
    setSelected(nearest);
  };
  const time = (value: number) => new Date(value).toLocaleString("en-GB", { timeZone: "Africa/Nairobi", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return <>
    <Button aria-label={open ? "Hide balance graph" : "Show balance graph"} aria-expanded={open} aria-controls="home-balance-history" onClick={() => setOpen(!open)} className="size-7 shrink-0 text-muted" title={open ? "Hide balance graph" : "Show balance graph"}>
      <span className={open ? "rotate-180" : ""}><ChevronD size={14} /></span>
    </Button>
    {open && <section id="home-balance-history" aria-label="Account balance history" className="mt-3 w-full basis-full">
      <div className="tnum mb-2 flex min-h-5 justify-between gap-2 text-[11px] text-muted">
        <span>{!hidden && current ? time(current.timestamp) : ""}</span>
        <span>{hidden ? "******" : current ? `${formatBalance(current.balance, unit, kes, prices)} ${unit === "KES" ? "" : unit}` : ""}</span>
      </div>
      <div className="flex h-40 items-center justify-center">
        {hidden ? <span className="text-[12px] text-muted">Balance hidden</span> : loading && !snapshots ? <span className="text-[12px] text-muted" role="status">Loading…</span> : points.length < 2 ? <span className="text-[12px] text-muted">Balance history unavailable</span> : <svg viewBox="0 0 400 120" preserveAspectRatio="none" role="img" aria-label={`Account balance graph, ${range}`} tabIndex={0} className="h-full w-full cursor-crosshair text-brand"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); inspect(e.clientX, e.currentTarget); }}
          onPointerMove={(e) => { if (e.buttons || e.pointerType === "mouse") inspect(e.clientX, e.currentTarget); }}
          onKeyDown={(e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); setSelected(Math.max(0, Math.min(points.length - 1, (selected ?? points.length - 1) + (e.key === "ArrowLeft" ? -1 : 1)))); } }}>
          <defs><linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.20" /><stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" /></linearGradient></defs>
          <path d={`${curve} L392,120 L8,120 Z`} fill={`url(#${fillId})`} />
          <path d={curve} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>}
      </div>
      <div className="mt-3 flex justify-between gap-1" role="group" aria-label="Balance history period">
        {HISTORY_RANGES.map((r) => <Button key={r} aria-pressed={range === r} onClick={() => { setRange(r); setSelected(null); }} className={`min-h-8 px-2 text-[12px] ${range === r ? "rounded bg-card2 text-brand" : "text-muted"}`}>{r}</Button>)}
      </div>
    </section>}
  </>;
}
