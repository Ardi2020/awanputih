"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import {
  Cloud,
  Search,
  Bell,
  X,
  UserCheck,
  FileText,
  Users,
  CheckSquare,
  BarChart3,
  Shield,
  Calendar,
  ChevronDown,
  ChevronRight,
  Plus,
  Home,
  AlertTriangle,
  ClipboardList,
  Wallet,
  CreditCard,
  Send,
  Settings,
  Star,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  CheckCircle2,
  BookOpen,
  PhoneCall,
  LogOut,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
  badgeColor?: "red" | "amber" | "blue" | "emerald";
}

export default function Navbar() {
  const {
    currentUser,
    allUsers,
    setCurrentUser,
    logout,
    periode,
    scopedHalaqahs,
    scopedPemudas,
    scopedLaporans,
    scopedPengajuans,
    scopedActionPlans,
    scopedPrioritas,
    scopedIltizamat,
    pembayaranTransaksis,
    notifikasis,
    isWeakNetwork,
    setIsWeakNetwork,
    lastAutoSaved,
    favoriteMenus,
    toggleFavoriteMenu,
    markNotifRead,
    quickLogGuruActivity,
    createActionPlan,
    addKontrolGuruLog,
    recordPembayaranIltizamat,
    toggleLockPeriode,
  } = useApp();

  const pathname = usePathname();
  const router = useRouter();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [lainnyaOpen, setLainnyaOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>(["pembinaan", "organisasi"]);

  // Quick Action Modal States
  const [guruQuickTab, setGuruQuickTab] = useState<"PERTEMUAN" | "KONTROL" | "KONTAK" | "SPP" | "MEDIA">("KONTROL");
  const [selectedHalaqahId, setSelectedHalaqahId] = useState(scopedHalaqahs[0]?.id || "hq-01");
  const [selectedPemudaId, setSelectedPemudaId] = useState(scopedPemudas[0]?.id || "pm-101");
  const [quickNote, setQuickNote] = useState("");
  const [quickSpp, setQuickSpp] = useState("200000");
  const [quickToast, setQuickToast] = useState<string | null>(null);

  // Action Plan Quick Form (Manager / Asmen)
  const [apJudul, setApJudul] = useState("");
  const [apSumber, setApSumber] = useState("");
  const [apPicId, setApPicId] = useState("");
  const [apTindakan, setApTindakan] = useState("");
  const [apTarget, setApTarget] = useState("");
  const [apDeadline, setApDeadline] = useState("2026-10-20");
  const [apPrioritas, setApPrioritas] = useState<"Kritis" | "Tinggi" | "Sedang" | "Rendah">("Tinggi");

  // Badge Calculations per Role
  const guruUnfinishedReports = scopedHalaqahs.filter((h) => {
    const r = scopedLaporans.find((rep) => rep.halaqahId === h.id && rep.periodeId === periode.id);
    return !r || r.status === "Draf" || r.verifikasiStatus === "Perlu Perbaikan";
  }).length;
  const guruNeedsRevision = scopedLaporans.some((r) => r.verifikasiStatus === "Perlu Perbaikan");
  const guruActiveTasks = scopedActionPlans.filter((p) => p.status !== "Selesai" && p.status !== "Dibatalkan").length;
  const guruOverdueTasks = scopedActionPlans.some((p) => p.status === "Terlambat" || p.prioritas === "Kritis");

  const asmenWaitingReports = scopedLaporans.filter(
    (r) => r.verifikasiStatus === "Dikirim" || r.verifikasiStatus === "Perlu Perbaikan"
  ).length;
  const asmenSickGurus = allUsers.filter(
    (u) => u.role === "Guru" && u.asmenId === currentUser.id && (u.statusKesehatan === "Sakit" || u.statusKesehatan === "Sedang")
  ).length;
  const asmenActiveTasks = scopedActionPlans.filter((p) => p.status !== "Selesai").length;

  const mgrSickAsmens = allUsers.filter((u) => u.role === "Asmen" && u.statusKesehatan === "Sakit").length;
  const mgrCriticalPriorities = scopedPrioritas.filter((p) => p.prioritas === "Kritis" || p.prioritas === "Tinggi").length;
  const mgrActivePlans = scopedActionPlans.filter((p) => p.status !== "Selesai").length;

  const pjMalUnfinished = scopedIltizamat.filter((i) => i.statusBayar !== "Lunas").length;
  const pjMalWaitingTrx = pembayaranTransaksis.filter((t) => t.statusVerifikasi === "Menunggu Verifikasi").length;

  // 4 Primary Bottom Navigation Items (+ 5th "Lainnya" button)
  const getPrimaryBottomTabs = (): NavItem[] => {
    switch (currentUser.role) {
      case "Manager":
        return [
          { href: "/", label: "Beranda", icon: Home },
          {
            href: "/asmen",
            label: "Asmen",
            icon: Users,
            badgeCount: mgrSickAsmens,
            badgeColor: mgrSickAsmens > 0 ? "red" : "amber",
          },
          {
            href: "/prioritas",
            label: "Prioritas",
            icon: AlertTriangle,
            badgeCount: mgrCriticalPriorities,
            badgeColor: "red",
          },
          {
            href: "/tugas",
            label: "Action Plan",
            icon: ClipboardList,
            badgeCount: mgrActivePlans,
            badgeColor: "amber",
          },
        ];
      case "Asmen":
        return [
          { href: "/", label: "Beranda", icon: Home },
          {
            href: "/laporan",
            label: "Laporan",
            icon: FileText,
            badgeCount: asmenWaitingReports + scopedPengajuans.filter((p) => p.status === "Menunggu Validasi").length,
            badgeColor: "amber",
          },
          {
            href: "/guru",
            label: "Guru",
            icon: UserCheck,
            badgeCount: asmenSickGurus,
            badgeColor: "red",
          },
          {
            href: "/tugas",
            label: "Tugas",
            icon: ClipboardList,
            badgeCount: asmenActiveTasks,
            badgeColor: "blue",
          },
        ];
      case "Guru":
        return [
          { href: "/", label: "Beranda", icon: Home },
          {
            href: "/halaqah",
            label: "Kursus",
            icon: BookOpen,
            badgeCount: scopedHalaqahs.filter((h) => h.kesehatan === "Sakit").length,
            badgeColor: "red",
          },
          {
            href: "/laporan",
            label: "Laporan",
            icon: FileText,
            badgeCount: guruUnfinishedReports,
            badgeColor: guruNeedsRevision ? "red" : "amber",
          },
          {
            href: "/tugas",
            label: "Tugas",
            icon: CheckSquare,
            badgeCount: guruActiveTasks,
            badgeColor: guruOverdueTasks ? "red" : "blue",
          },
        ];
      case "PJ Mal":
        return [
          { href: "/", label: "Beranda", icon: Home },
          {
            href: "/iltizamat",
            label: "Iltizamat",
            icon: Wallet,
            badgeCount: pjMalUnfinished,
            badgeColor: "amber",
          },
          {
            href: "/iltizamat?tab=pembayaran",
            label: "Pembayaran",
            icon: CreditCard,
            badgeCount: pjMalWaitingTrx,
            badgeColor: "red",
          },
          {
            href: "/iltizamat?tab=distribusi",
            label: "Distribusi",
            icon: Send,
          },
        ];
      case "Admin":
        return [
          {
            href: "/admin?tab=guru",
            label: "CRUD Guru",
            icon: Users,
            badgeCount: allUsers.filter((u) => u.role === "Guru").length,
            badgeColor: "emerald",
          },
          {
            href: "/admin?tab=halaqah",
            label: "Halaqah",
            icon: BookOpen,
            badgeCount: scopedHalaqahs.length,
            badgeColor: "blue",
          },
          {
            href: "/admin?tab=pemuda",
            label: "Murid (≤5)",
            icon: UserCheck,
            badgeCount: scopedPemudas.length,
            badgeColor: "amber",
          },
          {
            href: "/admin?tab=struktural",
            label: "AJM & Staf",
            icon: Shield,
          },
        ];
      default:
        return [{ href: "/", label: "Beranda", icon: Home }];
    }
  };

  const primaryTabs = getPrimaryBottomTabs();

  const getBadgeStyle = (color?: "red" | "amber" | "blue" | "emerald") => {
    switch (color) {
      case "red":
        return "bg-red-600 text-white";
      case "amber":
        return "bg-amber-500 text-slate-950";
      case "emerald":
        return "bg-emerald-600 text-white";
      case "blue":
      default:
        return "bg-blue-600 text-white";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Guru":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Asmen":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Manager":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "PJ Mal":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "Admin":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Filtered Notifications for Current User
  const userNotifs = notifikasis.filter(
    (n) =>
      n.targetRole === "ALL" ||
      (n.targetRole === currentUser.role && (!n.targetUserId || n.targetUserId === currentUser.id))
  );
  const unreadNotifCount = userNotifs.filter((n) => !n.dibaca).length;

  // Scoped Global Search Results
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { tipe: string; judul: string; sub: string; href: string }[] = [];

    // Halaqah / Kursus
    scopedHalaqahs.forEach((h) => {
      if (h.nama.toLowerCase().includes(q) || h.kode.toLowerCase().includes(q) || h.materi.toLowerCase().includes(q)) {
        results.push({
          tipe: "Kursus / Halaqah",
          judul: `${h.nama} (${h.kode})`,
          sub: `${h.jenis || "Umum"} • Guru: ${h.guruNama} • ${h.hari} ${h.jam}`,
          href: `/halaqah/${h.id}`,
        });
      }
    });

    // Pemuda (strictly scoped!)
    scopedPemudas.forEach((p) => {
      if (p.nama.toLowerCase().includes(q) || p.telepon.includes(q)) {
        const hq = scopedHalaqahs.find((h) => h.id === p.halaqahId);
        results.push({
          tipe: "Pemuda / Syabab",
          judul: p.nama,
          sub: `${p.jenjang || "Anggota"} • ${hq?.nama || p.halaqahId} • ${p.perluPerhatian ? "Perlu Perhatian" : "Aktif"}`,
          href: `/anggota`,
        });
      }
    });

    // Guru & Asmen (only for Asmen, Manager, Admin)
    if (currentUser.role !== "Guru") {
      allUsers.forEach((u) => {
        if (u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)) {
          if (currentUser.role === "Asmen" && u.role === "Guru" && u.asmenId !== currentUser.id) return;
          results.push({
            tipe: u.role,
            judul: u.name,
            sub: `${u.wilayahNama || "Mahali"} • Status: ${u.statusKesehatan || "Aktif"}`,
            href: u.role === "Asmen" ? "/asmen" : u.role === "Guru" ? "/guru" : "/admin",
          });
        }
      });
    }

    // Action Plan / Tugas
    scopedActionPlans.forEach((ap) => {
      if (ap.judul.toLowerCase().includes(q) || ap.tindakan.toLowerCase().includes(q)) {
        results.push({
          tipe: "Action Plan / Tugas",
          judul: ap.judul,
          sub: `PIC: ${ap.picNama} • Status: ${ap.status} (${ap.progres}%)`,
          href: "/tugas",
        });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, scopedHalaqahs, scopedPemudas, allUsers, scopedActionPlans, currentUser]);

  // Collapsible Sidebar Categories for "Lainnya"
  const sidebarCategories = [
    {
      id: "pembinaan",
      label: "Pembinaan & Kursus",
      items: [
        { href: "/halaqah", label: "Daftar Kursus / Halaqah" },
        ...(currentUser.role === "Asmen" || currentUser.role === "Manager" || currentUser.role === "Admin"
          ? [{ href: "/halaqah/baru", label: "+ Buat Perhalaqahan Baru (Asmen/Manajer)" }]
          : []),
        { href: "/anggota", label: "Data Pemuda & Ri'ayah" },
        {
          href: "/pengajuan",
          label:
            currentUser.role === "Guru"
              ? "Riwayat Update Murid & Waktu"
              : "Validasi Perubahan Murid & Waktu",
        },
      ],
    },
    {
      id: "monitoring",
      label: "Monitoring & Laporan",
      items: [
        { href: "/laporan", label: "Laporan Pekanan" },
        { href: "/tugas", label: "Action Plan & Tugas" },
        ...(currentUser.role === "Manager" || currentUser.role === "Asmen"
          ? [
              { href: "/rekap", label: "Dashboard KPI & Rekap Mahali" },
              { href: "/prioritas", label: "Daftar Masalah Prioritas" },
            ]
          : []),
      ],
    },
    {
      id: "organisasi",
      label: "Data Organisasi & Kepemimpinan",
      items: [
        ...(currentUser.role === "Manager" || currentUser.role === "Admin"
          ? [{ href: "/asmen", label: "Data 4 Asmen & Diagnosis 3K-3M" }]
          : []),
        ...(currentUser.role === "Asmen" || currentUser.role === "Manager" || currentUser.role === "Admin"
          ? [{ href: "/guru", label: "Data Guru & Beban Pembinaan" }]
          : []),
      ],
    },
    {
      id: "keuangan",
      label: "Keuangan & Iltizamat",
      items: [
        { href: "/iltizamat", label: "Siklus Iltizamat & SPP" },
        ...(currentUser.role === "PJ Mal" || currentUser.role === "Manager" || currentUser.role === "Admin"
          ? [
              { href: "/iltizamat?tab=pembayaran", label: "Verifikasi Pembayaran" },
              { href: "/iltizamat?tab=rekonsiliasi", label: "Rekonsiliasi & Distribusi Dana" },
            ]
          : []),
      ],
    },
    {
      id: "pengaturan",
      label: "Pengaturan & Admin CRUD",
      items: [
        ...(currentUser.role === "Admin" || currentUser.role === "Manager"
          ? [
              { href: "/admin", label: "CRUD Master Data & Pengguna" },
              { href: "/admin?tab=kpi", label: "Bobot KPI & Ambang Status" },
              { href: "/admin#audit", label: "Audit Trail Aktivitas" },
            ]
          : currentUser.role === "Asmen"
          ? [
              { href: "/admin?tab=guru", label: "CRUD Guru & Admin Guru (Khusus AJM)" },
              { href: "/admin?tab=halaqah", label: "CRUD Perhalaqahan (Khusus AJM)" },
              { href: "/admin?tab=pemuda", label: "CRUD Data Murid ≤5 (Khusus AJM)" },
            ]
          : []),
      ],
    },
  ].filter((cat) => cat.items.length > 0);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleGuruQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guruQuickTab === "PERTEMUAN") {
      setQuickActionOpen(false);
      router.push(`/laporan/buat?halaqahId=${selectedHalaqahId}`);
      return;
    }
    const res = quickLogGuruActivity({
      tipe: guruQuickTab,
      halaqahId: selectedHalaqahId,
      pemudaId: selectedPemudaId,
      catatan: quickNote,
      nominalSpp: Number(quickSpp) || 0,
    });
    if (res.success) {
      setQuickToast(res.message);
      setQuickNote("");
      setTimeout(() => {
        setQuickToast(null);
        setQuickActionOpen(false);
      }, 1500);
    }
  };

  const handleCreateActionPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPic =
      apPicId ||
      (currentUser.role === "Manager" ? "usr-asmen-2" : "usr-guru-1");
    const res = createActionPlan({
      judul: apJudul || "Tindak Lanjut Masalah Prioritas",
      sumberMasalah: apSumber || "Monitoring Dashboard",
      picId: targetPic,
      tindakan: apTindakan || "Temui PIC, identifikasi kendala, dan susun jadwal perbaikan.",
      targetHasil: apTarget || "Indikator kembali sehat pekan ini.",
      indikatorSelesai: "Laporan & bukti terverifikasi",
      prioritas: apPrioritas,
      deadline: apDeadline,
      buktiDiminta: "Catatan pertemuan & update laporan",
    });
    if (res.success) {
      setQuickToast(res.message);
      setApJudul("");
      setApTindakan("");
      setTimeout(() => {
        setQuickToast(null);
        setQuickActionOpen(false);
      }, 1400);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        {/* Top Role & Edge-State Simulator Bar */}
        <div className="bg-slate-900 text-white text-[11px] px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 hidden sm:inline">User Aktif:</span>
            <span className="font-bold text-white truncate max-w-[140px] sm:max-w-none">{currentUser.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role === "Asmen" ? "AJM / Asmen" : currentUser.role}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Weak Network / Offline Toggle for Field Guru Testing */}
            <button
              onClick={() => setIsWeakNetwork(!isWeakNetwork)}
              className={`px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-semibold border transition ${
                isWeakNetwork
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700"
              }`}
              title="Simulasi kondisi jaringan lapangan"
            >
              {isWeakNetwork ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span className="hidden md:inline">
                {isWeakNetwork ? "Jaringan Lemah (Draft Lokal)" : `✓ Tersimpan (${lastAutoSaved})`}
              </span>
            </button>

            {/* Period Lock Indicator / Toggle for Admin/Manager */}
            {(currentUser.role === "Admin" || currentUser.role === "Manager") && (
              <button
                onClick={toggleLockPeriode}
                className={`px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-semibold border transition ${
                  periode.status === "Dikunci"
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {periode.status === "Dikunci" ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span className="hidden sm:inline">Periode: {periode.status}</span>
              </button>
            )}

            {/* 1-Click Direct Button to Admin CRUD (Full for Admin/Manager, Scoped Guru+Murid+Halaqah for Asmen/AJM) */}
            <button
              onClick={() => {
                if (
                  currentUser.role !== "Admin" &&
                  currentUser.role !== "Manager" &&
                  currentUser.role !== "Asmen"
                ) {
                  const adminUser = allUsers.find((u) => u.role === "Admin");
                  if (adminUser) setCurrentUser(adminUser);
                }
                router.push("/admin");
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md flex items-center gap-1 font-black text-[11px] shadow-sm transition"
              title="Buka CRUD Guru, Halaqah & Murid"
            >
              <Shield className="w-3 h-3" />
              <span>{currentUser.role === "Asmen" ? "CRUD AJM (Guru/Murid)" : "CRUD Admin"}</span>
            </button>

            {/* Account Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md flex items-center gap-1 font-bold text-[11px] shadow-sm transition"
              >
                <span>Ganti Role</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 max-h-[80vh] overflow-y-auto"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Pilih Role Sesuai MENU APK AWANPUTIH
                  </div>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setCurrentUser(u)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        u.id === currentUser.id ? "bg-emerald-50 text-emerald-900 font-bold" : ""
                      }`}
                    >
                      <div className="pr-2">
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Logout / Back to Login Screen */}
            <button
              onClick={logout}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md flex items-center gap-1 font-bold text-[11px] shadow-sm transition"
              title="Keluar dan kembali ke Halaman Login"
            >
              <LogOut className="w-3 h-3" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Weak Network / Locked Period Banner */}
        {(isWeakNetwork || periode.status === "Dikunci") && (
          <div
            className={`px-4 py-1.5 text-xs font-semibold flex items-center justify-between ${
              periode.status === "Dikunci"
                ? "bg-red-600 text-white"
                : "bg-amber-100 text-amber-900 border-b border-amber-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {periode.status === "Dikunci" ? (
                <>
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Periode {periode.label} telah DIKUNCI. Data bersifat baca-saja kecuali dibuka kembali oleh Manajer/Admin.</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                  <span>Mode Jaringan Lemah Aktif: Guru tetap dapat mengisi form (simpan draft otomatis di HP).</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main Application Header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand & Active Period Subtitle */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Cloud className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                    AWAN<span className="text-emerald-600">PUTIH</span>
                  </span>
                  <span className="hidden xs:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {currentUser.wilayahNama || currentUser.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-emerald-600 inline" />
                  <span>{periode.label}</span>
                </div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {primaryTabs.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href.split("?")[0];
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`touch-target px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition relative ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                    <span>{link.label}</span>
                    {link.badgeCount !== undefined && link.badgeCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${getBadgeStyle(link.badgeColor)}`}>
                        {link.badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              <button
                onClick={() => setLainnyaOpen(true)}
                className="touch-target px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <span>Lainnya</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </nav>

            {/* Global Functions: Search (🔍), Notifications (🔔), Avatar */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="touch-target p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                aria-label="Pencarian Global"
                title="Cari sesuai hak akses"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setNotifOpen(true)}
                className="touch-target p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center relative transition"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setLainnyaOpen(true)}
                className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xs font-black text-emerald-800 hover:bg-emerald-200 transition"
                title="Profil & Menu Lainnya"
              >
                {currentUser.avatar || currentUser.name.substring(0, 2).toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MOBILE BOTTOM NAVIGATION BAR (5 TABS + COLORED BADGES)
      ===================================================================== */}
      <nav
        aria-label="Navigasi Bawah HP"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] px-1 py-1 flex items-center justify-around"
      >
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const baseHref = tab.href.split("?")[0];
          const isActive = pathname === baseHref && !lainnyaOpen;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setLainnyaOpen(false)}
              className={`touch-target flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center relative transition ${
                isActive ? "text-emerald-700 font-extrabold bg-emerald-50/70" : "text-slate-500 font-medium hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600 stroke-[2.5]" : "text-slate-400"}`} />
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-3 px-1.5 min-w-[16px] h-4 rounded-full text-[10px] font-black flex items-center justify-center shadow-sm ${getBadgeStyle(
                      tab.badgeColor
                    )}`}
                  >
                    {tab.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </Link>
          );
        })}

        {/* 5th Slot: LAINNYA (Opens Sidebar Drawer with Profile on top) */}
        <button
          onClick={() => setLainnyaOpen(!lainnyaOpen)}
          className={`touch-target flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center relative transition ${
            lainnyaOpen ? "text-emerald-700 font-extrabold bg-emerald-50/70" : "text-slate-500 font-medium hover:text-slate-900"
          }`}
        >
          <div className="w-5 h-5 rounded-md border-2 border-current flex items-center justify-center text-[9px] font-black">
            •••
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Lainnya</span>
        </button>
      </nav>

      {/* =====================================================================
          FLOATING ACTION BUTTON (FAB "+") PER ROLE FOR ONE-HAND MOBILE USE
      ===================================================================== */}
      <button
        onClick={() => setQuickActionOpen(true)}
        className="fixed right-4 bottom-20 md:bottom-8 z-30 touch-target px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-xl shadow-emerald-900/25 flex items-center gap-2 border border-emerald-400/30 transition transform active:scale-95"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span>
          {currentUser.role === "Guru"
            ? "Catat Aktivitas"
            : currentUser.role === "Asmen"
            ? "Catat Kontrol / Tugas"
            : currentUser.role === "Manager"
            ? "Buat Action Plan"
            : currentUser.role === "PJ Mal"
            ? "Catat Pembayaran"
            : "Tambah Data (CRUD)"}
        </span>
      </button>

      {/* =====================================================================
          GLOBAL SEARCH MODAL (SCOPED BY ROLE PERMISSIONS)
      ===================================================================== */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-3.5 border-b border-slate-200 flex items-center gap-2.5">
              <Search className="w-5 h-5 text-emerald-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  currentUser.role === "Guru"
                    ? "Cari Kursus, Pemuda binaan, atau Tugas Anda..."
                    : "Cari Asmen, Guru, Kursus, Pemuda, atau Action Plan..."
                }
                className="w-full text-sm bg-transparent focus:outline-none text-slate-900"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Hak Akses Pencarian: <strong>Scope {currentUser.role}</strong></span>
              <span>{ currentUser.role === "Guru" ? "Hanya menampilkan binaan sendiri" : "Mode Monitoring" }</span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {searchQuery.trim() === "" ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Ketik nama Pemuda, kode Halaqah (HK-01, HK-02), nama Guru, atau Action Plan...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Tidak ditemukan data dalam lingkup kewenangan akun Anda.
                </div>
              ) : (
                searchResults.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={() => setSearchOpen(false)}
                    className="p-3.5 hover:bg-emerald-50/60 flex items-center justify-between gap-3 transition"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {item.tipe}
                      </span>
                      <div className="font-bold text-slate-900 text-sm mt-1">{item.judul}</div>
                      <div className="text-xs text-slate-500">{item.sub}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          GLOBAL NOTIFICATIONS DRAWER (GROUPED BY SEVERITY)
      ===================================================================== */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <h2 className="font-black text-base text-slate-900">Notifikasi & Peringatan</h2>
              </div>
              <button
                onClick={() => setNotifOpen(false)}
                className="touch-target p-2 rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {userNotifs.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">Belum ada notifikasi baru.</div>
              ) : (
                userNotifs.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => {
                      markNotifRead(n.id);
                      setNotifOpen(false);
                    }}
                    className={`block p-3.5 rounded-2xl border transition ${
                      n.kategori === "Kritis"
                        ? "bg-red-50/70 border-red-200 hover:bg-red-50"
                        : n.kategori === "Perlu Tindakan"
                        ? "bg-amber-50/70 border-amber-200 hover:bg-amber-50"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          n.kategori === "Kritis"
                            ? "bg-red-600 text-white"
                            : n.kategori === "Perlu Tindakan"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {n.kategori}
                      </span>
                      <span className="text-[11px] text-slate-400">{n.waktu}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{n.judul}</div>
                    <p className="text-xs text-slate-600 mt-0.5">{n.pesan}</p>
                    <div className="text-[11px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
                      <span>Buka Halaman Terkait</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          "LAINNYA" SLIDE-OVER SIDEBAR (PROFILE AT TOP + FAVORITES + ACCORDION)
      ===================================================================== */}
      {lainnyaOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Top Profile Card (Recommendation #3: Profil di bagian atas sidebar) */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center shadow-md">
                    {currentUser.avatar || currentUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{currentUser.name}</div>
                    <div className="text-xs text-slate-300">{currentUser.email}</div>
                    <div className="mt-1 inline-flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Role: {currentUser.role}
                      </span>
                      {currentUser.statusKesehatan && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">
                          Status: {currentUser.statusKesehatan} ({currentUser.skorKesehatan})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setLainnyaOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
              {/* Menu Favorit (Recommendation #9) */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  <span>★ Menu Favorit Disematkan</span>
                  <span>Klik ★ untuk ubah</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {favoriteMenus.map((href) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setLainnyaOpen(false)}
                      className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center justify-between hover:bg-emerald-100 transition"
                    >
                      <span className="truncate capitalize">{href.replace("/", "") || "Beranda"}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Collapsible Categories */}
              <div className="space-y-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Katalog Modul Sesuai Kewenangan
                </div>
                {sidebarCategories.map((cat) => {
                  const isOpen = openCategories.includes(cat.id);
                  return (
                    <div key={cat.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition"
                      >
                        <span>▸ {cat.label}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="divide-y divide-slate-100">
                          {cat.items.map((item) => {
                            const isFav = favoriteMenus.includes(item.href);
                            return (
                              <div key={item.href} className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50">
                                <Link
                                  href={item.href}
                                  onClick={() => setLainnyaOpen(false)}
                                  className="text-xs font-medium text-slate-700 hover:text-emerald-700 flex-1 py-1"
                                >
                                  {item.label}
                                </Link>
                                <button
                                  onClick={() => toggleFavoriteMenu(item.href)}
                                  className="p-1 text-slate-300 hover:text-amber-500"
                                  title="Sematkan ke Favorit"
                                >
                                  <Star className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400 text-amber-500" : ""}`} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Arti Status & Kode Standar */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-2">
                <div className="font-bold text-slate-800">Standar Status Awan Putih</div>
                <div className="grid grid-cols-2 gap-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Sehat (≥80)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Sedang (65–79)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span>Sakit (&lt;65 / Kritis)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span>Data Belum Lengkap</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setLainnyaOpen(false);
                  logout();
                }}
                className="w-full touch-target py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar / Ganti Login (Role:test / Email Browser)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONE-HAND QUICK ACTION BOTTOM SHEET ("+" BUTTON)
      ===================================================================== */}
      {quickActionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {currentUser.role === "Guru"
                    ? "+ Catat Aktivitas Cepat (1x Input → Otomatis Laporan)"
                    : currentUser.role === "Manager"
                    ? "+ Buat Action Plan kepada Asmen"
                    : currentUser.role === "Asmen"
                    ? "+ Pintasan AJM: CRUD Guru/Murid/Halaqah & Tugas"
                    : currentUser.role === "PJ Mal"
                    ? "+ Catat Pembayaran Iltizamat Cepat"
                    : "+ Pintasan CRUD Admin"}
                </h3>
                <p className="text-xs text-slate-500">
                  Dirancang untuk pengoperasian satu tangan di layar HP.
                </p>
              </div>
              <button
                onClick={() => setQuickActionOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickToast && (
              <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{quickToast}</span>
              </div>
            )}

            {/* GURU 5-IN-1 QUICK INPUT */}
            {currentUser.role === "Guru" && (
              <form onSubmit={handleGuruQuickSubmit} className="space-y-4 pt-3 text-xs">
                <div className="grid grid-cols-5 gap-1.5">
                  {(
                    [
                      { id: "PERTEMUAN", label: "Pertemuan" },
                      { id: "KONTROL", label: "Kontrol" },
                      { id: "KONTAK", label: "Kontak" },
                      { id: "SPP", label: "SPP/Iltizam" },
                      { id: "MEDIA", label: "Media" },
                    ] as const
                  ).map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setGuruQuickTab(t.id)}
                      className={`py-2.5 px-1 rounded-xl font-bold text-[11px] border text-center transition ${
                        guruQuickTab === t.id
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {(guruQuickTab === "PERTEMUAN" || guruQuickTab === "MEDIA") && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilih Kelompok Halaqah:</label>
                    <select
                      value={selectedHalaqahId}
                      onChange={(e) => setSelectedHalaqahId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    >
                      {scopedHalaqahs.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.kode} • {h.nama} ({h.jenis || "Umum"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(guruQuickTab === "KONTROL" || guruQuickTab === "KONTAK" || guruQuickTab === "SPP") && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Pilih Pemuda (Kelompok otomatis terdeteksi):
                    </label>
                    <select
                      value={selectedPemudaId}
                      onChange={(e) => setSelectedPemudaId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                    >
                      {scopedPemudas.map((p) => {
                        const hq = scopedHalaqahs.find((h) => h.id === p.halaqahId);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.nama} — {hq?.kode || p.halaqahId} ({p.jenjang || "Anggota"})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {guruQuickTab === "SPP" && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nominal Iltizamat / SPP (Rp):</label>
                    <input
                      type="number"
                      value={quickSpp}
                      onChange={(e) => setQuickSpp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                )}

                {guruQuickTab !== "PERTEMUAN" && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Hasil / Catatan Tindak Lanjut:
                    </label>
                    <input
                      type="text"
                      value={quickNote}
                      onChange={(e) => setQuickNote(e.target.value)}
                      placeholder="Contoh: Tilawah 1 juz/hari baik, siap hadir Jumat..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full touch-target py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  {guruQuickTab === "PERTEMUAN"
                    ? "Buka Form Absensi & Materi Kelompok →"
                    : `Simpan ${guruQuickTab} & Sinkronkan ke Laporan`}
                </button>
              </form>
            )}

            {/* ASMEN (AJM) LIMITED ADMIN CRUD SHORTCUTS */}
            {currentUser.role === "Asmen" && (
              <div className="pt-3 pb-3 mb-2 border-b border-slate-200 space-y-2 text-xs">
                <div className="font-extrabold text-[11px] uppercase tracking-wider text-blue-800">
                  Pintasan Admin Terbatas AJM (Khusus Guru, Perhalaqahan & Murid):
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href="/admin?tab=guru&create=guru"
                    onClick={() => setQuickActionOpen(false)}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center text-[11px]"
                  >
                    + Tambah Guru
                  </Link>
                  <Link
                    href="/admin?tab=halaqah&create=halaqah"
                    onClick={() => setQuickActionOpen(false)}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-center text-[11px]"
                  >
                    + Tambah Halaqah
                  </Link>
                  <Link
                    href="/admin?tab=pemuda&create=pemuda"
                    onClick={() => setQuickActionOpen(false)}
                    className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-center text-[11px]"
                  >
                    + Tambah Murid
                  </Link>
                </div>
              </div>
            )}

            {/* MANAGER OR ASMEN QUICK ACTION PLAN */}
            {(currentUser.role === "Manager" || currentUser.role === "Asmen") && (
              <form onSubmit={handleCreateActionPlanSubmit} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Action Plan / Tugas:</label>
                  <input
                    type="text"
                    required
                    value={apJudul}
                    onChange={(e) => setApJudul(e.target.value)}
                    placeholder="Contoh: Pulihkan Kehadiran Kursus HK-02"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      PIC ({currentUser.role === "Manager" ? "Hanya Asmen" : "Pilih Guru"}):
                    </label>
                    <select
                      value={apPicId}
                      onChange={(e) => setApPicId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {allUsers
                        .filter((u) => (currentUser.role === "Manager" ? u.role === "Asmen" : u.role === "Guru"))
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prioritas:</label>
                    <select
                      value={apPrioritas}
                      onChange={(e) => setApPrioritas(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Kritis">🔴 Kritis</option>
                      <option value="Tinggi">🟠 Tinggi</option>
                      <option value="Sedang">🟡 Sedang</option>
                      <option value="Rendah">🔵 Rendah</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instruksi Tindakan Konkret:</label>
                  <textarea
                    rows={2}
                    required
                    value={apTindakan}
                    onChange={(e) => setApTindakan(e.target.value)}
                    placeholder="Contoh: Temui Guru/Pemuda yang tidak hadir 2 pekan, catat kendala, dan jadwalkan pertemuan pengganti."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Hasil Terukur:</label>
                    <input
                      type="text"
                      value={apTarget}
                      onChange={(e) => setApTarget(e.target.value)}
                      placeholder="Kehadiran naik ≥75%"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Deadline:</label>
                    <input
                      type="date"
                      value={apDeadline}
                      onChange={(e) => setApDeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full touch-target py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
                >
                  Kirim Action Plan Sekarang
                </button>
              </form>
            )}

            {/* PJ MAL OR ADMIN QUICK SHORTCUTS */}
            {currentUser.role === "PJ Mal" && (
              <div className="pt-4 space-y-2 text-xs">
                <Link
                  href="/iltizamat"
                  onClick={() => setQuickActionOpen(false)}
                  className="block w-full text-center py-3 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Buka Form Pembayaran & Verifikasi Iltizamat →
                </Link>
              </div>
            )}

            {currentUser.role === "Admin" && (
              <div className="pt-3 space-y-2 text-xs">
                <Link
                  href="/admin?tab=guru&create=guru"
                  onClick={() => setQuickActionOpen(false)}
                  className="block w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  + Tambah Guru Baru
                </Link>
                <Link
                  href="/admin?tab=struktural&create=asmen"
                  onClick={() => setQuickActionOpen(false)}
                  className="block w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  + Tambah AJM / Asmen Baru
                </Link>
                <Link
                  href="/admin?tab=halaqah&create=halaqah"
                  onClick={() => setQuickActionOpen(false)}
                  className="block w-full text-center py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                >
                  + Tambah Kelompok Halaqah Baru
                </Link>
                <Link
                  href="/admin?tab=pemuda&create=pemuda"
                  onClick={() => setQuickActionOpen(false)}
                  className="block w-full text-center py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  + Tambah Murid / Pemuda Baru (Maks. 5/Halaqah)
                </Link>
                <Link
                  href="/admin?tab=mahali&create=mahali"
                  onClick={() => setQuickActionOpen(false)}
                  className="block w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  + Tambah Wilayah Mahali Baru
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
