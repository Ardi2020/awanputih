"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import {
  Shield,
  Users,
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Edit,
  ShieldAlert,
} from "lucide-react";
import { Role } from "@/lib/types";

export default function AdminPage() {
  const { currentUser, allUsers, allHalaqahs, auditLogs, updateUserRoleAndScope } = useApp();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<Role>("Guru");
  const [editHalaqahs, setEditHalaqahs] = useState<string[]>([]);
  const [editSupervised, setEditSupervised] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Security check: Only Admin
  if (currentUser.role !== "Admin") {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak (403 Forbidden)</h1>
        <p className="text-slate-600 text-sm mb-6">
          Hanya Administrator sistem yang berwenang mengakses modul tata kelola akun dan penugasan akses.
        </p>
        <Link
          href="/"
          className="touch-target px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const handleOpenEdit = (userId: string) => {
    const u = allUsers.find((usr) => usr.id === userId);
    if (!u) return;
    setSelectedUser(userId);
    setEditRole(u.role);
    setEditHalaqahs(u.assignedHalaqahIds || []);
    setEditSupervised(u.supervisedHalaqahIds || []);
    setFeedback(null);
  };

  const handleSaveAssignments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const res = updateUserRoleAndScope(
      selectedUser,
      editRole,
      undefined,
      undefined,
      editHalaqahs,
      editSupervised
    );

    if (res.success) {
      setFeedback("Penugasan akses pengguna berhasil diperbarui dan dicatat dalam audit log.");
      setSelectedUser(null);
    }
  };

  const toggleHalaqahAssign = (hId: string) => {
    if (editHalaqahs.includes(hId)) {
      setEditHalaqahs(editHalaqahs.filter((id) => id !== hId));
    } else {
      setEditHalaqahs([...editHalaqahs, hId]);
    }
  };

  const toggleSupervisedAssign = (hId: string) => {
    if (editSupervised.includes(hId)) {
      setEditSupervised(editSupervised.filter((id) => id !== hId));
    } else {
      setEditSupervised([...editSupervised, hId]);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Administrasi Akun & Penugasan Akses
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Kelola empat peran sistem (Guru, Asmen, Manager, Admin) serta batas penugasan data server.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Users & Roles Management */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Daftar Akun Pengguna & Penugasan</h2>
            <p className="text-xs text-slate-500">
              Penugasan eksplisit menentukan batasan query scope di setiap role.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {allUsers.length} Akun
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5">Pengguna</th>
                <th className="p-3.5">Peran (Role)</th>
                <th className="p-3.5">Cakupan Penugasan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                          u.role === "Guru"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : u.role === "Asmen"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : u.role === "Manager"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {u.role === "Guru" && (
                        <span>
                          Mengampu: <strong>{u.assignedHalaqahIds.length} halaqah</strong> (
                          {u.assignedHalaqahIds.join(", ") || "Belum ada"})
                        </span>
                      )}
                      {u.role === "Asmen" && (
                        <span>
                          Supervisi: <strong>{u.supervisedHalaqahIds.length} halaqah</strong> (
                          {u.supervisedHalaqahIds.join(", ") || "Belum ada"})
                        </span>
                      )}
                      {u.role === "Manager" && (
                        <span>
                          Wilayah Mahali: <strong>{u.mahaliId || "Belum ada"}</strong>
                        </span>
                      )}
                      {u.role === "Admin" && <span className="italic text-slate-400">Hak Akses Administrasi Sistem</span>}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(u.id)}
                        className="touch-target px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Akses</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Ubah Role & Penugasan Akses Pengguna
            </h3>

            <form onSubmit={handleSaveAssignments} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peran (Role)</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="Guru">Guru (Pengampu Halaqah)</option>
                  <option value="Asmen">Asisten Manager (Reviewer / Supervisor)</option>
                  <option value="Manager">Manager (Monitoring Mahali)</option>
                  <option value="Admin">Admin (Administrasi Akun & Pengaturan)</option>
                </select>
              </div>

              {editRole === "Guru" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tugaskan Halaqah yang Diampu:
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {allHalaqahs.map((h) => (
                      <label key={h.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white">
                        <input
                          type="checkbox"
                          checked={editHalaqahs.includes(h.id)}
                          onChange={() => toggleHalaqahAssign(h.id)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="font-semibold text-slate-800">{h.nama}</span>
                        <span className="text-slate-400">({h.kode})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {editRole === "Asmen" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tugaskan Wilayah Kelompok Binaan:
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {allHalaqahs.map((h) => (
                      <label key={h.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white">
                        <input
                          type="checkbox"
                          checked={editSupervised.includes(h.id)}
                          onChange={() => toggleSupervisedAssign(h.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-semibold text-slate-800">{h.nama}</span>
                        <span className="text-slate-400">({h.kode})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="touch-target px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="touch-target px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  Simpan Perubahan Penugasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SYSTEM AUDIT LOG (FR-012) */}
      <div id="audit" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Log Audit Sistem (Keamanan & Integritas)</h2>
            <p className="text-xs text-slate-500">
              Mencatat seluruh peristiwa bisnis: pengajuan, persetujuan atomik, penolakan izin, dan perubahan hak akses.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {auditLogs.length} Entri Tercatat
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      log.outcome === "SUCCESS"
                        ? "bg-emerald-100 text-emerald-800"
                        : log.outcome === "DENIED"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {log.outcome}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{log.target}</span>
                </div>
                <div className="text-slate-600">{log.details}</div>
                {log.reason && (
                  <div className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] inline-block">
                    Alasan: &quot;{log.reason}&quot;
                  </div>
                )}
              </div>

              <div className="text-right text-[11px] text-slate-400 shrink-0">
                <div>
                  Oleh: <strong>{log.actorNama}</strong> ({log.actorRole})
                </div>
                <div>{new Date(log.timestamp).toLocaleTimeString("id-ID")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
