export type Role = "Guru" | "Asmen" | "Manager" | "PJ Mal" | "Admin";

export type HealthStatus = "Sehat" | "Sedang" | "Sakit" | "Data Belum Lengkap";

export type LaporanVerifikasiStatus =
  | "Draft"
  | "Dikirim"
  | "Perlu Perbaikan"
  | "Diverifikasi"
  | "Dikunci"
  | "Terlambat";

export type ActionPlanStatus =
  | "Belum Dimulai"
  | "Berjalan"
  | "Hampir Deadline"
  | "Terlambat"
  | "Menunggu Evaluasi"
  | "Selesai"
  | "Dibatalkan";

export type PriorityLevel = "Kritis" | "Tinggi" | "Sedang" | "Rendah";

export interface User {
  id: string;
  name: string;
  email: string;
  telepon?: string;
  role: Role;
  mahaliId?: string;
  wilayahNama?: string;
  asmenId?: string; // for Guru, points to supervising Asmen
  assignedHalaqahIds: string[]; // for Guru
  supervisedHalaqahIds: string[]; // for Asmen
  avatar?: string;
  skorKesehatan?: number;
  statusKesehatan?: HealthStatus;
  diagnosis3K?: {
    kompetensi: string;
    kekuatan: string;
    kemandirian: string;
    intervensi3M: "Konsultan" | "Mentor" | "Coach" | "Delegatif" | "Direktif";
    fokusPengembangan: string;
    komitmenTerakhir: string;
    checkInBerikutnya: string;
    calonPenerus?: string;
  };
}

export interface Mahali {
  id: string;
  nama: string;
  kode: string;
  asmenId?: string;
  targetKehadiran?: number;
}

export type JenjangPemuda = "HU" | "Pra HU" | "CP" | "KEC" | "Pelajar" | "Daris" | "Karyawan";

export type UnitWilayah = "KT1" | "KT2" | "PU1" | "PU2";

export interface KaryawanMaster {
  id: string;
  noUrutWilayah: number;
  nama: string;
  kodeDomisili: "KT" | "PU";
  unitWilayah: UnitWilayah;
  asmenNama: string;
  isGuru: boolean;
  jumlahHalaqahDiampu: number;
  halaqahDiikutiNama?: string;
  kitabDiikuti?: string;
  guruPembinaNama?: string;
  catatanKaderisasi?: string;
}

export interface KelompokKaderisasi {
  id: string;
  unitWilayah: UnitWilayah;
  asmenId: string;
  asmenNama: string;
  kategori: "HU" | "Pra HU" | "CP" | "Peserta KEC" | "Alumni TITR 4";
  judul: string;
  pengampuNama: string;
  perantaraNama?: string;
  musyrifBackup?: string;
  anggotaNamaList: string[];
}

export interface Pemuda {
  id: string;
  nama: string;
  kodeDomisili?: "KT" | "PU";
  domisili?: "KT" | "PU";
  unitWilayah?: UnitWilayah;
  wilayah?: UnitWilayah;
  kitabMateri?: string;
  noUrutKaryawan?: number;
  noUrutDaris?: number;
  catatanKaderisasi?: string;
  telepon: string;
  status: "Aktif" | "Nonaktif";
  jenjang?: JenjangPemuda;
  halaqahId: string;
  catatan?: string;
  perluPerhatian?: boolean;
  alasanPerhatian?: string;
  terakhirKontrol?: string;
  terakhirKontak?: string;
  targetIltizamat?: number;
}

export interface Halaqah {
  id: string;
  kode: string;
  nama: string;
  unitWilayah?: UnitWilayah;
  wilayah?: UnitWilayah;
  jenis?: "Karyawan" | "Pelajar";
  guruId: string;
  guruNama: string;
  guruPenggantiNama?: string;
  asmenId: string;
  mahaliId: string;
  hari: string;
  jam: string;
  tempat: string;
  materi: string;
  anggotaIds: string[];
  versi: number;
  status: "Aktif" | "Nonaktif" | "Tidak Berjalan" | "Dijadwal Ulang";
  kesehatan?: HealthStatus;
  rataKehadiran?: number;
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
  deadline: string;
  status: "Aktif" | "Ditutup" | "Dikunci";
}

export type KehadiranStatus = "Hadir" | "Izin" | "Sakit" | "Alpa";

export interface LaporanPemudaItem {
  pemudaId: string;
  pemudaNama: string;
  kehadiran: KehadiranStatus;
  alasanTidakHadir?: string;
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
  leaflet?: boolean;
  sppNominal: number;
}

export interface InfoUmumLaporan {
  terlaksana: boolean;
  alasanTidakTerlaksana?: string;
  jadwalPengganti?: string;
  tanggalPelaksanaan?: string;
  jamPelaksanaan?: string;
  materiBuku?: string;
  babHalaman?: string;
  catatanSuasana?: string;
}

export interface RingkasanLaporan {
  totalAnggota: number;
  totalHadir: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpa: number;
  persentaseKehadiran: number;
  totalSpp: number;
  kelengkapanPersen?: number;
}

export interface LaporanPekanan {
  id: string;
  periodeId: string;
  periodeLabel: string;
  halaqahId: string;
  halaqahNama: string;
  jenisHalaqah?: "Karyawan" | "Pelajar";
  guruId: string;
  guruNama: string;
  asmenId: string;
  mahaliId: string;
  status: "Draf" | "Submitted";
  verifikasiStatus?: LaporanVerifikasiStatus;
  catatanAsmen?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  infoUmum: InfoUmumLaporan;
  laporanPemuda: LaporanPemudaItem[];
  ringkasan: RingkasanLaporan;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionPlan {
  id: string;
  judul: string;
  sumberMasalah: string;
  level: "MANAJER_TO_ASMEN" | "ASMEN_TO_GURU";
  pemberiId: string;
  pemberiNama: string;
  picId: string;
  picNama: string;
  asmenId: string;
  mahaliId: string;
  halaqahId?: string;
  tindakan: string;
  targetHasil: string;
  indikatorSelesai: string;
  prioritas: PriorityLevel;
  deadline: string;
  progres: number;
  status: ActionPlanStatus;
  buktiDiminta: string;
  catatanProgres?: string;
  catatanEvaluasi?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrioritasMasalah {
  id: string;
  judul: string;
  kategori:
    | "KPI Merah"
    | "Kursus Bermasalah"
    | "Kehadiran Rendah"
    | "Laporan Terlambat"
    | "Pemuda Rawan"
    | "Data Belum Lengkap";
  prioritas: PriorityLevel;
  dampakLevel: "Tinggi" | "Rendah";
  urgensiLevel: "Tinggi" | "Rendah";
  buktiFakta: string;
  dampakDeskripsi: string;
  mulaiTerjadi: string;
  asmenId: string;
  asmenNama: string;
  guruId?: string;
  guruNama?: string;
  halaqahId?: string;
  halaqahNama?: string;
  mahaliId: string;
  tindakanAsmen: string;
  statusTindakLanjut: "Belum Ditangani" | "Dalam Action Plan" | "Dipantau" | "Selesai";
  rekomendasi: string;
}

export interface KontrolGuruLog {
  id: string;
  tanggal: string;
  asmenId: string;
  asmenNama: string;
  guruId: string;
  guruNama: string;
  media: "Tatap Muka" | "Telepon / Daring" | "Kunjungan Halaqah";
  topik: string;
  faktaMasalah: string;
  kondisiGuru: string;
  kesepakatan: string;
  tindakLanjut: string;
  tanggalEvaluasi: string;
  perluActionPlan: boolean;
  perluEskalasi: boolean;
}

export type StatusBayarIltizamat =
  | "Belum Membayar"
  | "Sebagian"
  | "Lunas"
  | "Terlambat"
  | "Ditangguhkan";

export type StatusKomunikasiIltizamat =
  | "Belum Dihubungi"
  | "Informasi Terkirim"
  | "Belum Merespons"
  | "Sudah Merespons"
  | "Berjanji Membayar"
  | "Menyampaikan Kendala"
  | "Perlu Bantuan Guru"
  | "Selesai";

export interface IltizamatRecord {
  id: string;
  periodeBulan: string;
  pemudaId: string;
  pemudaNama: string;
  jenjang: JenjangPemuda;
  halaqahId: string;
  halaqahNama: string;
  guruId: string;
  guruNama: string;
  asmenId: string;
  asmenNama: string;
  mahaliId: string;
  targetNominal: number;
  terbayarNominal: number;
  statusBayar: StatusBayarIltizamat;
  statusKomunikasi: StatusKomunikasiIltizamat;
  tanggalJanji?: string;
  catatanTindakLanjut?: string;
  alasanPenangguhan?: string;
  updatedAt: string;
}

export interface PembayaranTransaksi {
  id: string;
  nomorTransaksi: string;
  iltizamatId: string;
  pemudaId: string;
  pemudaNama: string;
  guruNama: string;
  periodeBulan: string;
  nominal: number;
  tanggal: string;
  metode: "Transfer" | "Tunai";
  sumberInfo: "Guru" | "PJ Mal" | "Syabab";
  buktiUrl: string;
  statusVerifikasi: "Menunggu Verifikasi" | "Terverifikasi" | "Perlu Koreksi";
  catatan?: string;
}

export interface DistribusiDana {
  id: string;
  nomorDistribusi: string;
  tanggal: string;
  sumberPeriode: string;
  tujuan: string;
  penerima: string;
  nominal: number;
  metode: "Transfer" | "Tunai";
  status: "Draft" | "Menunggu Pemeriksaan" | "Disetujui" | "Didistribusikan" | "Selesai";
  bukti: string;
}

export interface NotifikasiItem {
  id: string;
  judul: string;
  pesan: string;
  kategori: "Kritis" | "Perlu Tindakan" | "Informasi" | "Selesai";
  targetRole: Role | "ALL";
  targetUserId?: string;
  href: string;
  waktu: string;
  dibaca: boolean;
}

export interface KpiConfig {
  bobotPembinaan: number;
  bobotKaderisasi: number;
  bobotKontrolKontak: number;
  bobotLaporan: number;
  bobotKeuangan: number;
  ambangSehat: number;
  ambangSedang: number;
  criticalOverrideAktif: boolean;
  maksKelompokIdealGuru: number;
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
