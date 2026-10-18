"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { formatRupiah } from "@/lib/utils";
import {
  Shield,
  Users,
  BookOpen,
  MapPin,
  UserCheck,
  Settings,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Lock,
  Unlock,
  X,
  Search,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { Role, JenjangPemuda, HealthStatus } from "@/lib/types";

type AdminTab = "guru" | "struktural" | "halaqah" | "pemuda" | "mahali" | "kpi" | "audit";

function AdminPageContent() {
  const searchParams = useSearchParams();
  const {
    currentUser,
    switchRole,
    allUsers,
    allMahalis,
    allHalaqahs,
    allPemudas,
    kpiConfig,
    periode,
    auditLogs,
    createUserAdmin,
    updateUserAdmin,
    deleteUserAdmin,
    createMahaliAdmin,
    updateMahaliAdmin,
    deleteMahaliAdmin,
    createHalaqahAdmin,
    updateHalaqahAdmin,
    deleteHalaqahAdmin,
    createPemudaAdmin,
    updatePemudaAdmin,
    deletePemudaAdmin,
    updateKpiConfigAdmin,
    toggleLockPeriode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>("guru");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ msg: string; isError?: boolean } | null>(null);

  // User CRUD Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uTelepon, setUTelepon] = useState("");
  const [uRole, setURole] = useState<Role>("Guru");
  const [uWilayah, setUWilayah] = useState("Wilayah 1 • Koto Tangah");
  const [uMahaliId, setUMahaliId] = useState("mahali-barat");
  const [uAsmenId, setUAsmenId] = useState("usr-asmen-1");
  const [uAssignedHalaqahs, setUAssignedHalaqahs] = useState<string[]>([]);
  const [uSupervisedHalaqahs, setUSupervisedHalaqahs] = useState<string[]>([]);

  // Mahali CRUD Modal State
  const [mahaliModalOpen, setMahaliModalOpen] = useState(false);
  const [editingMahaliId, setEditingMahaliId] = useState<string | null>(null);
  const [mNama, setMNama] = useState("");
  const [mKode, setMKode] = useState("");
  const [mTarget, setMTarget] = useState(80);

  // Halaqah CRUD Modal State
  const [hqModalOpen, setHqModalOpen] = useState(false);
  const [editingHqId, setEditingHqId] = useState<string | null>(null);
  const [hKode, setHKode] = useState("");
  const [hNama, setHNama] = useState("");
  const [hJenis, setHJenis] = useState<"Karyawan" | "Pelajar">("Pelajar");
  const [hGuruId, setHGuruId] = useState("usr-guru-1");
  const [hGuruPengganti, setHGuruPengganti] = useState("");
  const [hAsmenId, setHAsmenId] = useState("usr-asmen-1");
  const [hHari, setHHari] = useState("Jumat");
  const [hJam, setHJam] = useState("19:30 - 21:00 WIB");
  const [hTempat, setHTempat] = useState("");
  const [hMateri, setHMateri] = useState("");
  const [hStatus, setHStatus] = useState<"Aktif" | "Tidak Berjalan" | "Dijadwal Ulang">("Aktif");
  const [hKesehatan, setHKesehatan] = useState<HealthStatus>("Sehat");

  // Pemuda CRUD Modal State
  const [pmModalOpen, setPmModalOpen] = useState(false);
  const [editingPmId, setEditingPmId] = useState<string | null>(null);
  const [pNama, setPNama] = useState("");
  const [pTelepon, setPTelepon] = useState("");
  const [pJenjang, setPJenjang] = useState<JenjangPemuda>("Pelajar");
  const [pHalaqahId, setPHalaqahId] = useState("hq-01");
  const [pTargetIltizamat, setPTargetIltizamat] = useState(50000);
  const [pPerluPerhatian, setPPerluPerhatian] = useState(false);
  const [pAlasanPerhatian, setPAlasanPerhatian] = useState("");

  // KPI Config State
  const [cfgState, setCfgState] = useState(kpiConfig);

  const showToast = (msg: string, isError = false) => {
    setFeedback({ msg, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- USER CRUD HANDLERS ---
  const openCreateUser = (defaultRole: Role = "Guru") => {
    setEditingUserId(null);
    setUName("");
    setUEmail("");
    setUTelepon("0812");
    setURole(defaultRole);
    setUWilayah("Wilayah 1 • Koto Tangah");
    setUMahaliId(allMahalis[0]?.id || "mahali-barat");
    setUAsmenId(allUsers.find((u) => u.role === "Asmen")?.id || "usr-asmen-1");
    setUAssignedHalaqahs([]);
    setUSupervisedHalaqahs([]);
    setUserModalOpen(true);
  };

  const openEditUser = (u: (typeof allUsers)[0]) => {
    setEditingUserId(u.id);
    setUName(u.name);
    setUEmail(u.email);
    setUTelepon(u.telepon || "");
    setURole(u.role);
    setUWilayah(u.wilayahNama || "");
    setUMahaliId(u.mahaliId || "mahali-barat");
    setUAsmenId(u.asmenId || "usr-asmen-1");
    setUAssignedHalaqahs(u.assignedHalaqahIds || []);
    setUSupervisedHalaqahs(u.supervisedHalaqahIds || []);
    setUserModalOpen(true);
  };

  // --- MAHALI CRUD HANDLERS ---
  const openCreateMahali = () => {
    setEditingMahaliId(null);
    setMNama("");
    setMKode("MHL-");
    setMTarget(80);
    setMahaliModalOpen(true);
  };

  const openEditMahali = (m: (typeof allMahalis)[0]) => {
    setEditingMahaliId(m.id);
    setMNama(m.nama);
    setMKode(m.kode);
    setMTarget(m.targetKehadiran || 80);
    setMahaliModalOpen(true);
  };

  // --- HALAQAH CRUD HANDLERS ---
  const openCreateHalaqah = () => {
    setEditingHqId(null);
    setHKode(`HK-0${allHalaqahs.length + 1}`);
    setHNama("");
    setHJenis("Pelajar");
    setHGuruId(allUsers.find((u) => u.role === "Guru")?.id || "usr-guru-1");
    setHGuruPengganti("");
    setHAsmenId(allUsers.find((u) => u.role === "Asmen")?.id || "usr-asmen-1");
    setHHari("Jumat");
    setHJam("19:30 - 21:00 WIB");
    setHTempat("Masjid / Rumah Dakwah");
    setHMateri("Nizhamul Islam");
    setHStatus("Aktif");
    setHKesehatan("Sehat");
    setHqModalOpen(true);
  };

  const openEditHalaqah = (h: (typeof allHalaqahs)[0]) => {
    setEditingHqId(h.id);
    setHKode(h.kode);
    setHNama(h.nama);
    setHJenis(h.jenis || "Pelajar");
    setHGuruId(h.guruId);
    setHGuruPengganti(h.guruPenggantiNama || "");
    setHAsmenId(h.asmenId);
    setHHari(h.hari);
    setHJam(h.jam);
    setHTempat(h.tempat);
    setHMateri(h.materi);
    setHStatus((h.status as any) || "Aktif");
    setHKesehatan(h.kesehatan || "Sehat");
    setHqModalOpen(true);
  };

  // --- PEMUDA CRUD HANDLERS ---
  const openCreatePemuda = () => {
    setEditingPmId(null);
    setPNama("");
    setPTelepon("0812");
    setPJenjang("Pelajar");
    const availableHq = allHalaqahs.find((h) => h.anggotaIds.length < 5) || allHalaqahs[0];
    setPHalaqahId(availableHq?.id || "hq-01");
    setPTargetIltizamat(50000);
    setPPerluPerhatian(false);
    setPAlasanPerhatian("");
    setPmModalOpen(true);
  };

  const openEditPemuda = (p: (typeof allPemudas)[0]) => {
    setEditingPmId(p.id);
    setPNama(p.nama);
    setPTelepon(p.telepon);
    setPJenjang(p.jenjang || "Pelajar");
    setPHalaqahId(p.halaqahId);
    setPTargetIltizamat(p.targetIltizamat ?? 50000);
    setPPerluPerhatian(!!p.perluPerhatian);
    setPAlasanPerhatian(p.alasanPerhatian || "");
    setPmModalOpen(true);
  };

  const isLimitedAsmenAdmin = currentUser.role === "Asmen";

  // Sync URL query params (?tab=... & ?create=...)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "users" || tabParam === "guru") setActiveTab("guru");
    else if ((tabParam === "struktural" || tabParam === "asmen") && !isLimitedAsmenAdmin) setActiveTab("struktural");
    else if (tabParam === "halaqah") setActiveTab("halaqah");
    else if (tabParam === "pemuda") setActiveTab("pemuda");
    else if (tabParam === "mahali" && !isLimitedAsmenAdmin) setActiveTab("mahali");
    else if (tabParam === "kpi" && !isLimitedAsmenAdmin) setActiveTab("kpi");
    else if (tabParam === "audit" && !isLimitedAsmenAdmin) setActiveTab("audit");

    const createParam = searchParams.get("create");
    if (createParam === "guru") {
      setActiveTab("guru");
      openCreateUser("Guru");
    } else if (createParam === "asmen" && !isLimitedAsmenAdmin) {
      setActiveTab("struktural");
      openCreateUser("Asmen");
    } else if (createParam === "halaqah") {
      setActiveTab("halaqah");
      openCreateHalaqah();
    } else if (createParam === "pemuda") {
      setActiveTab("pemuda");
      openCreatePemuda();
    } else if (createParam === "mahali" && !isLimitedAsmenAdmin) {
      setActiveTab("mahali");
      openCreateMahali();
    }
  }, [searchParams, isLimitedAsmenAdmin]);

  if (
    currentUser.role !== "Admin" &&
    currentUser.role !== "Manager" &&
    currentUser.role !== "Asmen"
  ) {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2">
          Anda Sedang Menggunakan Akun {currentUser.role} ({currentUser.name})
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mb-6">
          Modul CRUD Master Data hanya aktif untuk role <strong>Admin</strong>, <strong>Manajer</strong>, atau <strong>AJM / Asmen</strong> (terbatas pada Guru, Halaqah & Murid). Klik tombol di bawah untuk beralih:
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => switchRole("Asmen")}
            className="touch-target px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Buka sebagai AJM / Asmen (CRUD Guru & Murid)</span>
          </button>
          <button
            onClick={() => switchRole("Admin")}
            className="touch-target px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>Buka sebagai Full Admin</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveRole: Role = isLimitedAsmenAdmin ? "Guru" : uRole;
    const effectiveAsmenId = isLimitedAsmenAdmin ? currentUser.id : uAsmenId;
    const payload = {
      name: uName,
      email: uEmail,
      telepon: uTelepon,
      role: effectiveRole,
      wilayahNama: uWilayah,
      mahaliId: uMahaliId,
      asmenId: effectiveRole === "Guru" ? effectiveAsmenId : undefined,
      assignedHalaqahIds: effectiveRole === "Guru" ? uAssignedHalaqahs : [],
      supervisedHalaqahIds: effectiveRole === "Asmen" ? uSupervisedHalaqahs : [],
    };
    const res = editingUserId
      ? updateUserAdmin(editingUserId, payload)
      : createUserAdmin(payload);
    if (res.success) {
      showToast(res.message);
      setUserModalOpen(false);
    } else {
      showToast(res.message, true);
    }
  };

  const handleSaveMahali = (e: React.FormEvent) => {
    e.preventDefault();
    const res = editingMahaliId
      ? updateMahaliAdmin(editingMahaliId, { nama: mNama, kode: mKode, targetKehadiran: mTarget })
      : createMahaliAdmin({ nama: mNama, kode: mKode, targetKehadiran: mTarget });
    if (res.success) {
      showToast(res.message);
      setMahaliModalOpen(false);
    } else {
      showToast(res.message, true);
    }
  };

  const handleSaveHalaqah = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      kode: hKode,
      nama: hNama,
      jenis: hJenis,
      guruId: hGuruId,
      guruPenggantiNama: hGuruPengganti,
      asmenId: isLimitedAsmenAdmin ? currentUser.id : hAsmenId,
      hari: hHari,
      jam: hJam,
      tempat: hTempat,
      materi: hMateri,
      status: hStatus,
      kesehatan: hKesehatan,
    };
    const res = editingHqId
      ? updateHalaqahAdmin(editingHqId, payload)
      : createHalaqahAdmin(payload);
    if (res.success) {
      showToast(res.message);
      setHqModalOpen(false);
    } else {
      showToast(res.message, true);
    }
  };

  const handleSavePemuda = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nama: pNama,
      telepon: pTelepon,
      jenjang: pJenjang,
      halaqahId: pHalaqahId,
      targetIltizamat: Number(pTargetIltizamat) || 0,
      perluPerhatian: pPerluPerhatian,
      alasanPerhatian: pPerluPerhatian ? pAlasanPerhatian : undefined,
    };
    const res = editingPmId
      ? updatePemudaAdmin(editingPmId, payload)
      : createPemudaAdmin(payload);
    if (res.success) {
      showToast(res.message);
      setPmModalOpen(false);
    } else {
      showToast(res.message, true);
    }
  };

  const guruUsers = allUsers.filter((u) => u.role === "Guru");
  const strukturalUsers = allUsers.filter((u) => u.role !== "Guru");

  const availableTabs = isLimitedAsmenAdmin
    ? ([
        { id: "guru", label: `Data Guru & Email Login (${guruUsers.length})`, icon: Users },
        { id: "halaqah", label: `Perhalaqahan / Kursus (${allHalaqahs.length})`, icon: BookOpen },
        { id: "pemuda", label: `Data Murid ≤5 (${allPemudas.length})`, icon: UserCheck },
      ] as const)
    : ([
        { id: "guru", label: `Data Guru (${guruUsers.length})`, icon: Users },
        { id: "struktural", label: `AJM / Asmen & Staf (${strukturalUsers.length})`, icon: Shield },
        { id: "halaqah", label: `Halaqah / Kursus (${allHalaqahs.length})`, icon: BookOpen },
        { id: "pemuda", label: `Murid / Pemuda (${allPemudas.length})`, icon: UserCheck },
        { id: "mahali", label: `Wilayah (${allMahalis.length})`, icon: MapPin },
        { id: "kpi", label: "Bobot KPI & Status", icon: Settings },
        { id: "audit", label: `Audit (${auditLogs.length})`, icon: FileText },
      ] as const);

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
              isLimitedAsmenAdmin
                ? "bg-blue-100 text-blue-900"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {isLimitedAsmenAdmin
              ? `Mode Admin Terbatas AJM / Asmen (${currentUser.name})`
              : "Pusat Kendali Master Data (Full CRUD Admin)"}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {isLimitedAsmenAdmin
              ? "Pengaturan User/Admin Guru, Perhalaqahan & Data Murid"
              : "Manajemen CRUD Guru, AJM/Asmen, Halaqah, Murid & Wilayah"}
          </h1>
          <p className="text-xs text-slate-500">
            {isLimitedAsmenAdmin
              ? "Sesuai kewenangan AJM (Asmen): Anda dapat menambah/mengatur akun & email login para Guru, menambah Perhalaqahan, dan mengelola data Murid (maks. 5/halaqah)."
              : "Tambah, ubah, dan hapus data Guru, AJM (Asmen), Kelompok Halaqah, Murid (maks. 5/halaqah), dan Wilayah Mahali."}
          </p>
        </div>

        {!isLimitedAsmenAdmin && (
          <button
            onClick={() => {
              const res = toggleLockPeriode();
              showToast(res.message);
            }}
            className={`touch-target px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition self-start sm:self-auto ${
              periode.status === "Dikunci"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {periode.status === "Dikunci" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span>{periode.status === "Dikunci" ? "Buka Kunci Periode" : "Kunci Periode Penilaian"}</span>
          </button>
        )}
      </div>

      {/* BARIS AKSI CEPAT (+ TAMBAH DATA BARU 1-KLIK) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1.5">
          <UserPlus className="w-4 h-4" />
          <span>
            {isLimitedAsmenAdmin
              ? "Pintasan Admin AJM (Terbatas pada Guru, Perhalaqahan & Murid):"
              : "Pintasan Tambah Data Master (Klik untuk Langsung Menambahkan):"}
          </span>
        </div>
        <div className={`grid gap-2.5 ${isLimitedAsmenAdmin ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-5"}`}>
          <button
            onClick={() => {
              setActiveTab("guru");
              openCreateUser("Guru");
            }}
            className="touch-target p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Tambah Guru (Daftarkan Email)</span>
          </button>

          {!isLimitedAsmenAdmin && (
            <button
              onClick={() => {
                setActiveTab("struktural");
                openCreateUser("Asmen");
              }}
              className="touch-target p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>+ Tambah AJM / Asmen</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab("halaqah");
              openCreateHalaqah();
            }}
            className="touch-target p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Tambah Perhalaqahan</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("pemuda");
              openCreatePemuda();
            }}
            className="touch-target p-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Tambah Data Murid (Maks. 5)</span>
          </button>

          {!isLimitedAsmenAdmin && (
            <button
              onClick={() => {
                setActiveTab("mahali");
                openCreateMahali();
              }}
              className="touch-target p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition col-span-2 sm:col-span-1"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>+ Tambah Wilayah</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md ${
            feedback.isError ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Mobile-Friendly Scrollable Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {availableTabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`touch-target px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 border transition ${
                active
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: CRUD KHUSUS GURU (MUSYRIF)
      ===================================================================== */}
      {activeTab === "guru" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">CRUD Data Guru (Musyrif Halaqah)</h2>
              <p className="text-xs text-slate-500">
                Tambah Guru baru, atur AJM (Asmen) pembina, wilayah, dan penugasan kelompok halaqah.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama guru..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <button
                onClick={() => openCreateUser("Guru")}
                className="touch-target px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Guru Baru</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {guruUsers
              .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((u) => {
                const asmenObj = allUsers.find((a) => a.id === u.asmenId);
                const guruHalaqahs = allHalaqahs.filter(
                  (h) => h.guruId === u.id || u.assignedHalaqahIds.includes(h.id)
                );
                return (
                  <div
                    key={u.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Guru
                        </span>
                        {u.wilayahNama && (
                          <span className="text-xs text-slate-500">• {u.wilayahNama}</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Email: {u.email} • WA: <strong>{u.telepon || "-"}</strong> • AJM Pembina:{" "}
                        <strong className="text-blue-700">{asmenObj?.name || "Belum ditentukan"}</strong>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span>Mengampu {guruHalaqahs.length} Halaqah:</span>
                        {guruHalaqahs.length === 0 ? (
                          <span className="text-slate-400 italic">Belum ada halaqah ditugaskan</span>
                        ) : (
                          guruHalaqahs.map((hq) => (
                            <span
                              key={hq.id}
                              className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold"
                            >
                              {hq.kode} ({hq.nama}) — {hq.anggotaIds.length}/5 Murid
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => openEditUser(u)}
                        className="touch-target px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Guru</span>
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            const res = deleteUserAdmin(u.id);
                            showToast(res.message);
                          }}
                          className="touch-target px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: CRUD AJM / ASMEN, MANAJER, PJ MAL, ADMIN
      ===================================================================== */}
      {activeTab === "struktural" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900">
                CRUD Akun AJM (Asmen), Manajer, PJ Mal & Admin
              </h2>
              <p className="text-xs text-slate-500">
                Kelola jajaran struktural pembina wilayah (AJM/Asmen), Manajer Mahali, PJ Mal, dan Admin.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => openCreateUser("Asmen")}
                className="touch-target px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah AJM / Asmen</span>
              </button>
              <button
                onClick={() => openCreateUser("PJ Mal")}
                className="touch-target px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Manajer / PJ Mal / Admin</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {strukturalUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                      {u.role === "Asmen" ? "AJM / Asmen" : u.role}
                    </span>
                    {u.wilayahNama && (
                      <span className="text-xs text-slate-500">• {u.wilayahNama}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {u.email} {u.telepon ? `• ${u.telepon}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => openEditUser(u)}
                    className="touch-target px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  {u.id !== currentUser.id && (
                    <button
                      onClick={() => {
                        const res = deleteUserAdmin(u.id);
                        showToast(res.message);
                      }}
                      className="touch-target px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: CRUD MASTER HALAQAH / KURSUS
      ===================================================================== */}
      {activeTab === "halaqah" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">CRUD Master Kursus / Kelompok Halaqah</h2>
              <p className="text-xs text-slate-500">
                Kelola kelompok halaqah (maks. 5 murid per halaqah), Guru Utama, AJM, jadwal, dan materi.
              </p>
            </div>
            <button
              onClick={openCreateHalaqah}
              className="touch-target px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Halaqah Baru</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {allHalaqahs.map((h) => (
              <div key={h.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-900 text-white">
                      {h.kode}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{h.nama}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Segmen: {h.jenis || "Pelajar"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {h.anggotaIds.length}/5 Murid
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Guru Utama: <strong>{h.guruNama}</strong>
                    {h.guruPenggantiNama ? ` • Guru Pengganti: ${h.guruPenggantiNama}` : ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    {h.hari}, {h.jam} • {h.tempat} • Kitab: {h.materi}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => openEditHalaqah(h)}
                    className="touch-target px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      const res = deleteHalaqahAdmin(h.id);
                      showToast(res.message);
                    }}
                    className="touch-target px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: CRUD MASTER MURID / PEMUDA (MAKS 5 PER HALAQAH)
      ===================================================================== */}
      {activeTab === "pemuda" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                CRUD Master Murid / Pemuda Halaqah (Maks. 5 per Halaqah)
              </h2>
              <p className="text-xs text-slate-500">
                Tambah murid baru, ubah nama/WA, mutasi kelompok halaqah, dan atur target Iltizamat.
              </p>
            </div>
            <button
              onClick={openCreatePemuda}
              className="touch-target px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Murid Baru</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {allPemudas.map((p) => {
              const hq = allHalaqahs.find((h) => h.id === p.halaqahId);
              return (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{p.nama}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Jenjang: {p.jenjang || "Pelajar"}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {hq ? `${hq.nama} (${hq.anggotaIds.length}/5)` : p.halaqahId}
                      </span>
                      {p.perluPerhatian && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white">
                          Perlu Ri&apos;ayah
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      Telepon: {p.telepon} • Target Iltizamat:{" "}
                      <strong>{formatRupiah(p.targetIltizamat || 50000)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => openEditPemuda(p)}
                      className="touch-target px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit / Mutasi</span>
                    </button>
                    <button
                      onClick={() => {
                        const res = deletePemudaAdmin(p.id);
                        showToast(res.message);
                      }}
                      className="touch-target px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: CRUD WILAYAH / MAHALI
      ===================================================================== */}
      {activeTab === "mahali" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">CRUD Master Wilayah / Mahali</h2>
              <p className="text-xs text-slate-500">Kelola daftar Mahali dan target kehadiran wilayah.</p>
            </div>
            <button
              onClick={openCreateMahali}
              className="touch-target px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Wilayah</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {allMahalis.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{m.nama}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {m.kode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Target Kehadiran: <strong>{m.targetKehadiran || 80}%</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditMahali(m)}
                    className="touch-target px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      const res = deleteMahaliAdmin(m.id);
                      showToast(res.message);
                    }}
                    className="touch-target px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: PENGATURAN BOBOT KPI & AMBANG STATUS KESEHATAN
      ===================================================================== */}
      {activeTab === "kpi" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-black text-slate-900">Pengaturan Sistem: Bobot KPI & Ambang Status</h2>
            <p className="text-xs text-slate-500">
              Setiap perubahan disimpan dengan audit trail.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-700 mb-1">Ambang Status SEHAT (≥):</label>
              <input
                type="number"
                value={cfgState.ambangSehat}
                onChange={(e) => setCfgState({ ...cfgState, ambangSehat: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-700 mb-1">Ambang Status SEDANG (≥):</label>
              <input
                type="number"
                value={cfgState.ambangSedang}
                onChange={(e) => setCfgState({ ...cfgState, ambangSedang: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-700 mb-1">Kapasitas Ideal Kelompok / Guru:</label>
              <input
                type="number"
                value={cfgState.maksKelompokIdealGuru}
                onChange={(e) => setCfgState({ ...cfgState, maksKelompokIdealGuru: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <div>
              <div className="font-bold text-amber-950">Aturan Kritis (Critical Override)</div>
              <div className="text-amber-800">
                Jika diaktifkan, Kursus berhenti 2 pekan atau selisih kas otomatis menjadikan status merah/perlu perhatian meskipun rata-rata tinggi.
              </div>
            </div>
            <input
              type="checkbox"
              checked={cfgState.criticalOverrideAktif}
              onChange={(e) => setCfgState({ ...cfgState, criticalOverrideAktif: e.target.checked })}
              className="w-5 h-5 accent-emerald-600"
            />
          </div>

          <button
            onClick={() => {
              const res = updateKpiConfigAdmin(cfgState);
              showToast(res.message);
            }}
            className="touch-target px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Simpan Konfigurasi KPI dengan Audit Trail
          </button>
        </div>
      )}

      {/* =====================================================================
          TAB 7: AUDIT LOG SISTEM
      ===================================================================== */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-black text-slate-900">Jejak Audit Aktivitas & Perubahan Data</h2>
            <p className="text-xs text-slate-500">Seluruh operasi CRUD, verifikasi laporan, dan keputusan tercatat permanen.</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {log.outcome}
                    </span>
                    <span className="text-slate-400 font-mono">{log.target}</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">{log.details}</div>
                </div>
                <div className="text-[11px] text-slate-400 shrink-0">
                  {log.actorNama} ({log.actorRole})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODALS FOR FULL CRUD (USER/GURU/AJM, MAHALI, HALAQAH, PEMUDA)
      ===================================================================== */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {editingUserId
                  ? `Edit Data ${uRole === "Asmen" ? "AJM / Asmen" : uRole}`
                  : `Tambah ${uRole === "Asmen" ? "AJM / Asmen" : uRole} Baru`}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="Contoh: Ustadz Khalid Walid"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Login (Chrome / Edge):
                  </label>
                  <input
                    type="email"
                    required
                    value={uEmail}
                    onChange={(e) => setUEmail(e.target.value)}
                    placeholder="asmuliardi@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Sistem:</label>
                  <select
                    value={isLimitedAsmenAdmin ? "Guru" : uRole}
                    disabled={isLimitedAsmenAdmin}
                    onChange={(e) => setURole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold disabled:bg-slate-100"
                  >
                    <option value="Guru">Guru (Musyrif)</option>
                    {!isLimitedAsmenAdmin && (
                      <>
                        <option value="Asmen">AJM / Asmen (Asisten Manajer)</option>
                        <option value="Manager">Manager (Manajer Mahali)</option>
                        <option value="PJ Mal">PJ Mal (Keuangan & Iltizamat)</option>
                        <option value="Admin">Admin Sistem</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Wilayah:</label>
                  <input
                    type="text"
                    value={uWilayah}
                    onChange={(e) => setUWilayah(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telepon / WA:</label>
                  <input
                    type="text"
                    value={uTelepon}
                    onChange={(e) => setUTelepon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              {uRole === "Guru" && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Pilih AJM / Asmen Pembina:
                    </label>
                    <select
                      value={uAsmenId}
                      onChange={(e) => setUAsmenId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                    >
                      {allUsers
                        .filter((x) => x.role === "Asmen")
                        .map((asmen) => (
                          <option key={asmen.id} value={asmen.id}>
                            {asmen.name} ({asmen.wilayahNama || "Mahali"})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Pilih Halaqah yang Diampu:
                    </label>
                    <div className="max-h-36 overflow-y-auto p-2 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                      {allHalaqahs.map((h) => (
                        <label key={h.id} className="flex items-center gap-2 cursor-pointer p-1">
                          <input
                            type="checkbox"
                            checked={uAssignedHalaqahs.includes(h.id)}
                            onChange={() =>
                              setUAssignedHalaqahs((prev) =>
                                prev.includes(h.id)
                                  ? prev.filter((x) => x !== h.id)
                                  : [...prev, h.id]
                              )
                            }
                          />
                          <span className="font-semibold">
                            {h.kode} — {h.nama} ({h.anggotaIds.length}/5 Murid)
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Simpan Data {uRole === "Asmen" ? "AJM / Asmen" : uRole}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mahaliModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-black text-base text-slate-900 mb-3">
              {editingMahaliId ? "Edit Wilayah Mahali" : "Tambah Wilayah Mahali"}
            </h3>
            <form onSubmit={handleSaveMahali} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Wilayah:</label>
                <input
                  type="text"
                  required
                  value={mKode}
                  onChange={(e) => setMKode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Mahali / Wilayah:</label>
                <input
                  type="text"
                  required
                  value={mNama}
                  onChange={(e) => setMNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setMahaliModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Simpan Wilayah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {hqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-base text-slate-900 mb-3">
              {editingHqId ? "Edit Master Halaqah / Kursus" : "Tambah Kelompok Halaqah Baru"}
            </h3>
            <form onSubmit={handleSaveHalaqah} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Kelompok (mis: HK-05):</label>
                  <input
                    type="text"
                    required
                    value={hKode}
                    onChange={(e) => setHKode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Segmen Halaqah:</label>
                  <select
                    value={hJenis}
                    onChange={(e) => setHJenis(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="Karyawan">Karyawan</option>
                    <option value="Pelajar">Pelajar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Halaqah / Kursus:</label>
                <input
                  type="text"
                  required
                  value={hNama}
                  onChange={(e) => setHNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guru Utama:</label>
                  <select
                    value={hGuruId}
                    onChange={(e) => setHGuruId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    {allUsers
                      .filter((u) => u.role === "Guru")
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">AJM / Asmen Pembina:</label>
                  <select
                    value={hAsmenId}
                    onChange={(e) => setHAsmenId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    {allUsers
                      .filter((u) => u.role === "Asmen")
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hari:</label>
                  <input
                    type="text"
                    value={hHari}
                    onChange={(e) => setHHari(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam:</label>
                  <input
                    type="text"
                    value={hJam}
                    onChange={(e) => setHJam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tempat Pertemuan:</label>
                <input
                  type="text"
                  value={hTempat}
                  onChange={(e) => setHTempat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Materi Kitab:</label>
                <input
                  type="text"
                  value={hMateri}
                  onChange={(e) => setHMateri(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setHqModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Simpan Halaqah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-black text-base text-slate-900 mb-3">
              {editingPmId ? "Edit / Mutasi Data Murid" : "Tambah Murid Baru (Maks. 5/Halaqah)"}
            </h3>
            <form onSubmit={handleSavePemuda} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Murid / Pemuda:</label>
                <input
                  type="text"
                  required
                  value={pNama}
                  onChange={(e) => setPNama(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenjang Kaderisasi:</label>
                  <select
                    value={pJenjang}
                    onChange={(e) => setPJenjang(e.target.value as JenjangPemuda)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="HU">HU (Halaqah Umum)</option>
                    <option value="CP">CP (Calon Pelajar)</option>
                    <option value="Pelajar">Pelajar</option>
                    <option value="Karyawan">Karyawan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelompok Halaqah (Maks. 5):</label>
                  <select
                    value={pHalaqahId}
                    onChange={(e) => setPHalaqahId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    {allHalaqahs.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.kode} — {h.nama} ({h.anggotaIds.length}/5)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WA:</label>
                  <input
                    type="text"
                    value={pTelepon}
                    onChange={(e) => setPTelepon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Iltizamat (Rp):</label>
                  <input
                    type="number"
                    value={pTargetIltizamat}
                    onChange={(e) => setPTargetIltizamat(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPmModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Simpan Data Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Memuat Panel CRUD Admin...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}
