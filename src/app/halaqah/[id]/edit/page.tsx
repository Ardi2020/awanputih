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
  Clock,
  Edit3,
} from "lucide-react";
import { PengajuanMemberItem } from "@/lib/types";

const MAX_MURID_HALAQAH = 5;

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

  const activeCount = members.filter((m) => m.action !== "REMOVE").length;

  const handleUpdateMemberField = (
    idx: number,
    field: "nama" | "telepon",
    value: string
  ) => {
    const updated = [...members];
    updated[idx] = { ...updated[idx], [field]: value };
    setMembers(updated);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!newMemberName.trim()) return;
    if (activeCount >= MAX_MURID_HALAQAH) {
      setErrorMsg(`Jumlah murid halaqah maksimum adalah ${MAX_MURID_HALAQAH} orang.`);
      return;
    }
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
    setErrorMsg("");
    const item = members[idx];
    if (item.action === "ADD") {
      setMembers(members.filter((_, i) => i !== idx));
    } else {
      // Check if restoring a removed member would exceed 5
      if (item.action === "REMOVE" && activeCount >= MAX_MURID_HALAQAH) {
        setErrorMsg(`Tidak dapat membatalkan penghapusan: jumlah murid aktif sudah mencapai batas maksimum ${MAX_MURID_HALAQAH} orang.`);
        return;
      }
      const updated = [...members];
      updated[idx] = { ...item, action: item.action === "REMOVE" ? "KEEP" : "REMOVE" };
      setMembers(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nama.trim() || !jam.trim() || !tempat.trim() || !materi.trim()) {
      setErrorMsg("Mohon lengkapi seluruh field waktu dan informasi halaqah.");
      return;
    }

    if (activeCount === 0) {
      setErrorMsg("Kelompok halaqah harus memiliki minimal 1 orang murid.");
      return;
    }

    if (activeCount > MAX_MURID_HALAQAH) {
      setErrorMsg(`Jumlah murid aktif tidak boleh lebih dari ${MAX_MURID_HALAQAH} orang.`);
      return;
    }

    const hasEmptyName = members.some((m) => m.action !== "REMOVE" && !m.nama.trim());
    if (hasEmptyName) {
      setErrorMsg("Nama murid aktif tidak boleh kosong.");
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
        anggota: members.map((m) => ({
          ...m,
          nama: m.nama.trim(),
          telepon: m.telepon.trim() || "-",
        })),
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
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
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
          Update Data Halaqah (Waktu & Nama Murid)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Perbarui waktu pelaksanaan atau nama murid (maks. 5 orang) untuk{" "}
          <strong>{halaqah.nama}</strong>, lalu ajukan perubahan ke <strong>AJM (Asmen)</strong>.
        </p>
      </div>

      {/* Alur Pengajuan Notice */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-950 text-xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Alur Validasi AJM (Asmen):</span> Perubahan waktu pertemuan dan nama/daftar murid (maksimum <strong>5 murid</strong>) akan dikirim sebagai{" "}
          <strong>Pengajuan Perubahan</strong> ke AJM. Data akan resmi berubah pada kelompok aktif segera setelah disetujui oleh AJM.
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm"
      >
        {/* 1. Waktu & Informasi Halaqah */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>1. Waktu Pelaksanaan & Informasi Halaqah</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hari Pertemuan <span className="text-red-500">*</span>
              </label>
              <select
                value={hari}
                onChange={(e) => setHari(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white font-semibold"
              >
                <option value="Ahad">Ahad</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jam / Waktu Pertemuan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                placeholder="Contoh: 20:00 - 21:30 WIB"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kelompok Halaqah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              />
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
                required
              />
            </div>
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
              required
            />
          </div>
        </div>

        {/* 2. Daftar & Update Nama Murid (Max 5) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>2. Update Nama Murid / Anggota Halaqah</span>
            </h2>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                activeCount >= MAX_MURID_HALAQAH
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {activeCount} / {MAX_MURID_HALAQAH} Murid (Maks. 5)
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Ketuk langsung pada kolom nama atau nomor WA di bawah untuk mengubah nama murid yang sudah ada, atau tambah/hapus murid (maksimal 5 murid per halaqah).
          </p>

          <div className="space-y-2.5">
            {members.map((m, idx) => {
              const isRemoved = m.action === "REMOVE";
              const isAdded = m.action === "ADD";
              const originalMember = m.id ? allPemudas.find((p) => p.id === m.id) : undefined;
              const isEdited =
                !isRemoved &&
                !isAdded &&
                originalMember &&
                (originalMember.nama !== m.nama.trim() || originalMember.telepon !== m.telepon.trim());

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition ${
                    isRemoved
                      ? "bg-red-50/60 border-red-200 opacity-65"
                      : isAdded
                      ? "bg-emerald-50/60 border-emerald-200"
                      : isEdited
                      ? "bg-blue-50/50 border-blue-300"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          disabled={isRemoved}
                          value={m.nama}
                          onChange={(e) => handleUpdateMemberField(idx, "nama", e.target.value)}
                          placeholder="Nama Murid"
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            isRemoved
                              ? "line-through text-red-700 bg-red-50 border-red-200"
                              : "bg-white border-slate-300 text-slate-900"
                          }`}
                        />
                        <input
                          type="text"
                          disabled={isRemoved}
                          value={m.telepon}
                          onChange={(e) => handleUpdateMemberField(idx, "telepon", e.target.value)}
                          placeholder="Nomor WA / Telepon"
                          className={`px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            isRemoved
                              ? "line-through text-red-600 bg-red-50 border-red-200"
                              : "bg-white border-slate-300 text-slate-700"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 pl-8 sm:pl-0">
                      {isAdded && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                          + Murid Baru
                        </span>
                      )}
                      {isEdited && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                          <Edit3 className="w-2.5 h-2.5" /> Nama/WA Diubah
                        </span>
                      )}
                      {isRemoved && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-200 text-red-800">
                          - Dihapus
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className={`touch-target px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                          isRemoved
                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                        title={isRemoved ? "Batalkan hapus" : "Keluarkan murid dari halaqah"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sm:hidden">{isRemoved ? "Batal Hapus" : "Hapus"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Member sub-form (capped at 5) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Tambah Murid ke Halaqah Ini (Maksimum {MAX_MURID_HALAQAH} Murid)
              </span>
              {activeCount >= MAX_MURID_HALAQAH && (
                <span className="text-[11px] font-bold text-amber-700">
                  Kuota penuh (5/5)
                </span>
              )}
            </div>

            {activeCount >= MAX_MURID_HALAQAH ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Jumlah murid aktif pada halaqah ini sudah mencapai batas maksimum{" "}
                <strong>5 orang</strong>. Jika ingin mengganti murid, silakan ubah langsung nama murid di atas atau hapus salah satu murid terlebih dahulu.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Nama Lengkap Murid Baru"
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
                  <span>Tambahkan Murid ({activeCount}/{MAX_MURID_HALAQAH})</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reason / Notes for AJM */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700">
            Catatan Pengajuan Perubahan untuk AJM / Asmen (Opsional)
          </label>
          <textarea
            value={catatanPemohon}
            onChange={(e) => setCatatanPemohon(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            placeholder="Contoh: Penyesuaian jam halaqah ke bada Isya & perbaikan penulisan nama murid..."
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
            <span>Ajukan Perubahan ke AJM</span>
          </button>
        </div>
      </form>
    </div>
  );
}
