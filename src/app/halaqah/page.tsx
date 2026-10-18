"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import {
  Users,
  ArrowRight,
  Calendar,
  MapPin,
  BookOpen,
  UserCheck,
  Search,
  Edit3,
} from "lucide-react";

export default function HalaqahListPage() {
  const { currentUser, scopedHalaqahs, allPemudas } = useApp();
  const [filterJenis, setFilterJenis] = useState<"ALL" | "Karyawan" | "Pelajar">("ALL");
  const [search, setSearch] = useState("");

  const isGuru = currentUser.role === "Guru";
  const isAsmen = currentUser.role === "Asmen";

  const filteredHalaqahs = scopedHalaqahs.filter((h) => {
    const jenis = h.jenis || "Karyawan";
    if (filterJenis !== "ALL" && jenis !== filterJenis) return false;
    if (
      search &&
      !h.nama.toLowerCase().includes(search.toLowerCase()) &&
      !h.guruNama.toLowerCase().includes(search.toLowerCase()) &&
      !h.kode.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
            Manajemen Kursus & Multi-Halaqah (Maks. 5 Murid / Kelompok)
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {isGuru ? "Halaqah Saya" : isAsmen ? "Kelompok Binaan" : "Daftar Kelompok Halaqah"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGuru
              ? `Anda mengampu ${scopedHalaqahs.length} kelompok halaqah aktif. Anda dapat memperbarui nama murid (maks. 5 orang) dan waktu pertemuan untuk diajukan ke AJM.`
              : isAsmen
              ? "Kelompok perhalaqahan yang berada dalam pengawasan binaan Anda beserta status kesehatannya."
              : "Seluruh data kelompok sesuai lingkup kewenangan Anda."}
          </p>
        </div>
      </div>

      {/* Smart Filter [ Semua ] [ Karyawan ] [ Pelajar ] & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(["ALL", "Karyawan", "Pelajar"] as const).map((tab) => {
            const count =
              tab === "ALL"
                ? scopedHalaqahs.length
                : scopedHalaqahs.filter((h) => (h.jenis || "Karyawan") === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setFilterJenis(tab)}
                className={`px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap ${
                  filterJenis === tab
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab === "ALL" ? "Semua Segmen" : `Halaqah ${tab}`} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama halaqah / guru..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {filteredHalaqahs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Kelompok Halaqah</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Tidak ditemukan kelompok halaqah untuk filter segmen atau pencarian ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHalaqahs.map((h) => {
            const health = h.kesehatan || "Sehat";
            const jenis = h.jenis || "Karyawan";
            const muridList = allPemudas.filter((p) => h.anggotaIds.includes(p.id));

            return (
              <div
                key={h.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {h.kode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          jenis === "Karyawan"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {jenis}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        health === "Sehat"
                          ? "bg-emerald-100 text-emerald-800"
                          : health === "Sedang"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      ● {health}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2.5">{h.nama}</h3>

                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {h.hari}, {h.jam}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{h.tempat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{h.materi}</span>
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Murid Halaqah ({muridList.length}/5 Maks)</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {muridList.map((m) => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {m.nama}
                          </span>
                        ))}
                      </div>
                    </div>
                    {!isGuru && (
                      <div className="flex items-center gap-2 text-slate-600 pt-1.5 border-t border-slate-100">
                        <span>
                          Guru Utama: <strong>{h.guruNama}</strong>
                        </span>
                      </div>
                    )}
                    {h.guruPenggantiNama && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Guru Pengganti Sementara: <strong>{h.guruPenggantiNama}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/halaqah/${h.id}`}
                    className="touch-target text-xs font-bold text-slate-700 hover:text-slate-900 transition flex items-center gap-1"
                  >
                    <span>Detail Halaqah</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isGuru && (
                    <Link
                      href={`/halaqah/${h.id}/edit`}
                      className="touch-target px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Update Murid & Waktu</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
