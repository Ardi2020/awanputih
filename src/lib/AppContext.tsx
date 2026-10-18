"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  Mahali,
  Halaqah,
  LaporanPekanan,
  PengajuanHalaqah,
  AuditLog,
  Pemuda,
  PeriodeLaporan,
  PengajuanPayload,
  Role,
  ActionPlan,
  PrioritasMasalah,
  KontrolGuruLog,
  IltizamatRecord,
  PembayaranTransaksi,
  DistribusiDana,
  NotifikasiItem,
  KpiConfig,
  ActionPlanStatus,
  PriorityLevel,
  StatusBayarIltizamat,
  StatusKomunikasiIltizamat,
} from "./types";
import {
  initialUsers,
  initialMahalis,
  initialHalaqahs,
  initialLaporans,
  initialPengajuans,
  initialPemudas,
  initialPeriode,
  initialAuditLogs,
  initialActionPlans,
  initialPrioritasMasalah,
  initialKontrolGuruLogs,
  initialIltizamatRecords,
  initialPembayaranTransaksis,
  initialDistribusiDanas,
  initialNotifikasis,
  initialKpiConfig,
} from "./store";
import {
  filterHalaqahsByScope,
  filterReportsByScope,
  filterPengajuanByScope,
  filterActionPlansByScope,
  filterPrioritasByScope,
  filterPemudasByScope,
  filterIltizamatByScope,
} from "./permissions";
import { generateId } from "./utils";

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  detectedBrowserEmail: string;
  setDetectedBrowserEmail: (email: string) => void;
  loginWithTestAccount: (username: string, password: string) => { success: boolean; message: string };
  loginWithBrowserEmail: (email: string) => { success: boolean; message: string };
  logout: () => void;
  allUsers: User[];
  allMahalis: Mahali[];
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role, userId?: string) => void;
  periode: PeriodeLaporan;
  allHalaqahs: Halaqah[];
  scopedHalaqahs: Halaqah[];
  allPemudas: Pemuda[];
  scopedPemudas: Pemuda[];
  allLaporans: LaporanPekanan[];
  scopedLaporans: LaporanPekanan[];
  allPengajuans: PengajuanHalaqah[];
  scopedPengajuans: PengajuanHalaqah[];
  allActionPlans: ActionPlan[];
  scopedActionPlans: ActionPlan[];
  allPrioritas: PrioritasMasalah[];
  scopedPrioritas: PrioritasMasalah[];
  kontrolGuruLogs: KontrolGuruLog[];
  allIltizamat: IltizamatRecord[];
  scopedIltizamat: IltizamatRecord[];
  pembayaranTransaksis: PembayaranTransaksi[];
  distribusiDanas: DistribusiDana[];
  notifikasis: NotifikasiItem[];
  kpiConfig: KpiConfig;
  auditLogs: AuditLog[];

  // UI & Field Simulation States
  isWeakNetwork: boolean;
  setIsWeakNetwork: (v: boolean) => void;
  lastAutoSaved: string;
  favoriteMenus: string[];
  toggleFavoriteMenu: (href: string) => void;
  markNotifRead: (id: string) => void;

  // Report & Proposal Actions
  saveReportDraft: (data: Partial<LaporanPekanan>) => { success: boolean; message: string; reportId?: string };
  submitReport: (data: Partial<LaporanPekanan>) => { success: boolean; message: string; reportId?: string };
  verifyLaporan: (
    reportId: string,
    keputusan: "Diverifikasi" | "Perlu Perbaikan",
    catatan?: string
  ) => { success: boolean; message: string };
  createPengajuan: (
    payload: PengajuanPayload,
    tipe: "CREATE" | "UPDATE",
    targetHalaqahId?: string,
    catatanPemohon?: string
  ) => { success: boolean; message: string; pengajuanId?: string };
  approvePengajuan: (pengajuanId: string) => { success: boolean; message: string };
  returnPengajuan: (pengajuanId: string, alasan: string) => { success: boolean; message: string };

  // Guru Quick Actions (1-Input -> Auto Report)
  quickLogGuruActivity: (payload: {
    tipe: "PERTEMUAN" | "KONTROL" | "KONTAK" | "SPP" | "MEDIA";
    halaqahId?: string;
    pemudaId?: string;
    materi?: string;
    catatan?: string;
    nominalSpp?: number;
  }) => { success: boolean; message: string };

  // Asmen & Manager Actions (Kontrol Guru & Action Plans)
  addKontrolGuruLog: (data: Omit<KontrolGuruLog, "id" | "asmenId" | "asmenNama">) => {
    success: boolean;
    message: string;
  };
  createActionPlan: (data: {
    judul: string;
    sumberMasalah: string;
    picId: string;
    tindakan: string;
    targetHasil: string;
    indikatorSelesai: string;
    prioritas: PriorityLevel;
    deadline: string;
    buktiDiminta: string;
    halaqahId?: string;
  }) => { success: boolean; message: string };
  updateActionPlanProgress: (
    planId: string,
    progres: number,
    catatanProgres: string,
    siapEvaluasi?: boolean
  ) => { success: boolean; message: string };
  evaluateActionPlan: (
    planId: string,
    keputusan: "Selesai" | "Berjalan" | "Dibatalkan",
    catatanEvaluasi: string
  ) => { success: boolean; message: string };

  // PJ Mal Actions
  recordPembayaranIltizamat: (data: {
    iltizamatId: string;
    nominal: number;
    metode: "Transfer" | "Tunai";
    catatan?: string;
  }) => { success: boolean; message: string };
  verifyPembayaranIltizamat: (
    trxId: string,
    status: "Terverifikasi" | "Perlu Koreksi"
  ) => { success: boolean; message: string };
  updateKomunikasiIltizamat: (
    iltizamatId: string,
    statusKomunikasi: StatusKomunikasiIltizamat,
    statusBayar?: StatusBayarIltizamat,
    tanggalJanji?: string,
    catatan?: string
  ) => { success: boolean; message: string };
  createDistribusiDana: (data: {
    tujuan: string;
    penerima: string;
    nominal: number;
    metode: "Transfer" | "Tunai";
  }) => { success: boolean; message: string };

  // Admin Full CRUD Actions
  updateUserRoleAndScope: (
    userId: string,
    role: Role,
    mahaliId?: string,
    asmenId?: string,
    assignedHalaqahIds?: string[],
    supervisedHalaqahIds?: string[]
  ) => { success: boolean; message: string };
  createUserAdmin: (data: Partial<User>) => { success: boolean; message: string };
  updateUserAdmin: (userId: string, data: Partial<User>) => { success: boolean; message: string };
  deleteUserAdmin: (userId: string) => { success: boolean; message: string };

  createMahaliAdmin: (data: Omit<Mahali, "id">) => { success: boolean; message: string };
  updateMahaliAdmin: (id: string, data: Partial<Mahali>) => { success: boolean; message: string };
  deleteMahaliAdmin: (id: string) => { success: boolean; message: string };

  createHalaqahAdmin: (data: Partial<Halaqah>) => { success: boolean; message: string };
  updateHalaqahAdmin: (id: string, data: Partial<Halaqah>) => { success: boolean; message: string };
  deleteHalaqahAdmin: (id: string) => { success: boolean; message: string };

  createPemudaAdmin: (data: Partial<Pemuda>) => { success: boolean; message: string };
  updatePemudaAdmin: (id: string, data: Partial<Pemuda>) => { success: boolean; message: string };
  deletePemudaAdmin: (id: string) => { success: boolean; message: string };

  updateKpiConfigAdmin: (cfg: KpiConfig) => { success: boolean; message: string };
  toggleLockPeriode: () => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(initialUsers[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [detectedBrowserEmail, setDetectedBrowserEmail] = useState<string>("asmuliardi@gmail.com");
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const [allMahalis, setAllMahalis] = useState<Mahali[]>(initialMahalis);
  const [periode, setPeriode] = useState<PeriodeLaporan>(initialPeriode);
  const [allHalaqahs, setAllHalaqahs] = useState<Halaqah[]>(initialHalaqahs);
  const [allPemudas, setAllPemudas] = useState<Pemuda[]>(initialPemudas);
  const [allLaporans, setAllLaporans] = useState<LaporanPekanan[]>(initialLaporans);
  const [allPengajuans, setAllPengajuans] = useState<PengajuanHalaqah[]>(initialPengajuans);
  const [allActionPlans, setAllActionPlans] = useState<ActionPlan[]>(initialActionPlans);
  const [allPrioritas, setAllPrioritas] = useState<PrioritasMasalah[]>(initialPrioritasMasalah);
  const [kontrolGuruLogs, setKontrolGuruLogs] = useState<KontrolGuruLog[]>(initialKontrolGuruLogs);
  const [allIltizamat, setAllIltizamat] = useState<IltizamatRecord[]>(initialIltizamatRecords);
  const [pembayaranTransaksis, setPembayaranTransaksis] = useState<PembayaranTransaksi[]>(initialPembayaranTransaksis);
  const [distribusiDanas, setDistribusiDanas] = useState<DistribusiDana[]>(initialDistribusiDanas);
  const [notifikasis, setNotifikasis] = useState<NotifikasiItem[]>(initialNotifikasis);
  const [kpiConfig, setKpiConfig] = useState<KpiConfig>(initialKpiConfig);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  const [isWeakNetwork, setIsWeakNetwork] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState("Baru saja");
  const [favoriteMenus, setFavoriteMenus] = useState<string[]>(["/halaqah", "/laporan", "/anggota"]);

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("awanputih_is_authenticated");
      const savedUser = localStorage.getItem("awanputih_current_user");
      const savedBrowserEmail = localStorage.getItem("awanputih_browser_email");
      if (savedBrowserEmail) {
        setDetectedBrowserEmail(savedBrowserEmail);
      }
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const found = allUsers.find((u) => u.id === parsed.id || u.email === parsed.email);
        if (found) setCurrentUserState(found);
        else setCurrentUserState(parsed);
      }
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("awanputih_current_user", JSON.stringify(user));
      localStorage.setItem("awanputih_is_authenticated", "true");
    } catch {
      // ignore
    }
  };

  const loginWithTestAccount = (usernameInput: string, passwordInput: string) => {
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    if (p !== "test") {
      return {
        success: false,
        message: "Password salah. Untuk uji coba semua role, gunakan password: test",
      };
    }

    let matchedUser: User | undefined;

    if (u === "admin") {
      matchedUser = allUsers.find((x) => x.role === "Admin");
    } else if (u === "guru") {
      matchedUser = allUsers.find((x) => x.role === "Guru");
    } else if (u === "asmen" || u === "ajm") {
      matchedUser = allUsers.find((x) => x.role === "Asmen");
    } else if (u === "manajer" || u === "manager") {
      matchedUser = allUsers.find((x) => x.role === "Manager");
    } else if (u === "pjmal" || u === "pj mal" || u === "mal") {
      matchedUser = allUsers.find((x) => x.role === "PJ Mal");
    } else {
      matchedUser = allUsers.find(
        (x) =>
          x.email.toLowerCase() === u ||
          x.name.toLowerCase() === u ||
          x.name.toLowerCase().includes(u)
      );
    }

    if (!matchedUser) {
      return {
        success: false,
        message:
          "User tidak ditemukan. Gunakan: admin, manajer, asmen (ajm), guru, pjmal, atau email terdaftar dengan password: test",
      };
    }

    setCurrentUser(matchedUser);
    return {
      success: true,
      message: `Berhasil login uji coba sebagai ${matchedUser.name} (${matchedUser.role})!`,
    };
  };

  const loginWithBrowserEmail = (emailInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return {
        success: false,
        message: "Masukkan alamat email akun Google Chrome / Microsoft Edge yang valid.",
      };
    }

    try {
      localStorage.setItem("awanputih_browser_email", cleanEmail);
    } catch {
      // ignore
    }
    setDetectedBrowserEmail(cleanEmail);

    // Cari apakah email sudah didaftarkan oleh Mahali / AJM di allUsers
    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      return {
        success: true,
        message: `Email browser Chrome/Edge (${cleanEmail}) terdeteksi! Masuk sebagai ${existing.name} (${existing.role}).`,
      };
    }

    // Jika email Chrome/Edge baru (misal asmuliardi@gmail.com atau email guru lain), otomatis set user sesuai email tersebut
    const autoUser: User = {
      id: `usr-sso-${Date.now()}`,
      name: cleanEmail,
      email: cleanEmail,
      telepon: "081200000000",
      role: "Guru",
      mahaliId: "mahali-barat",
      wilayahNama: "Koto Tangah",
      asmenId: "usr-asmen-1",
      assignedHalaqahIds: ["hq-01"],
      supervisedHalaqahIds: [],
      avatar: cleanEmail.substring(0, 2).toUpperCase(),
      skorKesehatan: 85,
      statusKesehatan: "Sehat",
    };

    setAllUsers((prev) => [autoUser, ...prev]);
    setCurrentUser(autoUser);
    return {
      success: true,
      message: `Login Chrome/Edge berhasil! Terdeteksi langsung sebagai user ${cleanEmail}.`,
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem("awanputih_is_authenticated", "false");
    } catch {
      // ignore
    }
  };

  const switchRole = (role: Role, userId?: string) => {
    const target = userId
      ? allUsers.find((u) => u.id === userId)
      : allUsers.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  const toggleFavoriteMenu = (href: string) => {
    setFavoriteMenus((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href].slice(0, 4)
    );
  };

  const markNotifRead = (id: string) => {
    setNotifikasis((prev) => prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n)));
  };

  // Scoped views based on current user
  const scopedHalaqahs = filterHalaqahsByScope(currentUser, allHalaqahs);
  const scopedPemudas = filterPemudasByScope(currentUser, allPemudas, scopedHalaqahs);
  const scopedLaporans = filterReportsByScope(currentUser, allLaporans);
  const scopedPengajuans = filterPengajuanByScope(currentUser, allPengajuans);
  const scopedActionPlans = filterActionPlansByScope(currentUser, allActionPlans);
  const scopedPrioritas = filterPrioritasByScope(currentUser, allPrioritas);
  const scopedIltizamat = filterIltizamatByScope(currentUser, allIltizamat);

  const addAudit = (
    action: string,
    target: string,
    details: string,
    outcome: "SUCCESS" | "DENIED" | "FAILED",
    reason?: string
  ) => {
    const log: AuditLog = {
      id: generateId("aud"),
      actorId: currentUser.id,
      actorNama: currentUser.name,
      actorRole: currentUser.role,
      action,
      target,
      details,
      outcome,
      reason,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
    setLastAutoSaved(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
  };

  // Save Report Draft
  const saveReportDraft = (data: Partial<LaporanPekanan>) => {
    if (periode.status === "Dikunci") {
      return { success: false, message: "Periode penilaian telah dikunci. Perubahan memerlukan pembukaan kembali." };
    }
    if (currentUser.role !== "Guru") {
      addAudit("SAVE_REPORT_DRAFT", "Unauthorized", "Bukan Guru", "DENIED");
      return { success: false, message: "Akses ditolak: Hanya Guru yang dapat menyimpan draf laporan." };
    }

    const halaqah = allHalaqahs.find((h) => h.id === data.halaqahId);
    if (!halaqah || (halaqah.guruId !== currentUser.id && !currentUser.assignedHalaqahIds.includes(halaqah.id))) {
      addAudit("SAVE_REPORT_DRAFT", data.halaqahId || "Unknown", "Kelompok di luar penugasan", "DENIED");
      return { success: false, message: "Akses ditolak: Halaqah ini di luar cakupan Anda." };
    }

    const reportId = data.id || generateId("lap");
    const existingIndex = allLaporans.findIndex((r) => r.id === reportId);

    const newReport: LaporanPekanan = {
      id: reportId,
      periodeId: periode.id,
      periodeLabel: periode.label,
      halaqahId: halaqah.id,
      halaqahNama: halaqah.nama,
      jenisHalaqah: halaqah.jenis,
      guruId: currentUser.id,
      guruNama: currentUser.name,
      asmenId: halaqah.asmenId,
      mahaliId: halaqah.mahaliId,
      status: "Draf",
      verifikasiStatus: "Draft",
      infoUmum: data.infoUmum || { terlaksana: true },
      laporanPemuda: data.laporanPemuda || [],
      ringkasan: data.ringkasan || {
        totalAnggota: data.laporanPemuda?.length || 0,
        totalHadir: data.laporanPemuda?.filter((p) => p.kehadiran === "Hadir").length || 0,
        totalIzin: data.laporanPemuda?.filter((p) => p.kehadiran === "Izin").length || 0,
        totalSakit: data.laporanPemuda?.filter((p) => p.kehadiran === "Sakit").length || 0,
        totalAlpa: data.laporanPemuda?.filter((p) => p.kehadiran === "Alpa").length || 0,
        persentaseKehadiran: 0,
        totalSpp: data.laporanPemuda?.reduce((acc, curr) => acc + (curr.sppNominal || 0), 0) || 0,
        kelengkapanPersen: 80,
      },
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const updated = [...allLaporans];
      updated[existingIndex] = newReport;
      setAllLaporans(updated);
    } else {
      setAllLaporans([newReport, ...allLaporans]);
    }

    addAudit("SAVE_REPORT_DRAFT", `${newReport.id} / ${halaqah.nama}`, "Draf sub-laporan disimpan otomatis", "SUCCESS");
    return {
      success: true,
      message: isWeakNetwork
        ? "Tersimpan di memori lokal HP (Mode Jaringan Lemah). Akan disinkronkan saat sinyal stabil."
        : "Draf laporan berhasil disimpan.",
      reportId,
    };
  };

  // Submit Report
  const submitReport = (data: Partial<LaporanPekanan>) => {
    if (periode.status === "Dikunci") {
      return { success: false, message: "Periode telah dikunci, tidak dapat mengirim atau mengubah laporan." };
    }
    if (currentUser.role !== "Guru") {
      addAudit("SUBMIT_REPORT", "Unauthorized", "Bukan Guru", "DENIED");
      return { success: false, message: "Akses ditolak: Hanya Guru yang dapat mengirim laporan." };
    }

    const halaqah = allHalaqahs.find((h) => h.id === data.halaqahId);
    if (!halaqah || (halaqah.guruId !== currentUser.id && !currentUser.assignedHalaqahIds.includes(halaqah.id))) {
      addAudit("SUBMIT_REPORT", data.halaqahId || "Unknown", "Kelompok di luar penugasan", "DENIED");
      return { success: false, message: "Akses ditolak: Halaqah di luar cakupan Anda." };
    }

    if (data.infoUmum?.terlaksana === false && !data.infoUmum?.alasanTidakTerlaksana?.trim()) {
      return { success: false, message: "Validasi gagal: Alasan tidak terlaksana wajib diisi." };
    }

    const reportId = data.id || generateId("lap");
    const existing = allLaporans.find((r) => r.id === reportId);
    if (existing && existing.verifikasiStatus === "Diverifikasi") {
      return { success: false, message: "Laporan sudah diverifikasi Asmen dan bersifat baca-saja." };
    }

    const pemudas = data.laporanPemuda || [];
    const totalAnggota = pemudas.length;
    const totalHadir = pemudas.filter((p) => p.kehadiran === "Hadir").length;
    const totalIzin = pemudas.filter((p) => p.kehadiran === "Izin").length;
    const totalSakit = pemudas.filter((p) => p.kehadiran === "Sakit").length;
    const totalAlpa = pemudas.filter((p) => p.kehadiran === "Alpa").length;
    const persentase = totalAnggota > 0 ? Math.round((totalHadir / totalAnggota) * 1000) / 10 : 0;
    const totalSpp = pemudas.reduce((acc, curr) => acc + (curr.sppNominal || 0), 0);

    const submittedReport: LaporanPekanan = {
      id: reportId,
      periodeId: periode.id,
      periodeLabel: periode.label,
      halaqahId: halaqah.id,
      halaqahNama: halaqah.nama,
      jenisHalaqah: halaqah.jenis,
      guruId: currentUser.id,
      guruNama: currentUser.name,
      asmenId: halaqah.asmenId,
      mahaliId: halaqah.mahaliId,
      status: "Submitted",
      verifikasiStatus: "Dikirim",
      infoUmum: data.infoUmum || { terlaksana: true },
      laporanPemuda: pemudas,
      ringkasan: {
        totalAnggota,
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlpa,
        persentaseKehadiran: persentase,
        totalSpp,
        kelengkapanPersen: 100,
      },
      submittedAt: new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = allLaporans.findIndex((r) => r.id === reportId);
    if (existingIndex >= 0) {
      const updated = [...allLaporans];
      updated[existingIndex] = submittedReport;
      setAllLaporans(updated);
    } else {
      setAllLaporans([submittedReport, ...allLaporans]);
    }

    addAudit(
      "SUBMIT_REPORT",
      `${submittedReport.id} / ${halaqah.nama}`,
      `Laporan pekanan dikirim ke Asmen (Kehadiran: ${persentase}%, Iltizamat: Rp ${totalSpp})`,
      "SUCCESS"
    );

    return { success: true, message: "Laporan pekanan berhasil dikirim ke Asmen untuk diverifikasi!", reportId };
  };

  // Asmen Verifies or Returns Report per Kelompok
  const verifyLaporan = (
    reportId: string,
    keputusan: "Diverifikasi" | "Perlu Perbaikan",
    catatan?: string
  ) => {
    if (currentUser.role !== "Asmen") {
      return { success: false, message: "Hanya Asmen yang berwenang memverifikasi laporan Guru." };
    }
    if (keputusan === "Perlu Perbaikan" && !catatan?.trim()) {
      return { success: false, message: "Catatan perbaikan wajib diisi saat mengembalikan laporan ke Guru." };
    }

    const target = allLaporans.find((r) => r.id === reportId);
    if (!target) return { success: false, message: "Laporan tidak ditemukan." };

    setAllLaporans((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: keputusan === "Perlu Perbaikan" ? "Draf" : "Submitted",
              verifikasiStatus: keputusan,
              catatanAsmen: catatan?.trim() || r.catatanAsmen,
              verifiedBy: currentUser.name,
              verifiedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    addAudit(
      "VERIFY_REPORT",
      `${reportId} / ${target.halaqahNama}`,
      `Asmen menetapkan status laporan menjadi '${keputusan}'${catatan ? `: "${catatan}"` : ""}`,
      "SUCCESS",
      catatan
    );

    return {
      success: true,
      message:
        keputusan === "Diverifikasi"
          ? `Laporan ${target.halaqahNama} berhasil diverifikasi dan masuk perhitungan KPI!`
          : `Laporan ${target.halaqahNama} dikembalikan ke Guru disertai catatan perbaikan.`,
    };
  };

  // Guru 1-Tap Quick Activity Log -> Auto populates Weekly Report & Youth State
  const quickLogGuruActivity = (payload: {
    tipe: "PERTEMUAN" | "KONTROL" | "KONTAK" | "SPP" | "MEDIA";
    halaqahId?: string;
    pemudaId?: string;
    materi?: string;
    catatan?: string;
    nominalSpp?: number;
  }) => {
    if (
      (payload.tipe === "KONTROL" || payload.tipe === "KONTAK" || payload.tipe === "SPP") &&
      payload.pemudaId
    ) {
      const pm = allPemudas.find((p) => p.id === payload.pemudaId);
      if (!pm) return { success: false, message: "Pemuda tidak ditemukan." };

      setAllPemudas((prev) =>
        prev.map((p) =>
          p.id === pm.id
            ? {
                ...p,
                terakhirKontrol: payload.tipe === "KONTROL" ? "Hari ini" : p.terakhirKontrol,
                terakhirKontak: payload.tipe === "KONTAK" ? "Hari ini" : p.terakhirKontak,
                perluPerhatian: payload.tipe === "KONTROL" || payload.tipe === "KONTAK" ? false : p.perluPerhatian,
                catatan: payload.catatan || p.catatan,
              }
            : p
        )
      );

      // Also sync into active report draft for that halaqah
      setAllLaporans((prev) =>
        prev.map((rep) => {
          if (rep.halaqahId === pm.halaqahId && rep.periodeId === periode.id) {
            const updatedItems = rep.laporanPemuda.map((item) => {
              if (item.pemudaId === pm.id) {
                return {
                  ...item,
                  kontrolPekanan:
                    payload.tipe === "KONTROL"
                      ? {
                          tilawah: true,
                          shalatJamaah: true,
                          qiyamulLail: true,
                          shaumSunnah: false,
                          catatan: payload.catatan || "Sudah dikontrol via Input Cepat",
                        }
                      : item.kontrolPekanan,
                  kontakPersonal: payload.tipe === "KONTAK" ? true : item.kontakPersonal,
                  catatanKontak: payload.tipe === "KONTAK" ? payload.catatan || "Dihubungi personal" : item.catatanKontak,
                  sppNominal:
                    payload.tipe === "SPP" && payload.nominalSpp !== undefined
                      ? payload.nominalSpp
                      : item.sppNominal,
                };
              }
              return item;
            });
            const totalSpp = updatedItems.reduce((a, b) => a + (b.sppNominal || 0), 0);
            return {
              ...rep,
              laporanPemuda: updatedItems,
              ringkasan: {
                ...rep.ringkasan,
                totalSpp,
                kelengkapanPersen: Math.min(100, (rep.ringkasan.kelengkapanPersen || 75) + 15),
              },
              updatedAt: new Date().toISOString(),
            };
          }
          return rep;
        })
      );

      addAudit(
        `QUICK_INPUT_${payload.tipe}`,
        `${pm.nama} (${pm.halaqahId})`,
        `Guru mencatat ${payload.tipe} untuk ${pm.nama} — otomatis masuk ke sub-laporan pekanan`,
        "SUCCESS"
      );

      return {
        success: true,
        message: `Data ${payload.tipe} untuk ${pm.nama} tersimpan & otomatis masuk ke Laporan Pekanan!`,
      };
    }

    if (payload.tipe === "MEDIA" && payload.halaqahId) {
      const hq = allHalaqahs.find((h) => h.id === payload.halaqahId);
      setAllLaporans((prev) =>
        prev.map((rep) =>
          rep.halaqahId === payload.halaqahId
            ? {
                ...rep,
                laporanPemuda: rep.laporanPemuda.map((m) => ({
                  ...m,
                  buletinCetak: true,
                  buletinDigital: true,
                })),
                ringkasan: {
                  ...rep.ringkasan,
                  kelengkapanPersen: Math.min(100, (rep.ringkasan.kelengkapanPersen || 80) + 10),
                },
              }
            : rep
        )
      );
      addAudit(
        "QUICK_INPUT_MEDIA",
        hq?.nama || payload.halaqahId,
        `Distribusi Buletin Cetak & Digital dicatat untuk kelompok ${hq?.nama}`,
        "SUCCESS"
      );
      return {
        success: true,
        message: `Distribusi Media untuk ${hq?.nama || "Halaqah"} tersimpan & masuk ke Laporan Pekanan!`,
      };
    }

    return { success: true, message: "Aktivitas berhasil dicatat dan disinkronkan ke laporan!" };
  };

  // Asmen logs Guru Control
  const addKontrolGuruLog = (data: Omit<KontrolGuruLog, "id" | "asmenId" | "asmenNama">) => {
    const newLog: KontrolGuruLog = {
      ...data,
      id: generateId("kg"),
      asmenId: currentUser.id,
      asmenNama: currentUser.name,
    };
    setKontrolGuruLogs((prev) => [newLog, ...prev]);

    if (data.perluActionPlan) {
      const autoPlan: ActionPlan = {
        id: generateId("ap"),
        judul: `Tindak Lanjut Kontrol: ${data.topik}`,
        sumberMasalah: `Hasil Kontrol Guru (${data.tanggal})`,
        level: "ASMEN_TO_GURU",
        pemberiId: currentUser.id,
        pemberiNama: currentUser.name,
        picId: data.guruId,
        picNama: data.guruNama,
        asmenId: currentUser.id,
        mahaliId: currentUser.mahaliId || "mahali-barat",
        tindakan: data.tindakLanjut,
        targetHasil: data.kesepakatan,
        indikatorSelesai: "Evaluasi kontrol berikutnya tuntas",
        prioritas: data.perluEskalasi ? "Kritis" : "Tinggi",
        deadline: data.tanggalEvaluasi,
        progres: 0,
        status: "Belum Dimulai",
        buktiDiminta: "Catatan progres pada laporan pekanan",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAllActionPlans((prev) => [autoPlan, ...prev]);
    }

    addAudit(
      "CATAT_KONTROL_GURU",
      `${data.guruNama}`,
      `Asmen mencatat kontrol Guru (${data.media}) — Topik: ${data.topik}`,
      "SUCCESS"
    );

    return {
      success: true,
      message: data.perluActionPlan
        ? "Catatan Kontrol Guru disimpan & otomatis dibuatkan Tugas/Action Plan untuk Guru!"
        : "Catatan Kontrol Guru berhasil disimpan.",
    };
  };

  // Create Action Plan (Manajer -> Asmen or Asmen -> Guru)
  const createActionPlan = (data: {
    judul: string;
    sumberMasalah: string;
    picId: string;
    tindakan: string;
    targetHasil: string;
    indikatorSelesai: string;
    prioritas: PriorityLevel;
    deadline: string;
    buktiDiminta: string;
    halaqahId?: string;
  }) => {
    const picUser = allUsers.find((u) => u.id === data.picId);
    if (!picUser) return { success: false, message: "PIC tidak ditemukan." };

    const level = currentUser.role === "Manager" ? "MANAJER_TO_ASMEN" : "ASMEN_TO_GURU";
    const newPlan: ActionPlan = {
      id: generateId("ap"),
      judul: data.judul,
      sumberMasalah: data.sumberMasalah,
      level,
      pemberiId: currentUser.id,
      pemberiNama: currentUser.name,
      picId: picUser.id,
      picNama: picUser.name,
      asmenId: level === "MANAJER_TO_ASMEN" ? picUser.id : currentUser.id,
      mahaliId: currentUser.mahaliId || "mahali-barat",
      halaqahId: data.halaqahId,
      tindakan: data.tindakan,
      targetHasil: data.targetHasil,
      indikatorSelesai: data.indikatorSelesai,
      prioritas: data.prioritas,
      deadline: data.deadline,
      progres: 0,
      status: "Belum Dimulai",
      buktiDiminta: data.buktiDiminta,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAllActionPlans((prev) => [newPlan, ...prev]);
    addAudit(
      "CREATE_ACTION_PLAN",
      `${newPlan.id} / PIC: ${picUser.name}`,
      `Membuat Action Plan (${data.prioritas}): ${data.judul}`,
      "SUCCESS"
    );

    return { success: true, message: `Action Plan untuk ${picUser.name} berhasil dibuat!` };
  };

  const updateActionPlanProgress = (
    planId: string,
    progres: number,
    catatanProgres: string,
    siapEvaluasi?: boolean
  ) => {
    setAllActionPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        const nextStatus: ActionPlanStatus =
          siapEvaluasi || progres >= 100
            ? "Menunggu Evaluasi"
            : progres > 0
            ? "Berjalan"
            : "Belum Dimulai";
        return {
          ...p,
          progres,
          catatanProgres,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAudit("UPDATE_ACTION_PLAN", planId, `Progres diperbarui menjadi ${progres}%`, "SUCCESS");
    return { success: true, message: "Progres tugas berhasil diperbarui!" };
  };

  const evaluateActionPlan = (
    planId: string,
    keputusan: "Selesai" | "Berjalan" | "Dibatalkan",
    catatanEvaluasi: string
  ) => {
    setAllActionPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              status: keputusan,
              progres: keputusan === "Selesai" ? 100 : p.progres,
              catatanEvaluasi,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    addAudit("EVALUATE_ACTION_PLAN", planId, `Evaluasi pimpinan: ${keputusan} — ${catatanEvaluasi}`, "SUCCESS");
    return { success: true, message: `Status Action Plan diperbarui menjadi '${keputusan}'.` };
  };

  // PJ Mal Actions
  const recordPembayaranIltizamat = (data: {
    iltizamatId: string;
    nominal: number;
    metode: "Transfer" | "Tunai";
    catatan?: string;
  }) => {
    const rec = allIltizamat.find((i) => i.id === data.iltizamatId);
    if (!rec) return { success: false, message: "Data kewajiban tidak ditemukan." };

    const isPjMal = currentUser.role === "PJ Mal";
    const trx: PembayaranTransaksi = {
      id: generateId("trx"),
      nomorTransaksi: `ILZ-KT-202608-00${pembayaranTransaksis.length + 46}`,
      iltizamatId: rec.id,
      pemudaId: rec.pemudaId,
      pemudaNama: rec.pemudaNama,
      guruNama: rec.guruNama,
      periodeBulan: rec.periodeBulan,
      nominal: data.nominal,
      tanggal: new Date().toISOString().split("T")[0],
      metode: data.metode,
      sumberInfo: isPjMal ? "PJ Mal" : "Guru",
      buktiUrl: `Bukti-${data.metode}-${Date.now().toString().slice(-4)}.jpg`,
      statusVerifikasi: isPjMal ? "Terverifikasi" : "Menunggu Verifikasi",
      catatan: data.catatan,
    };

    setPembayaranTransaksis((prev) => [trx, ...prev]);

    const newTerbayar = rec.terbayarNominal + data.nominal;
    const newStatusBayar: StatusBayarIltizamat =
      newTerbayar >= rec.targetNominal ? "Lunas" : newTerbayar > 0 ? "Sebagian" : "Belum Membayar";

    setAllIltizamat((prev) =>
      prev.map((i) =>
        i.id === rec.id
          ? {
              ...i,
              terbayarNominal: newTerbayar,
              statusBayar: newStatusBayar,
              statusKomunikasi: newStatusBayar === "Lunas" ? "Selesai" : "Sudah Merespons",
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );

    addAudit(
      "RECORD_ILTIZAMAT_PAYMENT",
      `${trx.nomorTransaksi} / ${rec.pemudaNama}`,
      `Mencatat pembayaran Rp ${data.nominal} (${data.metode}) — Status: ${newStatusBayar}`,
      "SUCCESS"
    );

    return {
      success: true,
      message: `Pembayaran ${rec.pemudaNama} sebesar Rp ${data.nominal.toLocaleString("id-ID")} berhasil dicatat!`,
    };
  };

  const verifyPembayaranIltizamat = (
    trxId: string,
    status: "Terverifikasi" | "Perlu Koreksi"
  ) => {
    const trx = pembayaranTransaksis.find((t) => t.id === trxId);
    if (!trx) return { success: false, message: "Transaksi tidak ditemukan." };

    setPembayaranTransaksis((prev) =>
      prev.map((t) => (t.id === trxId ? { ...t, statusVerifikasi: status } : t))
    );

    addAudit(
      "VERIFY_ILTIZAMAT_PAYMENT",
      `${trx.nomorTransaksi} / ${trx.pemudaNama}`,
      `PJ Mal memverifikasi transaksi menjadi '${status}'`,
      "SUCCESS"
    );

    return { success: true, message: `Transaksi ${trx.nomorTransaksi} telah ditetapkan '${status}'.` };
  };

  const updateKomunikasiIltizamat = (
    iltizamatId: string,
    statusKomunikasi: StatusKomunikasiIltizamat,
    statusBayar?: StatusBayarIltizamat,
    tanggalJanji?: string,
    catatan?: string
  ) => {
    setAllIltizamat((prev) =>
      prev.map((i) =>
        i.id === iltizamatId
          ? {
              ...i,
              statusKomunikasi,
              statusBayar: statusBayar || i.statusBayar,
              tanggalJanji: tanggalJanji !== undefined ? tanggalJanji : i.tanggalJanji,
              catatanTindakLanjut: catatan || i.catatanTindakLanjut,
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );
    addAudit(
      "UPDATE_ILTIZAMAT_STATUS",
      iltizamatId,
      `Update status komunikasi: ${statusKomunikasi}${tanggalJanji ? ` (Janji: ${tanggalJanji})` : ""}`,
      "SUCCESS"
    );
    return { success: true, message: "Status komunikasi & janji bayar syabab diperbarui." };
  };

  const createDistribusiDana = (data: {
    tujuan: string;
    penerima: string;
    nominal: number;
    metode: "Transfer" | "Tunai";
  }) => {
    const dist: DistribusiDana = {
      id: generateId("dist"),
      nomorDistribusi: `DST-KT-202608-00${distribusiDanas.length + 1}`,
      tanggal: new Date().toISOString().split("T")[0],
      sumberPeriode: "Agustus 2026",
      tujuan: data.tujuan,
      penerima: data.penerima,
      nominal: data.nominal,
      metode: data.metode,
      status: "Selesai",
      bukti: `Bukti-Distribusi-00${distribusiDanas.length + 1}.pdf`,
    };
    setDistribusiDanas((prev) => [dist, ...prev]);
    addAudit(
      "CREATE_DISTRIBUSI_DANA",
      dist.nomorDistribusi,
      `Distribusi dana Rp ${data.nominal} untuk ${data.tujuan}`,
      "SUCCESS"
    );
    return { success: true, message: "Distribusi dana Iltizamat berhasil dicatat!" };
  };

  // Create or Update Proposal
  const createPengajuan = (
    payload: PengajuanPayload,
    tipe: "CREATE" | "UPDATE",
    targetHalaqahId?: string,
    catatanPemohon?: string
  ) => {
    if (tipe === "CREATE") {
      addAudit("CREATE_PROPOSAL", "Blocked", "Guru tidak boleh membuat halaqah baru", "DENIED");
      return {
        success: false,
        message: "Pengajuan halaqah baru pada Guru telah dihapus. Perhalaqahan dibuat oleh Asmen dan Manajer.",
      };
    }

    if (currentUser.role !== "Guru") {
      addAudit("CREATE_PROPOSAL", "Unauthorized", "Bukan Guru", "DENIED");
      return { success: false, message: "Akses ditolak: Hanya Guru yang dapat mengajukan update data halaqahnya." };
    }

    if (!payload.nama?.trim() || !payload.hari || !payload.jam || !payload.materi?.trim()) {
      return { success: false, message: "Validasi gagal: Nama halaqah, hari, jam, dan materi wajib diisi." };
    }

    const activeMembers = payload.anggota.filter((m) => m.action !== "REMOVE");
    if (activeMembers.length === 0) {
      return { success: false, message: "Validasi gagal: Halaqah wajib memiliki minimal 1 murid." };
    }
    if (activeMembers.length > 5) {
      return { success: false, message: "Validasi gagal: Jumlah anggota/murid halaqah maksimum hanya 5 orang." };
    }

    let targetHalaqah: Halaqah | undefined;
    let asmenId = currentUser.asmenId || "usr-asmen-1";

    if (tipe === "UPDATE") {
      if (!targetHalaqahId) {
        return { success: false, message: "Target halaqah tidak ditemukan." };
      }
      targetHalaqah = allHalaqahs.find((h) => h.id === targetHalaqahId);
      if (!targetHalaqah || (targetHalaqah.guruId !== currentUser.id && !currentUser.assignedHalaqahIds.includes(targetHalaqah.id))) {
        addAudit("CREATE_PROPOSAL", targetHalaqahId, "Mencoba edit halaqah milik guru lain", "DENIED");
        return { success: false, message: "Akses ditolak: Anda hanya dapat mengajukan perubahan halaqah sendiri." };
      }
      asmenId = targetHalaqah.asmenId;
    }

    const diffFieldChanges = [];
    const addedMembers: string[] = [];
    const removedMembers: string[] = [];

    if (targetHalaqah) {
      if (payload.nama !== targetHalaqah.nama) {
        diffFieldChanges.push({ field: "nama", label: "Nama Halaqah", oldValue: targetHalaqah.nama, newValue: payload.nama });
      }
      if (payload.hari !== targetHalaqah.hari) {
        diffFieldChanges.push({ field: "hari", label: "Hari Pertemuan", oldValue: targetHalaqah.hari, newValue: payload.hari });
      }
      if (payload.jam !== targetHalaqah.jam) {
        diffFieldChanges.push({ field: "jam", label: "Jam Pertemuan", oldValue: targetHalaqah.jam, newValue: payload.jam });
      }
      if (payload.tempat !== targetHalaqah.tempat) {
        diffFieldChanges.push({ field: "tempat", label: "Tempat Pertemuan", oldValue: targetHalaqah.tempat, newValue: payload.tempat });
      }
      if (payload.materi !== targetHalaqah.materi) {
        diffFieldChanges.push({ field: "materi", label: "Buku / Kurikulum", oldValue: targetHalaqah.materi, newValue: payload.materi });
      }

      payload.anggota.forEach((m) => {
        if (m.action === "ADD") {
          addedMembers.push(`${m.nama} (${m.telepon})`);
        } else if (m.action === "REMOVE") {
          removedMembers.push(`${m.nama} (${m.telepon})`);
        } else if (m.action === "KEEP" && m.id) {
          const orig = allPemudas.find((p) => p.id === m.id);
          if (orig && (orig.nama !== m.nama || orig.telepon !== m.telepon)) {
            diffFieldChanges.push({
              field: `murid_${m.id}`,
              label: `Update Nama/WA Murid (${orig.nama})`,
              oldValue: `${orig.nama} (${orig.telepon})`,
              newValue: `${m.nama} (${m.telepon})`,
            });
          }
        }
      });
    }

    const pengajuanId = generateId("req");
    const newPengajuan: PengajuanHalaqah = {
      id: pengajuanId,
      tipe,
      pemohonId: currentUser.id,
      pemohonNama: currentUser.name,
      targetHalaqahId,
      versiSumber: targetHalaqah ? targetHalaqah.versi : undefined,
      asmenId,
      status: "Menunggu Validasi",
      payload,
      diff:
        tipe === "UPDATE"
          ? { fieldChanges: diffFieldChanges, addedMembers, removedMembers }
          : undefined,
      catatanPemohon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAllPengajuans([newPengajuan, ...allPengajuans]);

    addAudit(
      "SUBMIT_PROPOSAL",
      `${pengajuanId} / ${payload.nama}`,
      `Guru mengajukan perubahan data halaqah (waktu/murid) ke AJM`,
      "SUCCESS"
    );

    return {
      success: true,
      message: "Pengajuan perubahan berhasil dikirim ke AJM (Asmen) untuk divalidasi.",
      pengajuanId,
    };
  };

  const approvePengajuan = (pengajuanId: string) => {
    if (currentUser.role !== "Asmen") {
      addAudit("APPROVE_PROPOSAL", pengajuanId, "Bukan Asmen", "DENIED");
      return { success: false, message: "Akses ditolak: Hanya AJM / Asisten Manager yang berwenang memvalidasi pengajuan." };
    }

    const pengajuan = allPengajuans.find((p) => p.id === pengajuanId);
    if (!pengajuan) return { success: false, message: "Pengajuan tidak ditemukan." };

    if (pengajuan.pemohonId === currentUser.id) {
      addAudit("APPROVE_PROPOSAL", pengajuanId, "Mencoba self-approval", "DENIED");
      return { success: false, message: "Akses ditolak: Pemohon dilarang menyetujui pengajuannya sendiri." };
    }

    if (pengajuan.asmenId !== currentUser.id) {
      addAudit("APPROVE_PROPOSAL", pengajuanId, "Di luar binaan Asmen", "DENIED");
      return { success: false, message: "Akses ditolak: Pengajuan ini di luar cakupan binaan Anda." };
    }

    if (pengajuan.status !== "Menunggu Validasi") {
      return { success: false, message: `Pengajuan sudah berstatus '${pengajuan.status}' dan tidak dapat diproses ulang.` };
    }

    if (pengajuan.tipe === "CREATE") {
      const newHalaqahId = generateId("hq");
      const memberIds: string[] = [];
      const newMembers: Pemuda[] = [];

      pengajuan.payload.anggota.slice(0, 5).forEach((m) => {
        const pId = generateId("pm");
        memberIds.push(pId);
        newMembers.push({
          id: pId,
          nama: m.nama,
          telepon: m.telepon,
          status: "Aktif",
          jenjang: "Pelajar",
          halaqahId: newHalaqahId,
          targetIltizamat: 50000,
        });
      });

      const newHalaqah: Halaqah = {
        id: newHalaqahId,
        kode: `HK-${allHalaqahs.length + 1}`,
        nama: pengajuan.payload.nama,
        jenis: "Pelajar",
        guruId: pengajuan.pemohonId,
        guruNama: pengajuan.pemohonNama,
        asmenId: currentUser.id,
        mahaliId: currentUser.mahaliId || "mahali-barat",
        hari: pengajuan.payload.hari,
        jam: pengajuan.payload.jam,
        tempat: pengajuan.payload.tempat,
        materi: pengajuan.payload.materi,
        anggotaIds: memberIds,
        versi: 1,
        status: "Aktif",
        kesehatan: "Sehat",
        rataKehadiran: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAllPemudas((prev) => [...prev, ...newMembers]);
      setAllHalaqahs((prev) => [newHalaqah, ...prev]);
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === pengajuan.pemohonId
            ? { ...u, assignedHalaqahIds: [...u.assignedHalaqahIds, newHalaqahId] }
            : u
        )
      );
    } else if (pengajuan.tipe === "UPDATE" && pengajuan.targetHalaqahId) {
      const target = allHalaqahs.find((h) => h.id === pengajuan.targetHalaqahId);
      if (!target) return { success: false, message: "Target halaqah tidak ditemukan." };

      if (pengajuan.versiSumber !== undefined && target.versi !== pengajuan.versiSumber) {
        return {
          success: false,
          message: "Konflik versi: Halaqah telah diubah sebelumnya. Harap periksa versi terbaru.",
        };
      }

      let updatedMemberIds = [...target.anggotaIds];
      const newMembersToAdd: Pemuda[] = [];
      const renamedMembersMap = new Map<string, { nama: string; telepon: string }>();

      pengajuan.payload.anggota.forEach((m) => {
        if (m.action === "ADD") {
          const pId = generateId("pm");
          updatedMemberIds.push(pId);
          newMembersToAdd.push({
            id: pId,
            nama: m.nama,
            telepon: m.telepon,
            status: "Aktif",
            jenjang: target.jenis === "Karyawan" ? "Karyawan" : "Pelajar",
            halaqahId: target.id,
            targetIltizamat: target.jenis === "Karyawan" ? 200000 : 50000,
          });
        } else if (m.action === "REMOVE" && m.id) {
          updatedMemberIds = updatedMemberIds.filter((id) => id !== m.id);
        } else if (m.action === "KEEP" && m.id) {
          renamedMembersMap.set(m.id, { nama: m.nama, telepon: m.telepon });
        }
      });

      updatedMemberIds = updatedMemberIds.slice(0, 5);

      setAllPemudas((prev) => {
        const updatedExisting = prev.map((p) => {
          const upd = renamedMembersMap.get(p.id);
          if (upd) {
            return { ...p, nama: upd.nama, telepon: upd.telepon };
          }
          return p;
        });
        return [...updatedExisting, ...newMembersToAdd];
      });

      const updatedHalaqah: Halaqah = {
        ...target,
        nama: pengajuan.payload.nama,
        hari: pengajuan.payload.hari,
        jam: pengajuan.payload.jam,
        tempat: pengajuan.payload.tempat,
        materi: pengajuan.payload.materi,
        anggotaIds: updatedMemberIds,
        versi: target.versi + 1,
        updatedAt: new Date().toISOString(),
      };

      setAllHalaqahs((prev) =>
        prev.map((h) => (h.id === updatedHalaqah.id ? updatedHalaqah : h))
      );
    }

    setAllPengajuans((prev) =>
      prev.map((p) =>
        p.id === pengajuanId
          ? {
              ...p,
              status: "Disetujui",
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    addAudit(
      "APPROVE_PROPOSAL",
      `${pengajuanId} / ${pengajuan.payload.nama}`,
      `AJM menyetujui pengajuan ${pengajuan.tipe}. Master halaqah & murid aktif diperbarui secara atomik.`,
      "SUCCESS"
    );

    return { success: true, message: "Pengajuan berhasil disetujui AJM dan data master kelompok telah aktif!" };
  };

  const returnPengajuan = (pengajuanId: string, alasan: string) => {
    if (currentUser.role !== "Asmen") {
      addAudit("RETURN_PROPOSAL", pengajuanId, "Bukan Asmen", "DENIED");
      return { success: false, message: "Akses ditolak: Hanya Asisten Manager yang berwenang mengembalikan pengajuan." };
    }

    if (!alasan || !alasan.trim()) {
      return { success: false, message: "Validasi gagal: Alasan pengembalian wajib diisi secara jelas." };
    }

    const pengajuan = allPengajuans.find((p) => p.id === pengajuanId);
    if (!pengajuan) return { success: false, message: "Pengajuan tidak ditemukan." };

    setAllPengajuans((prev) =>
      prev.map((p) =>
        p.id === pengajuanId
          ? {
              ...p,
              status: "Dikembalikan untuk Revisi",
              alasanPengembalian: alasan.trim(),
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    addAudit(
      "RETURN_PROPOSAL",
      `${pengajuanId} / ${pengajuan.payload.nama}`,
      `Asmen mengembalikan pengajuan untuk revisi. Alasan: "${alasan.trim()}"`,
      "SUCCESS",
      alasan.trim()
    );

    return { success: true, message: "Pengajuan telah dikembalikan ke Guru disertai catatan revisi." };
  };

  // =========================================================
  // ADMIN FULL CRUD IMPLEMENTATION
  // =========================================================

  const updateUserRoleAndScope = (
    userId: string,
    role: Role,
    mahaliId?: string,
    asmenId?: string,
    assignedHalaqahIds?: string[],
    supervisedHalaqahIds?: string[]
  ) => {
    if (currentUser.role !== "Admin") {
      addAudit("UPDATE_ASSIGNMENTS", userId, "Bukan Admin", "DENIED");
      return { success: false, message: "Akses ditolak: Hanya Admin yang dapat mengelola akun dan penugasan." };
    }

    const userToUpdate = allUsers.find((u) => u.id === userId);
    if (!userToUpdate) return { success: false, message: "User tidak ditemukan." };

    const updatedUser: User = {
      ...userToUpdate,
      role,
      mahaliId: mahaliId ?? userToUpdate.mahaliId,
      asmenId: asmenId ?? userToUpdate.asmenId,
      assignedHalaqahIds: assignedHalaqahIds ?? userToUpdate.assignedHalaqahIds,
      supervisedHalaqahIds: supervisedHalaqahIds ?? userToUpdate.supervisedHalaqahIds,
    };

    setAllUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    if (currentUser.id === userId) setCurrentUser(updatedUser);

    addAudit(
      "UPDATE_ASSIGNMENTS",
      `${userId} / ${userToUpdate.name}`,
      `Admin mengubah role menjadi ${role} dan memperbarui penugasan cakupan.`,
      "SUCCESS"
    );

    return { success: true, message: "Penugasan akun dan cakupan berhasil diperbarui!" };
  };

  const createUserAdmin = (data: Partial<User>) => {
    if (!data.name?.trim() || !data.email?.trim() || !data.role) {
      return { success: false, message: "Nama, email, dan role wajib diisi." };
    }
    if (currentUser.role === "Asmen" && data.role !== "Guru") {
      return {
        success: false,
        message: "Kewenangan Admin AJM / Asmen hanya terbatas pada penambahan & pengelolaan akun Guru.",
      };
    }
    const newUser: User = {
      id: generateId("usr"),
      name: data.name.trim(),
      email: data.email.trim(),
      telepon: data.telepon || "",
      role: currentUser.role === "Asmen" ? "Guru" : data.role,
      mahaliId: data.mahaliId || currentUser.mahaliId || "mahali-barat",
      wilayahNama: data.wilayahNama || currentUser.wilayahNama || "Wilayah Utama",
      asmenId: currentUser.role === "Asmen" ? currentUser.id : data.asmenId,
      assignedHalaqahIds: data.assignedHalaqahIds || [],
      supervisedHalaqahIds: data.supervisedHalaqahIds || [],
      avatar: data.name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase(),
      skorKesehatan: 85,
      statusKesehatan: "Sehat",
    };
    setAllUsers((prev) => [newUser, ...prev]);
    addAudit(
      "ADMIN_CREATE_USER",
      `${newUser.id} / ${newUser.name}`,
      `${currentUser.role} menambahkan akun ${newUser.role} baru (${newUser.email})`,
      "SUCCESS"
    );
    return { success: true, message: `Akun ${newUser.name} (${newUser.email}) berhasil didaftarkan!` };
  };

  const updateUserAdmin = (userId: string, data: Partial<User>) => {
    const existing = allUsers.find((u) => u.id === userId);
    if (!existing) return { success: false, message: "Akun tidak ditemukan." };
    if (currentUser.role === "Asmen" && existing.role !== "Guru") {
      return {
        success: false,
        message: "Kewenangan Admin AJM / Asmen hanya terbatas pada pengelolaan akun Guru.",
      };
    }
    const updated: User = {
      ...existing,
      ...data,
      role: currentUser.role === "Asmen" ? "Guru" : data.role || existing.role,
    };
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    if (currentUser.id === userId) setCurrentUser(updated);
    addAudit("ADMIN_UPDATE_USER", `${userId} / ${updated.name}`, `Memperbarui profil & akses pengguna`, "SUCCESS");
    return { success: true, message: `Data pengguna ${updated.name} berhasil diperbarui!` };
  };

  const deleteUserAdmin = (userId: string) => {
    if (userId === currentUser.id) {
      return { success: false, message: "Tidak dapat menghapus akun yang sedang digunakan." };
    }
    const target = allUsers.find((u) => u.id === userId);
    if (!target) return { success: false, message: "Akun tidak ditemukan." };
    if (currentUser.role === "Asmen" && target.role !== "Guru") {
      return {
        success: false,
        message: "Kewenangan Admin AJM / Asmen hanya terbatas pada pengelolaan akun Guru.",
      };
    }
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    addAudit("ADMIN_DELETE_USER", `${userId} / ${target.name}`, `Menghapus akun pengguna (${target.role})`, "SUCCESS");
    return { success: true, message: `Akun ${target.name} telah dihapus.` };
  };

  // Mahali CRUD
  const createMahaliAdmin = (data: Omit<Mahali, "id">) => {
    if (!data.nama.trim() || !data.kode.trim()) {
      return { success: false, message: "Nama dan kode Mahali wajib diisi." };
    }
    const newMahali: Mahali = {
      id: generateId("mhl"),
      nama: data.nama.trim(),
      kode: data.kode.trim().toUpperCase(),
      targetKehadiran: data.targetKehadiran || 80,
    };
    setAllMahalis((prev) => [...prev, newMahali]);
    addAudit("ADMIN_CREATE_MAHALI", `${newMahali.kode}`, `Menambahkan wilayah Mahali: ${newMahali.nama}`, "SUCCESS");
    return { success: true, message: `Wilayah ${newMahali.nama} berhasil ditambahkan!` };
  };

  const updateMahaliAdmin = (id: string, data: Partial<Mahali>) => {
    setAllMahalis((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    addAudit("ADMIN_UPDATE_MAHALI", id, `Memperbarui data wilayah Mahali`, "SUCCESS");
    return { success: true, message: "Data wilayah Mahali berhasil diperbarui!" };
  };

  const deleteMahaliAdmin = (id: string) => {
    const target = allMahalis.find((m) => m.id === id);
    setAllMahalis((prev) => prev.filter((m) => m.id !== id));
    addAudit("ADMIN_DELETE_MAHALI", id, `Menghapus wilayah Mahali ${target?.nama || id}`, "SUCCESS");
    return { success: true, message: "Data wilayah Mahali telah dihapus." };
  };

  // Halaqah CRUD
  const createHalaqahAdmin = (data: Partial<Halaqah>) => {
    if (!data.nama?.trim() || !data.kode?.trim() || !data.guruId) {
      return { success: false, message: "Kode, nama kelompok, dan Guru pengampu wajib diisi." };
    }
    const guru = allUsers.find((u) => u.id === data.guruId);
    const resolvedAsmenId =
      currentUser.role === "Asmen"
        ? currentUser.id
        : data.asmenId || guru?.asmenId || "usr-asmen-1";
    const newHq: Halaqah = {
      id: generateId("hq"),
      kode: data.kode.trim().toUpperCase(),
      nama: data.nama.trim(),
      jenis: data.jenis || "Pelajar",
      guruId: data.guruId,
      guruNama: guru?.name || data.guruNama || "Guru",
      guruPenggantiNama: data.guruPenggantiNama,
      asmenId: resolvedAsmenId,
      mahaliId: data.mahaliId || guru?.mahaliId || "mahali-barat",
      hari: data.hari || "Jumat",
      jam: data.jam || "19:30 - 21:00 WIB",
      tempat: data.tempat || "Rumah Dakwah",
      materi: data.materi || "Nizhamul Islam",
      anggotaIds: (data.anggotaIds || []).slice(0, 5),
      versi: 1,
      status: data.status || "Aktif",
      kesehatan: data.kesehatan || "Sehat",
      rataKehadiran: data.rataKehadiran ?? 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAllHalaqahs((prev) => [newHq, ...prev]);
    // Also link to Guru's assignedHalaqahIds & Asmen's supervisedHalaqahIds
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === newHq.guruId && !u.assignedHalaqahIds.includes(newHq.id)) {
          return { ...u, assignedHalaqahIds: [...u.assignedHalaqahIds, newHq.id] };
        }
        if (u.id === resolvedAsmenId && !u.supervisedHalaqahIds.includes(newHq.id)) {
          return { ...u, supervisedHalaqahIds: [...u.supervisedHalaqahIds, newHq.id] };
        }
        return u;
      })
    );
    addAudit(
      "ADMIN_CREATE_HALAQAH",
      `${newHq.kode} / ${newHq.nama}`,
      `${currentUser.role} membuat kelompok Halaqah (${newHq.jenis})`,
      "SUCCESS"
    );
    return { success: true, message: `Kelompok ${newHq.nama} berhasil dibuat!` };
  };

  const updateHalaqahAdmin = (id: string, data: Partial<Halaqah>) => {
    const guru = data.guruId ? allUsers.find((u) => u.id === data.guruId) : undefined;
    setAllHalaqahs((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              ...data,
              guruNama: guru ? guru.name : data.guruNama ?? h.guruNama,
              versi: h.versi + 1,
              updatedAt: new Date().toISOString(),
            }
          : h
      )
    );
    addAudit("ADMIN_UPDATE_HALAQAH", id, `${currentUser.role} memperbarui master Halaqah`, "SUCCESS");
    return { success: true, message: "Data master Halaqah berhasil diperbarui!" };
  };

  const deleteHalaqahAdmin = (id: string) => {
    const target = allHalaqahs.find((h) => h.id === id);
    setAllHalaqahs((prev) => prev.filter((h) => h.id !== id));
    setAllUsers((prev) =>
      prev.map((u) => ({
        ...u,
        assignedHalaqahIds: u.assignedHalaqahIds.filter((hid) => hid !== id),
        supervisedHalaqahIds: u.supervisedHalaqahIds.filter((hid) => hid !== id),
      }))
    );
    addAudit("ADMIN_DELETE_HALAQAH", `${id} / ${target?.nama || ""}`, `${currentUser.role} menghapus kelompok Halaqah`, "SUCCESS");
    return { success: true, message: `Kelompok ${target?.nama || ""} berhasil dihapus.` };
  };

  // Pemuda CRUD (Max 5 per Halaqah)
  const createPemudaAdmin = (data: Partial<Pemuda>) => {
    if (!data.nama?.trim() || !data.halaqahId) {
      return { success: false, message: "Nama pemuda dan kelompok Halaqah wajib diisi." };
    }
    const targetHq = allHalaqahs.find((h) => h.id === data.halaqahId);
    if (targetHq && targetHq.anggotaIds.length >= 5) {
      return {
        success: false,
        message: `Kelompok ${targetHq.nama} sudah mencapai batas maksimum 5 anggota/murid.`,
      };
    }
    const newPm: Pemuda = {
      id: generateId("pm"),
      nama: data.nama.trim(),
      telepon: data.telepon || "081200000000",
      status: data.status || "Aktif",
      jenjang: data.jenjang || "Pelajar",
      halaqahId: data.halaqahId,
      catatan: data.catatan,
      perluPerhatian: data.perluPerhatian || false,
      alasanPerhatian: data.alasanPerhatian,
      terakhirKontrol: "Baru terdaftar",
      terakhirKontak: "Baru terdaftar",
      targetIltizamat: data.targetIltizamat ?? (data.jenjang === "Karyawan" ? 200000 : 50000),
    };
    setAllPemudas((prev) => [newPm, ...prev]);
    setAllHalaqahs((prev) =>
      prev.map((h) =>
        h.id === newPm.halaqahId && !h.anggotaIds.includes(newPm.id)
          ? { ...h, anggotaIds: [...h.anggotaIds, newPm.id] }
          : h
      )
    );
    addAudit("ADMIN_CREATE_PEMUDA", `${newPm.id} / ${newPm.nama}`, `${currentUser.role} menambahkan murid baru (${newPm.jenjang})`, "SUCCESS");
    return { success: true, message: `Murid ${newPm.nama} berhasil ditambahkan!` };
  };

  const updatePemudaAdmin = (id: string, data: Partial<Pemuda>) => {
    const oldPm = allPemudas.find((p) => p.id === id);
    if (!oldPm) return { success: false, message: "Data pemuda tidak ditemukan." };

    if (data.halaqahId && data.halaqahId !== oldPm.halaqahId) {
      const targetHq = allHalaqahs.find((h) => h.id === data.halaqahId);
      if (targetHq && targetHq.anggotaIds.length >= 5) {
        return {
          success: false,
          message: `Mutasi gagal: Kelompok ${targetHq.nama} sudah mencapai batas maksimum 5 anggota/murid.`,
        };
      }
    }

    setAllPemudas((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));

    // Handle group mutation if halaqahId changed
    if (data.halaqahId && data.halaqahId !== oldPm.halaqahId) {
      setAllHalaqahs((prev) =>
        prev.map((h) => {
          if (h.id === oldPm.halaqahId) {
            return { ...h, anggotaIds: h.anggotaIds.filter((aid) => aid !== id) };
          }
          if (h.id === data.halaqahId && !h.anggotaIds.includes(id)) {
            return { ...h, anggotaIds: [...h.anggotaIds, id] };
          }
          return h;
        })
      );
    }

    addAudit("ADMIN_UPDATE_PEMUDA", `${id} / ${oldPm.nama}`, `Memperbarui data / mutasi murid`, "SUCCESS");
    return { success: true, message: `Data murid ${data.nama || oldPm.nama} berhasil diperbarui!` };
  };

  const deletePemudaAdmin = (id: string) => {
    const target = allPemudas.find((p) => p.id === id);
    setAllPemudas((prev) => prev.filter((p) => p.id !== id));
    setAllHalaqahs((prev) =>
      prev.map((h) => ({ ...h, anggotaIds: h.anggotaIds.filter((aid) => aid !== id) }))
    );
    addAudit("ADMIN_DELETE_PEMUDA", `${id} / ${target?.nama || ""}`, `Menghapus data murid`, "SUCCESS");
    return { success: true, message: `Data murid ${target?.nama || ""} telah dihapus.` };
  };

  const updateKpiConfigAdmin = (cfg: KpiConfig) => {
    setKpiConfig(cfg);
    addAudit(
      "ADMIN_UPDATE_KPI_CONFIG",
      "Sistem KPI & Ambang Status",
      `Bobot KPI diperbarui (Ambang Sehat: ${cfg.ambangSehat}, Sedang: ${cfg.ambangSedang})`,
      "SUCCESS"
    );
    return { success: true, message: "Konfigurasi Bobot KPI & Ambang Status berhasil disimpan dengan jejak audit!" };
  };

  const toggleLockPeriode = () => {
    const nextStatus = periode.status === "Dikunci" ? "Aktif" : "Dikunci";
    setPeriode({ ...periode, status: nextStatus });
    addAudit(
      "TOGGLE_PERIODE_LOCK",
      periode.id,
      `Status periode penilaian diubah menjadi '${nextStatus}'`,
      "SUCCESS"
    );
    return {
      success: true,
      message:
        nextStatus === "Dikunci"
          ? "Periode penilaian telah DIKUNCI. Laporan tidak dapat diedit tanpa pembukaan kembali."
          : "Periode penilaian telah DIBUKA KEMBALI.",
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        detectedBrowserEmail,
        setDetectedBrowserEmail,
        loginWithTestAccount,
        loginWithBrowserEmail,
        logout,
        allUsers,
        allMahalis,
        setCurrentUser,
        switchRole,
        periode,
        allHalaqahs,
        scopedHalaqahs,
        allPemudas,
        scopedPemudas,
        allLaporans,
        scopedLaporans,
        allPengajuans,
        scopedPengajuans,
        allActionPlans,
        scopedActionPlans,
        allPrioritas,
        scopedPrioritas,
        kontrolGuruLogs,
        allIltizamat,
        scopedIltizamat,
        pembayaranTransaksis,
        distribusiDanas,
        notifikasis,
        kpiConfig,
        auditLogs,
        isWeakNetwork,
        setIsWeakNetwork,
        lastAutoSaved,
        favoriteMenus,
        toggleFavoriteMenu,
        markNotifRead,
        saveReportDraft,
        submitReport,
        verifyLaporan,
        createPengajuan,
        approvePengajuan,
        returnPengajuan,
        quickLogGuruActivity,
        addKontrolGuruLog,
        createActionPlan,
        updateActionPlanProgress,
        evaluateActionPlan,
        recordPembayaranIltizamat,
        verifyPembayaranIltizamat,
        updateKomunikasiIltizamat,
        createDistribusiDana,
        updateUserRoleAndScope,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
