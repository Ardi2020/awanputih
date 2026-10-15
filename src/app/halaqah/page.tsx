"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Users, PlusCircle, ArrowRight, Calendar, MapPin, BookOpen, Clock } from "lucide-react";

export default function HalaqahListPage() {
  const { currentUser, scopedHalaqahs } = useApp();

  const isGuru = currentUser.role === "Guru";
  const isAsmen = currentUser.role === "Asmen";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isGuru ? "Halaqah Saya" : isAsmen ? "Kelompok Binaan" : "Daftar Kelompok Halaqah"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isGuru
              ? "Kelompok perhalaqahan aktif yang Anda ampu secara langsung."
              : isAsmen
              ? "Kelompok perhalaqahan yang berada dalam pengawasan binaan Anda."
              : "Seluruh data kelompok sesuai lingkup kewenangan Anda."}
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

      {scopedHalaqahs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Kelompok Terdaftar</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {isGuru
              ? "Anda belum memiliki kelompok halaqah aktif. Silakan ajukan pembuatan kelompok baru untuk divalidasi oleh Asisten Manager."
              : "Tidak ada kelompok halaqah yang ditugaskan dalam lingkup cakupan Anda."}
          </p>
          {isGuru && (
            <Link
              href="/halaqah/baru"
              className="touch-target px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Mulai Ajukan Halaqah Baru</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {scopedHalaqahs.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {h.kode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Versi {h.versi} Aktif
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{h.nama}</h3>

                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
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
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700">{h.anggotaIds.length} Pemuda / Anggota</span>
                  </div>
                  {!isGuru && (
                    <div className="flex items-center gap-2 text-slate-500 pt-1 border-t border-slate-100">
                      <span>Pengampu: <strong>{h.guruNama}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/halaqah/${h.id}`}
                  className="touch-target text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
                >
                  <span>Detail Kelompok</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {isGuru && (
                  <Link
                    href={`/halaqah/${h.id}/edit`}
                    className="touch-target px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                  >
                    Ajukan Ubah
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
