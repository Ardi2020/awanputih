"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import {
  Cloud,
  Globe,
  Lock,
  UserCheck,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  LogIn,
} from "lucide-react";

export default function LoginScreen() {
  const {
    allUsers,
    detectedBrowserEmail,
    setDetectedBrowserEmail,
    loginWithTestAccount,
    loginWithBrowserEmail,
  } = useApp();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("test");
  const [browserEmailInput, setBrowserEmailInput] = useState(detectedBrowserEmail || "asmuliardi@gmail.com");
  const [browserType, setBrowserType] = useState<"Chrome" | "Edge">("Chrome");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTestLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = loginWithTestAccount(username, password);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleQuickRoleTest = (roleUser: string) => {
    setUsername(roleUser);
    setPassword("test");
    setErrorMsg(null);
    const res = loginWithTestAccount(roleUser, "test");
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleBrowserEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const clean = browserEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setErrorMsg("Masukkan alamat email akun Google Chrome / Microsoft Edge yang valid.");
      return;
    }
    setDetectedBrowserEmail(clean);
    const res = loginWithBrowserEmail(clean);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const registeredUserMatch = allUsers.find(
    (u) => u.email.toLowerCase() === browserEmailInput.trim().toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900">
      <div className="w-full max-w-md space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 mx-auto border border-emerald-300/30">
            <Cloud className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            AWAN<span className="text-emerald-400">PUTIH</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-xs mx-auto">
            Sistem Kendali Pembinaan, Perhalaqahan, Iltizamat & Laporan Pekanan Berbasis Role
          </p>
        </div>

        {/* Notice: No Self-Registration */}
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">Tidak Ada Registrasi Mandiri:</span> Pendaftaran akun dilakukan
            terpusat oleh <strong>Mahali / Admin / AJM (Asmen)</strong> dengan mendaftarkan email Guru atau pengurus.
            Aplikasi langsung mendeteksi email dari sesi login <strong>Chrome</strong> atau <strong>Edge</strong> Anda.
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* =====================================================================
            BAGIAN 1: DETEKSI OTOMATIS EMAIL LOGIN CHROME / EDGE
        ===================================================================== */}
        <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Deteksi Email Login {browserType}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Otomatis masuk sesuai email yang aktif di browser
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setBrowserType("Chrome")}
                className={`px-2 py-1 rounded-lg transition ${
                  browserType === "Chrome" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
                }`}
              >
                Chrome
              </button>
              <button
                type="button"
                onClick={() => setBrowserType("Edge")}
                className={`px-2 py-1 rounded-lg transition ${
                  browserType === "Edge" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"
                }`}
              >
                Edge
              </button>
            </div>
          </div>

          <form onSubmit={handleBrowserEmailLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Email Akun {browserType} yang Terdeteksi Saat Ini:
              </label>
              <input
                type="email"
                required
                value={browserEmailInput}
                onChange={(e) => setBrowserEmailInput(e.target.value)}
                placeholder="asmuliardi@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-slate-400">Contoh cepat:</span>
                {[
                  "asmuliardi@gmail.com",
                  "surya@awanputih.click",
                  "david@awanputih.click",
                  "nandes@awanputih.click",
                ].map((sampleEmail) => (
                  <button
                    key={sampleEmail}
                    type="button"
                    onClick={() => setBrowserEmailInput(sampleEmail)}
                    className={`px-2 py-0.5 rounded-md font-semibold border transition ${
                      browserEmailInput.toLowerCase() === sampleEmail
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {sampleEmail}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Deteksi */}
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-950 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  {registeredUserMatch ? (
                    <>
                      Terdaftar: <strong>{registeredUserMatch.name}</strong> ({registeredUserMatch.role})
                    </>
                  ) : (
                    <>
                      Langsung masuk sebagai user: <strong>{browserEmailInput || "asmuliardi@gmail.com"}</strong>
                    </>
                  )}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 text-[10px] font-black shrink-0">
                SSO {browserType}
              </span>
            </div>

            <button
              type="submit"
              className="w-full touch-target py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Otomatis dengan {browserEmailInput || "asmuliardi@gmail.com"}</span>
            </button>
          </form>
        </div>

        {/* =====================================================================
            BAGIAN 2: LOGIN UJI COBA ROLE (role : test)
        ===================================================================== */}
        <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">
                Login Uji Coba Role (<code className="text-emerald-700">role : test</code>)
              </h2>
              <p className="text-[11px] text-slate-500">
                Khusus pengujian fungsi Manajer, Asmen (AJM), Guru, PJ Mal & Admin
              </p>
            </div>
          </div>

          {/* 1-Tap Quick Role Chips */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Klik Langsung untuk Uji Coba Cepat (Password: test):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { user: "admin", label: "admin : test", sub: "Full CRUD Master", color: "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100" },
                { user: "asmen", label: "asmen : test", sub: "AJM (+CRUD Guru/Murid)", color: "bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100" },
                { user: "guru", label: "guru : test", sub: "Musyrif Halaqah", color: "bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100" },
                { user: "manajer", label: "manajer : test", sub: "Manajer Mahali", color: "bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100" },
                { user: "pjmal", label: "pjmal : test", sub: "Keuangan / Iltizamat", color: "bg-teal-50 border-teal-300 text-teal-900 hover:bg-teal-100" },
              ].map((item) => (
                <button
                  key={item.user}
                  type="button"
                  onClick={() => handleQuickRoleTest(item.user)}
                  className={`p-2 rounded-xl border text-left transition ${item.color}`}
                >
                  <div className="font-black text-xs">{item.label}</div>
                  <div className="text-[10px] opacity-80 truncate">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Username & Password Form */}
          <form onSubmit={handleTestLoginSubmit} className="space-y-3 pt-1 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  User / Role:
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / guru / asmen"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password Uji Coba:
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="test"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full touch-target py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login Uji Coba ({username || "role"}:{password || "test"})</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
