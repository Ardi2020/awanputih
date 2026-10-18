"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { canAccessHalaqah } from "@/lib/permissions";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  ArrowLeft,
  Edit3,
  ShieldAlert,
  UserCheck,
  Phone,
} from "lucide-react";

export default function HalaqahDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { currentUser, allHalaqahs, allPemudas, scopedPengajuans } = useApp();

  const halaqah = allHalaqahs.find((h) => h.id === id);

  // FR-002: Negative Authorization check
  if (!halaqah || !canAccessHalaqah(currentUser, halaqah)) {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak (403 Forbidden)</h1>
        <p className="text-slate-600 text-sm mb-6">
          Anda tidak memiliki izin untuk membaca atau mengelola kelompok ini. Data kelompok dibatasi secara ketat berdasarkan role dan penugasan server.
        </p>
        <button
          onClick={() => router.push("/halaqah")}
          className="touch-target px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
        >
          Kembali ke Daftar Halaqah
        </button>
      </div>
    );
  }

  const anggotaList = allPemudas.filter((p) => halaqah.anggotaIds.includes(p.id));
  const activeProposal = scopedPengajuans.find(
    (p) => p.targetHalaqahId === halaqah.id && p.status === "Menunggu Validasi"
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/halaqah"
          className="touch-target inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar</span>
        </Link>

        {currentUser.role === "Guru" && (
          <Link
            href={`/halaqah/${halaqah.id}/edit`}
            className="touch-target px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto"
          >
            <Edit3 className="w-4 h-4" />
            <span>Update Nama Murid & Waktu (Ajukan ke AJM)</span>
          </Link>
        )}
      </div>

      {/* Proposal Warning Notice if currently pending */}
      {activeProposal && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-blue-900 text-xs">
          <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Pengajuan Perubahan Sedang Diproses:</span> Ada usulan pembaruan waktu/murid untuk kelompok ini yang berstatus <strong>Menunggu Validasi</strong> oleh AJM (Asmen).
            Data aktif di bawah ini tetap berlaku sampai usulan disetujui secara resmi.
          </div>
        </div>
      )}

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                {halaqah.kode}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                Versi {halaqah.versi} Aktif
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{halaqah.nama}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs text-slate-600">
          <div className="space-y-2.5">
            <div>
              <span className="text-slate-400 block mb-0.5">Guru Pengampu</span>
              <span className="font-semibold text-slate-900 text-sm">{halaqah.guruNama}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Jadwal Pertemuan</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {halaqah.hari}, {halaqah.jam}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Tempat Kegiatan</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {halaqah.tempat}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div>
              <span className="text-slate-400 block mb-0.5">Kurikulum / Buku Materi</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                {halaqah.materi}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Jumlah Murid Aktif (Maks. 5)</span>
              <span className="font-semibold text-slate-900 text-sm">
                {anggotaList.length} / 5 Murid Terdaftar
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Terakhir Diperbarui</span>
              <span className="font-semibold text-slate-900">
                {new Date(halaqah.updatedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Member List (Mobile-friendly cards, NFR-003) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Daftar Murid / Anggota Halaqah</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {anggotaList.length}/5 Maks
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Maksimum 5 murid per halaqah. Guru dapat mengajukan perubahan nama murid dan waktu pertemuan ke AJM.
        </p>

        {anggotaList.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Belum ada anggota terdaftar pada kelompok ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {anggotaList.map((m, idx) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{m.nama}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{m.telepon}</span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
