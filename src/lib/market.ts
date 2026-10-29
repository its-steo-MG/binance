"use client";
import { useEffect, useState } from "react";
// Live market data from Binance public API + USD→KES rate.
export type Ticker = { symbol: string; base: string; price: number; change: number; volume: number };
export const COINS: Record<string, string> = { BTC: "Bitcoin", ETH: "Ethereum", BNB: "BNB", SOL: "Solana", XRP: "XRP", DOGE: "Dogecoin", PEPE: "Pepe", SUI: "Sui", NEAR: "NEAR Protocol", ZEC: "Zcash", ADA: "Cardano", TRX: "TRON", LINK: "Chainlink", TON: "Toncoin", AVAX: "Avalanche", SHIB: "Shiba Inu", LTC: "Litecoin", DOT: "Polkadot" };
export const COIN_COLORS: Record<string, string> = { BTC: "#f7931a", ETH: "#627eea", BNB: "#f0b90b", SOL: "#14f195", XRP: "#23292f", DOGE: "#c2a633", PEPE: "#4c9a2a", SUI: "#4da2ff", NEAR: "#ffffff", ZEC: "#ecb244", ADA: "#0033ad", TRX: "#ff060a", LINK: "#2a5ada", TON: "#0098ea", AVAX: "#e84142", SHIB: "#ffa409", LTC: "#345d9d", DOT: "#e6007a", USDT: "#26a17b", USD: "#2ebd85", KES: "#bb0000" };

let rateCache: number | null = null;
export function useKesRate() {
  const [rate, setRate] = useState<number>(rateCache ?? 129.2);
  useEffect(() => {
    if (rateCache) return;
    fetch("https://open.er-api.com/v6/latest/USD").then((r) => r.json()).then((d) => { const k = d?.rates?.KES; if (k) { rateCache = k; setRate(k); } }).catch(() => {});
  }, []);
  return rate;
}

export function useTickers(refreshMs = 10000) {
  const [data, setData] = useState<Ticker[] | null>(null);
  useEffect(() => {
    let alive = true;
    const syms = Object.keys(COINS).map((c) => `"${c}USDT"`).join(",");
    const load = () => fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${syms}]`).then((r) => r.json()).then((rows: any[]) => {
      if (!alive || !Array.isArray(rows)) return;
      setData(rows.map((r) => ({ symbol: r.symbol, base: r.symbol.replace("USDT", ""), price: +r.lastPrice, change: +r.priceChangePercent, volume: +r.quoteVolume })));
    }).catch(() => {});
    load(); const t = setInterval(load, refreshMs);
    return () => { alive = false; clearInterval(t); };
  }, [refreshMs]);
  return data;
}

export function useKlines(symbol = "BTCUSDT", interval = "15m", limit = 60) {
  const [pts, setPts] = useState<number[]>([]);
  useEffect(() => {
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`).then((r) => r.json()).then((rows: any[]) => Array.isArray(rows) && setPts(rows.map((k) => +k[4]))).catch(() => {});
  }, [symbol, interval, limit]);
  return pts;
}

export const fmtPrice = (p: number) => (p >= 1000 ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p >= 1 ? p.toFixed(4) : p.toPrecision(4));
