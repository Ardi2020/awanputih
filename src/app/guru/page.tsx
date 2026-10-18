"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import {
  UserCheck,
  BookOpen,
  Users,
  FileText,
  ClipboardList,
  Plus,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";

type GuruTab = "ringkasan" | "kursus" | "pemuda" | "riwayat_kontrol" | "pengembangan";

export default function GuruControlPage() {
  const { currentUser, allUsers, allHalaqahs, allPemudas, kontrolGuruLogs, addKontrolGuruLog } = useApp();

  const gurus = allUsers.filter(
    (u) =>
      u.role === "Guru" &&
      u.id !== "usr-unassigned" &&
      (currentUser.role !== "Asmen" || u.asmenId === currentUser.id)
  );

  const [selectedGuruId, setSelectedGuruId] = useState(gurus[0]?.id || "usr-guru-1");
  const [activeTab, setActiveTab] = useState<GuruTab>("ringkasan");
  const [kontrolModalOpen, setKontrolModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form Catat Kontrol Guru state (Spec 3.D Asmen)
  const [kMedia, setKMedia] = useState<"Tatap Muka" | "Telepon / Daring" | "Kunjungan Halaqah">("Tatap Muka");
  const [kTopik, setKTopik] = useState("Kursus & Kehadiran Pemuda");
  const [kFakta, setKFakta] = useState("");
  const [kKondisi, setKKondisi] = useState("Baik & komunikatif");
  const [kKesepakatan, setKKesepakatan] = useState("");
  const [kTindakLanjut, setKTindakLanjut] = useState("");
  const [kTanggalEval, setKTanggalEval] = useState("2026-10-22");
  const [kBuatAP, setKBuatAP] = useState(true);

  const selectedGuru = gurus.find((g) => g.id === selectedGuruId) || gurus[0];
  const guruHalaqahs = allHalaqahs.filter((h) => h.guruId === selectedGuru?.id);
  const guruPemudas = allPemudas.filter((p) => guruHalaqahs.some((h) => h.id === p.halaqahId));
  const guruLogs = kontrolGuruLogs.filter((l) => l.guruId === selectedGuru?.id);

  const handleSubmitKontrol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuru) return;
    const res = addKontrolGuruLog({
      tanggal: new Date().toISOString().split("T")[0],
      guruId: selectedGuru.id,
      guruNama: selectedGuru.name,
      media: kMedia,
      topik: kTopik,
      faktaMasalah: kFakta || "Evaluasi rutin perkembangan halaqah",
      kondisiGuru: kKondisi,
      kesepakatan: kKesepakatan || "Menindaklanjuti pemuda yang belum dikontrol pekan ini",
      tindakLanjut: kTindakLanjut || "Kunjungan ri'ayah sebelum Jumat",
      tanggalEvaluasi: kTanggalEval,
      perluActionPlan: kBuatAP,
      perluEskalasi: false,
    });
    if (res.success) {
      setToast(res.message);
      setKontrolModalOpen(false);
      setKFakta("");
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Menu Guru — Pusat Kontrol, Perbandingan & Beban Pembinaan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Penyempurnaan MENU APK AWANPUTIH: Mengganti nama &ldquo;Kontrol&rdquo; menjadi objek &ldquo;Guru&rdquo; dengan Aggregate Score + Critical Override.
          </p>
        </div>
        <button
          onClick={() => setKontrolModalOpen(true)}
          className="touch-target px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Kontrol Guru</span>
        </button>
      </div>

      {/* Panel Fungsi Admin Terbatas AJM / Asmen (Khusus Guru, Perhalaqahan & Murid) */}
      {(currentUser.role === "Asmen" || currentUser.role === "Admin" || currentUser.role === "Manager") && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
              Fungsi Admin AJM / Asmen (Terbatas Guru, Perhalaqahan & Murid)
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Atur user/email login Guru, tambah perhalaqahan, atau kelola data murid (maks. 5/halaqah).
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin?tab=guru&create=guru"
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Guru</span>
            </Link>
            <Link
              href="/admin?tab=halaqah&create=halaqah"
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Halaqah</span>
            </Link>
            <Link
              href="/admin?tab=pemuda&create=pemuda"
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Murid</span>
            </Link>
            <Link
              href="/admin?tab=guru"
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
            >
              Kelola Semua (CRUD) →
            </Link>
          </div>
        </div>
      )}

      {toast && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Guru Cards with Multi-Halaqah Chips & Beban Amanah */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gurus.map((g) => {
          const gHqs = allHalaqahs.filter((h) => h.guruId === g.id);
          const gPms = allPemudas.filter((p) => gHqs.some((h) => h.id === p.halaqahId));
          const rawanCount = gPms.filter((p) => p.perluPerhatian).length;
          const hasCriticalHq = gHqs.some((h) => h.kesehatan === "Sakit");
          const isSelected = g.id === selectedGuru?.id;

          return (
            <div
              key={g.id}
              onClick={() => setSelectedGuruId(g.id)}
              className={`cursor-pointer p-4 rounded-2xl border transition flex flex-col justify-between ${
                isSelected
                  ? "bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/20 shadow-md"
                  : "bg-white border-slate-200 hover:border-blue-300 shadow-sm"
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-black text-slate-900 text-sm">{g.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {gHqs.length} Halaqah • {gPms.length} Pemuda • {rawanCount} Perlu Ri&apos;ayah
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      g.statusKesehatan === "Sakit" || hasCriticalHq
                        ? "bg-red-600 text-white"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    Skor {g.skorKesehatan} • {g.statusKesehatan}
                  </span>
                </div>

                {/* Multi-Halaqah Chips (Recommendation #16: Aggregate + Critical Override) */}
                <div className="flex flex-wrap gap-1.5">
                  {gHqs.map((hq) => (
                    <span
                      key={hq.id}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
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

                {hasCriticalHq && (
                  <div className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                    ⚠ Critical Override: 1 Halaqah membutuhkan intervensi
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  Beban Amanah: <strong>{gHqs.length >= 3 ? "🟡 Monitor (3 Kelompok)" : "🟢 Normal"}</strong>
                </span>
                <span className="font-bold text-blue-700">Detail →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Guru Detail (Drill-Down: Guru -> Kelompok -> Pemuda) */}
      {selectedGuru && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">{selectedGuru.name}</h2>
              <p className="text-xs text-slate-300">
                Drill-down Hierarki: <strong>Asmen → Guru → Kelompok Halaqah → Pemuda</strong>
              </p>
            </div>
            <button
              onClick={() => setKontrolModalOpen(true)}
              className="px-3.5 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black rounded-xl text-xs self-start sm:self-auto"
            >
              + Catat Kontrol {selectedGuru.name}
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto px-4 pt-2 border-b border-slate-200 text-xs">
            {(
              [
                { id: "ringkasan", label: "1. Ringkasan & Beban Amanah" },
                { id: "kursus", label: `2. Kelompok Halaqah (${guruHalaqahs.length})` },
                { id: "pemuda", label: `3. Pemuda (${guruPemudas.length})` },
                { id: "riwayat_kontrol", label: `4. Riwayat Kontrol (${guruLogs.length})` },
                { id: "pengembangan", label: "5. Pengembangan Guru (3K-3M)" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2.5 font-bold border-b-2 transition shrink-0 ${
                  activeTab === t.id
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "ringkasan" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-black text-slate-900 text-sm">Beban Pembinaan Guru (Spec #19)</div>
                  <div>Halaqah Aktif: <strong>{guruHalaqahs.length} Kelompok</strong></div>
                  <div>Total Pemuda Binaan: <strong>{guruPemudas.length} Orang</strong></div>
                  <div>Kasus Perlu Ri&apos;ayah: <strong className="text-red-600">{guruPemudas.filter((p) => p.perluPerhatian).length} Orang</strong></div>
                  <div>Status Beban: <strong>{guruHalaqahs.length >= 3 ? "🟡 Perlu Perhatian (3 Kelompok)" : "🟢 Kapasitas Normal"}</strong></div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 sm:col-span-2">
                  <div className="font-black text-slate-900 text-sm">Ringkasan per Kelompok Halaqah</div>
                  <div className="space-y-2 mt-2">
                    {guruHalaqahs.map((hq) => (
                      <div key={hq.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">{hq.kode} • {hq.nama}</span>
                          <span className="ml-2 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold">{hq.jenis}</span>
                          <div className="text-slate-500 mt-0.5">
                            {hq.hari}, {hq.jam} • Guru Pengganti: {hq.guruPenggantiNama || "Belum ditetapkan"}
                          </div>
                        </div>
                        <Link href={`/halaqah/${hq.id}`} className="font-bold text-blue-600">
                          Buka →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "kursus" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {guruHalaqahs.map((hq) => (
                  <div key={hq.id} className="p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="font-black text-slate-900 text-sm">{hq.kode} — {hq.nama}</div>
                    <div>Jenis: <strong>{hq.jenis}</strong> • Kehadiran: <strong>{hq.rataKehadiran}%</strong></div>
                    <div>Materi: {hq.materi}</div>
                    <Link href={`/halaqah/${hq.id}`} className="inline-block pt-1 font-bold text-blue-600">
                      Lihat Detail Kursus & Absensi →
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "pemuda" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {guruPemudas.map((pm) => (
                  <div key={pm.id} className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{pm.nama}</div>
                      <div className="text-slate-500">
                        Jenjang: {pm.jenjang} • Kontrol: {pm.terakhirKontrol || "-"}
                      </div>
                    </div>
                    {pm.perluPerhatian && (
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                        Rawan
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "riwayat_kontrol" && (
              <div className="space-y-3 text-xs">
                {guruLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.topik}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {log.media} • {log.tanggal}
                      </span>
                    </div>
                    <div><strong>Fakta:</strong> {log.faktaMasalah}</div>
                    <div><strong>Kesepakatan:</strong> {log.kesepakatan}</div>
                    <div><strong>Evaluasi berikutnya:</strong> {log.tanggalEvaluasi}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "pengembangan" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-black text-slate-900 text-sm">Catatan Pembinaan & Pendekatan 3M Asmen</div>
                <div>• Kompetensi: <strong>{selectedGuru.diagnosis3K?.kompetensi}</strong></div>
                <div>• Kekuatan: <strong>{selectedGuru.diagnosis3K?.kekuatan}</strong></div>
                <div>• Kemandirian & Topi: <strong>{selectedGuru.diagnosis3K?.kemandirian} ({selectedGuru.diagnosis3K?.intervensi3M})</strong></div>
                <div>• Komitmen Terakhir: <strong>{selectedGuru.diagnosis3K?.komitmenTerakhir}</strong></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Form Catat Kontrol Guru */}
      {kontrolModalOpen && selectedGuru && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                Catat Kontrol Guru: {selectedGuru.name}
              </h3>
              <button onClick={() => setKontrolModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitKontrol} className="space-y-3 pt-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Media Kontrol:</label>
                  <select
                    value={kMedia}
                    onChange={(e) => setKMedia(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Tatap Muka">Tatap Muka</option>
                    <option value="Telepon / Daring">Telepon / Daring</option>
                    <option value="Kunjungan Halaqah">Kunjungan Halaqah</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Topik:</label>
                  <input
                    type="text"
                    value={kTopik}
                    onChange={(e) => setKTopik(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fakta Masalah yang Dibahas:</label>
                <textarea
                  rows={2}
                  required
                  value={kFakta}
                  onChange={(e) => setKFakta(e.target.value)}
                  placeholder="Contoh: Kehadiran HK-02 turun dan 1 pemuda belum dikontrol..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kesepakatan & Tindak Lanjut:</label>
                <input
                  type="text"
                  required
                  value={kKesepakatan}
                  onChange={(e) => setKKesepakatan(e.target.value)}
                  placeholder="Contoh: Kunjungan personal bersama hari Kamis sore"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kBuatAP}
                  onChange={(e) => setKBuatAP(e.target.checked)}
                />
                <span className="font-bold text-blue-800">
                  Otomatis jadikan Tugas / Action Plan untuk Guru
                </span>
              </label>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setKontrolModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl">
                  Simpan Catatan Kontrol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
