"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import {
  Users,
  BarChart3,
  AlertTriangle,
  ClipboardList,
  Award,
  CheckCircle2,
  ArrowRight,
  Plus,
} from "lucide-react";

type DetailTab = "ringkasan" | "kpi" | "guru" | "masalah" | "actionplan" | "pengembangan";

export default function AsmenPage() {
  const { allUsers, allHalaqahs, allLaporans, allPrioritas, allActionPlans } = useApp();
  const asmenList = allUsers.filter((u) => u.role === "Asmen");

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedAsmenId, setSelectedAsmenId] = useState<string>(asmenList[0]?.id || "usr-asmen-1");
  const [activeTab, setActiveTab] = useState<DetailTab>("ringkasan");

  const filteredAsmens = asmenList.filter((a) =>
    filterStatus === "ALL" ? true : a.statusKesehatan === filterStatus
  );

  const selectedAsmen = asmenList.find((a) => a.id === selectedAsmenId) || asmenList[0];
  const asmenGurus = allUsers.filter((u) => u.role === "Guru" && u.asmenId === selectedAsmen?.id);
  const asmenHalaqahs = allHalaqahs.filter((h) => h.asmenId === selectedAsmen?.id);
  const asmenMasalahs = allPrioritas.filter((p) => p.asmenId === selectedAsmen?.id);
  const asmenPlans = allActionPlans.filter((ap) => ap.asmenId === selectedAsmen?.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Menu Asmen — Perbandingan & Kendali 4 Asmen
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manajer mengontrol 4 Asmen serta membaca bukti sampai level Guru, Kursus, dan Pemuda.
          </p>
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {["ALL", "Sehat", "Sedang", "Sakit"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold border transition shrink-0 ${
                filterStatus === st
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {st === "ALL" ? "Semua (4)" : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Asmen Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredAsmens.map((asmen) => {
          const isSelected = asmen.id === selectedAsmen?.id;
          const gCount = allUsers.filter((u) => u.role === "Guru" && u.asmenId === asmen.id).length || 4;
          const hCount = allHalaqahs.filter((h) => h.asmenId === asmen.id).length || 8;
          const mCount = allPrioritas.filter((p) => p.asmenId === asmen.id).length;
          const apCount = allActionPlans.filter((ap) => ap.asmenId === asmen.id && ap.status !== "Selesai").length;

          return (
            <button
              key={asmen.id}
              onClick={() => setSelectedAsmenId(asmen.id)}
              className={`text-left p-4 rounded-2xl border transition flex flex-col justify-between ${
                isSelected
                  ? "bg-purple-50/70 border-purple-600 ring-2 ring-purple-500/20 shadow-md"
                  : "bg-white border-slate-200 hover:border-purple-300 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-black text-slate-900 text-sm">{asmen.name}</div>
                    <div className="text-[11px] text-slate-500">{asmen.wilayahNama}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${
                      asmen.statusKesehatan === "Sehat"
                        ? "bg-emerald-100 text-emerald-800"
                        : asmen.statusKesehatan === "Sakit"
                        ? "bg-red-600 text-white"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {asmen.skorKesehatan} • {asmen.statusKesehatan}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                  <div>Guru: <strong>{gCount}</strong></div>
                  <div>Kursus: <strong>{hCount}</strong></div>
                  <div>Masalah: <strong className="text-red-600">{mCount}</strong></div>
                  <div>Action Plan: <strong>{apCount}</strong></div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-bold text-purple-700 flex items-center justify-between">
                <span>Lihat Detail 6 Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Asmen 6-Tab Detail View */}
      {selectedAsmen && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/30 text-purple-200">
                DETAIL KENDALI ASMEN
              </span>
              <h2 className="text-lg sm:text-xl font-black mt-1">
                {selectedAsmen.name} — {selectedAsmen.wilayahNama}
              </h2>
              <p className="text-xs text-slate-300">
                Skor Kesehatan: <strong>{selectedAsmen.skorKesehatan} ({selectedAsmen.statusKesehatan})</strong> • Intervensi utama diberikan kepada Asmen, bukan melewati Asmen.
              </p>
            </div>
            <Link
              href="/tugas"
              className="touch-target px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Action Plan ke Asmen</span>
            </Link>
          </div>

          {/* 6 Tabs (Spec 2.C) */}
          <div className="flex items-center gap-1 overflow-x-auto px-4 pt-3 border-b border-slate-200 text-xs">
            {(
              [
                { id: "ringkasan", label: "1. Ringkasan" },
                { id: "kpi", label: "2. KPI Wilayah" },
                { id: "guru", label: `3. Guru (${asmenGurus.length})` },
                { id: "masalah", label: `4. Masalah (${asmenMasalahs.length})` },
                { id: "actionplan", label: `5. Action Plan (${asmenPlans.length})` },
                { id: "pengembangan", label: "6. Pengembangan 3K-3M" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2.5 font-bold border-b-2 transition shrink-0 ${
                  activeTab === t.id
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "ringkasan" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-black text-slate-900 text-sm">Profil & Kapasitas Wilayah</div>
                  <div>Email: <strong>{selectedAsmen.email}</strong></div>
                  <div>Telepon: <strong>{selectedAsmen.telepon || "-"}</strong></div>
                  <div>Jumlah Guru Binaan: <strong>{asmenGurus.length} Guru</strong></div>
                  <div>Jumlah Kursus Aktif: <strong>{asmenHalaqahs.length} Kursus</strong></div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-black text-slate-900 text-sm">Ringkasan Kinerja Pekan Ini</div>
                  <div>Kehadiran Rata-rata: <strong>{selectedAsmen.skorKesehatan && selectedAsmen.skorKesehatan > 75 ? "81%" : "58%"} (Target 80%)</strong></div>
                  <div>Pelaksanaan Kontrol: <strong>86%</strong></div>
                  <div>Pelaksanaan Kontak: <strong>78%</strong></div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5">
                  <div className="font-black text-purple-950 text-sm">Catatan Manajer</div>
                  <p className="text-purple-900">
                    {selectedAsmen.diagnosis3K?.fokusPengembangan || "Fokus pada penguatan kontrol Guru dan pemulihan kursus bermasalah."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "kpi" && (
              <div className="space-y-3 text-xs">
                {[
                  { domain: "Kursus & Pembinaan (Kehadiran)", target: "80%", real: selectedAsmen.statusKesehatan === "Sakit" ? "58%" : "82%", selisih: selectedAsmen.statusKesehatan === "Sakit" ? "-22%" : "+2%", status: selectedAsmen.statusKesehatan || "Sehat" },
                  { domain: "Kontrol & Kontak Personal", target: "85%", real: "80%", selisih: "-5%", status: "Sedang" },
                  { domain: "Ketepatan Verifikasi Laporan", target: "100%", real: "92%", selisih: "-8%", status: "Sehat" },
                  { domain: "Keuangan & Iltizamat Wilayah", target: "95%", real: "88%", selisih: "-7%", status: "Sedang" },
                ].map((k, i) => (
                  <div key={i} className="p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{k.domain}</div>
                      <div className="text-slate-500 mt-0.5">
                        Target: <strong>{k.target}</strong> • Realisasi: <strong>{k.real}</strong> • Selisih: <strong>{k.selisih}</strong>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 self-start sm:self-center">
                      Status: {k.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "guru" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-medium">
                  Prinsip Hierarki: Manajer memonitor bukti Guru di bawah Asmen. Tindakan utama adalah <strong>Minta Asmen Menindaklanjuti</strong>, bukan memberi tugas langsung melewati Asmen.
                </div>
                {asmenGurus.length === 0 ? (
                  <div className="text-slate-500 py-4">Data Guru teragregasi pada rekap wilayah ini.</div>
                ) : (
                  asmenGurus.map((g) => (
                    <div key={g.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{g.name}</div>
                        <div className="text-slate-500">
                          {g.assignedHalaqahIds.length} Kursus • Status: <strong>{g.statusKesehatan} ({g.skorKesehatan})</strong>
                        </div>
                      </div>
                      <Link href="/tugas" className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold">
                        Minta Asmen Tindak Lanjuti
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "masalah" && (
              <div className="space-y-2.5 text-xs">
                {asmenMasalahs.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl border border-red-200 bg-red-50/40 space-y-1">
                    <div className="font-bold text-slate-900 text-sm">🔴 {m.judul}</div>
                    <div className="text-slate-600">Bukti: {m.buktiFakta}</div>
                    <div className="text-slate-500">Tindak lanjut Asmen: <strong>{m.tindakanAsmen}</strong></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "actionplan" && (
              <div className="space-y-2.5 text-xs">
                {asmenPlans.map((ap) => (
                  <div key={ap.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{ap.judul}</div>
                      <div className="text-slate-500">{ap.tindakan}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-900">
                      {ap.status} ({ap.progres}%)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "pengembangan" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="font-black text-slate-900 text-sm">
                  Diagnosis 3K & Intervensi Kepemimpinan 3M (Privat Manajer)
                </div>
                <p className="text-slate-500">
                  Sistem hanya mencatat fakta perilaku dan hasil percakapan (tanpa memberi label otomatis).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-500 uppercase text-[10px]">Kompetensi (K1)</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{selectedAsmen.diagnosis3K?.kompetensi}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-500 uppercase text-[10px]">Kekuatan (K2)</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{selectedAsmen.diagnosis3K?.kekuatan}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-500 uppercase text-[10px]">Kemandirian (K3) & Topi 3M</div>
                    <div className="font-semibold text-purple-800 mt-0.5">
                      {selectedAsmen.diagnosis3K?.kemandirian} → Pendekatan: {selectedAsmen.diagnosis3K?.intervensi3M}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-500 uppercase text-[10px]">Komitmen & Calon Penerus</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {selectedAsmen.diagnosis3K?.komitmenTerakhir} • Regenerasi: {selectedAsmen.diagnosis3K?.calonPenerus || "Sedang dipetakan"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
