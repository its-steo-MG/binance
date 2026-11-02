import { describe, expect, it } from "vitest";
import { notificationCategory, signedAmount, transactionStatus, eatTimestamp } from "./transaction-display";
import type { Notif, Tx } from "./api";
const tx: Tx = { id: 1, amount: "10.6", transaction_type: "credit", description: "Wallet credit", reference: "REF1", balance_after: "10.6", created_at: "2026-10-27T08:17:29Z" };
describe("Real transaction display", () => {
  it("does not infer payment completion from a ledger row", () => { expect(transactionStatus(tx)).toBe("Recorded"); });
  it("uses explicit payment status when available", () => { expect(transactionStatus({ ...tx, status: "completed" })).toBe("Completed"); expect(transactionStatus({ ...tx, status: "processing" })).toBe("Processing"); });
  it("displays debit amounts as outgoing even when stored unsigned", () => { expect(signedAmount({ ...tx, transaction_type: "debit" })).toBe(-10.6); expect(signedAmount(tx)).toBe(10.6); });
  it("shows transaction time in Nairobi", () => { expect(eatTimestamp(tx.created_at)).toBe("2026-10-27 11:17:29"); });
  it("groups backend notifications without sample messages", () => {
    const n: Notif = { id: 1, title: "Sell Crypto Successful", body: "", is_read: false, data: { type: "sell" }, created_at: tx.created_at };
    expect(notificationCategory(n)).toBe("Transaction");
    expect(notificationCategory({ ...n, title: "Login attempted", data: {} })).toBe("Account");
    expect(notificationCategory({ ...n, title: "BNB Price Alert", data: {} })).toBe("Price Alert");
  });
});