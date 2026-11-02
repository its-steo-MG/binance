"use client";
import { useState } from "react";
import { AssetButton } from "./assets-controls";
import { enablePush, disablePush } from "@/lib/push";
export function PushControls() {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const run = async (action: () => Promise<string>) => { setBusy(true); try { setMessage(await action()); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update notification settings."); } finally { setBusy(false); } };
  return <section className="border-b border-line px-4 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-[14px] font-medium">Phone notifications</h2><div className="flex gap-3"><AssetButton disabled={busy} onClick={() => void run(enablePush)} className="rounded bg-brand px-3 py-2 text-[12px] font-semibold text-brand-fg">Enable</AssetButton><AssetButton disabled={busy} onClick={() => void run(disablePush)} className="px-2 py-2 text-[12px] text-muted">Disable</AssetButton></div></div>{message && <p role="status" className="mt-3 text-[12px] text-muted">{message}</p>}</section>;
}
