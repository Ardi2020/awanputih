"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { formatRupiah } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Filter,
  Download,
} from "lucide-react";

export default function RekapMahaliPage() {
  const { currentUser, allUsers, allHalaqahs, allLaporans, periode } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState(periode.id);

  const isManager = currentUser.role === "Manager";
  const isAsmen = currentUser.role === "Asmen";

  // Scoped halaqahs for rekap
  const relevantHalaqahs = isManager
    ? allHalaqahs.filter((h) => h.mahaliId === currentUser.mahaliId)
    : isAsmen
    ? allHalaqahs.filter((h) => h.asmenId === currentUser.id)
    : allHalaqahs;

  const relevantLaporans = allLaporans.filter(
    (r) =>
      r.periodeId === selectedPeriod &&
      relevantHalaqahs.some((h) => h.id === r.halaqahId)
  );

  const totalHalaqah = relevantHalaqahs.length;
  const submittedReports = relevantLaporans.filter((r) => r.status === "Submitted");
  const draftReports = relevantLaporans.filter((r) => r.status === "Draf");
  const unsubmittedCount = totalHalaqah - submittedReports.length;

  const totalSpp = submittedReports.reduce((acc, r) => acc + r.ringkasan.totalSpp, 0);
  const totalHadir = submittedReports.reduce((acc, r) => acc + r.ringkasan.totalHadir, 0);
  const totalAnggota = submittedReports.reduce((acc, r) => acc + r.ringkasan.totalAnggota, 0);
  const avgAttendance = totalAnggota > 0 ? Math.round((totalHadir / totalAnggota) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Rekapitulasi Capaian Mahali
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitoring performa pelaporan, kehadiran, dan iuran SPP pekanan.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-transparent focus:outline-none text-slate-800"
          >
            <option value="2026-W41">Pekan 41 (11–17 Okt 2026)</option>
            <option value="2026-W40">Pekan 40 (04–10 Okt 2026)</option>
          </select>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Total Kelompok</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalHalaqah}</div>
          <div className="text-xs text-slate-500 mt-1">Dalam lingkup wilayah</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Laporan Masuk</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {submittedReports.length} / {totalHalaqah}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalHalaqah > 0 ? Math.round((submittedReports.length / totalHalaqah) * 100) : 0}% kepatuhan
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Rata-rata Kehadiran</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-2">
            {totalAnggota > 0 ? `${avgAttendance}%` : "Belum Ada Laporan"}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {totalHadir} hadir dari {totalAnggota} pemuda
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Total SPP Terkumpul</span>
          <div className="text-xl sm:text-2xl font-black text-purple-700 mt-2">{formatRupiah(totalSpp)}</div>
          <div className="text-xs text-slate-500 mt-1">Akumulasi laporan terkirim</div>
        </div>
      </div>

      {/* Distinction Note (FR-010: Belum Ada vs Nol vs Tidak Terlaksana) */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Integritas Data PRD (FR-010):</strong> Sistem membedakan secara tegas antara <em>&quot;Belum Ada Laporan&quot;</em>, <em>&quot;Kegiatan Tidak Terlaksana&quot;</em>, dan <em>&quot;Nilai Terlapor Nol&quot;</em>. Kelompok yang belum melapor tidak otomatis dianggap berkinerja buruk atau bernilai nol.
        </div>
      </div>

      {/* Breakdown per Halaqah Table (Responsive) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Rincian Performa per Kelompok Halaqah</h2>
          <span className="text-xs text-slate-500">{relevantHalaqahs.length} kelompok</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Halaqah</th>
                <th className="p-3.5">Guru Pengampu</th>
                <th className="p-3.5">Status Laporan</th>
                <th className="p-3.5">Pelaksanaan</th>
                <th className="p-3.5">Kehadiran</th>
                <th className="p-3.5">SPP Pekanan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {relevantHalaqahs.map((h) => {
                const report = relevantLaporans.find((r) => r.halaqahId === h.id);
                const isSubmitted = report?.status === "Submitted";
                const isDraft = report?.status === "Draf";

                return (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{h.nama}</div>
                      <div className="text-[11px] text-slate-400">{h.kode}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{h.guruNama}</td>
                    <td className="p-3.5">
                      {isSubmitted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Terkirim
                        </span>
                      ) : isDraft ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Draf
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          Belum Ada Laporan
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {report ? (
                        report.infoUmum.terlaksana ? (
                          <span className="text-emerald-700 font-semibold">Terlaksana</span>
                        ) : (
                          <span className="text-red-700 font-semibold">Tidak Terlaksana</span>
                        )
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {isSubmitted
                        ? `${report.ringkasan.totalHadir}/${report.ringkasan.totalAnggota} (${report.ringkasan.persentaseKehadiran}%)`
                        : isDraft
                        ? "Dalam Pengisian"
                        : "Belum Melapor"}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {isSubmitted ? formatRupiah(report.ringkasan.totalSpp) : "-"}
                    </td>
                    <td className="p-3.5 text-right">
                      {isSubmitted ? (
                        <Link
                          href={`/laporan/${report.id}`}
                          className="touch-target px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold transition"
                        >
                          Lihat
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
