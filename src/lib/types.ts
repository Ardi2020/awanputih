export type Role = "Guru" | "Asmen" | "Manager" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  mahaliId?: string;
  asmenId?: string; // for Guru, points to supervising Asmen
  assignedHalaqahIds: string[]; // for Guru
  supervisedHalaqahIds: string[]; // for Asmen
  avatar?: string;
}

export interface Mahali {
  id: string;
  nama: string;
  kode: string;
}

export interface Pemuda {
  id: string;
  nama: string;
  telepon: string;
  status: "Aktif" | "Nonaktif";
  halaqahId: string;
  catatan?: string;
}

export interface Halaqah {
  id: string;
  kode: string;
  nama: string;
  guruId: string;
  guruNama: string;
  asmenId: string;
  mahaliId: string;
  hari: string;
  jam: string;
  tempat: string;
  materi: string;
  anggotaIds: string[];
  versi: number;
  status: "Aktif" | "Nonaktif";
  createdAt: string;
  updatedAt: string;
}

export type StatusPengajuan =
  | "Draf"
  | "Menunggu Validasi"
  | "Disetujui"
  | "Dikembalikan untuk Revisi";

export interface PengajuanMemberItem {
  id?: string;
  nama: string;
  telepon: string;
  action: "KEEP" | "ADD" | "REMOVE";
}

export interface PengajuanPayload {
  nama: string;
  hari: string;
  jam: string;
  tempat: string;
  materi: string;
  anggota: PengajuanMemberItem[];
}

export interface DiffItem {
  field: string;
  label: string;
  oldValue: string;
  newValue: string;
}

export interface PengajuanHalaqah {
  id: string;
  tipe: "CREATE" | "UPDATE";
  pemohonId: string;
  pemohonNama: string;
  targetHalaqahId?: string;
  versiSumber?: number;
  asmenId: string;
  status: StatusPengajuan;
  payload: PengajuanPayload;
  diff?: {
    fieldChanges: DiffItem[];
    addedMembers: string[];
    removedMembers: string[];
  };
  alasanPengembalian?: string;
  catatanPemohon?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodeLaporan {
  id: string;
  nomorPekanKalender: number;
  nomorPekanKajian: number;
  label: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: "Aktif" | "Ditutup";
}

export type KehadiranStatus = "Hadir" | "Izin" | "Sakit" | "Alpa";

export interface LaporanPemudaItem {
  pemudaId: string;
  pemudaNama: string;
  kehadiran: KehadiranStatus;
  kontrolPekanan: {
    tilawah: boolean;
    shalatJamaah: boolean;
    qiyamulLail: boolean;
    shaumSunnah: boolean;
    catatan?: string;
  };
  kontakPersonal: boolean;
  catatanKontak?: string;
  buletinCetak: boolean;
  buletinDigital: boolean;
  sppNominal: number;
}

export interface InfoUmumLaporan {
  terlaksana: boolean;
  alasanTidakTerlaksana?: string;
  tanggalPelaksanaan?: string;
  jamPelaksanaan?: string;
  materiBuku?: string;
  babHalaman?: string;
}

export interface RingkasanLaporan {
  totalAnggota: number;
  totalHadir: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpa: number;
  persentaseKehadiran: number;
  totalSpp: number;
}

export interface LaporanPekanan {
  id: string;
  periodeId: string;
  periodeLabel: string;
  halaqahId: string;
  halaqahNama: string;
  guruId: string;
  guruNama: string;
  asmenId: string;
  mahaliId: string;
  status: "Draf" | "Submitted";
  infoUmum: InfoUmumLaporan;
  laporanPemuda: LaporanPemudaItem[];
  ringkasan: RingkasanLaporan;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorNama: string;
  actorRole: Role;
  action: string;
  target: string;
  details: string;
  outcome: "SUCCESS" | "DENIED" | "FAILED";
  reason?: string;
  timestamp: string;
}
