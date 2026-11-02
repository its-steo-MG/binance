"use client";
import { useSyncExternalStore } from "react";
import { readBalanceCurrency, setBalanceCurrency, subscribeBalanceCurrency, type BalanceUnit } from "./balance-currency";

export function useBalanceCurrency() {
  const unit = useSyncExternalStore(subscribeBalanceCurrency, readBalanceCurrency, (): BalanceUnit => "BTC");
  return [unit, setBalanceCurrency] as const;
}