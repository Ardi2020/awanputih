"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { canReviewPengajuan } from "@/lib/permissions";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  User,
  Calendar,
  MapPin,
  BookOpen,
  Users,
  ShieldAlert,
} from "lucide-react";

export default function PengajuanDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const {
    currentUser,
    allPengajuans,
    allHalaqahs,
    approvePengajuan,
    returnPengajuan,
  } = useApp();

  const pengajuan = allPengajuans.find((p) => p.id === id);

  const [alasanModalOpen, setAlasanModalOpen] = useState(false);
  const [alasanText, setAlasanText] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!pengajuan) {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Pengajuan Tidak Ditemukan</h1>
        <p className="text-slate-600 text-sm mb-4">Pengajuan ID &apos;{id}&apos; tidak ada dalam basis data.</p>
        <Link href="/pengajuan" className="text-xs text-blue-600 font-bold hover:underline">
          Kembali ke Daftar Pengajuan
        </Link>
      </div>
    );
  }

  const targetHalaqah = pengajuan.targetHalaqahId
    ? allHalaqahs.find((h) => h.id === pengajuan.targetHalaqahId)
    : undefined;

  const isAsmen = currentUser.role === "Asmen";
  const canReview = isAsmen && canReviewPengajuan(currentUser, pengajuan);
  const isSelfProposal = isAsmen && pengajuan.pemohonId === currentUser.id;

  const handleApprove = () => {
    setIsProcessing(true);
    const res = approvePengajuan(pengajuan.id);
    setIsProcessing(false);
    if (res.success) {
      setFeedbackMsg({ text: res.message, error: false });
      setTimeout(() => router.push("/pengajuan"), 1200);
    } else {
      setFeedbackMsg({ text: res.message, error: true });
    }
  };

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alasanText.trim()) {
      setFeedbackMsg({ text: "Alasan pengembalian wajib diisi.", error: true });
      return;
    }

    setIsProcessing(true);
    const res = returnPengajuan(pengajuan.id, alasanText.trim());
    setIsProcessing(false);
    if (res.success) {
      setAlasanModalOpen(false);
      setFeedbackMsg({ text: res.message, error: false });
      setTimeout(() => router.push("/pengajuan"), 1200);
    } else {
      setFeedbackMsg({ text: res.message, error: true });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/pengajuan"
          className="touch-target inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Pengajuan</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                {pengajuan.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 uppercase">
                {pengajuan.tipe === "CREATE" ? "Pembuatan Baru" : "Perubahan Halaqah"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{pengajuan.payload.nama}</h1>
          </div>

          <div className="self-start sm:self-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                pengajuan.status === "Disetujui"
                  ? "bg-emerald-100 text-emerald-800"
                  : pengajuan.status === "Menunggu Validasi"
                  ? "bg-blue-100 text-blue-800"
                  : pengajuan.status === "Dikembalikan untuk Revisi"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {pengajuan.status === "Disetujui" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {pengajuan.status === "Menunggu Validasi" && <Clock className="w-3.5 h-3.5" />}
              {pengajuan.status === "Dikembalikan untuk Revisi" && <AlertCircle className="w-3.5 h-3.5" />}
              <span>{pengajuan.status}</span>
            </span>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            feedbackMsg.error
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold"
          }`}
        >
          {feedbackMsg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Rejection / Revision Note */}
      {pengajuan.status === "Dikembalikan untuk Revisi" && pengajuan.alasanPengembalian && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>Catatan Revisi dari Asisten Manager ({pengajuan.reviewedBy || "Reviewer"}):</span>
          </div>
          <div className="text-sm font-medium pl-5">&quot;{pengajuan.alasanPengembalian}&quot;</div>
          {pengajuan.reviewedAt && (
            <div className="text-[11px] text-amber-600 pl-5">
              Dikembalikan pada: {new Date(pengajuan.reviewedAt).toLocaleString("id-ID")}
            </div>
          )}
        </div>
      )}

      {/* Reviewer Self-approval Warning */}
      {isSelfProposal && pengajuan.status === "Menunggu Validasi" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong>Larangan Self-Approval (FR-006):</strong> Anda terdaftar sebagai pemohon sekaligus reviewer untuk pengajuan ini. Berdasarkan aturan integritas bisnis, pengajuan Anda harus divalidasi oleh Asisten Manager lain atau penanggung jawab delegasi yang sah.
          </div>
        </div>
      )}

      {/* Meta Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-slate-400 block mb-0.5">Guru Pemohon</span>
          <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {pengajuan.pemohonNama}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Waktu Pengajuan</span>
          <span className="font-semibold text-slate-900">
            {new Date(pengajuan.createdAt).toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Target & Versi Sumber</span>
          <span className="font-semibold text-slate-900">
            {targetHalaqah ? `${targetHalaqah.kode} (v${pengajuan.versiSumber})` : "Kelompok Baru (v0)"}
          </span>
        </div>
      </div>

      {/* VISUAL DIFF VIEWER (PRD Section 11: Side-by-side desktop, stacked mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Perbandingan Data: Data Aktif vs Usulan Baru
            </h2>
            <p className="text-xs text-slate-500">
              Periksa perbedaan secara teliti sebelum mengambil keputusan validasi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left Column: Data Aktif */}
          <div className="p-5 space-y-4">
            <div className="inline-block px-2.5 py-1 rounded bg-slate-200 text-slate-800 text-xs font-bold">
              Data Aktif Saat Ini {targetHalaqah ? `(v${targetHalaqah.versi})` : "(Belum Ada)"}
            </div>

            {targetHalaqah ? (
              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block">Nama Halaqah:</span>
                  <span className="font-semibold">{targetHalaqah.nama}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jadwal:</span>
                  <span className="font-semibold">{targetHalaqah.hari}, {targetHalaqah.jam}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tempat:</span>
                  <span className="font-semibold">{targetHalaqah.tempat}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Buku / Materi:</span>
                  <span className="font-semibold">{targetHalaqah.materi}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Anggota Aktif ({targetHalaqah.anggotaIds.length}):</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
                    {targetHalaqah.anggotaIds.map((id, idx) => (
                      <li key={idx}>{id}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-6">
                Tidak ada data aktif sebelumnya (Kelompok baru diusulkan).
              </div>
            )}
          </div>

          {/* Right Column: Usulan Baru */}
          <div className="p-5 space-y-4 bg-emerald-50/20">
            <div className="inline-block px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold">
              Usulan Perubahan Baru (Akan Diaktifkan)
            </div>

            <div className="space-y-3 text-xs text-slate-800">
              <div>
                <span className="text-slate-400 block">Nama Halaqah:</span>
                <span className="font-bold text-emerald-950">{pengajuan.payload.nama}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Jadwal:</span>
                <span className="font-bold text-emerald-950">{pengajuan.payload.hari}, {pengajuan.payload.jam}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tempat:</span>
                <span className="font-bold text-emerald-950">{pengajuan.payload.tempat}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Buku / Materi:</span>
                <span className="font-bold text-emerald-950">{pengajuan.payload.materi}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">
                  Daftar Anggota Usulan ({pengajuan.payload.anggota.length}):
                </span>
                <div className="space-y-1">
                  {pengajuan.payload.anggota.map((m, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-1 rounded text-xs flex items-center justify-between ${
                        m.action === "ADD"
                          ? "bg-emerald-100 text-emerald-900 font-semibold"
                          : m.action === "REMOVE"
                          ? "bg-red-100 text-red-900 line-through opacity-70"
                          : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>
                        {m.nama} <span className="text-slate-400 font-normal">({m.telepon})</span>
                      </span>
                      {m.action === "ADD" && (
                        <span className="text-[10px] font-bold text-emerald-700">+ Baru</span>
                      )}
                      {m.action === "REMOVE" && (
                        <span className="text-[10px] font-bold text-red-700 no-underline">- Hapus</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviewer Action Bar (FR-006) */}
      {canReview && pengajuan.status === "Menunggu Validasi" && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-bold text-slate-900 block">Tindakan Validasi Asisten Manager</span>
            <span className="text-xs text-slate-500">
              Persetujuan bersifat atomik dan langsung mengaktifkan versi baru di sistem.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAlasanModalOpen(true)}
              disabled={isProcessing}
              className="touch-target px-4 py-2.5 rounded-xl border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kembalikan untuk Revisi</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="touch-target px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Setujui & Aktifkan Kelompok</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Kembalikan untuk Revisi (Mandatory Reason) */}
      {alasanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Kembalikan Pengajuan untuk Revisi
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sesuai FR-006, pengembalian <strong>wajib disertai alasan yang jelas</strong> agar Guru pengampu dapat memperbaiki draf usulannya.
            </p>

            <form onSubmit={handleReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan & Catatan Perbaikan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={alasanText}
                  onChange={(e) => setAlasanText(e.target.value)}
                  rows={4}
                  required
                  placeholder="Contoh: Jadwal bertabrakan dengan kajian akbar mahali; mohon sesuaikan jam menjadi pukul 09:00 atau ganti ke hari Sabtu."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAlasanModalOpen(false)}
                  className="touch-target px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="touch-target px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  Kirim Catatan Revisi ke Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
