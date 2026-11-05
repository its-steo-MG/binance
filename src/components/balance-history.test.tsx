// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BalanceHistory } from "./balance-history";
beforeEach(() => { vi.stubGlobal("React", React); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-05T12:00:00Z")); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
const snapshots = [{ timestamp: "2026-11-05T08:00:00Z", balance: "100" }, { timestamp: "2026-11-05T10:00:00Z", balance: "125" }];
describe("Home balance graph control", () => {
  it("opens and closes the graph without changing the selected currency", () => {
    localStorage.setItem("bn_balance_currency", "KES");
    render(<BalanceHistory snapshots={snapshots} unit="KES" kes={130} prices={null} />);
    expect(screen.queryByRole("img")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show balance graph" }));
    expect(screen.getByRole("img", { name: "Account balance graph, 1D" })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("img"), { key: "ArrowLeft" });
    expect(screen.getByText("KSh13,000.00")).toBeTruthy();
    expect(localStorage.getItem("bn_balance_currency")).toBe("KES");
    fireEvent.click(screen.getByRole("button", { name: "Hide balance graph" }));
    expect(screen.queryByRole("img")).toBeNull();
  });
  it("filters account data when the period changes", () => {
    render(<BalanceHistory snapshots={[{ timestamp: "2026-11-01T08:00:00Z", balance: "80" }, snapshots[0]]} unit="USDT" kes={130} prices={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Show balance graph" }));
    expect(screen.queryByRole("img")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "1W" }));
    expect(screen.getByRole("img", { name: "Account balance graph, 1W" })).toBeTruthy();
  });
  it("does not expose account history while balances are hidden", () => {
    render(<BalanceHistory snapshots={snapshots} unit="KES" kes={130} prices={null} hidden />);
    fireEvent.click(screen.getByRole("button", { name: "Show balance graph" }));
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("slider")).toBeNull();
    expect(screen.queryByText(/KSh/)).toBeNull();
  });
});