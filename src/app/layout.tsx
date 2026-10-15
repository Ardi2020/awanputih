import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";

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
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                © 2026 <strong>Awanputih</strong> — Sistem Laporan Pekanan & Perhalaqahan
              </div>
              <div className="text-slate-400">
                Sesuai Spesifikasi PRD v0.1 • 4 Role RBAC • Mobile Friendly NFR-003
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
