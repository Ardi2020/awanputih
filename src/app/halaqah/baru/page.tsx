"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
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

export default function NewHalaqahProposalPage() {
  const router = useRouter();
  const { currentUser, createPengajuan } = useApp();

  const [nama, setNama] = useState("");
  const [hari, setHari] = useState("Ahad");
  const [jam, setJam] = useState("08:30 - 10:30 WIB");
  const [tempat, setTempat] = useState("");
  const [materi, setMateri] = useState("");
  const [members, setMembers] = useState<PengajuanMemberItem[]>([]);
  const [catatanPemohon, setCatatanPemohon] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security check: Only Guru
  if (currentUser.role !== "Guru") {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak (403 Forbidden)</h1>
        <p className="text-slate-600 text-sm mb-6">
          Hanya pengguna dengan peran Guru yang berwenang mengajukan pembuatan kelompok halaqah baru.
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
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nama.trim() || !jam.trim() || !tempat.trim() || !materi.trim()) {
      setErrorMsg("Mohon lengkapi seluruh field pokok kelompok halaqah.");
      return;
    }

    if (members.length === 0) {
      setErrorMsg("Kelompok baru harus memiliki minimal 1 calon anggota pemuda.");
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
      "CREATE",
      undefined,
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
      <div>
        <Link
          href="/halaqah"
          className="touch-target inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaqah Saya</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Ajukan Pembuatan Halaqah Baru
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pengampu: <strong>{currentUser.name}</strong> (Otomatis dari sesi login server).
        </p>
      </div>

      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-950 text-xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Ketentuan PRD (FR-004):</span> Pengajuan baru berstatus <strong>Menunggu Validasi</strong> dan <em>belum</em> menjadi kelompok aktif atau sumber laporan sampai disetujui secara resmi oleh Asisten Manager pembina Anda.
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            1. Informasi Pokok Kelompok
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
              placeholder="Contoh: Halaqah Salman Al-Farisi"
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
              placeholder="Contoh: Masjid Nurul Iman, Lt. 2"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kurikulum / Buku Materi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={materi}
              onChange={(e) => setMateri(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="Contoh: Fiqih Sunnah & Tadabbur Al-Qur'an"
              required
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>2. Calon Anggota Pemuda Awal</span>
            <span className="text-xs font-normal text-slate-400">{members.length} pemuda</span>
          </h2>

          <div className="space-y-2">
            {members.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">
                    {m.nama} <span className="text-slate-400 font-normal">({m.telepon})</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(idx)}
                  className="touch-target p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Daftarkan Anggota Baru</span>
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
                placeholder="Nomor Telepon / WA"
                className="px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={handleAddMember}
              className="touch-target px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Anggota</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700">
            Catatan Tambahan untuk Asisten Manager (Opsional)
          </label>
          <textarea
            value={catatanPemohon}
            onChange={(e) => setCatatanPemohon(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            placeholder="Keterangan pengajuan pembentukan kelompok..."
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/halaqah"
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
            <span>Kirim Pengajuan ke Asmen</span>
          </button>
        </div>
      </form>
    </div>
  );
}
