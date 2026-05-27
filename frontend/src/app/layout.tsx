import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexusDeFi — Next-Gen Staking Platform",
  description: "The future of decentralized staking. Stake, earn, govern, and build the DeFi ecosystem.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "#131A2B", color: "#fff", border: "1px solid #1E293B" },
              success: { iconTheme: { primary: "#00E676", secondary: "#0A0E17" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
          <div className="grid-lines fixed inset-0 pointer-events-none opacity-30 z-0" />
          <Navbar />
          <main className="relative z-10 pt-24 min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
