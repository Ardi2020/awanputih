"use client";

import React from "react";
import { useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import LoginScreen from "@/components/LoginScreen";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {children}
      </main>
      <footer className="hidden md:block bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 <strong>Awanputih</strong> — Sistem Kendali Pembinaan, Halaqah, Iltizamat & Laporan
          </div>
          <div className="text-slate-400">
            Sesuai Blueprint MENU APK AWANPUTIH • 5 Role RBAC + Admin CRUD • Mobile First
          </div>
        </div>
      </footer>
    </>
  );
}
