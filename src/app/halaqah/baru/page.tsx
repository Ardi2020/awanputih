"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { JenjangPemuda } from "@/lib/types";

const MAX_MURID = 5;

export default function BuatPerhalaqahanPage() {
  const router = useRouter();
  const {
    currentUser,
    allUsers,
    allHalaqahs,
    createHalaqahAdmin,
    createPemudaAdmin,
  } = useApp();

  const canCreate =
    currentUser.role === "Asmen" ||
    currentUser.role === "Manager" ||
    currentUser.role === "Admin";

  const gurus = allUsers.filter(
    (u) =>
      u.role === "Guru" &&
      (currentUser.role !== "Asmen" || !u.asmenId || u.asmenId === currentUser.id)
  );
  const asmens = allUsers.filter((u) => u.role === "Asmen");

  const [kode, setKode] = useState(`HK-0${allHalaqahs.length + 1}`);
  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState<"Karyawan" | "Pelajar">("Pelajar");
  const [guruId, setGuruId] = useState(gurus[0]?.id || "usr-guru-1");
  const [asmenId, setAsmenId] = useState(
    currentUser.role === "Asmen" ? currentUser.id : asmens[0]?.id || "usr-asmen-1"
  );
  const [hari, setHari] = useState("Jumat");
  const [jam, setJam] = useState("19:30 - 21:00 WIB");
  const [tempat, setTempat] = useState("");
  const [materi, setMateri] = useState("Nizhamul Islam");

  // Initial Murid (up to 5)
  const [muridList, setMuridList] = useState<
    { nama: string; telepon: string; jenjang: JenjangPemuda }[]
  >([]);
  const [mNama, setMNama] = useState("");
  const [mTelepon, setMTelepon] = useState("0812");
  const [mJenjang, setMJenjang] = useState<JenjangPemuda>("Pelajar");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Jika Guru mengakses halaman ini, tampilkan penolakan tegas bahwa Ajukan Halaqah Guru dihapus
  if (!canCreate) {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2">
          Perhalaqahan Dibuat oleh Asmen & Manajer
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          Fitur pengajuan pembuatan halaqah baru pada akun <strong>Guru</strong> telah dihapus.
          Pembentukan kelompok perhalaqahan baru dilakukan langsung oleh{" "}
          <strong>Asmen (AJM)</strong> atau <strong>Manajer</strong>.
        </p>
        <Link
          href="/halaqah"
          className="touch-target px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaqah Saya</span>
        </Link>
      </div>
    );
  }

  const handleAddMurid = () => {
    setErrorMsg(null);
    if (!mNama.trim()) return;
    if (muridList.length >= MAX_MURID) {
      setErrorMsg(`Maksimum anggota halaqah adalah ${MAX_MURID} orang.`);
      return;
    }
    setMuridList([
      ...muridList,
      { nama: mNama.trim(), telepon: mTelepon.trim() || "-", jenjang: mJenjang },
    ]);
    setMNama("");
    setMTelepon("0812");
  };

  const handleRemoveMurid = (idx: number) => {
    setMuridList(muridList.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nama.trim() || !tempat.trim() || !materi.trim()) {
      setErrorMsg("Mohon lengkapi nama halaqah, tempat, dan materi kitab.");
      return;
    }

    if (muridList.length > MAX_MURID) {
      setErrorMsg(`Maksimum anggota halaqah adalah ${MAX_MURID} orang.`);
      return;
    }

    const res = createHalaqahAdmin({
      kode: kode.trim() || `HK-0${allHalaqahs.length + 1}`,
      nama: nama.trim(),
      jenis,
      guruId,
      asmenId: currentUser.role === "Asmen" ? currentUser.id : asmenId,
      hari,
      jam: jam.trim(),
      tempat: tempat.trim(),
      materi: materi.trim(),
      status: "Aktif",
      kesehatan: "Sehat",
    });

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg(
      `Perhalaqahan "${nama.trim()}" berhasil dibuat oleh ${currentUser.name} (${currentUser.role})!`
    );
    setTimeout(() => {
      router.push("/halaqah");
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <Link
          href="/halaqah"
          className="touch-target inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Perhalaqahan</span>
        </Link>
        <span className="block px-2.5 py-0.5 w-fit rounded-full bg-blue-100 text-blue-900 text-[11px] font-extrabold uppercase tracking-wider">
          Kewenangan Asmen (AJM) & Manajer
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Buat Perhalaqahan Baru
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tetapkan kelompok halaqah baru, Guru pengampu, jadwal pelaksanaan, dan materi kajian.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-600 text-white text-xs font-bold flex items-center gap-2 shadow-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5 text-xs"
      >
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>1. Identitas & Pengampu Perhalaqahan</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Halaqah:</label>
              <input
                type="text"
                required
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="HK-06"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nama Kelompok Halaqah:</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Halaqah Al-Faruq"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Segmen Halaqah:</label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as "Karyawan" | "Pelajar")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold"
              >
                <option value="Pelajar">Pelajar</option>
                <option value="Karyawan">Karyawan</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Guru Pengampu:</label>
              <select
                value={guruId}
                onChange={(e) => setGuruId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold"
              >
                {gurus.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">AJM / Asmen Pembina:</label>
              <select
                value={asmenId}
                disabled={currentUser.role === "Asmen"}
                onChange={(e) => setAsmenId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold disabled:bg-slate-100"
              >
                {asmens.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-3 border-t border-slate-100">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>2. Jadwal, Tempat & Materi Kitab</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hari Pertemuan:</label>
              <select
                value={hari}
                onChange={(e) => setHari(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold"
              >
                {["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jam Pertemuan:</label>
              <input
                type="text"
                required
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                placeholder="19:30 - 21:00 WIB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tempat Kegiatan:</label>
              <input
                type="text"
                required
                value={tempat}
                onChange={(e) => setTempat(e.target.value)}
                placeholder="Contoh: Masjid Al-Ihsan Lt. 2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Materi / Kitab Pegangan:</label>
              <input
                type="text"
                required
                value={materi}
                onChange={(e) => setMateri(e.target.value)}
                placeholder="Contoh: Nizhamul Islam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <Link
            href="/halaqah"
            className="touch-target px-4 py-2.5 text-slate-600 font-bold hover:text-slate-900"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="touch-target px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-md flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Simpan & Aktifkan Perhalaqahan Baru</span>
          </button>
        </div>
      </form>
    </div>
  );
}
