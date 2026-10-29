import type { SVGProps } from "react";
type P = SVGProps<SVGSVGElement> & { size?: number };
const S = ({ size = 22, children, ...p }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>
);
export const BinanceMark = ({ size = 28, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 126.61 126.61" {...p}>
    <g fill="var(--color-brand)">
      <path d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.42 38.9z" />
      <path d="M0 63.31l14.3-14.31 14.31 14.31-14.31 14.3z" />
      <path d="M38.73 73.41l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88z" />
      <path d="M98 63.31l14.3-14.31 14.31 14.3-14.31 14.32z" />
      <path d="M77.83 63.3L63.32 48.78 52.59 59.51l-1.24 1.23-2.54 2.54 14.51 14.5 14.51-14.47z" />
    </g>
  </svg>
);
export const HomeI = (p: P) => <S {...p}><path d="M7 7l5-5 5 5M7 17l5 5 5-5M3 9l3 3-3 3M21 9l-3 3 3 3" /><path d="M12 8l4 4-4 4-4-4z" fill="currentColor" stroke="none" /></S>;
export const MarketsI = (p: P) => <S {...p}><path d="M3 19h18" /><path d="M4 15l5-5 4 3 7-7" /><path d="M16 6h4v4" /></S>;
export const TradeI = (p: P) => <S {...p}><path d="M20 12a8 8 0 0 1-14 5.3" /><path d="M4 12a8 8 0 0 1 14-5.3" /><path d="M18 3v4h-4" /><path d="M6 21v-4h4" /></S>;
export const FuturesI = (p: P) => <S {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></S>;
export const AssetsI = (p: P) => <S {...p}><path d="M4 8h16v12H4z" /><path d="M8 8V5h8v3" /><path d="M14 14h3" /></S>;
export const SearchI = (p: P) => <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></S>;
export const ScanI = (p: P) => <S {...p}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" /></S>;
export const BellI = (p: P) => <S {...p}><path d="M6 10a6 6 0 0 1 12 0v4l2 3H4l2-3z" /><path d="M10 20a2 2 0 0 0 4 0" /></S>;
export const HeadsetI = (p: P) => <S {...p}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1" /><rect x="17" y="14" width="4" height="6" rx="1" /></S>;
export const ChatI = (p: P) => <S {...p}><path d="M4 5h16v11H9l-5 4z" /><path d="M8 10h8" /></S>;
export const EyeI = (p: P) => <S {...p}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.5" /></S>;
export const EyeOffI = (p: P) => <S {...p}><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3 3.6M6.6 6.6A17 17 0 0 0 2 12s3.5 6 10 6a10 10 0 0 0 4.4-1" /></S>;
export const ChevronR = (p: P) => <S {...p}><path d="M9 6l6 6-6 6" /></S>;
export const ChevronD = (p: P) => <S {...p}><path d="M6 9l6 6 6-6" /></S>;
export const BackI = (p: P) => <S {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></S>;
export const DownI = (p: P) => <S {...p}><path d="M12 4v14M6 12l6 6 6-6" /></S>;
export const UpI = (p: P) => <S {...p}><path d="M12 20V6M6 12l6-6 6 6" /></S>;
export const SwapI = (p: P) => <S {...p}><path d="M4 8h14l-4-4M20 16H6l4 4" /></S>;
export const EarnI = (p: P) => <S {...p}><path d="M8 4h8l-2 4h-4z" /><path d="M6 20a6 6 0 0 1 0-1c0-5 3-9 6-11 3 2 6 6 6 11v1z" /><path d="M12 12v5M10.5 13.5h2.5a1 1 0 0 1 0 2h-2" /></S>;
export const HistoryI = (p: P) => <S {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></S>;
export const CloseI = (p: P) => <S {...p}><path d="M6 6l12 12M18 6L6 18" /></S>;
export const CopyI = (p: P) => <S {...p}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></S>;
export const UserI = (p: P) => <S {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></S>;
export const MenuI = (p: P) => <S {...p}><path d="M4 7h16M4 12h16M4 17h16" /></S>;
export const MoreI = (p: P) => <S {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></S>;
