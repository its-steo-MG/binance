export type BalanceSnapshot = { timestamp: string; balance: string | number };
export type BalancePoint = { timestamp: number; balance: number };
export const HISTORY_RANGES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;
export type HistoryRange = (typeof HISTORY_RANGES)[number];
const DAYS = { "1D": 1, "1W": 7, "1M": 30, "3M": 90, "1Y": 365 };

/** Account snapshots only. Market prices and ledger entries are not balance history. */
export function balanceHistory(raw: BalanceSnapshot[] | null | undefined, range: HistoryRange, now = Date.now()): BalancePoint[] {
  if (!Array.isArray(raw)) return [];
  const cutoff = range === "ALL" ? -Infinity : now - DAYS[range] * 86400000;
  const points = new Map<number, BalancePoint>();
  for (const row of raw) {
    if (!row || typeof row.timestamp !== "string" || row.balance === null || row.balance === undefined || String(row.balance).trim() === "") continue;
    const timestamp = Date.parse(row.timestamp), balance = Number(row.balance);
    if (Number.isFinite(timestamp) && Number.isFinite(balance) && timestamp >= cutoff && timestamp <= now) points.set(timestamp, { timestamp, balance });
  }
  return [...points.values()].sort((a, b) => a.timestamp - b.timestamp);
}

export function historyLine(points: BalancePoint[]): string {
  if (points.length < 2) return "";
  const min = Math.min(...points.map((p) => p.balance)), max = Math.max(...points.map((p) => p.balance));
  const first = points[0], last = points[points.length - 1];
  if (!first || !last) return "";
  return points.map((p) => `${8 + (p.timestamp - first.timestamp) / (last.timestamp - first.timestamp || 1) * 384},${max === min ? 60 : 112 - (p.balance - min) / (max - min) * 104}`).join(" ");
}

/** Monotone cubic interpolation: curves through real samples without adding extrema. */
export function historyPath(points: BalancePoint[]): string {
  if (points.length < 2) return "";
  const coordinates = historyLine(points).split(" ").map((pair) => {
    const [x = 0, y = 0] = pair.split(",").map(Number);
    return { x, y };
  });
  const slopes = coordinates.slice(1).map((point, i) => {
    const previous = coordinates[i];
    return previous && point.x > previous.x ? (point.y - previous.y) / (point.x - previous.x) : 0;
  });
  const tangents = coordinates.map((point, i) => {
    if (i === 0) return slopes[0] ?? 0;
    if (i === coordinates.length - 1) return slopes[i - 1] ?? 0;
    const before = slopes[i - 1] ?? 0, after = slopes[i] ?? 0;
    const previous = coordinates[i - 1], next = coordinates[i + 1];
    if (before * after <= 0 || !previous || !next) return 0;
    const left = point.x - previous.x, right = next.x - point.x;
    const a = 2 * right + left, b = right + 2 * left;
    return (a + b) / (a / before + b / after);
  });
  const first = coordinates[0];
  if (!first) return "";
  let path = `M${first.x},${first.y}`;
  for (let i = 1; i < coordinates.length; i++) {
    const previous = coordinates[i - 1], current = coordinates[i];
    if (!previous || !current) continue;
    const dx = (current.x - previous.x) / 3;
    path += ` C${previous.x + dx},${previous.y + dx * (tangents[i - 1] ?? 0)} ${current.x - dx},${current.y - dx * (tangents[i] ?? 0)} ${current.x},${current.y}`;
  }
  return path;
}