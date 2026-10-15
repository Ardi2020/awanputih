"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { canSubmitReport } from "@/lib/permissions";
import { formatRupiah } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { KehadiranStatus, LaporanPemudaItem } from "@/lib/types";

function BuatLaporanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, scopedHalaqahs, allPemudas, allLaporans, periode, saveReportDraft, submitReport } = useApp();

  const halaqahIdParam = searchParams.get("halaqahId") || "";
  const laporanIdParam = searchParams.get("laporanId") || "";

  const [selectedHalaqahId, setSelectedHalaqahId] = useState(
    halaqahIdParam || (scopedHalaqahs[0] ? scopedHalaqahs[0].id : "")
  );

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State - Step 1: Info Umum
  const [terlaksana, setTerlaksana] = useState(true);
  const [alasanTidakTerlaksana, setAlasanTidakTerlaksana] = useState("");
  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState("2026-10-14");
  const [jamPelaksanaan, setJamPelaksanaan] = useState("08:30 - 10:30 WIB");
  const [materiBuku, setMateriBuku] = useState("");
  const [babHalaman, setBabHalaman] = useState("");

  // Form State - Step 2: Laporan Pemuda
  const [pemudaItems, setPemudaItems] = useState<LaporanPemudaItem[]>([]);

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Halaqah Object
  const currentHalaqah = scopedHalaqahs.find((h) => h.id === selectedHalaqahId);

  // Initialize or load draft
  useEffect(() => {
    if (!currentHalaqah) return;

    // Check if there is an existing draft for this halaqah & period
    const existingDraft = allLaporans.find(
      (r) =>
        (r.id === laporanIdParam || (r.halaqahId === currentHalaqah.id && r.periodeId === periode.id))
    );

    if (existingDraft) {
      setTerlaksana(existingDraft.infoUmum.terlaksana);
      setAlasanTidakTerlaksana(existingDraft.infoUmum.alasanTidakTerlaksana || "");
      setTanggalPelaksanaan(existingDraft.infoUmum.tanggalPelaksanaan || "2026-10-14");
      setJamPelaksanaan(existingDraft.infoUmum.jamPelaksanaan || currentHalaqah.jam);
      setMateriBuku(existingDraft.infoUmum.materiBuku || currentHalaqah.materi);
      setBabHalaman(existingDraft.infoUmum.babHalaman || "");
      setPemudaItems(existingDraft.laporanPemuda);
    } else {
      // Initialize from active members
      const activeMembers = allPemudas.filter((p) => currentHalaqah.anggotaIds.includes(p.id));
      setMateriBuku(currentHalaqah.materi);
      setJamPelaksanaan(currentHalaqah.jam);

      const items: LaporanPemudaItem[] = activeMembers.map((m) => ({
        pemudaId: m.id,
        pemudaNama: m.nama,
        kehadiran: "Hadir",
        kontrolPekanan: {
          tilawah: true,
          shalatJamaah: true,
          qiyamulLail: false,
          shaumSunnah: false,
          catatan: "",
        },
        kontakPersonal: true,
        catatanKontak: "",
        buletinCetak: true,
        buletinDigital: true,
        sppNominal: 50000,
      }));
      setPemudaItems(items);
    }
  }, [selectedHalaqahId, currentHalaqah]);

  // Security check: Only Guru with assigned halaqah
  if (currentUser.role !== "Guru" || scopedHalaqahs.length === 0) {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak (403 Forbidden)</h1>
        <p className="text-slate-600 text-sm mb-6">
          Hanya Guru yang memiliki penugasan kelompok halaqah yang berwenang mengisi laporan pekanan.
        </p>
        <button
          onClick={() => router.push("/")}
          className="touch-target px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // Update item helper
  const updatePemudaItem = (idx: number, patch: Partial<LaporanPemudaItem>) => {
    const updated = [...pemudaItems];
    updated[idx] = { ...updated[idx], ...patch };
    setPemudaItems(updated);
  };

  const updateKontrolPekanan = (idx: number, field: string, value: any) => {
    const updated = [...pemudaItems];
    updated[idx] = {
      ...updated[idx],
      kontrolPekanan: {
        ...updated[idx].kontrolPekanan,
        [field]: value,
      },
    };
    setPemudaItems(updated);
  };

  // Calculations for Step 3
  const totalAnggota = pemudaItems.length;
  const totalHadir = pemudaItems.filter((p) => p.kehadiran === "Hadir").length;
  const totalIzin = pemudaItems.filter((p) => p.kehadiran === "Izin").length;
  const totalSakit = pemudaItems.filter((p) => p.kehadiran === "Sakit").length;
  const totalAlpa = pemudaItems.filter((p) => p.kehadiran === "Alpa").length;
  const persentase = totalAnggota > 0 ? Math.round((totalHadir / totalAnggota) * 1000) / 10 : 0;
  const totalSpp = pemudaItems.reduce((acc, curr) => acc + (Number(curr.sppNominal) || 0), 0);

  const handleSaveDraft = () => {
    setErrorMsg("");
    const res = saveReportDraft({
      id: laporanIdParam || undefined,
      halaqahId: selectedHalaqahId,
      infoUmum: {
        terlaksana,
        alasanTidakTerlaksana,
        tanggalPelaksanaan,
        jamPelaksanaan,
        materiBuku,
        babHalaman,
      },
      laporanPemuda: pemudaItems,
      ringkasan: {
        totalAnggota,
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlpa,
        persentaseKehadiran: persentase,
        totalSpp,
      },
    });

    if (res.success) {
      router.push("/laporan");
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSubmitReport = () => {
    setErrorMsg("");
    if (!terlaksana && !alasanTidakTerlaksana.trim()) {
      setErrorMsg("Alasan tidak terlaksana wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const res = submitReport({
      id: laporanIdParam || undefined,
      halaqahId: selectedHalaqahId,
      infoUmum: {
        terlaksana,
        alasanTidakTerlaksana,
        tanggalPelaksanaan,
        jamPelaksanaan,
        materiBuku,
        babHalaman,
      },
      laporanPemuda: pemudaItems,
    });
    setIsSubmitting(false);

    if (res.success) {
      router.push("/laporan");
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/laporan"
          className="touch-target inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Laporan Saya</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Isi Laporan Pekanan
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Periode: <strong>{periode.label}</strong> • Guru: <strong>{currentUser.name}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="touch-target px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Simpan Draf</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step Indicator (OBS-004: Info Umum, Laporan Pemuda, Ringkasan) */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`touch-target py-2.5 rounded-xl border transition ${
            currentStep === 1
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          1. Info Umum
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className={`touch-target py-2.5 rounded-xl border transition ${
            currentStep === 2
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          2. Laporan Pemuda
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className={`touch-target py-2.5 rounded-xl border transition ${
            currentStep === 3
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200"
          }`}
        >
          3. Ringkasan & Kirim
        </button>
      </div>

      {/* STEP 1: INFO UMUM */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            Langkah 1: Informasi Pelaksanaan Halaqah
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Kelompok Halaqah <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedHalaqahId}
              onChange={(e) => setSelectedHalaqahId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {scopedHalaqahs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nama} ({h.kode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Status Keterlaksanaan Kegiatan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTerlaksana(true)}
                className={`touch-target py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
                  terlaksana
                    ? "bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-500/20"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Terlaksana</span>
              </button>
              <button
                type="button"
                onClick={() => setTerlaksana(false)}
                className={`touch-target py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
                  !terlaksana
                    ? "bg-red-50 text-red-800 border-red-400 ring-2 ring-red-500/20"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Tidak Terlaksana</span>
              </button>
            </div>
          </div>

          {!terlaksana ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Tidak Terlaksana <span className="text-red-500">*</span>
              </label>
              <textarea
                value={alasanTidakTerlaksana}
                onChange={(e) => setAlasanTidakTerlaksana(e.target.value)}
                rows={3}
                placeholder="Jelaskan alasan kendala kegiatan tidak dapat berlangsung pekan ini..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pelaksanaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tanggalPelaksanaan}
                    onChange={(e) => setTanggalPelaksanaan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Pelaksanaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jamPelaksanaan}
                    onChange={(e) => setJamPelaksanaan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="08:30 - 10:30 WIB"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Buku / Materi Yang Dibahas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={materiBuku}
                  onChange={(e) => setMateriBuku(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: Siroh Nabawiyah Ar-Rahiq Al-Makhtum"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bab / Pembahasan & Halaman <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={babHalaman}
                  onChange={(e) => setBabHalaman(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: Bab Bai'at Aqabah II (Hal. 110-125)"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="touch-target px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Lanjut ke Laporan Pemuda
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LAPORAN PEMUDA (Mobile-First Cards preserving all fields) */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Langkah 2: Isian Anggota / Pemuda ({pemudaItems.length} orang)
              </h2>
              <p className="text-xs text-slate-500">
                Preservasi field: Kehadiran, Kontrol Ibadah, Kontak, Buletin, dan SPP Bulanan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="touch-target px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl transition"
            >
              Ringkasan
            </button>
          </div>

          <div className="space-y-4">
            {pemudaItems.map((p, idx) => (
              <div
                key={p.pemudaId}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
              >
                {/* Member Header & Attendance */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{p.pemudaNama}</span>
                  </div>

                  {/* Kehadiran Radio Pills */}
                  <div className="grid grid-cols-4 gap-1.5 self-start sm:self-auto">
                    {(["Hadir", "Izin", "Sakit", "Alpa"] as KehadiranStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updatePemudaItem(idx, { kehadiran: status })}
                        className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                          p.kehadiran === status
                            ? status === "Hadir"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : status === "Izin"
                              ? "bg-blue-600 text-white border-blue-600"
                              : status === "Sakit"
                              ? "bg-amber-600 text-white border-amber-600"
                              : "bg-red-600 text-white border-red-600"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kontrol Pekanan / Mutaba'ah */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Kontrol Ibadah Pekanan
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.kontrolPekanan.tilawah}
                        onChange={(e) => updateKontrolPekanan(idx, "tilawah", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Tilawah Harian</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.kontrolPekanan.shalatJamaah}
                        onChange={(e) => updateKontrolPekanan(idx, "shalatJamaah", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Shalat Jama&apos;ah</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.kontrolPekanan.qiyamulLail}
                        onChange={(e) => updateKontrolPekanan(idx, "qiyamulLail", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Qiyamul Lail</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.kontrolPekanan.shaumSunnah}
                        onChange={(e) => updateKontrolPekanan(idx, "shaumSunnah", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Shaum Sunnah</span>
                    </label>
                  </div>
                </div>

                {/* Kontak Personal, Buletin, SPP */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* Kontak Personal */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <label className="flex items-center gap-2 font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={p.kontakPersonal}
                        onChange={(e) => updatePemudaItem(idx, { kontakPersonal: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Kontak Personal</span>
                    </label>
                    {p.kontakPersonal && (
                      <input
                        type="text"
                        value={p.catatanKontak || ""}
                        onChange={(e) => updatePemudaItem(idx, { catatanKontak: e.target.value })}
                        placeholder="Catatan interaksi..."
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                      />
                    )}
                  </div>

                  {/* Buletin */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <span className="font-semibold text-slate-700 block">Distribusi Buletin</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.buletinCetak}
                          onChange={(e) => updatePemudaItem(idx, { buletinCetak: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>Cetak</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.buletinDigital}
                          onChange={(e) => updatePemudaItem(idx, { buletinDigital: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>Digital</span>
                      </label>
                    </div>
                  </div>

                  {/* SPP Bulanan */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-semibold text-slate-700 block">SPP Bulanan (Rp)</span>
                    <span className="text-[10px] text-slate-400 block">Iuran bulan berjalan</span>
                    <input
                      type="number"
                      step={5000}
                      value={p.sppNominal}
                      onChange={(e) => updatePemudaItem(idx, { sppNominal: Number(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="touch-target px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Kembali ke Info Umum
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="touch-target px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              Lanjut ke Ringkasan Laporan
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RINGKASAN & KONFIRMASI */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            Langkah 3: Ringkasan & Konfirmasi Pengiriman Laporan
          </h2>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-2 bg-white rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Total Hadir</span>
              <span className="text-lg font-black text-emerald-600">{totalHadir} / {totalAnggota}</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Persentase</span>
              <span className="text-lg font-black text-slate-900">{persentase}%</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Izin / Sakit / Alpa</span>
              <span className="text-sm font-bold text-slate-700">{totalIzin} / {totalSakit} / {totalAlpa}</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Total SPP Bulanan</span>
              <span className="text-sm font-black text-emerald-700">{formatRupiah(totalSpp)}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div><strong>Kelompok:</strong> {currentHalaqah?.nama} ({currentHalaqah?.kode})</div>
            <div><strong>Pelaksanaan:</strong> {terlaksana ? "Terlaksana" : `Tidak Terlaksana (Alasan: ${alasanTidakTerlaksana})`}</div>
            {terlaksana && (
              <>
                <div><strong>Waktu:</strong> {tanggalPelaksanaan}, {jamPelaksanaan}</div>
                <div><strong>Materi:</strong> {materiBuku} ({babHalaman || "-"})</div>
              </>
            )}
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Ketentuan PRD (FR-008):</strong> Setelah laporan dikirim (&quot;Kirim Laporan&quot;), status akan berubah menjadi <strong>Submitted</strong> dan bersifat <em>Baca-Saja</em> untuk menjaga keutuhan riwayat pekanan.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="touch-target px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Ubah Data Pemuda
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="touch-target px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
              >
                Simpan Sebagai Draf
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                className="touch-target px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Laporan Pekanan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuatLaporanPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-slate-500 text-xs">
          Memuat formulir laporan pekanan...
        </div>
      }
    >
      <BuatLaporanContent />
    </Suspense>
  );
}
