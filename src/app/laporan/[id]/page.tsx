"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  Phone,
  ShieldAlert,
  Download,
} from "lucide-react";

export default function LaporanDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { currentUser, allLaporans } = useApp();

  const report = allLaporans.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Laporan Tidak Ditemukan</h1>
        <p className="text-slate-600 text-sm mb-4">Laporan dengan ID &apos;{id}&apos; tidak ada dalam sistem.</p>
        <Link href="/laporan" className="text-xs text-blue-600 font-bold hover:underline">
          Kembali ke Daftar Laporan
        </Link>
      </div>
    );
  }

  // Security check: Scope based
  const isAuthorized =
    (currentUser.role === "Guru" && report.guruId === currentUser.id) ||
    (currentUser.role === "Asmen" && report.asmenId === currentUser.id) ||
    (currentUser.role === "Manager" && report.mahaliId === currentUser.mahaliId);

  if (!isAuthorized) {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak (403 Forbidden)</h1>
        <p className="text-slate-600 text-sm mb-6">
          Anda tidak memiliki hak untuk melihat laporan di luar cakupan kewenangan Anda.
        </p>
        <button
          onClick={() => router.push("/laporan")}
          className="touch-target px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
        >
          Kembali ke Laporan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/laporan"
          className="touch-target inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Laporan</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                {report.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Submitted (Baca Saja)</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{report.halaqahNama}</h1>
          </div>

          <div className="text-xs text-slate-500 self-start sm:self-auto sm:text-right">
            <div>Periode: <strong>{report.periodeLabel}</strong></div>
            {report.submittedAt && (
              <div>Dikirim pada: {new Date(report.submittedAt).toLocaleString("id-ID")}</div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-400 block mb-1">Kehadiran</span>
          <span className="text-2xl font-black text-emerald-600">
            {report.ringkasan.persentaseKehadiran}%
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {report.ringkasan.totalHadir} dari {report.ringkasan.totalAnggota} hadir
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-400 block mb-1">Izin / Sakit / Alpa</span>
          <span className="text-xl font-bold text-slate-800">
            {report.ringkasan.totalIzin} / {report.ringkasan.totalSakit} / {report.ringkasan.totalAlpa}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Status anggota</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-400 block mb-1">Total SPP Bulanan</span>
          <span className="text-xl font-black text-emerald-700">
            {formatRupiah(report.ringkasan.totalSpp)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Iuran bulanan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-400 block mb-1">Status Kegiatan</span>
          <span className="text-sm font-bold text-slate-900 block mt-1">
            {report.infoUmum.terlaksana ? "Terlaksana" : "Tidak Terlaksana"}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {report.infoUmum.tanggalPelaksanaan || "-"}
          </span>
        </div>
      </div>

      {/* Info Pelaksanaan Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs text-slate-600">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Informasi Pelaksanaan & Materi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-slate-400 block mb-0.5">Guru Pengampu:</span>
            <span className="font-semibold text-slate-900 text-sm">{report.guruNama}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Waktu Kegiatan:</span>
            <span className="font-semibold text-slate-900">
              {report.infoUmum.tanggalPelaksanaan || "-"}, {report.infoUmum.jamPelaksanaan || "-"}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400 block mb-0.5">Buku & Bab / Halaman:</span>
            <span className="font-semibold text-slate-900">
              {report.infoUmum.materiBuku || "-"} {report.infoUmum.babHalaman ? `(${report.infoUmum.babHalaman})` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Detail Anggota / Pemuda (Preserving all fields: kehadiran, kontrol, kontak, buletin, SPP) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Rincian Capaian Per Anggota ({report.laporanPemuda.length} Pemuda)
        </h2>

        <div className="space-y-3">
          {report.laporanPemuda.map((p, idx) => (
            <div
              key={p.pemudaId}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{p.pemudaNama}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      p.kehadiran === "Hadir"
                        ? "bg-emerald-100 text-emerald-800"
                        : p.kehadiran === "Izin"
                        ? "bg-blue-100 text-blue-800"
                        : p.kehadiran === "Sakit"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {p.kehadiran}
                  </span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    SPP Bulanan: {formatRupiah(p.sppNominal)}
                  </span>
                </div>
              </div>

              {/* Kontrol Ibadah */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className={p.kontrolPekanan.tilawah ? "text-emerald-600 font-bold" : "text-slate-400"}>
                    {p.kontrolPekanan.tilawah ? "✓" : "✗"} Tilawah
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={p.kontrolPekanan.shalatJamaah ? "text-emerald-600 font-bold" : "text-slate-400"}>
                    {p.kontrolPekanan.shalatJamaah ? "✓" : "✗"} Shalat Jama&apos;ah
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={p.kontrolPekanan.qiyamulLail ? "text-emerald-600 font-bold" : "text-slate-400"}>
                    {p.kontrolPekanan.qiyamulLail ? "✓" : "✗"} Qiyamul Lail
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={p.kontrolPekanan.shaumSunnah ? "text-emerald-600 font-bold" : "text-slate-400"}>
                    {p.kontrolPekanan.shaumSunnah ? "✓" : "✗"} Shaum Sunnah
                  </span>
                </div>
              </div>

              {/* Kontak Personal & Buletin */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>
                  Kontak Personal: <strong>{p.kontakPersonal ? "Ya" : "Tidak"}</strong>
                  {p.catatanKontak ? ` (${p.catatanKontak})` : ""}
                </span>
                <span>Buletin Cetak: <strong>{p.buletinCetak ? "Diterima" : "Tidak"}</strong></span>
                <span>Buletin Digital: <strong>{p.buletinDigital ? "Diterima" : "Tidak"}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
