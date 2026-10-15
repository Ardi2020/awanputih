# Awanputih — Laporan Pekanan dan Perhalaqahan Berbasis Role

Aplikasi web modern untuk pengelolaan kelompok halaqah, anggota pemuda, dan pelaporan pekanan berbasis empat role (Guru, Asisten Manager, Manager, Admin) dengan pembatasan akses data (*Role + Assignment Scoping*), alur validasi persetujuan atomik, pemeliharaan keutuhan sejarah laporan, serta desain mobile-first responsif (**NFR-003**).

Dibuat sesuai dokumen spesifikasi:
- **PRD-Laporan-Pekanan-v0.1.md**
- **Handoff-Coding-Agent-v0.1.md**
- **Spesifikasi-Laporan-Pekanan-v0.1.json**

---

## 🚀 Fitur Utama & Kepatuhan PRD

### 1. Empat Role & Navigasi Sesuai Pekerjaan (FR-001 & FR-002)
- **Guru (Pengampu):**
  - Beranda: *Pekerjaan Saya Pekan Ini* (tanpa ringkasan global mahali atau keuangan eksekutif).
  - Menu: *Halaqah Saya*, *Anggota Halaqah Saya*, *Laporan Saya*, *Pengajuan Saya*.
  - Query scope server: Hanya melihat dan mengelola kelompok yang diampunya sendiri. Akses ke kelompok guru lain ditolak (**403 Forbidden**).
- **Asisten Manager (Asmen):**
  - Beranda: *Ringkasan Binaan & Validasi*.
  - Menu: *Ringkasan Binaan*, *Kelompok Binaan*, *Laporan Binaan*, *Validasi Perhalaqahan*.
  - Validasi: Memeriksa antrean usulan baru/perubahan halaqah dengan perbandingan data (*Visual Diff*), menyetujui secara atomik, atau mengembalikan disertai alasan wajib. Larangan *self-approval* jika Asmen menjadi pemohon.
- **Manager:**
  - Beranda: *Ringkasan Eksekutif Mahali*.
  - Menu: *Rekap Mahali*, *Status Pelaporan*, *Ringkasan per Asmen*.
  - Monitoring rekapitulasi capaian kepatuhan pelaporan, kehadiran rata-rata, dan total SPP tanpa hak operasional mengubah laporan.
- **Admin:**
  - Beranda: *Dashboard Administrasi*.
  - Menu: *Akun & Penugasan*, *Log Audit Sistem*.
  - Mengelola peran pengguna (RBAC), penugasan Guru ke Kelompok, dan Asmen ke Wilayah Binaan. Admin tidak memiliki akses operasional otomatis mengubah isi laporan atau mem-bypass validasi perhalaqahan.
- **Akun Tanpa Penugasan (Default Deny):**
  - Pengguna tanpa penugasan menampilkan state aman (*Empty State*) dengan penjelasan dan tidak membocorkan data global.

### 2. Pengajuan Buat & Ubah Perhalaqahan (FR-004, FR-005, FR-006, FR-007)
- **Buat Halaqah Baru:** Guru mengisi draf usulan kelompok baru. Status menjadi *Menunggu Validasi*. Data master belum dibuat sampai disetujui Asmen.
- **Ubah Halaqah Aktif:** Guru mengusulkan perubahan dari data aktif kelompoknya. Data aktif dan pelaporan tetap menggunakan versi lama selama masa pengajuan.
- **Visual Diff Viewer:** Menampilkan perbandingan *Data Aktif* vs *Usulan Baru* secara berdampingan (desktop) atau berurutan (mobile), dengan penanda mutasi anggota (+ Tambah / - Hapus).
- **Validasi Atomik & Alasan Pengembalian:** Persetujuan Asmen secara atomik memperbarui master halaqah dan menaikkan nomor versi (`v1 -> v2`). Pengembalian untuk revisi wajib disertai catatan perbaikan.

### 3. Preservasi Seluruh Field Laporan Pekanan (FR-008 & FR-009)
Mempertahankan seluruh field formulir laporan existing:
- **Langkah 1: Info Umum:** Status Keterlaksanaan (Terlaksana / Tidak Terlaksana), Alasan jika Tidak Terlaksana, Tanggal & Jam pelaksanaan, Buku Kurikulum/Materi, Bab & Halaman.
- **Langkah 2: Laporan Pemuda:** Preservasi field per anggota:
  - Kehadiran (*Hadir, Izin, Sakit, Alpa*)
  - Kontrol Pekanan (*Tilawah Harian, Shalat Jama'ah, Qiyamul Lail, Shaum Sunnah, Catatan*)
  - Kontak Personal (*Ya/Tidak, Catatan Interaksi*)
  - Distribusi Buletin (*Cetak & Digital*)
  - SPP Pekanan (*Nominal Rupiah*)
- **Langkah 3: Ringkasan & Submit:** Perhitungan otomatis persentase kehadiran, rekapitulasi status, dan total SPP.
- **Read-Only Submitted Report:** Laporan yang telah dikirim berstatus *Submitted* dan bersifat baca-saja untuk menjaga keutuhan riwayat pekanan.

### 4. Responsif Mobile First (NFR-003)
- Telah dioptimasi untuk berbagai ukuran viewport: ponsel (360px, 390px, 430px), tablet (768px), dan desktop (1280px).
- Target sentuh tombol dan kontrol minimal **44 × 44 CSS px**.
- Ukuran teks input minimal **16 CSS px** untuk mencegah auto-zoom pada Safari iOS.
- Layout form satu kolom pada perangkat mobile dan *drawer navigation* yang dapat dibuka-tutup dengan sentuhan maupun keyboard.

### 5. Akun Sintetis / Fixture PRD & Role Switcher
Tersedia bar **Simulasi Role** di bagian atas aplikasi untuk menguji setiap peran secara langsung:
1. `Ustadz Ahmad Fauzi` (Guru — Mengampu Halaqah Al-Fatih & An-Nur)
2. `Ustadz Budi Santoso` (Guru — Mengampu Halaqah Al-Ikhlas)
3. `Ustadz Salman Al-Farisi` (Asmen — Wilayah Mahali Barat)
4. `Ustadz Ridwan Hakim` (Asmen — Wilayah Mahali Timur)
5. `H. Hendra Gunawan` (Manager — Mahali Jakarta Barat)
6. `Syahrul Admin` (Admin Sistem)
7. `Akun Tanpa Penugasan` (Uji skenario negatif default deny)

---

## 🛠️ Stack Teknologi

- **Framework:** Next.js 14 (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS & PostCSS
- **Ikon:** Lucide React
- **Hosting / Deployment:** Vercel

---

## 📦 Menjalankan Secara Lokal

```bash
# 1. Clone repository
git clone https://github.com/Ardi2020/awanputih.git
cd awanputih

# 2. Install dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev

# Buka http://localhost:3000 pada browser Anda
```

Untuk build produksi:
```bash
npm run build
npm start
```
