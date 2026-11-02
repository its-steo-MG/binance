import Home from "@/components/home-screen";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Binance — Exchange", description: "View your crypto balance and markets.", openGraph: { title: "Binance — Exchange", description: "View your crypto balance and markets.", type: "website" }, twitter: { card: "summary" } };
export default function Page() { return <Home/>; }
