import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = {
  title: "Assets — Binance",
  description: "View Binance account balances across Overview, Spot, Earn and Funding.",
  openGraph: { title: "Assets — Binance", description: "Your account balances and available profit and loss figures.", type: "website" },
  twitter: { card: "summary" },
};
export default function AssetsLayout({ children }: { children: ReactNode }) { return children; }