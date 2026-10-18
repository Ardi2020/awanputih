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
  Search,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  MessageSquare,
} from "lucide-react";

export default function LaporanListPage() {
  const { currentUser, scopedLaporans, scopedHalaqahs, verifyLaporan } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [revisiTargetId, setRevisiTargetId] = useState<string | null>(null);
  const [catatanRevisi, setCatatanRevisi] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isGuru = currentUser.role === "Guru";
  const isAsmen = currentUser.role === "Asmen";
  const isManager = currentUser.role === "Manager";

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getNormalizedStatus = (r: { status: string; verifikasiStatus?: string }) => {
    const s = r.verifikasiStatus || r.status;
    if (s === "Diverifikasi") return "Diverifikasi";
    if (s === "Perlu Perbaikan") return "Perlu Perbaikan";
    if (s === "Submitted" || s === "Dikirim") return "Dikirim";
    return "Draft";
  };

  const filteredReports = scopedLaporans.filter((r) => {
    const norm = getNormalizedStatus(r);
    if (filterStatus !== "ALL" && norm !== filterStatus) return false;
    if (
      searchQuery &&
      !r.halaqahNama.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.guruNama.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleVerifikasi = (id: string, status: "Diverifikasi" | "Perlu Perbaikan") => {
    if (status === "Perlu Perbaikan" && !catatanRevisi.trim()) return;
    verifyLaporan(
      id,
      status,
      status === "Perlu Perbaikan"
        ? catatanRevisi.trim()
        : "Data kehadiran, materi, dan setoran kursus pekanan telah sesuai."
    );
    setRevisiTargetId(null);
    setCatatanRevisi("");
    showToast(
      status === "Diverifikasi"
        ? "Sub-laporan kursus berhasil diverifikasi!"
        : "Sub-laporan dikembalikan ke Guru dengan catatan perbaikan."
    );
  };

  return (
    <div className="space-y-5 pb-10">
      {toastMsg && (
        <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
            Pekan Berjalan & Riwayat
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {isGuru
              ? "Laporan Pekanan & Sub-Laporan Halaqah"
              : isAsmen
              ? "Verifikasi Laporan Pekanan Guru"
              : isManager
              ? "Status Pelaporan Pekanan Mahali"
              : "Laporan Pekanan"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGuru
              ? "Setiap halaqah yang Anda ampu memiliki status verifikasi mandiri agar perbaikan cukup dilakukan pada kelompok yang terkendala saja."
              : isAsmen
              ? "Verifikasi sub-laporan tiap halaqah atau kembalikan dengan catatan spesifik tanpa menolak seluruh laporan guru."
              : "Ringkasan pelaporan seluruh kelompok halaqah di wilayah mahali."}
          </p>
        </div>

        {isGuru && scopedHalaqahs.length > 0 && (
          <Link
            href="/laporan/buat"
            className="touch-target px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Isi Laporan Pekanan</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: "Semua", count: scopedLaporans.length },
            {
              id: "Dikirim",
              label: "Menunggu Verifikasi",
              count: scopedLaporans.filter((r) => getNormalizedStatus(r) === "Dikirim").length,
            },
            {
              id: "Perlu Perbaikan",
              label: "Perlu Perbaikan",
              count: scopedLaporans.filter((r) => getNormalizedStatus(r) === "Perlu Perbaikan")
                .length,
            },
            {
              id: "Diverifikasi",
              label: "Diverifikasi",
              count: scopedLaporans.filter((r) => getNormalizedStatus(r) === "Diverifikasi")
                .length,
            },
            {
              id: "Draft",
              label: "Draft",
              count: scopedLaporans.filter((r) => getNormalizedStatus(r) === "Draft").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
                filterStatus === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari halaqah / guru..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Reports Cards */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Laporan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Tidak ditemukan laporan yang sesuai dengan filter atau pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((r) => {
            const normStatus = getNormalizedStatus(r);
            const halaqahObj = scopedHalaqahs.find((h) => h.id === r.halaqahId);

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{r.halaqahNama}</span>
                      {halaqahObj?.jenis && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            halaqahObj.jenis === "Karyawan"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {halaqahObj.jenis}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.periodeLabel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          normStatus === "Diverifikasi"
                            ? "bg-emerald-100 text-emerald-800"
                            : normStatus === "Perlu Perbaikan"
                            ? "bg-red-100 text-red-700"
                            : normStatus === "Dikirim"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {normStatus === "Diverifikasi" ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : normStatus === "Perlu Perbaikan" ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{normStatus}</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {!isGuru && (
                        <span>
                          Guru: <strong>{r.guruNama}</strong>
                        </span>
                      )}
                      <span>
                        Kehadiran:{" "}
                        <strong>
                          {r.ringkasan.totalHadir}/{r.ringkasan.totalAnggota} (
                          {r.ringkasan.persentaseKehadiran}%)
                        </strong>
                      </span>
                      <span>
                        Setoran Iltizamat: <strong>{formatRupiah(r.ringkasan.totalSpp)}</strong>
                      </span>
                      <span>
                        Status Kursus:{" "}
                        <strong>{r.infoUmum.terlaksana ? "Terlaksana" : "Tertunda"}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {isAsmen && (normStatus === "Dikirim" || normStatus === "Perlu Perbaikan") && (
                      <>
                        <button
                          onClick={() => handleVerifikasi(r.id, "Diverifikasi")}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verifikasi</span>
                        </button>
                        <button
                          onClick={() =>
                            setRevisiTargetId(revisiTargetId === r.id ? null : r.id)
                          }
                          className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Minta Perbaikan</span>
                        </button>
                      </>
                    )}

                    <Link
                      href={
                        normStatus === "Draft" || normStatus === "Perlu Perbaikan"
                          ? `/laporan/buat?laporanId=${r.id}&halaqahId=${r.halaqahId}`
                          : `/laporan/${r.id}`
                      }
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <span>
                        {normStatus === "Draft"
                          ? "Lanjutkan Draft"
                          : normStatus === "Perlu Perbaikan" && isGuru
                          ? "Perbaiki Sub-Laporan"
                          : "Lihat Detail"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Catatan Verifikasi Asmen jika ada */}
                {r.catatanAsmen && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      normStatus === "Perlu Perbaikan"
                        ? "bg-red-50 border-red-200 text-red-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Catatan Verifikasi Asmen: </span>
                      <span>{r.catatanAsmen}</span>
                    </div>
                  </div>
                )}

                {/* Form input catatan perbaikan Asmen */}
                {revisiTargetId === r.id && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
                    <label className="block text-xs font-bold text-amber-950">
                      Catatan Perbaikan Spesifik untuk Sub-Laporan {r.halaqahNama}:
                    </label>
                    <textarea
                      rows={2}
                      value={catatanRevisi}
                      onChange={(e) => setCatatanRevisi(e.target.value)}
                      placeholder="Contoh: Mohon lengkapi alasan ketidakhadiran 2 anggota dan lampirkan nominal setoran tunai..."
                      className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRevisiTargetId(null)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-600"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleVerifikasi(r.id, "Perlu Perbaikan")}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                      >
                        Kirim Catatan Revisi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
