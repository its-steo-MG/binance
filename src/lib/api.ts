// Client for the TradeRiser Django backend (binance app). No mock data.
//const DEFAULT_BASE = "https://traderiserproapp.onrender.com/api";
const DEFAULT_BASE = "http://localhost:8000/api";
export const apiBase = () => (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE).replace(/\/$/, "");
const prefix = () => (process.env.NEXT_PUBLIC_BINANCE_PREFIX || "/binance").replace(/\/$/, "");

const A = "bn_access", R = "bn_refresh", P = "bn_profile", LAST = "bn_last_active";
export type Profile = { name: string; username: string; email: string };

export const auth = {
  access: () => (typeof window === "undefined" ? null : localStorage.getItem(A)),
  save: (a: string, r?: string) => { localStorage.setItem(A, a); if (r) localStorage.setItem(R, r); touch(); },
  clear: () => { [A, R, P, LAST].forEach((k) => localStorage.removeItem(k)); sessionStorage.removeItem("bn_session"); },
  profile: (): Profile | null => { try { return JSON.parse(localStorage.getItem(P) || "null"); } catch { return null; } },
  saveProfile: (p: Profile) => localStorage.setItem(P, JSON.stringify(p)),
};

// Session: must log in on every app launch and after 5 minutes away.
export const SESSION_TIMEOUT_MS = 5 * 60 * 1000;
export function touch() { if (typeof window !== "undefined") { localStorage.setItem(LAST, String(Date.now())); sessionStorage.setItem("bn_session", "1"); } }
export function sessionValid(): boolean {
  if (typeof window === "undefined") return false;
  if (!auth.access() || !sessionStorage.getItem("bn_session")) return false;
  const last = Number(localStorage.getItem(LAST) || 0);
  return Date.now() - last < SESSION_TIMEOUT_MS;
}

export class ApiError extends Error { constructor(m: string, public status: number) { super(m); } }

async function refresh(): Promise<string | null> {
  const r = localStorage.getItem(R); if (!r) return null;
  const res = await fetch(`${apiBase()}/accounts/token/refresh/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh: r }) }).catch(() => null);
  if (!res || !res.ok) return null;
  const d = await res.json(); if (!d.access) return null; auth.save(d.access); return d.access;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = auth.access();
  const res = await fetch(`${apiBase()}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) } });
  if (res.status === 401 && retry && (await refresh())) return request<T>(path, init, false);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as any).detail || (data as any).error || `Request failed (${res.status})`, res.status);
  return data as T;
}

export type Wallet = { id: number; label: string; address: string; network: string; balance: string; currency: string; is_primary: boolean; is_active: boolean; created_at: string };
export type Tx = { id: number; amount: string; transaction_type: string; description: string; reference: string; balance_after: string; created_at: string };
export type Notif = { id: number; title: string; body: string; is_read: boolean; data: Record<string, unknown>; created_at: string };
export type Home = { greeting: string; primary_wallet: Wallet | null; wallets: Wallet[]; total_balance: string | number; currency: string };
const list = <T,>(d: T[] | { results: T[] }) => (Array.isArray(d) ? d : d.results || []);

export const api = {
  async login(username: string, password: string) {
    const d = await request<any>("/accounts/login/", { method: "POST", body: JSON.stringify({ username, email: username, password, account_type: "real" }) }, false);
    if (!d.access) throw new ApiError(d.detail || "Login failed", 400);
    auth.save(d.access, d.refresh);
    const u = d.user || {};
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.full_name || u.username || username;
    auth.saveProfile({ name, username: u.username || username, email: u.email || "" });
    return d;
  },
  home: () => request<Home>(`${prefix()}/home/`),
  wallets: async () => list(await request<any>(`${prefix()}/wallets/`)) as Wallet[],
  transactions: async (walletId?: number) => list(await request<any>(`${prefix()}/transactions/${walletId ? `?wallet_id=${walletId}` : ""}`)) as Tx[],
  notifications: async () => list(await request<any>(`${prefix()}/notifications/`)) as Notif[],
  markRead: (id: number) => request(`${prefix()}/notifications/${id}/read/`, { method: "POST" }),
};

export const num = (v: string | number | null | undefined) => Number(v ?? 0) || 0;
export const fmt = (v: number, d = 2) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const mask = (a: string) => (a && a.length > 12 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a);
