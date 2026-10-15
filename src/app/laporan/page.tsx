"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { formatRupiah } from "@/lib/utils";
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calendar,
  Users,
  Search,
} from "lucide-react";

export default function LaporanListPage() {
  const { currentUser, scopedLaporans, scopedHalaqahs, periode } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const isGuru = currentUser.role === "Guru";
  const isAsmen = currentUser.role === "Asmen";
  const isManager = currentUser.role === "Manager";

  const filteredReports = scopedLaporans.filter((r) => {
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (
      searchQuery &&
      !r.halaqahNama.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.guruNama.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isGuru
              ? "Laporan Pekanan Saya"
              : isAsmen
              ? "Laporan Kelompok Binaan"
              : isManager
              ? "Status Pelaporan Mahali"
              : "Laporan Pekanan"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isGuru
              ? "Seluruh laporan kegiatan halaqah pekanan yang Anda ampu."
              : isAsmen
              ? "Pemantauan berkala laporan kegiatan halaqah kelompok binaan Anda."
              : "Ringkasan pelaporan seluruh kelompok halaqah di wilayah mahali."}
          </p>
        </div>

        {isGuru && scopedHalaqahs.length > 0 && (
          <Link
            href="/laporan/buat"
            className="touch-target px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Isi Laporan Pekanan</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`touch-target px-3.5 py-2 rounded-xl font-semibold transition ${
              filterStatus === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Semua ({scopedLaporans.length})
          </button>
          <button
            onClick={() => setFilterStatus("Submitted")}
            className={`touch-target px-3.5 py-2 rounded-xl font-semibold transition ${
              filterStatus === "Submitted"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Terkirim ({scopedLaporans.filter((r) => r.status === "Submitted").length})
          </button>
          <button
            onClick={() => setFilterStatus("Draf")}
            className={`touch-target px-3.5 py-2 rounded-xl font-semibold transition ${
              filterStatus === "Draf"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Draf ({scopedLaporans.filter((r) => r.status === "Draf").length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari halaqah / guru..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Reports Table / Cards (Mobile-friendly layout) */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Laporan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            {searchQuery
              ? "Tidak ditemukan laporan yang sesuai kata kunci pencarian Anda."
              : isGuru
              ? "Belum ada laporan untuk pekan ini. Silakan buat laporan pekanan baru."
              : "Belum ada laporan pekanan yang tercatat."}
          </p>
          {isGuru && scopedHalaqahs.length > 0 && (
            <Link
              href="/laporan/buat"
              className="touch-target px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Isi Laporan Sekarang</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((r) => {
            const isSubmitted = r.status === "Submitted";
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{r.halaqahNama}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {r.periodeLabel}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isSubmitted
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isSubmitted ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{isSubmitted ? "Terkirim (Baca Saja)" : "Draf"}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {!isGuru && <span>Guru: <strong>{r.guruNama}</strong></span>}
                    <span>Kehadiran: <strong>{r.ringkasan.totalHadir} / {r.ringkasan.totalAnggota} ({r.ringkasan.persentaseKehadiran}%)</strong></span>
                    <span>Total Iuran Bulanan: <strong>{formatRupiah(r.ringkasan.totalSpp)}</strong></span>
                    <span>Pelaksanaan: <strong>{r.infoUmum.terlaksana ? "Terlaksana" : "Tidak Terlaksana"}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={isSubmitted ? `/laporan/${r.id}` : `/laporan/buat?laporanId=${r.id}&halaqahId=${r.halaqahId}`}
                    className="touch-target px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span>{isSubmitted ? "Lihat Detail" : "Lanjutkan Draf"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
