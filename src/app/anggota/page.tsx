"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import {
  WILAYAH_ASMEN_SUMMARIES,
  MASTER_KARYAWAN_40,
  MASTER_DARIS_58,
  KELOMPOK_KADERISASI_LIST,
} from "@/lib/orgData";
import { UnitWilayah } from "@/lib/types";
import {
  Users,
  Phone,
  Search,
  Network,
  Briefcase,
  GraduationCap,
  Sparkles,
  BookOpen,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

type ActiveTab = "STRUKTUR" | "KARYAWAN_40" | "DARIS_58" | "KADERISASI" | "MURID_SAYA";

export default function AnggotaListPage() {
  const { currentUser, allHalaqahs, scopedHalaqahs, allPemudas } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>("STRUKTUR");
  const [selectedWilayah, setSelectedWilayah] = useState<"ALL" | UnitWilayah>("ALL");
  const [search, setSearch] = useState("");

  const isGuru = currentUser.role === "Guru";
  const isAsmen = currentUser.role === "Asmen";

  // Scoped members for "Murid Saya / Wilayah Saya"
  const myHalaqahIds = scopedHalaqahs.map((h) => h.id);
  const myMembers = allPemudas.filter((p) => myHalaqahIds.includes(p.halaqahId));

  const filteredMyMembers = myMembers.filter(
    (m) =>
      (selectedWilayah === "ALL" || m.wilayah === selectedWilayah || m.unitWilayah === selectedWilayah) &&
      (m.nama.toLowerCase().includes(search.toLowerCase()) ||
        m.telepon.includes(search) ||
        (m.kitabMateri && m.kitabMateri.toLowerCase().includes(search.toLowerCase())))
  );

  // Filtered 40 Karyawan
  const filteredKaryawan40 = MASTER_KARYAWAN_40.filter(
    (k) =>
      (selectedWilayah === "ALL" || k.unitWilayah === selectedWilayah) &&
      (k.nama.toLowerCase().includes(search.toLowerCase()) ||
        (k.halaqahDiikutiNama && k.halaqahDiikutiNama.toLowerCase().includes(search.toLowerCase())) ||
        (k.kitabDiikuti && k.kitabDiikuti.toLowerCase().includes(search.toLowerCase())) ||
        (k.catatanKaderisasi && k.catatanKaderisasi.toLowerCase().includes(search.toLowerCase())))
  );

  // Filtered 58 Daris
  const filteredDaris58 = MASTER_DARIS_58.filter(
    (d) =>
      (selectedWilayah === "ALL" || d.unitWilayah === selectedWilayah) &&
      (d.nama.toLowerCase().includes(search.toLowerCase()) ||
        d.guruNama.toLowerCase().includes(search.toLowerCase()) ||
        d.kitab.toLowerCase().includes(search.toLowerCase()))
  );

  // Filtered Kaderisasi (HU, Pra HU, CP, KEC, Alumni TITR 4)
  const filteredKaderisasi = KELOMPOK_KADERISASI_LIST.filter(
    (g) =>
      (selectedWilayah === "ALL" || g.unitWilayah === selectedWilayah) &&
      (g.pengampuNama.toLowerCase().includes(search.toLowerCase()) ||
        g.kategori.toLowerCase().includes(search.toLowerCase()) ||
        g.judul.toLowerCase().includes(search.toLowerCase()) ||
        g.anggotaNamaList.some((n: string) => n.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-4 pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-1.5">
              <Network className="w-3 h-3" />
              Master Data Organisasi & Anggota Awan Putih
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight">
              Data Struktur KT1, KT2, PU1, PU2 (Karyawan, Daris & Kaderisasi)
            </h1>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Manajer: <strong className="text-white">Yugi</strong> • 4 Asmen:{" "}
              <strong className="text-white">KT1 (Deri)</strong>,{" "}
              <strong className="text-white">KT2 (David)</strong>,{" "}
              <strong className="text-white">PU1 (Nandes)</strong>,{" "}
              <strong className="text-white">PU2 (Abdi)</strong>
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:w-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-2.5 py-2 text-center border border-white/10">
              <div className="text-sm sm:text-base font-black text-white">40</div>
              <div className="text-[10px] font-bold text-emerald-200">Karyawan</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-2.5 py-2 text-center border border-white/10">
              <div className="text-sm sm:text-base font-black text-amber-300">58+8</div>
              <div className="text-[10px] font-bold text-emerald-200">Daris</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-2.5 py-2 text-center border border-white/10">
              <div className="text-sm sm:text-base font-black text-sky-300">30</div>
              <div className="text-[10px] font-bold text-emerald-200">Halaqah</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-2.5 py-2 text-center border border-white/10">
              <div className="text-sm sm:text-base font-black text-purple-200">15</div>
              <div className="text-[10px] font-bold text-emerald-200">HU/CP/KEC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab("STRUKTUR")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
            activeTab === "STRUKTUR"
              ? "bg-emerald-900 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          Bagan Wilayah (KT1–PU2)
        </button>
        <button
          onClick={() => setActiveTab("KARYAWAN_40")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
            activeTab === "KARYAWAN_40"
              ? "bg-emerald-900 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          40 Karyawan
        </button>
        <button
          onClick={() => setActiveTab("DARIS_58")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
            activeTab === "DARIS_58"
              ? "bg-emerald-900 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          58 Daris (Pelajar)
        </button>
        <button
          onClick={() => setActiveTab("KADERISASI")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
            activeTab === "KADERISASI"
              ? "bg-emerald-900 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          HU / Pra HU / CP / KEC (15)
        </button>
        <button
          onClick={() => setActiveTab("MURID_SAYA")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
            activeTab === "MURID_SAYA"
              ? "bg-emerald-900 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          {isGuru ? "Murid Binaan Saya" : isAsmen ? "Anggota Wilayah Saya" : "Semua Anggota Halaqah"} ({myMembers.length})
        </button>
      </div>

      {/* Wilayah Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(["ALL", "KT1", "KT2", "PU1", "PU2"] as const).map((w) => {
            const labelMap = {
              ALL: "Semua Wilayah (4)",
              KT1: "KT1 (Deri)",
              KT2: "KT2 (David)",
              PU1: "PU1 (Nandes)",
              PU2: "PU2 (Abdi)",
            };
            return (
              <button
                key={w}
                onClick={() => setSelectedWilayah(w)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                  selectedWilayah === w
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {labelMap[w]}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anggota, guru, kitab..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* =========================================================
          TAB 1: BAGAN STRUKTUR WILAYAH (KT1, KT2, PU1, PU2)
      ========================================================= */}
      {activeTab === "STRUKTUR" && (
        <div className="space-y-5">
          {WILAYAH_ASMEN_SUMMARIES.filter(
            (w) => selectedWilayah === "ALL" || w.unitWilayah === selectedWilayah
          ).map((wil) => {
            const wilayahHalaqahs = allHalaqahs.filter((h) => h.wilayah === wil.unitWilayah);
            const wilayahKaderisasi = KELOMPOK_KADERISASI_LIST.filter(
              (k) => k.unitWilayah === wil.unitWilayah
            );

            // Group halaqahs by Guru
            const guruNames = Array.from(new Set(wilayahHalaqahs.map((h) => h.guruNama)));

            return (
              <div
                key={wil.unitWilayah}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Wilayah Header */}
                <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-4 py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs">
                        {wil.namaWilayah}
                      </span>
                      <span className="text-xs font-bold text-emerald-200">
                        Manajer: Yugi • Asmen (AJM): {wil.asmenNama}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Bagan Struktur Perhalaqahan (Kotak Kuning = Karyawan, Kotak Putih = Daris / Pelajar, Bagian Bawah = HU / Pra HU / CP / KEC)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {wil.jumlahKaryawan} Karyawan
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-400/20 text-sky-200 border border-sky-400/30">
                      {wil.jumlahDaris} Daris
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                      {wilayahHalaqahs.length} Halaqah
                    </span>
                  </div>
                </div>

                {/* Guru & Halaqah Columns */}
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {guruNames.map((gName) => {
                      const gHalaqahs = wilayahHalaqahs.filter((h) => h.guruNama === gName);
                      return (
                        <div
                          key={gName}
                          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            {/* Guru Header */}
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-xs">
                                  {gName.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                    GURU / MUSYRIF
                                  </div>
                                  <div className="text-xs font-black text-slate-900">{gName}</div>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {gHalaqahs.length} Halaqah
                              </span>
                            </div>

                            {/* Halaqah Groups under this Guru */}
                            <div className="space-y-2.5">
                              {gHalaqahs.map((hq) => {
                                const members = allPemudas.filter((p) => p.halaqahId === hq.id);
                                const isKaryawan = hq.jenis === "Karyawan";
                                return (
                                  <div
                                    key={hq.id}
                                    className={`rounded-xl p-2.5 border ${
                                      isKaryawan
                                        ? "bg-amber-50/90 border-amber-300"
                                        : "bg-white border-slate-200"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1 mb-1.5">
                                      <div className="flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                                        <span className="text-xs font-black text-slate-900">
                                          {hq.materi}
                                        </span>
                                      </div>
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                          isKaryawan
                                            ? "bg-amber-300/80 text-amber-950"
                                            : "bg-slate-100 text-slate-700 border border-slate-200"
                                        }`}
                                      >
                                        {isKaryawan ? "Karyawan" : "Daris"} ({members.length}/5)
                                      </span>
                                    </div>

                                    <div className="space-y-1">
                                      {members.map((m, idx) => (
                                        <div
                                          key={m.id}
                                          className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs font-bold ${
                                            isKaryawan
                                              ? "bg-amber-200/70 text-slate-900"
                                              : "bg-slate-50 text-slate-800 border border-slate-100"
                                          }`}
                                        >
                                          <span>
                                            {idx + 1}. {m.nama}
                                          </span>
                                          {m.catatanKaderisasi && (
                                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-900/10 text-emerald-900">
                                              {m.catatanKaderisasi}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bagian Bawah Bagan: HU / Pra HU / CP / Peserta KEC / Alumni TITR 4 */}
                  {wilayahKaderisasi.length > 0 && (
                    <div className="pt-3 border-t border-dashed border-slate-200">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Pembinaan Umum & Kaderisasi Wilayah {wil.namaWilayah} (HU • Pra HU • CP • KEC)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {wilayahKaderisasi.map((kd) => (
                          <div
                            key={kd.id}
                            className="rounded-xl border border-amber-300/80 bg-amber-50/50 p-2.5"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-black text-slate-900">
                                {kd.pengampuNama}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px]">
                                {kd.kategori}
                              </span>
                            </div>
                            {kd.anggotaNamaList.length === 0 ? (
                              <div className="text-[11px] italic text-slate-400">
                                (Belum ada daftar nama di bagan)
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {kd.anggotaNamaList.map((nm: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[11px] font-semibold text-slate-800"
                                  >
                                    {i + 1}. {nm}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
          TAB 2: DATA 40 KARYAWAN (SESUAI KARYAWAN 40.PNG)
      ========================================================= */}
      {activeTab === "KARYAWAN_40" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-amber-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-amber-700" />
                Daftar Lengkap 40 Karyawan (Sesuai Dokumen Karyawan 40.png)
              </h2>
              <p className="text-xs text-slate-600">
                Terdiri dari 40 Karyawan (KT1: 12 orang, KT2: 12 orang, PU1: 8 orang, PU2: 8 orang).
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs self-start sm:self-auto">
              Menampilkan {filteredKaryawan40.length} / 40 Karyawan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {filteredKaryawan40.map((k, idx) => (
              <div
                key={k.id}
                className="rounded-xl border border-amber-200 bg-amber-50/30 p-3 flex flex-col justify-between hover:border-amber-400 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">
                          {k.nama} ({k.kodeDomisili})
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                            No. Wilayah #{k.noUrutWilayah}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                            {k.unitWilayah} ({k.asmenNama})
                          </span>
                        </div>
                      </div>
                    </div>
                    {k.isGuru && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-white font-extrabold text-[10px] flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        Guru ({k.jumlahHalaqahDiampu})
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-amber-200/60 space-y-1 text-xs">
                    <div className="text-slate-700">
                      <span className="font-bold text-slate-500">Halaqah Diikuti: </span>
                      <span className="font-bold text-slate-900">
                        {k.halaqahDiikutiNama || "-"} ({k.kitabDiikuti || "-"})
                      </span>
                    </div>
                    {k.guruPembinaNama && (
                      <div className="text-emerald-800">
                        <span className="font-bold text-emerald-700">Guru Pembina: </span>
                        <span className="font-extrabold">{k.guruPembinaNama}</span>
                      </div>
                    )}
                    {k.catatanKaderisasi && (
                      <div className="text-amber-900">
                        <span className="font-bold text-amber-700">Peran & Kaderisasi: </span>
                        <span className="font-bold">{k.catatanKaderisasi}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: DATA 58 DARIS (SESUAI DARIS 58.PNG)
      ========================================================= */}
      {activeTab === "DARIS_58" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-200 bg-sky-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-sky-700" />
                Daftar Lengkap 58 Daris (Sesuai Dokumen Daris 58.png)
              </h2>
              <p className="text-xs text-slate-600">
                Urutan 1–58 sesuai persis dengan tabel Daris 58.png (KT1: #1–#9, KT2: #10–#25, PU1: #26–#48, PU2: #49–#58).
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-sky-600 text-white font-black text-xs self-start sm:self-auto">
              Menampilkan {filteredDaris58.length} / 58 Daris
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {filteredDaris58.map((d) => (
              <div
                key={d.no}
                className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between hover:border-sky-400 transition shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-900 border border-sky-200 font-black text-xs flex items-center justify-center shrink-0">
                    {d.no}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{d.nama}</h3>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Guru: <strong className="text-slate-900">{d.guruNama}</strong> • Kitab:{" "}
                      <strong className="text-emerald-800">{d.kitab}</strong>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                    {d.unitWilayah}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{d.kodeDomisili}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: PEMBINAAN UMUM (HU, PRA HU, CP, PESERTA KEC, ALUMNI TITR 4)
      ========================================================= */}
      {activeTab === "KADERISASI" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredKaderisasi.map((kd) => (
            <div
              key={kd.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Wilayah {kd.unitWilayah} ({kd.asmenNama})
                    </span>
                    <h3 className="text-sm font-black text-slate-900">{kd.judul}</h3>
                    <div className="text-[11px] text-slate-600">
                      Pembina: <strong>{kd.pengampuNama}</strong>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs">
                    {kd.kategori}
                  </span>
                </div>

                {(kd.perantaraNama || kd.musyrifBackup) && (
                  <p className="text-[11px] text-slate-500 mb-2">
                    {kd.perantaraNama ? `Perantara: ${kd.perantaraNama}` : ""}
                    {kd.musyrifBackup ? ` • Musyrif: ${kd.musyrifBackup}` : ""}
                  </p>
                )}

                {kd.anggotaNamaList.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 italic">
                    Daftar nama peserta pada bagan masih kosong / sedang didata.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {kd.anggotaNamaList.map((nama: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs font-bold text-slate-900"
                      >
                        <span>
                          {idx + 1}. {nama}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-800">
                          {kd.kategori}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          TAB 5: MURID HALAQAH SAYA / WILAYAH SAYA (INTERAKTIF)
      ========================================================= */}
      {activeTab === "MURID_SAYA" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredMyMembers.map((m, idx) => {
            const h = allHalaqahs.find((hq) => hq.id === m.halaqahId);
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${
                        m.jenjang === "Karyawan"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-emerald-100 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-slate-900 text-sm">{m.nama}</h3>
                        {m.wilayah && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {m.wilayah}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{m.telepon}</span>
                      </div>
                      {h && (
                        <div className="text-[11px] text-emerald-700 font-bold mt-1">
                          {h.nama} • Kitab: {h.materi}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      m.jenjang === "Karyawan"
                        ? "bg-amber-300 text-amber-950"
                        : "bg-sky-100 text-sky-900"
                    }`}
                  >
                    {m.jenjang === "Karyawan" ? "Karyawan" : "Daris"}
                  </span>
                </div>

                {m.perluPerhatian && (
                  <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{m.alasanPerhatian || "Perlu perhatian & ri'ayah"}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
