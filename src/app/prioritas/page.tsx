"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { AlertTriangle, Plus, CheckCircle2, ArrowRight, ShieldAlert } from "lucide-react";

export default function PrioritasPage() {
  const { scopedPrioritas, createActionPlan } = useApp();
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [toast, setToast] = useState<string | null>(null);

  const filtered = scopedPrioritas.filter((p) =>
    filterLevel === "ALL" ? true : p.prioritas === filterLevel
  );

  const handleQuickCreateAP = (p: (typeof scopedPrioritas)[0]) => {
    const res = createActionPlan({
      judul: `Tindak Lanjut: ${p.judul}`,
      sumberMasalah: p.judul,
      picId: p.asmenId,
      tindakan: p.rekomendasi,
      targetHasil: "Masalah terselesaikan dan indikator kembali Sehat.",
      indikatorSelesai: "Bukti tindak lanjut terverifikasi",
      prioritas: p.prioritas,
      deadline: "2026-10-20",
      buktiDiminta: "Catatan hasil kontrol & laporan",
      halaqahId: p.halaqahId,
    });
    if (res.success) {
      setToast(res.message);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Menu Prioritas — Daftar Masalah & Matriks Dampak × Urgensi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Mengubah angka merah dan kuning menjadi daftar masalah berbasis fakta yang langsung dapat dijadikan Action Plan.
        </p>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Matriks Prioritas 2x2 (Spec 3.D: Dampak x Urgensi) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
          Matriks Prioritas (Dampak × Urgensi)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
            <div className="font-black text-red-900">🔴 Dampak Tinggi × Urgensi Tinggi (PRIORITAS KRITIS)</div>
            <p className="text-red-800 mt-1">
              • Kursus HU 03 Tidak Berjalan 2 Pekan (Asmen 2)
              <br />• Kehadiran Wilayah Asmen 4 Hanya 58%
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="font-black text-amber-900">🟠 Dampak Tinggi × Urgensi Rendah (RENCANAKAN SERIUS)</div>
            <p className="text-amber-800 mt-1">
              • Pemuda Rawan: Thariq Ziyad — Tidak hadir 2 pekan (HK-02)
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
            <div className="font-black text-blue-900">🟡 Dampak Rendah × Urgensi Tinggi (TANGANI TERJADWAL)</div>
            <p className="text-blue-800 mt-1">
              • Laporan Guru Ust. Budi Santoso mendekati deadline Jumat
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-black text-slate-800">⚪ Dampak Rendah × Urgensi Rendah (PANTAU)</div>
            <p className="text-slate-600 mt-1">
              • Penyesuaian jam pertemuan Halaqah Al-Fatih (HK-01)
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {["ALL", "Kritis", "Tinggi", "Sedang"].map((lv) => (
          <button
            key={lv}
            onClick={() => setFilterLevel(lv)}
            className={`px-3.5 py-2 rounded-xl font-bold border transition shrink-0 ${
              filterLevel === lv
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {lv === "ALL" ? `Semua (${scopedPrioritas.length})` : lv}
          </button>
        ))}
      </div>

      {/* Problem Cards */}
      <div className="space-y-3">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 mr-2">
                  {item.kategori}
                </span>
                <span className="text-xs text-slate-400">Mulai: {item.mulaiTerjadi}</span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {idx + 1}. {item.judul}
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                  item.prioritas === "Kritis"
                    ? "bg-red-600 text-white"
                    : item.prioritas === "Tinggi"
                    ? "bg-amber-500 text-slate-950"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {item.prioritas}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400">Asmen / Wilayah:</span>{" "}
                <strong className="text-slate-800">{item.asmenNama}</strong>
              </div>
              {item.guruNama && (
                <div>
                  <span className="text-slate-400">Guru / Kursus:</span>{" "}
                  <strong className="text-slate-800">
                    {item.guruNama} ({item.halaqahNama})
                  </strong>
                </div>
              )}
              <div className="sm:col-span-2">
                <span className="text-slate-400">Fakta & Bukti:</span>{" "}
                <strong className="text-slate-900">{item.buktiFakta}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">Dampak Pembinaan:</span>{" "}
                <span className="text-red-700 font-semibold">{item.dampakDeskripsi}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">Rekomendasi Sistem:</span>{" "}
                <span className="text-emerald-800 font-semibold">{item.rekomendasi}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-xs font-bold text-slate-500">
                Status Tindak Lanjut: <strong className="text-slate-800">{item.statusTindakLanjut}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickCreateAP(item)}
                  className="touch-target px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Jadikan Action Plan</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
