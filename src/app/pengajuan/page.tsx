"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  FileText,
  Filter,
} from "lucide-react";
import { StatusPengajuan } from "@/lib/types";

export default function PengajuanListPage() {
  const { currentUser, scopedPengajuans } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const isGuru = currentUser.role === "Guru";
  const isAsmen = currentUser.role === "Asmen";

  const filteredItems = scopedPengajuans.filter((p) => {
    if (filterStatus === "ALL") return true;
    return p.status === filterStatus;
  });

  const getStatusBadge = (status: StatusPengajuan) => {
    switch (status) {
      case "Menunggu Validasi":
        return {
          bg: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Clock,
          label: "Menunggu Validasi",
        };
      case "Disetujui":
        return {
          bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
          label: "Disetujui (Aktif)",
        };
      case "Dikembalikan untuk Revisi":
        return {
          bg: "bg-amber-100 text-amber-800 border-amber-200",
          icon: AlertCircle,
          label: "Dikembalikan untuk Revisi",
        };
      case "Draf":
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          icon: FileText,
          label: "Draf",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isGuru ? "Pengajuan Saya" : isAsmen ? "Validasi Perhalaqahan" : "Daftar Pengajuan Perhalaqahan"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isGuru
              ? "Riwayat dan status pengajuan pembuatan atau perubahan kelompok halaqah Anda."
              : isAsmen
              ? "Antrean dan riwayat validasi usulan kelompok binaan di wilayah Anda."
              : "Audit riwayat pengajuan perhalaqahan sistem."}
          </p>
        </div>

        {isGuru && (
          <Link
            href="/halaqah/baru"
            className="touch-target px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ajukan Halaqah Baru</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterStatus("ALL")}
          className={`touch-target px-3.5 py-2 rounded-xl font-semibold transition ${
            filterStatus === "ALL"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua ({scopedPengajuans.length})
        </button>
        <button
          onClick={() => setFilterStatus("Menunggu Validasi")}
          className={`touch-target px-3.5 py-2 rounded-xl font-semibold transition ${
            filterStatus === "Menunggu Validasi"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Menunggu Validasi ({scopedPengajuans.filter((p) => p.status === "Menunggu Validasi").length})
        </button>
        <button
          onClick={() => setFilterStatus("Disetujui")}
          className={`touch-target px-3.5 py-2 rounded-xl font-semibold transition ${
            filterStatus === "Disetujui"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Disetujui ({scopedPengajuans.filter((p) => p.status === "Disetujui").length})
        </button>
        <button
          onClick={() => setFilterStatus("Dikembalikan untuk Revisi")}
          className={`touch-target px-3.5 py-2 rounded-xl font-semibold transition ${
            filterStatus === "Dikembalikan untuk Revisi"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Perlu Revisi ({scopedPengajuans.filter((p) => p.status === "Dikembalikan untuk Revisi").length})
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Pengajuan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Tidak ditemukan pengajuan dengan status ini dalam lingkup tanggung jawab Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((p) => {
            const badge = getStatusBadge(p.status);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{p.payload.nama}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      {p.tipe === "CREATE" ? "Buat Baru" : "Ubah Data"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Pemohon: <strong>{p.pemohonNama}</strong>
                    </span>
                    <span>
                      Waktu Pengajuan: {new Date(p.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {p.versiSumber !== undefined && <span>Versi Sumber: v{p.versiSumber}</span>}
                  </div>

                  {/* Feedback notice if returned */}
                  {p.status === "Dikembalikan untuk Revisi" && p.alasanPengembalian && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mt-2">
                      <span className="font-bold">Catatan Revisi dari Asmen:</span> &quot;{p.alasanPengembalian}&quot;
                    </div>
                  )}

                  {/* Summary of diff if UPDATE */}
                  {p.diff && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      {p.diff.fieldChanges.length > 0 && (
                        <div>
                          <strong>Perubahan:</strong> {p.diff.fieldChanges.map((c) => c.label).join(", ")}
                        </div>
                      )}
                      {p.diff.addedMembers.length > 0 && (
                        <div className="text-emerald-700">
                          <strong>+ Tambah Anggota:</strong> {p.diff.addedMembers.join(", ")}
                        </div>
                      )}
                      {p.diff.removedMembers.length > 0 && (
                        <div className="text-red-700">
                          <strong>- Hapus Anggota:</strong> {p.diff.removedMembers.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    href={`/pengajuan/${p.id}`}
                    className="touch-target px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span>{isAsmen && p.status === "Menunggu Validasi" ? "Tinjau & Validasi" : "Lihat Detail"}</span>
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
