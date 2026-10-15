"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { canAccessHalaqah } from "@/lib/permissions";
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  Save,
  ShieldAlert,
  Info,
} from "lucide-react";
import { PengajuanMemberItem } from "@/lib/types";

export default function EditHalaqahProposalPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { currentUser, allHalaqahs, allPemudas, createPengajuan } = useApp();

  const halaqah = allHalaqahs.find((h) => h.id === id);

  // Initial members from active master
  const currentMembers = halaqah
    ? allPemudas
        .filter((p) => halaqah.anggotaIds.includes(p.id))
        .map((p) => ({
          id: p.id,
          nama: p.nama,
          telepon: p.telepon,
          action: "KEEP" as const,
        }))
    : [];

  const [nama, setNama] = useState(halaqah?.nama || "");
  const [hari, setHari] = useState(halaqah?.hari || "Ahad");
  const [jam, setJam] = useState(halaqah?.jam || "");
  const [tempat, setTempat] = useState(halaqah?.tempat || "");
  const [materi, setMateri] = useState(halaqah?.materi || "");
  const [members, setMembers] = useState<PengajuanMemberItem[]>(currentMembers);
  const [catatanPemohon, setCatatanPemohon] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security check: Only Guru who owns the halaqah
  if (!halaqah || currentUser.role !== "Guru" || !canAccessHalaqah(currentUser, halaqah)) {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak (403 Forbidden)</h1>
        <p className="text-slate-600 text-sm mb-6">
          Anda hanya dapat mengajukan perubahan untuk kelompok halaqah yang Anda ampu sendiri.
        </p>
        <button
          onClick={() => router.push("/halaqah")}
          className="touch-target px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
        >
          Kembali ke Halaqah Saya
        </button>
      </div>
    );
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setMembers([
      ...members,
      {
        nama: newMemberName.trim(),
        telepon: newMemberPhone.trim() || "-",
        action: "ADD",
      },
    ]);
    setNewMemberName("");
    setNewMemberPhone("");
  };

  const handleRemoveMember = (idx: number) => {
    const item = members[idx];
    if (item.action === "ADD") {
      setMembers(members.filter((_, i) => i !== idx));
    } else {
      // Mark as REMOVE
      const updated = [...members];
      updated[idx] = { ...item, action: item.action === "REMOVE" ? "KEEP" : "REMOVE" };
      setMembers(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nama.trim() || !jam.trim() || !tempat.trim() || !materi.trim()) {
      setErrorMsg("Mohon lengkapi seluruh field formulir kelompok.");
      return;
    }

    const activeCount = members.filter((m) => m.action !== "REMOVE").length;
    if (activeCount === 0) {
      setErrorMsg("Kelompok halaqah harus memiliki minimal 1 orang anggota.");
      return;
    }

    setIsSubmitting(true);

    const res = createPengajuan(
      {
        nama: nama.trim(),
        hari,
        jam: jam.trim(),
        tempat: tempat.trim(),
        materi: materi.trim(),
        anggota: members,
      },
      "UPDATE",
      halaqah.id,
      catatanPemohon.trim()
    );

    setIsSubmitting(false);

    if (res.success) {
      router.push("/pengajuan?success=true");
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href={`/halaqah/${halaqah.id}`}
          className="touch-target inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Kelompok</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Ajukan Perubahan Halaqah
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Usulkan perubahan untuk <strong>{halaqah.nama}</strong> (Versi Sumber: v{halaqah.versi}).
        </p>
      </div>

      {/* PRD Principle Notice */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-950 text-xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Ketentuan PRD (FR-005):</span> Formulir ini membuat <strong>Draf Pengajuan</strong> yang akan diperiksa oleh Asisten Manager.
          Selama masa pengajuan, data aktif kelompok dan pelaporan tetap menggunakan versi v{halaqah.versi} tanpa berubah surut.
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form (Mobile First, Single-column for NFR-003) */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            1. Informasi Pokok Halaqah
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Halaqah <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="Contoh: Halaqah Al-Fatih"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hari Pertemuan <span className="text-red-500">*</span>
              </label>
              <select
                value={hari}
                onChange={(e) => setHari(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                <option value="Ahad">Ahad</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jum'at">Jum&apos;at</option>
                <option value="Sabtu">Sabtu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Pertemuan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="Contoh: 08:30 - 10:30 WIB"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tempat Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tempat}
              onChange={(e) => setTempat(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="Contoh: Masjid Al-Ihsan, Lt. 2"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Buku / Kurikulum Materi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={materi}
              onChange={(e) => setMateri(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="Contoh: Siroh Nabawiyah & Tadabbur Al-Qur'an"
              required
            />
          </div>
        </div>

        {/* Member Mutation Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>2. Susunan Anggota / Pemuda</span>
            <span className="text-xs font-normal text-slate-400">
              {members.filter((m) => m.action !== "REMOVE").length} anggota aktif
            </span>
          </h2>

          <div className="space-y-2">
            {members.map((m, idx) => {
              const isRemoved = m.action === "REMOVE";
              const isAdded = m.action === "ADD";

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between transition ${
                    isRemoved
                      ? "bg-red-50/60 border-red-200 line-through text-red-600 opacity-70"
                      : isAdded
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">
                      {m.nama} <span className="text-slate-400 font-normal">({m.telepon})</span>
                    </span>
                    {isAdded && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-800">
                        + Tambahan Baru
                      </span>
                    )}
                    {isRemoved && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-200 text-red-800 no-underline">
                        - Dihapus
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="touch-target p-1.5 rounded-lg text-slate-500 hover:text-red-600 transition"
                    title={isRemoved ? "Batalkan hapus" : "Hapus dari kelompok"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add Member sub-form */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Tambah Anggota Baru ke Usulan</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nama Lengkap Pemuda"
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              />
              <input
                type="text"
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
                placeholder="Nomor Telepon / WA (opsional)"
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={handleAddMember}
              className="touch-target px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambahkan ke Daftar</span>
            </button>
          </div>
        </div>

        {/* Reason / Notes */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700">
            Catatan Perubahan untuk Asisten Manager (Opsional)
          </label>
          <textarea
            value={catatanPemohon}
            onChange={(e) => setCatatanPemohon(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            placeholder="Jelaskan secara singkat alasan perubahan jadwal, tempat, atau mutasi anggota..."
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href={`/halaqah/${halaqah.id}`}
            className="touch-target px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="touch-target px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Kirim Pengajuan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
