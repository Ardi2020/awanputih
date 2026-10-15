"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Users, Phone, Search, ArrowRight, ShieldAlert } from "lucide-react";

export default function AnggotaListPage() {
  const { currentUser, scopedHalaqahs, allPemudas } = useApp();
  const [search, setSearch] = useState("");

  const isGuru = currentUser.role === "Guru";
  const isAsmen = currentUser.role === "Asmen";

  // Filter members belonging to scoped halaqahs
  const myHalaqahIds = scopedHalaqahs.map((h) => h.id);
  const myMembers = allPemudas.filter((p) => myHalaqahIds.includes(p.halaqahId));

  const filtered = myMembers.filter(
    (m) =>
      m.nama.toLowerCase().includes(search.toLowerCase()) ||
      m.telepon.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isGuru ? "Anggota Halaqah Saya" : isAsmen ? "Anggota Kelompok Binaan" : "Daftar Pemuda / Anggota"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isGuru
              ? "Daftar seluruh pemuda yang aktif mengikuti halaqah binaan Anda."
              : "Daftar pemuda dalam wilayah pengawasan kelompok binaan Anda."}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / telepon..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Anggota</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Belum ada data anggota pemuda dalam kelompok aktif Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, idx) => {
            const h = scopedHalaqahs.find((hq) => hq.id === m.halaqahId);
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{m.nama}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{m.telepon}</span>
                    </div>
                    {h && (
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                        {h.nama}
                      </div>
                    )}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {m.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
