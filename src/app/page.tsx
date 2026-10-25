"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { formatRupiah } from "@/lib/utils";
import AdminPage from "@/app/admin/page";
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  ShieldAlert,
  BarChart2,
  CheckSquare,
  HelpCircle,
  Calendar,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  BookOpen,
  Wallet,
  PhoneCall,
  ClipboardCheck,
  Filter,
  Sparkles,
  Settings,
} from "lucide-react";

export default function DashboardPage() {
  const {
    currentUser,
    scopedHalaqahs,
    scopedPemudas,
    scopedLaporans,
    scopedPengajuans,
    scopedActionPlans,
    scopedPrioritas,
    scopedIltizamat,
    pembayaranTransaksis,
    distribusiDanas,
    allHalaqahs,
    allPemudas,
    allLaporans,
    allUsers,
    allMahalis,
    periode,
    quickLogGuruActivity,
  } = useApp();

  const [filterChipAsmen, setFilterChipAsmen] = useState("ALL");
  const [quickToast, setQuickToast] = useState<string | null>(null);

  // Default Deny for Unassigned User
  const isUnassigned =
    currentUser.role !== "Admin" &&
    currentUser.role !== "PJ Mal" &&
    scopedHalaqahs.length === 0 &&
    scopedLaporans.length === 0 &&
    scopedPengajuans.length === 0 &&
    (!currentUser.mahaliId || currentUser.role === "Guru");

  if (isUnassigned) {
    return (
      <div className="py-12 px-4 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Belum Ada Penugasan Aktif</h1>
        <p className="text-slate-600 mb-6 text-xs sm:text-sm">
          Akun Anda (<strong>{currentUser.name}</strong>) saat ini belum memiliki penugasan kelompok halaqah atau wilayah binaan.
          Sistem menerapkan <em>Default Deny</em> sehingga data organisasi tidak ditampilkan.
        </p>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-1.5 mb-6 shadow-sm">
          <div>• Role: <strong>{currentUser.role}</strong></div>
          <div>• Email: <strong>{currentUser.email}</strong></div>
          <div>• Status Akses: <strong className="text-amber-700">Aman (Nol Akses Tanpa Penugasan)</strong></div>
        </div>
      </div>
    );
  }

  const handleQuickYouthAction = (pemudaId: string, tipe: "KONTROL" | "KONTAK") => {
    const res = quickLogGuruActivity({
      tipe,
      pemudaId,
      catatan: `${tipe === "KONTROL" ? "Kontrol" : "Kontak"} personal dicatat langsung dari Beranda HP`,
    });
    if (res.success) {
      setQuickToast(res.message);
      setTimeout(() => setQuickToast(null), 2500);
    }
  };

  // =========================================================================
  // 1. GURU BERANDA — MULTI-HALAQAH INPUT CENTER (MOBILE-FIRST)
  // =========================================================================
  if (currentUser.role === "Guru") {
    const perluPerhatianList = scopedPemudas.filter((p) => p.perluPerhatian);
    const activeTasks = scopedActionPlans.filter((p) => p.status !== "Selesai" && p.status !== "Dibatalkan");

    // Calculate multi-halaqah report progress
    const groupProgress = scopedHalaqahs.map((h) => {
      const rep = scopedLaporans.find((r) => r.halaqahId === h.id && r.periodeId === periode.id);
      const pct = rep?.ringkasan.kelengkapanPersen ?? (rep?.status === "Submitted" ? 100 : rep ? 65 : 0);
      const vStatus = rep?.verifikasiStatus || (rep?.status === "Submitted" ? "Dikirim" : "Belum Dimulai");
      return { halaqah: h, report: rep, pct, vStatus };
    });

    const overallPct =
      groupProgress.length > 0
        ? Math.round(groupProgress.reduce((a, b) => a + b.pct, 0) / groupProgress.length)
        : 0;

    return (
      <div className="space-y-4 sm:space-y-6">
        {quickToast && (
          <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{quickToast}</span>
          </div>
        )}

        {/* A. Sapaan & Identitas Multi-Halaqah */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-7 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-emerald-100 text-[11px] font-bold mb-2">
                <span>{scopedHalaqahs.length} Halaqah Aktif • {scopedPemudas.length} Pemuda</span>
                <span>•</span>
                <span>{periode.label}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Assalamu&apos;alaikum, {currentUser.name}
              </h1>
              <p className="text-emerald-100 text-xs mt-1">
                Input Center Lapangan: Satu kali catat aktivitas, otomatis menjadi Sub-Laporan Kelompok & Laporan Pekanan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/laporan/buat"
                className="touch-target flex-1 sm:flex-initial px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Catat Pertemuan</span>
              </Link>
              <Link
                href="/laporan"
                className="touch-target flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600/70 hover:bg-emerald-600 text-white border border-emerald-400/40 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Lanjutkan Laporan</span>
              </Link>
            </div>
          </div>
        </div>

        {/* B. Agenda Terdekat Card */}
        {scopedHalaqahs[1] || scopedHalaqahs[0] ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  AGENDA TERDEKAT
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {(scopedHalaqahs[1] || scopedHalaqahs[0]).kode} • {(scopedHalaqahs[1] || scopedHalaqahs[0]).jenis || "Pelajar"}
                </span>
              </div>
              <div className="text-base font-black text-slate-900">
                {(scopedHalaqahs[1] || scopedHalaqahs[0]).nama}
              </div>
              <div className="text-xs text-slate-600">
                {(scopedHalaqahs[1] || scopedHalaqahs[0]).hari} • {(scopedHalaqahs[1] || scopedHalaqahs[0]).jam} •{" "}
                {(scopedHalaqahs[1] || scopedHalaqahs[0]).anggotaIds.length} Pemuda
              </div>
              <div className="text-xs text-slate-500">
                Materi berikutnya: <strong className="text-slate-800">{(scopedHalaqahs[1] || scopedHalaqahs[0]).materi}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/halaqah/${(scopedHalaqahs[1] || scopedHalaqahs[0]).id}`}
                className="touch-target px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center"
              >
                Buka Kursus
              </Link>
              <Link
                href={`/laporan/buat?halaqahId=${(scopedHalaqahs[1] || scopedHalaqahs[0]).id}`}
                className="touch-target px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1"
              >
                <span>Catat Pertemuan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : null}

        {/* C. Progres Laporan Pekanan Multi-Halaqah (1 Guru = 1 Laporan = 1-3 Sub-Laporan Kelompok) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                PROGRES LAPORAN PEKAN INI (MULTI-HALAQAH)
              </h2>
              <p className="text-xs text-slate-500">
                Setiap kelompok dapat diverifikasi terpisah oleh Asmen • Deadline: {periode.deadline}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-black text-emerald-700">{overallPct}%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Keseluruhan</div>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all"
              style={{ width: `${overallPct}%` }}
            />
          </div>

          <div className="space-y-2.5">
            {groupProgress.map(({ halaqah, report, pct, vStatus }) => {
              const isRevision = vStatus === "Perlu Perbaikan";
              const isVerified = vStatus === "Diverifikasi";
              return (
                <div
                  key={halaqah.id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isRevision
                      ? "bg-red-50/60 border-red-200"
                      : isVerified
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-slate-50/70 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">
                        {isVerified ? "🟢" : isRevision ? "🔴" : "🟡"} {halaqah.kode} • {halaqah.jenis || "Umum"}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">({halaqah.nama})</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isVerified
                            ? "bg-emerald-100 text-emerald-800"
                            : isRevision
                            ? "bg-red-600 text-white"
                            : vStatus === "Dikirim"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {vStatus} • {pct}%
                      </span>
                    </div>
                    {isRevision && report?.catatanAsmen && (
                      <div className="text-xs text-red-800 bg-white/80 p-2 rounded-xl border border-red-200 font-medium">
                        <strong>Catatan Asmen:</strong> &ldquo;{report.catatanAsmen}&rdquo;
                      </div>
                    )}
                  </div>

                  <Link
                    href={
                      isVerified && report
                        ? `/laporan/${report.id}`
                        : `/laporan/buat?halaqahId=${halaqah.id}${report ? `&laporanId=${report.id}` : ""}`
                    }
                    className={`touch-target px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shrink-0 ${
                      isRevision
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : isVerified
                        ? "bg-white border border-slate-200 text-slate-700"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <span>
                      {isRevision ? "Perbaiki Sekarang" : isVerified ? "Lihat Bukti" : "Lanjutkan Input"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* D. Perspektif Pemuda Perlu Perhatian (Human-Centric Ri'ayah) & Tugas dari Asmen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pemuda Perlu Perhatian */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">PEMUDA PERLU PERHATIAN (RI&apos;AYAH)</h2>
                <p className="text-xs text-slate-500">Klik tombol untuk catat Kontrol/Kontak 1-tangan</p>
              </div>
              <Link href="/anggota" className="text-xs font-bold text-emerald-700">
                Semua ({scopedPemudas.length})
              </Link>
            </div>

            {perluPerhatianList.length === 0 ? (
              <div className="p-6 text-center bg-emerald-50/50 rounded-xl text-xs text-emerald-800 font-semibold">
                Alhamdulillah, seluruh pemuda binaan telah dikontrol dan hadir rutin.
              </div>
            ) : (
              <div className="space-y-2.5">
                {perluPerhatianList.map((pm) => {
                  const hq = scopedHalaqahs.find((h) => h.id === pm.halaqahId);
                  return (
                    <div key={pm.id} className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                            <span>🔴 {pm.nama}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px]">
                              {hq?.kode || pm.halaqahId}
                            </span>
                          </div>
                          <div className="text-xs text-red-700 font-medium mt-0.5">
                            {pm.alasanPerhatian || "Belum dikontrol pekan ini"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleQuickYouthAction(pm.id, "KONTROL")}
                          className="touch-target flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition"
                        >
                          ✓ Catat Kontrol
                        </button>
                        <button
                          onClick={() => handleQuickYouthAction(pm.id, "KONTAK")}
                          className="touch-target flex-1 py-1.5 px-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-[11px] font-bold transition"
                        >
                          📞 Catat Kontak
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tugas / Action Plan dari Asmen */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">TUGAS & ARAHAN DARI ASMEN</h2>
                <p className="text-xs text-slate-500">Tindak lanjut pembinaan yang perlu diselesaikan</p>
              </div>
              <Link href="/tugas" className="text-xs font-bold text-emerald-700">
                Buka Tugas ({activeTasks.length})
              </Link>
            </div>

            {activeTasks.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                Tidak ada tugas aktif dari Asmen.
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTasks.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-xs">{t.judul}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {t.status} ({t.progres}%)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{t.tindakan}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Deadline: <strong>{t.deadline}</strong></span>
                      <Link href="/tugas" className="font-bold text-emerald-700 hover:underline">
                        Perbarui Progres →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. ASMEN BERANDA — KENDALI OPERATIONAL WILAYAH, VERIFIKASI & GURU
  // =========================================================================
  if (currentUser.role === "Asmen") {
    const gurusInScope = allUsers.filter((u) => u.role === "Guru" && u.asmenId === currentUser.id);
    const waitingReports = scopedLaporans.filter((r) => r.verifikasiStatus === "Dikirim");
    const revisionReports = scopedLaporans.filter((r) => r.verifikasiStatus === "Perlu Perbaikan");
    const verifiedReports = scopedLaporans.filter((r) => r.verifikasiStatus === "Diverifikasi");
    const pemudaRawanCount = scopedPemudas.filter((p) => p.perluPerhatian).length;

    return (
      <div className="space-y-5">
        {/* A & B. Sapaan & Skor Kesehatan Wilayah */}
        <div className="bg-gradient-to-br from-blue-800 via-indigo-800 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold mb-2">
                <span>{currentUser.wilayahNama || "Wilayah Binaan"}</span>
                <span>•</span>
                <span>{periode.label}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Assalamu&apos;alaikum, {currentUser.name}
              </h1>
              <p className="text-blue-100 text-xs mt-1">
                Penyebab utama status pekan ini: • {waitingReports.length} laporan menunggu verifikasi • 1 Halaqah perlu perbaikan • {pemudaRawanCount} Pemuda perlu ri&apos;ayah
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 shrink-0">
              <div className="text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200">KESEHATAN WILAYAH</div>
                <div className="text-3xl font-black text-white mt-0.5">{currentUser.skorKesehatan || 82}</div>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950">
                  {currentUser.statusKesehatan || "SEHAT"} (↑ +3 Poin)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* C. Ringkasan Wilayah (6 Kartu Sentuh) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link href="/guru" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Guru Aktif</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{gurusInScope.length}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Buka Menu Guru →</div>
          </Link>
          <Link href="/halaqah" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Kursus Berjalan</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {scopedHalaqahs.filter((h) => h.status === "Aktif").length}/{scopedHalaqahs.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Kelompok binaan</div>
          </Link>
          <Link href="/anggota" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Pemuda Aktif</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{scopedPemudas.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Dalam wilayah</div>
          </Link>
          <Link href="/rekap" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Kehadiran</div>
            <div className="text-2xl font-black text-blue-600 mt-1">81%</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Target 80% ✓</div>
          </Link>
          <Link href="/anggota" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-red-400 transition">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Pemuda Rawan</div>
            <div className="text-2xl font-black text-red-600 mt-1">{pemudaRawanCount}</div>
            <div className="text-[11px] text-red-700 font-semibold mt-0.5">Perlu ri&apos;ayah →</div>
          </Link>
          <Link href="/pengajuan" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Usulan Mutasi</div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {scopedPengajuans.filter((p) => p.status === "Menunggu Validasi").length}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Validasi →</div>
          </Link>
        </div>

        {/* D & E. Ringkasan Laporan Pekan Ini & Kondisi Guru Perlu Dibina */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Laporan Pekan Ini */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">LAPORAN PEKAN INI</h2>
                  <p className="text-xs text-slate-500">Periksa kualitas data Guru sebelum masuk KPI</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900">
                  Menunggu: {waitingReports.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xl font-black text-slate-900">{scopedHalaqahs.length}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Wajib</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-xl font-black text-blue-700">{waitingReports.length}</div>
                  <div className="text-[10px] font-bold text-blue-700 uppercase">Menunggu</div>
                </div>
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <div className="text-xl font-black text-red-600">{revisionReports.length}</div>
                  <div className="text-[10px] font-bold text-red-700 uppercase">Perbaikan</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xl font-black text-emerald-700">{verifiedReports.length}</div>
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Diverifikasi</div>
                </div>
              </div>
            </div>

            <Link
              href="/laporan"
              className="w-full touch-target py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Periksa & Verifikasi Laporan Guru Sekarang</span>
            </Link>
          </div>

          {/* Guru Perlu Dibina (Aggregate Score + Critical Override per Halaqah) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">KONDISI GURU (AGGREGATE + OVERRIDE)</h2>
                <p className="text-xs text-slate-500">Rata-rata tinggi tidak menyembunyikan kelompok kritis</p>
              </div>
              <Link href="/guru" className="text-xs font-bold text-blue-600 hover:underline">
                Pusat Kontrol Guru →
              </Link>
            </div>

            <div className="space-y-2.5">
              {gurusInScope.map((g) => {
                const gHalaqahs = allHalaqahs.filter((h) => h.guruId === g.id);
                const hasCritical = gHalaqahs.some((h) => h.kesehatan === "Sakit");
                return (
                  <div key={g.id} className="p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{g.name}</span>
                        <span className="text-xs text-slate-500 ml-2">
                          ({gHalaqahs.length} Halaqah)
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          hasCritical || g.statusKesehatan === "Sakit"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        Skor {g.skorKesehatan || 75} • {hasCritical ? "Perlu Intervensi (1 Kritis)" : g.statusKesehatan}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {gHalaqahs.map((hq) => (
                        <span
                          key={hq.id}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            hq.kesehatan === "Sakit"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : hq.kesehatan === "Sedang"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {hq.kesehatan === "Sakit" ? "🔴" : hq.kesehatan === "Sedang" ? "🟡" : "🟢"} {hq.kode} ({hq.jenis}) {hq.rataKehadiran}%
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/guru"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold"
                      >
                        Catat Kontrol
                      </Link>
                      <Link
                        href="/tugas"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold"
                      >
                        Buat Tugas
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. MANAJER BERANDA — KESEHATAN MAHALI, 4 ASMEN, PRIORITAS & ACTION PLAN
  // =========================================================================
  if (currentUser.role === "Manager") {
    const asmenList = allUsers.filter((u) => u.role === "Asmen");
    const guruCount = allUsers.filter((u) => u.role === "Guru").length;
    const activeKursusCount = allHalaqahs.filter((h) => h.status === "Aktif").length;

    return (
      <div className="space-y-5">
        {/* Global Filter Chips (Spec A.2) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold shrink-0">
            <Filter className="w-3 h-3" />
            <span>Pekan Ini ({periode.nomorPekanKalender})</span>
          </span>
          <button
            onClick={() => setFilterChipAsmen("ALL")}
            className={`px-3 py-1.5 rounded-full font-bold shrink-0 border transition ${
              filterChipAsmen === "ALL"
                ? "bg-purple-100 text-purple-900 border-purple-300"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            Semua 4 Asmen
          </button>
          {asmenList.map((a, idx) => (
            <button
              key={a.id}
              onClick={() => setFilterChipAsmen(a.id)}
              className={`px-3 py-1.5 rounded-full font-bold shrink-0 border transition ${
                filterChipAsmen === a.id
                  ? "bg-purple-700 text-white border-purple-700"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Asmen {idx + 1} ({a.skorKesehatan})
            </button>
          ))}
        </div>

        {/* A & B. Sapaan & Skor Kesehatan Mahali */}
        <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-7 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30">
                <span>Kondisi Seluruh Mahali</span>
                <span>•</span>
                <span>{periode.label}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Assalamu&apos;alaikum, {currentUser.name}
              </h1>
              <div className="text-xs text-purple-100 space-y-0.5">
                <div className="font-bold text-amber-300">Penyebab utama status SEDANG (Critical Override):</div>
                <div>• 1 Kursus (HU 03) tidak berjalan 2 pekan di wilayah Asmen 2</div>
                <div>• Kehadiran wilayah Asmen 4 rendah (58% vs Target 80%)</div>
                <div>• 1 Action Plan melewati batas waktu (Terlambat)</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200">
                  KESEHATAN MAHALI
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  78 <span className="text-base font-extrabold text-amber-300">— SEDANG</span>
                </div>
                <div className="text-xs text-emerald-300 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Naik +4 poin dari pekan sebelumnya</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* C. Ringkasan Struktur (4 Kartu Sentuh) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/asmen" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 transition">
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Asmen</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{asmenList.length}</div>
            <div className="text-xs text-purple-700 font-bold mt-1">Bandingkan 4 Asmen →</div>
          </Link>
          <Link href="/guru" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 transition">
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Guru</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{guruCount}</div>
            <div className="text-xs text-slate-500 mt-1">Data Organisasi / Guru →</div>
          </Link>
          <Link href="/halaqah" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 transition">
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Kursus</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {activeKursusCount}/{allHalaqahs.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">90% Kursus berjalan →</div>
          </Link>
          <Link href="/anggota" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 transition">
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Pemuda</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{allPemudas.length}</div>
            <div className="text-xs text-slate-500 mt-1">Seluruh jenjang binaan →</div>
          </Link>
        </div>

        {/* E & F. Kondisi Empat Asmen & Prioritas Hari Ini */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Kondisi 4 Asmen */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">KONDISI EMPAT ASMEN</h2>
                <p className="text-xs text-slate-500">Klik Asmen untuk melihat KPI, bukti, & diagnosis 3K-3M</p>
              </div>
              <Link href="/asmen" className="text-xs font-bold text-purple-700 hover:underline">
                Detail 4 Asmen →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {asmenList
                .filter((a) => filterChipAsmen === "ALL" || a.id === filterChipAsmen)
                .map((asmen) => {
                  const isSakit = asmen.statusKesehatan === "Sakit";
                  const isSehat = asmen.statusKesehatan === "Sehat";
                  const masalahCount = scopedPrioritas.filter((p) => p.asmenId === asmen.id).length;
                  const apCount = scopedActionPlans.filter((ap) => ap.asmenId === asmen.id && ap.status !== "Selesai").length;

                  return (
                    <Link
                      key={asmen.id}
                      href={`/asmen?id=${asmen.id}`}
                      className="py-3.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{asmen.name}</div>
                        <div className="text-xs text-slate-500">
                          {asmen.wilayahNama} • {masalahCount} Masalah • {apCount} Action Plan aktif
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <div className="text-base font-black text-slate-900">{asmen.skorKesehatan}</div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              isSehat
                                ? "bg-emerald-100 text-emerald-800"
                                : isSakit
                                ? "bg-red-600 text-white"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {asmen.statusKesehatan}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Prioritas Hari Ini */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">PRIORITAS HARI INI</h2>
                <p className="text-xs text-slate-500">Masalah merah & kuning yang membutuhkan keputusan</p>
              </div>
              <Link href="/prioritas" className="text-xs font-bold text-red-600 hover:underline">
                Matriks Prioritas →
              </Link>
            </div>

            <div className="space-y-2.5">
              {scopedPrioritas.slice(0, 3).map((prio) => (
                <div
                  key={prio.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {prio.prioritas === "Kritis" ? "🔴" : "🟡"} {prio.judul}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-800 shrink-0">
                      {prio.prioritas}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <strong>{prio.asmenNama}</strong> • Bukti: {prio.buktiFakta}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href="/prioritas"
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-[11px] font-bold"
                    >
                      Lihat Bukti
                    </Link>
                    <Link
                      href="/tugas"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold"
                    >
                      + Buat Action Plan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. PJ MAL BERANDA — KENDALI HARTA, ILTIZAMAT & REKONSILIASI Rp0
  // =========================================================================
  if (currentUser.role === "PJ Mal") {
    const totalTarget = scopedIltizamat.reduce((a, b) => a + b.targetNominal, 0);
    const totalTerbayar = scopedIltizamat.reduce((a, b) => a + b.terbayarNominal, 0);
    const lunasCount = scopedIltizamat.filter((i) => i.statusBayar === "Lunas").length;
    const pctNominal = totalTarget > 0 ? Math.round((totalTerbayar / totalTarget) * 100) : 0;
    const totalDistribusi = distribusiDanas.reduce((a, b) => a + b.nominal, 0);
    const saldoTersimpan = totalTerbayar - totalDistribusi;

    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-teal-800 via-emerald-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-bold">
                ILTIZAMAT AGUSTUS 2026 • Deadline 15 Agustus
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-2">Dashboard PJ Mal</h1>
              <p className="text-xs text-teal-100 mt-1">
                Mengendalikan siklus kewajiban, pemisahan status bayar vs komunikasi, verifikasi, distribusi, & rekonsiliasi.
              </p>
            </div>
            <Link
              href="/iltizamat"
              className="touch-target px-4 py-2.5 bg-white text-teal-950 font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-sm self-start sm:self-auto"
            >
              <Wallet className="w-4 h-4 text-teal-700" />
              <span>Buka Modul Lengkap Iltizamat →</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Target Kewajiban</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{formatRupiah(totalTarget)}</div>
            <div className="text-xs text-slate-500 mt-0.5">{scopedIltizamat.length} syabab wajib</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Dana Terverifikasi</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{formatRupiah(totalTerbayar)}</div>
            <div className="text-xs text-emerald-700 font-bold mt-0.5">{pctNominal}% terkumpul (↑ +6%)</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Sudah Selesai</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {lunasCount} / {scopedIltizamat.length}
            </div>
            <div className="text-xs text-amber-700 font-semibold mt-0.5">
              {scopedIltizamat.length - lunasCount} syabab belum selesai
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Selisih Rekonsiliasi</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">Rp 0 ✓</div>
            <div className="text-xs text-slate-500 mt-0.5">Saldo kas: {formatRupiah(saldoTersimpan)}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">PERLU TINDAKAN PJ MAL HARI INI</h2>
            <Link href="/iltizamat" className="text-xs font-bold text-teal-700">
              Kelola Semua →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <Link href="/iltizamat?tab=pembayaran" className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-950">🟡 1 Transaksi Tunai Menunggu Verifikasi</div>
              <p className="text-amber-800 mt-1">Pembayaran sebagian Sulis (KT) Rp 100.000 via Guru Erik</p>
            </Link>
            <Link href="/iltizamat" className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
              <div className="font-bold text-blue-950">🟠 2 Janji Pembayaran Jatuh Tempo</div>
              <p className="text-blue-800 mt-1">Rudi (PU) & Sulis (KT)</p>
            </Link>
            <Link href="/iltizamat" className="p-3.5 rounded-xl bg-red-50 border border-red-200">
              <div className="font-bold text-red-950">🔴 1 Daris Perlu Ri&apos;ayah</div>
              <p className="text-red-800 mt-1">Boy (PU2) — Perlu ri&apos;ayah Guru Budi</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. ADMIN BERANDA — LANGSUNG TAMPILKAN PANEL FULL CRUD ADMIN
  // =========================================================================
  return <AdminPage />;
}
