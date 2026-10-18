"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Info, ArrowLeft, Edit3, Shield } from "lucide-react";

export default function NewHalaqahInfoPage() {
  const { currentUser, scopedHalaqahs } = useApp();

  return (
    <div className="py-10 px-4 max-w-xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
          <Info className="w-6 h-6" />
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-900">
            Pembuatan Halaqah Baru Dikelola oleh Admin / Struktur
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Sesuai ketentuan sistem, laman Guru tidak menyediakan pengajuan pembuatan halaqah baru.
            Guru dapat langsung meng-update data halaqah yang sedang diampu (yaitu{" "}
            <strong>nama murid maksimum 5 orang</strong> dan <strong>waktu pertemuan</strong>),
            yang kemudian diajukan ke <strong>AJM (Asmen)</strong> untuk divalidasi.
          </p>
        </div>

        {currentUser.role === "Guru" && scopedHalaqahs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">
              Pilih Halaqah Anda untuk Update Murid & Waktu:
            </span>
            <div className="space-y-2">
              {scopedHalaqahs.map((h) => (
                <Link
                  key={h.id}
                  href={`/halaqah/${h.id}/edit`}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 flex items-center justify-between transition"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{h.nama}</div>
                    <div className="text-[11px] text-slate-500">
                      {h.hari}, {h.jam} • {h.anggotaIds.length}/5 Murid
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Update Data
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 flex items-center justify-between border-t border-slate-100">
          <Link
            href="/halaqah"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Halaqah</span>
          </Link>

          {currentUser.role === "Admin" && (
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Buka CRUD Halaqah Admin</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
