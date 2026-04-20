import type { Metadata, Viewport } from "next";
import "./globals.css";
import TerminalNav from "@/components/TerminalNav";

export const metadata: Metadata = {
  title: "BrainDump",
  description: "Capture, classify, and act on your ideas",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#101010",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <TerminalNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
