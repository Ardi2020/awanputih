"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";

export default function TugasActionPlanPage() {
  const { currentUser, scopedActionPlans, updateActionPlanProgress, evaluateActionPlan } = useApp();

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [asmenSection, setAsmenSection] = useState<"ALL" | "TO_GURU" | "FROM_MGR">("ALL");
  const [toast, setToast] = useState<string | null>(null);

  const plans = scopedActionPlans.filter((p) => {
    if (filterStatus !== "ALL" && p.status !== filterStatus) return false;
    if (currentUser.role === "Asmen") {
      if (asmenSection === "TO_GURU" && p.level !== "ASMEN_TO_GURU") return false;
      if (asmenSection === "FROM_MGR" && p.level !== "MANAJER_TO_ASMEN") return false;
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {currentUser.role === "Manager"
            ? "Menu Action Plan — Kendali Keputusan Manajer"
            : currentUser.role === "Asmen"
            ? "Menu Tugas — Tugas untuk Guru & Arahan dari Manajer"
            : "Menu Tugas — Action Plan & Arahan Asmen"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Alur resmi: Belum Dimulai → Berjalan (Hampir Deadline / Terlambat) → Menunggu Evaluasi → Selesai.
        </p>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Special Split for Asmen (Spec 4.F: Tugas untuk Guru vs Tugas dari Manajer) */}
      {currentUser.role === "Asmen" && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => setAsmenSection("ALL")}
            className={`py-2.5 px-3 rounded-xl font-bold border ${
              asmenSection === "ALL" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            Semua Tugas ({scopedActionPlans.length})
          </button>
          <button
            onClick={() => setAsmenSection("TO_GURU")}
            className={`py-2.5 px-3 rounded-xl font-bold border ${
              asmenSection === "TO_GURU" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            Tugas untuk Guru
          </button>
          <button
            onClick={() => setAsmenSection("FROM_MGR")}
            className={`py-2.5 px-3 rounded-xl font-bold border ${
              asmenSection === "FROM_MGR" ? "bg-purple-700 text-white border-purple-700" : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            Tugas dari Manajer
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {["ALL", "Belum Dimulai", "Berjalan", "Hampir Deadline", "Terlambat", "Menunggu Evaluasi", "Selesai"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl font-bold border shrink-0 transition ${
              filterStatus === st
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {st === "ALL" ? "Semua Status" : st}
          </button>
        ))}
      </div>

      {/* Action Plan Cards */}
      <div className="space-y-3.5">
        {plans.map((ap) => {
          const isPic = ap.picId === currentUser.id;
          const isReviewer =
            ap.pemberiId === currentUser.id ||
            (currentUser.role === "Manager" && ap.level === "MANAJER_TO_ASMEN") ||
            (currentUser.role === "Asmen" && ap.level === "ASMEN_TO_GURU");

          return (
            <div key={ap.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        ap.prioritas === "Kritis"
                          ? "bg-red-600 text-white"
                          : ap.prioritas === "Tinggi"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ap.prioritas}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {ap.level === "MANAJER_TO_ASMEN" ? "Arahan Manajer → Asmen" : "Tugas Asmen → Guru"}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">{ap.judul}</h3>
                  <div className="text-xs text-slate-500">Sumber Masalah: {ap.sumberMasalah}</div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    ap.status === "Selesai"
                      ? "bg-emerald-100 text-emerald-800"
                      : ap.status === "Terlambat"
                      ? "bg-red-100 text-red-800"
                      : ap.status === "Menunggu Evaluasi"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {ap.status} ({ap.progres}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${ap.progres}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400">PIC Pelaksana:</span>{" "}
                  <strong className="text-slate-900">{ap.picNama}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Deadline:</span>{" "}
                  <strong className="text-slate-900">{ap.deadline}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Instruksi Tindakan:</span>{" "}
                  <strong className="text-slate-800">{ap.tindakan}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Target Hasil:</span>{" "}
                  <span className="text-emerald-800 font-semibold">{ap.targetHasil}</span>
                </div>
                {ap.catatanProgres && (
                  <div className="sm:col-span-2 text-blue-900 bg-blue-50 p-2 rounded-lg">
                    <strong>Update Progres PIC:</strong> {ap.catatanProgres}
                  </div>
                )}
              </div>

              {/* Interactive Controls for PIC (Guru/Asmen) and Evaluator (Asmen/Manager) */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1 text-xs">
                {(isPic || currentUser.role === "Guru") && ap.status !== "Selesai" && (
                  <>
                    <button
                      onClick={() => {
                        const res = updateActionPlanProgress(
                          ap.id,
                          Math.min(100, ap.progres + 25),
                          "Tindak lanjut lapangan telah dijalankan sesuai arahan.",
                          ap.progres + 25 >= 100
                        );
                        showToast(res.message);
                      }}
                      className="touch-target px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                    >
                      + Perbarui Progres (+25%)
                    </button>
                    <button
                      onClick={() => {
                        const res = updateActionPlanProgress(
                          ap.id,
                          100,
                          "Seluruh instruksi dan bukti telah selesai, siap dievaluasi.",
                          true
                        );
                        showToast(res.message);
                      }}
                      className="touch-target px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
                    >
                      ✓ Tandai Siap Dievaluasi (100%)
                    </button>
                  </>
                )}

                {isReviewer && ap.status !== "Selesai" && (
                  <>
                    <button
                      onClick={() => {
                        const res = evaluateActionPlan(
                          ap.id,
                          "Selesai",
                          "Hasil terverifikasi dan indikator masalah telah pulih."
                        );
                        showToast(res.message);
                      }}
                      className="touch-target px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                    >
                      ✓ Terima & Tutup (Selesai)
                    </button>
                    <button
                      onClick={() => {
                        const res = evaluateActionPlan(
                          ap.id,
                          "Berjalan",
                          "Mohon lengkapi bukti catatan pertemuan sebelum ditutup."
                        );
                        showToast(res.message);
                      }}
                      className="touch-target px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold"
                    >
                      ↩ Kembalikan untuk Dilengkapi
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
