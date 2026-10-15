"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  Halaqah,
  LaporanPekanan,
  PengajuanHalaqah,
  AuditLog,
  Pemuda,
  PeriodeLaporan,
  PengajuanPayload,
  Role,
} from "./types";
import {
  initialUsers,
  initialHalaqahs,
  initialLaporans,
  initialPengajuans,
  initialPemudas,
  initialPeriode,
  initialAuditLogs,
} from "./store";
import {
  filterHalaqahsByScope,
  filterReportsByScope,
  filterPengajuanByScope,
} from "./permissions";
import { generateId } from "./utils";

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role, userId?: string) => void;
  periode: PeriodeLaporan;
  allHalaqahs: Halaqah[];
  scopedHalaqahs: Halaqah[];
  allPemudas: Pemuda[];
  allLaporans: LaporanPekanan[];
  scopedLaporans: LaporanPekanan[];
  allPengajuans: PengajuanHalaqah[];
  scopedPengajuans: PengajuanHalaqah[];
  auditLogs: AuditLog[];

  // Actions
  saveReportDraft: (data: Partial<LaporanPekanan>) => { success: boolean; message: string; reportId?: string };
  submitReport: (data: Partial<LaporanPekanan>) => { success: boolean; message: string; reportId?: string };
  createPengajuan: (
    payload: PengajuanPayload,
    tipe: "CREATE" | "UPDATE",
    targetHalaqahId?: string,
    catatanPemohon?: string
  ) => { success: boolean; message: string; pengajuanId?: string };
  approvePengajuan: (pengajuanId: string) => { success: boolean; message: string };
  returnPengajuan: (pengajuanId: string, alasan: string) => { success: boolean; message: string };
  updateUserRoleAndScope: (
    userId: string,
    role: Role,
    mahaliId?: string,
    asmenId?: string,
    assignedHalaqahIds?: string[],
    supervisedHalaqahIds?: string[]
  ) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(initialUsers[0]); // Default: Guru Ahmad Fauzi
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const [periode] = useState<PeriodeLaporan>(initialPeriode);
  const [allHalaqahs, setAllHalaqahs] = useState<Halaqah[]>(initialHalaqahs);
  const [allPemudas, setAllPemudas] = useState<Pemuda[]>(initialPemudas);
  const [allLaporans, setAllLaporans] = useState<LaporanPekanan[]>(initialLaporans);
  const [allPengajuans, setAllPengajuans] = useState<PengajuanHalaqah[]>(initialPengajuans);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("awanputih_current_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const found = allUsers.find((u) => u.id === parsed.id);
        if (found) setCurrentUserState(found);
      }
    } catch {
      // ignore
    }
  }, []);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem("awanputih_current_user", JSON.stringify(user));
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

  // Scoped views based on current user
  const scopedHalaqahs = filterHalaqahsByScope(currentUser, allHalaqahs);
  const scopedLaporans = filterReportsByScope(currentUser, allLaporans);
  const scopedPengajuans = filterPengajuanByScope(currentUser, allPengajuans);

  // Record audit log
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
  };

  // FR-008: Save Report Draft
  const saveReportDraft = (data: Partial<LaporanPekanan>) => {
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
      guruId: currentUser.id,
      guruNama: currentUser.name,
      asmenId: halaqah.asmenId,
      mahaliId: halaqah.mahaliId,
      status: "Draf",
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

    addAudit("SAVE_REPORT_DRAFT", `${newReport.id} / ${halaqah.nama}`, "Draf laporan disimpan", "SUCCESS");
    return { success: true, message: "Draf laporan berhasil disimpan.", reportId };
  };

  // FR-008: Submit Report (Atomic, Idempotent, Read-Only after Submit)
  const submitReport = (data: Partial<LaporanPekanan>) => {
    if (currentUser.role !== "Guru") {
      addAudit("SUBMIT_REPORT", "Unauthorized", "Bukan Guru", "DENIED");
      return { success: false, message: "Akses ditolak: Hanya Guru yang dapat mengirim laporan." };
    }

    const halaqah = allHalaqahs.find((h) => h.id === data.halaqahId);
    if (!halaqah || (halaqah.guruId !== currentUser.id && !currentUser.assignedHalaqahIds.includes(halaqah.id))) {
      addAudit("SUBMIT_REPORT", data.halaqahId || "Unknown", "Kelompok di luar penugasan", "DENIED");
      return { success: false, message: "Akses ditolak: Halaqah di luar cakupan Anda." };
    }

    // Validation
    if (data.infoUmum?.terlaksana === false && !data.infoUmum?.alasanTidakTerlaksana?.trim()) {
      return { success: false, message: "Validasi gagal: Alasan tidak terlaksana wajib diisi." };
    }

    const reportId = data.id || generateId("lap");
    const existing = allLaporans.find((r) => r.id === reportId);
    if (existing && existing.status === "Submitted") {
      return { success: false, message: "Laporan sudah pernah dikirim dan bersifat baca-saja." };
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
      guruId: currentUser.id,
      guruNama: currentUser.name,
      asmenId: halaqah.asmenId,
      mahaliId: halaqah.mahaliId,
      status: "Submitted",
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
      `Laporan pekanan berhasil dikirim (Kehadiran: ${persentase}%, SPP: Rp ${totalSpp})`,
      "SUCCESS"
    );

    return { success: true, message: "Laporan pekanan berhasil dikirim!", reportId };
  };

  // FR-004 & FR-005: Create Proposal (Create or Update Halaqah)
  const createPengajuan = (
    payload: PengajuanPayload,
    tipe: "CREATE" | "UPDATE",
    targetHalaqahId?: string,
    catatanPemohon?: string
  ) => {
    if (currentUser.role !== "Guru") {
      addAudit("CREATE_PROPOSAL", "Unauthorized", "Bukan Guru", "DENIED");
      return { success: false, message: "Akses ditolak: Hanya Guru yang dapat mengajukan perhalaqahan." };
    }

    if (!payload.nama?.trim() || !payload.hari || !payload.jam || !payload.materi?.trim()) {
      return { success: false, message: "Validasi gagal: Nama halaqah, hari, jam, dan materi wajib diisi." };
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

    // Build diff if UPDATE
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
        if (m.action === "ADD") addedMembers.push(`${m.nama} (${m.telepon})`);
        if (m.action === "REMOVE") removedMembers.push(`${m.nama} (${m.telepon})`);
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
      `Guru mengajukan ${tipe === "CREATE" ? "pembuatan halaqah baru" : "perubahan halaqah"}`,
      "SUCCESS"
    );

    return {
      success: true,
      message: "Pengajuan berhasil dikirim ke Asisten Manager untuk divalidasi.",
      pengajuanId,
    };
  };

  // FR-006: Asmen Approves Proposal (Atomic + Idempotent)
  const approvePengajuan = (pengajuanId: string) => {
    if (currentUser.role !== "Asmen") {
      addAudit("APPROVE_PROPOSAL", pengajuanId, "Bukan Asmen", "DENIED");
      return { success: false, message: "Akses ditolak: Hanya Asisten Manager yang berwenang memvalidasi pengajuan." };
    }

    const pengajuan = allPengajuans.find((p) => p.id === pengajuanId);
    if (!pengajuan) {
      return { success: false, message: "Pengajuan tidak ditemukan." };
    }

    if (pengajuan.pemohonId === currentUser.id) {
      addAudit("APPROVE_PROPOSAL", pengajuanId, "Mencoba self-approval", "DENIED");
      return { success: false, message: "Akses ditolak: Pemohon dilarang menyetujui pengajuannya sendiri (FR-006)." };
    }

    if (pengajuan.asmenId !== currentUser.id) {
      addAudit("APPROVE_PROPOSAL", pengajuanId, "Di luar binaan Asmen", "DENIED");
      return { success: false, message: "Akses ditolak: Pengajuan ini di luar cakupan binaan Anda." };
    }

    if (pengajuan.status !== "Menunggu Validasi") {
      return { success: false, message: `Pengajuan sudah berstatus '${pengajuan.status}' dan tidak dapat diproses ulang.` };
    }

    // Atomic update to master halaqah
    if (pengajuan.tipe === "CREATE") {
      const newHalaqahId = generateId("hq");
      const memberIds: string[] = [];

      // Create new members
      const newMembers: Pemuda[] = [];
      pengajuan.payload.anggota.forEach((m) => {
        const pId = generateId("pm");
        memberIds.push(pId);
        newMembers.push({
          id: pId,
          nama: m.nama,
          telepon: m.telepon,
          status: "Aktif",
          halaqahId: newHalaqahId,
        });
      });

      const newHalaqah: Halaqah = {
        id: newHalaqahId,
        kode: `HQ-${pengajuan.payload.nama.replace(/\s+/g, "").substring(0, 6).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
        nama: pengajuan.payload.nama,
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAllPemudas((prev) => [...prev, ...newMembers]);
      setAllHalaqahs((prev) => [newHalaqah, ...prev]);

      // Update Guru's assigned list
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

      // Version check (stale prevention)
      if (pengajuan.versiSumber !== undefined && target.versi !== pengajuan.versiSumber) {
        return {
          success: false,
          message: "Konflik versi: Halaqah telah diubah sebelumnya. Harap periksa versi terbaru.",
        };
      }

      // Process member updates
      let updatedMemberIds = [...target.anggotaIds];
      const newMembersToAdd: Pemuda[] = [];

      pengajuan.payload.anggota.forEach((m) => {
        if (m.action === "ADD") {
          const pId = generateId("pm");
          updatedMemberIds.push(pId);
          newMembersToAdd.push({
            id: pId,
            nama: m.nama,
            telepon: m.telepon,
            status: "Aktif",
            halaqahId: target.id,
          });
        } else if (m.action === "REMOVE" && m.id) {
          updatedMemberIds = updatedMemberIds.filter((id) => id !== m.id);
        }
      });

      if (newMembersToAdd.length > 0) {
        setAllPemudas((prev) => [...prev, ...newMembersToAdd]);
      }

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

    // Update Proposal Status
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
      `Asmen menyetujui pengajuan ${pengajuan.tipe}. Master halaqah aktif diperbarui secara atomik.`,
      "SUCCESS"
    );

    return { success: true, message: "Pengajuan berhasil disetujui dan data master kelompok telah aktif!" };
  };

  // FR-006: Asmen Returns Proposal for Revision (Mandatory Reason)
  const returnPengajuan = (pengajuanId: string, alasan: string) => {
    if (currentUser.role !== "Asmen") {
      addAudit("RETURN_PROPOSAL", pengajuanId, "Bukan Asmen", "DENIED");
      return { success: false, message: "Akses ditolak: Hanya Asisten Manager yang berwenang mengembalikan pengajuan." };
    }

    if (!alasan || !alasan.trim()) {
      return { success: false, message: "Validasi gagal: Alasan pengembalian wajib diisi secara jelas." };
    }

    const pengajuan = allPengajuans.find((p) => p.id === pengajuanId);
    if (!pengajuan) {
      return { success: false, message: "Pengajuan tidak ditemukan." };
    }

    if (pengajuan.asmenId !== currentUser.id) {
      addAudit("RETURN_PROPOSAL", pengajuanId, "Di luar binaan Asmen", "DENIED");
      return { success: false, message: "Akses ditolak: Pengajuan ini di luar cakupan binaan Anda." };
    }

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

  // FR-011: Admin updates user roles and explicit assignments
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

    // If updating current active user, sync state
    if (currentUser.id === userId) {
      setCurrentUser(updatedUser);
    }

    addAudit(
      "UPDATE_ASSIGNMENTS",
      `${userId} / ${userToUpdate.name}`,
      `Admin mengubah role menjadi ${role} dan memperbarui penugasan cakupan.`,
      "SUCCESS"
    );

    return { success: true, message: "Penugasan akun dan cakupan berhasil diperbarui!" };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        switchRole,
        periode,
        allHalaqahs,
        scopedHalaqahs,
        allPemudas,
        allLaporans,
        scopedLaporans,
        allPengajuans,
        scopedPengajuans,
        auditLogs,
        saveReportDraft,
        submitReport,
        createPengajuan,
        approvePengajuan,
        returnPengajuan,
        updateUserRoleAndScope,
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
