import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Awanputih — Laporan Pekanan dan Perhalaqahan Berbasis Role",
  description: "Aplikasi manajemen halaqah, laporan kegiatan pekanan, dan validasi berbasis empat role.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
