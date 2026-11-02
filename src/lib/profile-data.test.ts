import { describe, expect, it } from "vitest";
import { accountVerification, profileIdentity } from "./profile-data";
import type { Home, Wallet } from "./api";
const wallet: Wallet = { id: 1, uid: "123456789", address: "0xaccount", network: "BEP20", label: "Main", balance: "10", currency: "USDT", is_primary: true, is_active: true, created_at: "2026-01-01" };
const home: Home = { greeting: "Hi", primary_wallet: wallet, wallets: [wallet], total_balance: "10", currency: "USDT" };
describe("profile backend identity", () => {
  it("reads the UID supplied by the primary wallet", () => { expect(profileIdentity(home, null).uid).toBe("123456789"); });
  it("reads the address supplied by the primary wallet", () => { expect(profileIdentity(home, null).address).toBe("0xaccount"); });
  it("does not invent a UID when none is supplied", () => { expect(profileIdentity({ ...home, primary_wallet: { ...wallet, uid: undefined } }, null).uid).toBeNull(); });
  it("uses the explicitly primary wallet instead of the first arbitrary wallet", () => { expect(profileIdentity({ ...home, primary_wallet: null, wallets: [{ ...wallet, uid: "999", is_primary: false }, wallet] }, null).uid).toBe("123456789"); });
});

describe("primary wallet verification", () => {
  it("confirms verified only from the backend verified value", () => {
    expect(accountVerification({ ...home, primary_wallet: { ...wallet, verification_status: "verified" } }).verified).toBe(true);
  });
  it("does not verify the backend unverified value", () => {
    expect(accountVerification({ ...home, primary_wallet: { ...wallet, verification_status: "unverified" } }).verified).toBe(false);
  });
  it("does not invent verification or Regular tier when fields are missing", () => {
    expect(accountVerification(home)).toEqual({ verified: false, label: "Unavailable", tier: null });
  });
  it("reads Regular tier from the primary wallet response", () => {
    expect(accountVerification({ ...home, primary_wallet: { ...wallet, account_tier: "Regular" } }).tier).toBe("Regular");
  });
  it("does not borrow verification from another wallet", () => {
    expect(accountVerification({ ...home, wallets: [{ ...wallet, is_primary: false, verification_status: "verified" }] }).verified).toBe(false);
  });
  it("uses the explicitly primary wallet when home omits primary_wallet", () => {
    expect(accountVerification({ ...home, primary_wallet: null, wallets: [{ ...wallet, is_primary: false, verification_status: "unverified" }, { ...wallet, verification_status: "verified" }] }).verified).toBe(true);
  });
});