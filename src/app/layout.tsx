import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Binance", description: "Buy, trade and hold crypto. Binance clone PWA.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Binance", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-180.png" },
};
export const viewport: Viewport = { themeColor: "#1f242f", width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" /></head>
      <body>{children}</body>
    </html>
  );
}
