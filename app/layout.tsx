import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import PasscodeGate from "@/components/PasscodeGate";
import { DataProvider } from "@/contexts/DataContext";

export const metadata: Metadata = {
  title: "CLB Bóng bàn BIBLIO",
  description: "Ghi điểm thi đấu CLB Bóng bàn BIBLIO",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BB BIBLIO",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <PasscodeGate>
          <DataProvider>
            {/* max-w-md centers on large screens, pb-20 clears bottom nav */}
            <div className="max-w-md mx-auto" style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}>
              {children}
            </div>
            <BottomNav />
          </DataProvider>
        </PasscodeGate>
      </body>
    </html>
  );
}
