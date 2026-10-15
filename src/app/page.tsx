"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { formatRupiah } from "@/lib/utils";
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
} from "lucide-react";

export default function DashboardPage() {
  const { currentUser, scopedHalaqahs, scopedLaporans, scopedPengajuans, allHalaqahs, allLaporans, allUsers, periode } = useApp();

  // If user has no assignments
  const isUnassigned =
    currentUser.role !== "Admin" &&
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Belum Ada Penugasan Aktif</h1>
        <p className="text-slate-600 mb-6 text-sm">
          Akun Anda (<strong>{currentUser.name}</strong>) saat ini belum memiliki penugasan kelompok halaqah atau wilayah binaan.
          Sistem secara ketat menerapkan <em>Default Deny</em> sehingga tidak ada data global yang ditampilkan.
        </p>
        <div className="p-4 bg-white rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1 mb-6">
          <div>• Role: <strong>{currentUser.role}</strong></div>
          <div>• Email: <strong>{currentUser.email}</strong></div>
          <div>• Status Akses: <strong>Aman (Nol Akses Tanpa Penugasan)</strong></div>
        </div>
        <p className="text-xs text-slate-500">
          Untuk menguji role lain, gunakan menu <strong>Ganti Akun</strong> pada bar navigasi di atas.
        </p>
      </div>
    );
  }

  // 1. GURU VIEW
  if (currentUser.role === "Guru") {
    const pendingReportHalaqahs = scopedHalaqahs.filter((h) => {
      const rep = scopedLaporans.find((r) => r.halaqahId === h.id && r.periodeId === periode.id);
      return !rep || rep.status === "Draf";
    });

    const pendingProposals = scopedPengajuans.filter((p) => p.status === "Menunggu Validasi");
    const returnedProposals = scopedPengajuans.filter((p) => p.status === "Dikembalikan untuk Revisi");

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/60 text-emerald-100 text-xs font-semibold mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>{periode.label}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Pekerjaan Saya Pekan Ini
              </h1>
              <p className="mt-1 text-emerald-100 text-sm max-w-2xl">
                Assalamu&apos;alaikum, <strong>{currentUser.name}</strong>. Kelola kelompok halaqah dan tuntaskan laporan pekanan Anda.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/laporan/buat"
                className="touch-target px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Isi Laporan Pekanan</span>
              </Link>
              <Link
                href="/halaqah/baru"
                className="touch-target px-4 py-2.5 bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/40 rounded-xl font-semibold text-sm flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ajukan Halaqah</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Action Alerts */}
        {returnedProposals.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <span className="font-bold">Perlu Revisi:</span> Anda memiliki {returnedProposals.length} pengajuan halaqah yang dikembalikan oleh Asmen disertai catatan revisi.
              <div className="mt-2">
                <Link
                  href="/pengajuan"
                  className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:underline"
                >
                  Lihat Catatan & Perbaiki Draf <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Halaqah Saya</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{scopedHalaqahs.length}</div>
            <div className="text-xs text-slate-500 mt-1">Kelompok aktif diampu</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Laporan Pekan Ini</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {scopedLaporans.filter((r) => r.status === "Submitted").length} / {scopedHalaqahs.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Laporan terkirim</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Laporan Tertunda</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{pendingReportHalaqahs.length}</div>
            <div className="text-xs text-amber-700 font-medium mt-1">Perlu diisi / draf</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Status Pengajuan</span>
              <CheckSquare className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{pendingProposals.length}</div>
            <div className="text-xs text-slate-500 mt-1">Menunggu validasi Asmen</div>
          </div>
        </div>

        {/* Task List: Halaqah Saya & Status Laporan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Halaqah & Status Laporan Pekan Ini</h2>
              <p className="text-xs text-slate-500">Konteks historis laporan aman dan tidak berubah jika kelompok diedit.</p>
            </div>
            <Link href="/halaqah" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {scopedHalaqahs.map((h) => {
              const currentReport = scopedLaporans.find(
                (r) => r.halaqahId === h.id && r.periodeId === periode.id
              );
              const isSubmitted = currentReport?.status === "Submitted";
              const isDraft = currentReport?.status === "Draf";

              return (
                <div key={h.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{h.nama}</h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {h.kode}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        v{h.versi} Aktif
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Jadwal: {h.hari}, {h.jam}</span>
                      <span>Tempat: {h.tempat}</span>
                      <span>Anggota: {h.anggotaIds.length} pemuda</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isSubmitted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Laporan Terkirim (Baca Saja)</span>
                      </span>
                    ) : isDraft ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Draf Tersimpan</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        <span>Belum Ada Laporan</span>
                      </span>
                    )}

                    <Link
                      href={isSubmitted ? `/laporan/${currentReport.id}` : `/laporan/buat?halaqahId=${h.id}`}
                      className="touch-target px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1.5 shrink-0"
                    >
                      <span>{isSubmitted ? "Lihat Detail" : isDraft ? "Lanjutkan Draf" : "Isi Laporan"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. ASMEN VIEW
  if (currentUser.role === "Asmen") {
    const pendingValidation = scopedPengajuans.filter((p) => p.status === "Menunggu Validasi");
    const submittedReports = scopedLaporans.filter((r) => r.status === "Submitted");

    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/60 text-blue-100 text-xs font-semibold mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>{periode.label}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ringkasan Binaan & Validasi
              </h1>
              <p className="mt-1 text-blue-100 text-sm max-w-2xl">
                Asisten Manager: <strong>{currentUser.name}</strong>. Mengawasi halaqah binaan dan memvalidasi pengajuan guru.
              </p>
            </div>
            <Link
              href="/pengajuan"
              className="touch-target px-4 py-2.5 bg-white text-blue-800 hover:bg-blue-50 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition"
            >
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>Antrean Validasi ({pendingValidation.length})</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Halaqah Binaan</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{scopedHalaqahs.length}</div>
            <div className="text-xs text-slate-500 mt-1">Kelompok dalam wilayah Anda</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Antrean Validasi</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{pendingValidation.length}</div>
            <div className="text-xs text-amber-700 font-medium mt-1">Perlu ditinjau Asmen</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Laporan Masuk</span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{submittedReports.length}</div>
            <div className="text-xs text-slate-500 mt-1">Dari {scopedHalaqahs.length} kelompok binaan</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Iuran Bulanan Binaan</span>
              <BarChart2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {formatRupiah(submittedReports.reduce((acc, r) => acc + r.ringkasan.totalSpp, 0))}
            </div>
            <div className="text-xs text-slate-500 mt-1">Akumulasi iuran bulanan binaan</div>
          </div>
        </div>

        {/* Pending Validation Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pengajuan Perhalaqahan Menunggu Validasi</h2>
              <p className="text-xs text-slate-500">Periksa perbedaan usulan dengan data aktif sebelum menyetujui.</p>
            </div>
            <Link href="/pengajuan" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Kelola Semua
            </Link>
          </div>

          {pendingValidation.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-xl">
              Tidak ada pengajuan yang sedang menunggu validasi di wilayah binaan Anda.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingValidation.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{p.payload.nama}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {p.tipe === "CREATE" ? "BUAT BARU" : "UBAH HALAQAH"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Diajukan oleh: <strong>{p.pemohonNama}</strong> • {new Date(p.createdAt).toLocaleDateString("id-ID")}
                    </div>
                    {p.catatanPemohon && (
                      <div className="text-xs text-slate-500 italic mt-1">&quot;{p.catatanPemohon}&quot;</div>
                    )}
                  </div>
                  <Link
                    href={`/pengajuan/${p.id}`}
                    className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Tinjau & Validasi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. MANAGER VIEW
  if (currentUser.role === "Manager") {
    const totalMahaliHalaqah = scopedHalaqahs.length;
    const totalMahaliLaporan = scopedLaporans.filter((r) => r.status === "Submitted");
    const totalSpp = totalMahaliLaporan.reduce((acc, r) => acc + r.ringkasan.totalSpp, 0);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/60 text-purple-100 text-xs font-semibold mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>{periode.label}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ringkasan Eksekutif Mahali
              </h1>
              <p className="mt-1 text-purple-100 text-sm max-w-2xl">
                Manager: <strong>{currentUser.name}</strong> • Wilayah: <strong>Mahali Jakarta Barat</strong>
              </p>
            </div>
            <Link
              href="/rekap"
              className="touch-target px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition"
            >
              <BarChart2 className="w-4 h-4 text-purple-600" />
              <span>Buka Rekap Mahali Lengkap</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Halaqah Mahali</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalMahaliHalaqah}</div>
            <div className="text-xs text-slate-500 mt-1">Seluruh kelompok aktif</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-500">Laporan Terkumpul</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {totalMahaliLaporan.length} / {totalMahaliHalaqah}
            </div>
            <div className="text-xs text-slate-500 mt-1">Pekan {periode.nomorPekanKalender}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-500">Capaian Pelaporan</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {totalMahaliHalaqah > 0
                ? `${Math.round((totalMahaliLaporan.length / totalMahaliHalaqah) * 100)}%`
                : "0%"}
            </div>
            <div className="text-xs text-slate-500 mt-1">Target 100% tiap pekan</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Iuran Bulanan Mahali</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{formatRupiah(totalSpp)}</div>
            <div className="text-xs text-slate-500 mt-1">Akumulasi iuran bulanan</div>
          </div>
        </div>

        {/* Asmen Summary Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">Capaian per Asisten Manager (Binaan)</h2>
          <p className="text-xs text-slate-500 mb-4">Memantau tingkat kepatuhan pelaporan di setiap lini binaan.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Asisten Manager</th>
                  <th className="p-3">Kelompok Binaan</th>
                  <th className="p-3">Laporan Terkirim</th>
                  <th className="p-3">Persentase</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers
                  .filter((u) => u.role === "Asmen" && u.mahaliId === currentUser.mahaliId)
                  .map((asmen) => {
                    const binaanCount = allHalaqahs.filter((h) => h.asmenId === asmen.id).length;
                    const reportedCount = allLaporans.filter(
                      (r) => r.asmenId === asmen.id && r.status === "Submitted" && r.periodeId === periode.id
                    ).length;
                    const pct = binaanCount > 0 ? Math.round((reportedCount / binaanCount) * 100) : 0;

                    return (
                      <tr key={asmen.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{asmen.name}</td>
                        <td className="p-3">{binaanCount} halaqah</td>
                        <td className="p-3">{reportedCount} laporan</td>
                        <td className="p-3 font-bold">{pct}%</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              pct === 100
                                ? "bg-emerald-100 text-emerald-800"
                                : pct > 0
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {pct === 100 ? "Lengkap" : pct > 0 ? "Sebagian" : "Belum Ada"}
                          </span>
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

  // 4. ADMIN VIEW
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 text-slate-200 text-xs font-semibold mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Administrasi & Tata Kelola Sistem</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Administrator
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-2xl">
              Administrator: <strong>{currentUser.name}</strong>. Pengelolaan akun pengguna, penetapan peran (RBAC), penugasan hierarki, dan audit sistem.
            </p>
          </div>
          <Link
            href="/admin"
            className="touch-target px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm transition"
          >
            <Users className="w-4 h-4" />
            <span>Kelola Akun & Penugasan</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Total Akun Terdaftar</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{allUsers.length}</div>
          <div className="text-xs text-slate-500 mt-1">4 Role terkonfigurasi</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Guru Terdaftar</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {allUsers.filter((u) => u.role === "Guru").length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Pengampu halaqah</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Asisten Manager</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {allUsers.filter((u) => u.role === "Asmen").length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Reviewer perhalaqahan</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500">Master Halaqah</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{allHalaqahs.length}</div>
          <div className="text-xs text-slate-500 mt-1">Seluruh wilayah mahali</div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Aturan Keamanan PRD (FR-011):</strong> Hak administrator adalah untuk manajemen akun dan konfigurasi penugasan. Admin secara ketat <em>tidak diberikan izin langsung</em> untuk mengubah isi laporan atau mem-bypass persetujuan kelompok tanpa melalui Asisten Manager.
        </div>
      </div>
    </div>
  );
}
