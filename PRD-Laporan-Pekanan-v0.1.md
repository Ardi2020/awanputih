# PRD — Awanputih: Laporan Pekanan dan Perhalaqahan Berbasis Role

## 1. Status dan kontrol dokumen

| Atribut | Nilai |
|---|---|
| Versi / tanggal | 0.1 / 15 Oktober 2026, Asia/Jakarta |
| Status | PROVISIONAL — draf untuk peninjauan, belum siap implementasi penuh |
| Pemilik keputusan | Pemilik produk; nama penanggung jawab belum ditetapkan |
| Mode / kategori | Fast / aplikasi web dan dashboard |
| Kesiapan | 72/100, penilaian internal; penghambat utama dijelaskan di bagian 23 |
| Kualitas spesifikasi | 80/100, penilaian internal; bukan hasil pengujian aplikasi |
| Sumber utama | Instruksi dan jawaban pengguna; peninjauan Edge pada akun berlabel Guru |
| Sumber kebenaran | Dokumen PRD ini; handoff dan JSON merupakan turunannya |

Label asal keputusan: **USER_CONFIRMED** = dikonfirmasi pengguna; **GPT_RECOMMENDED** = rekomendasi belum disetujui; **ASSUMPTION** = asumsi sementara; **UNSPECIFIED** = belum diketahui. Observasi aplikasi adalah bukti kondisi saat peninjauan, bukan persetujuan pengguna atas perilaku tersebut.

Pengguna menyetujui lingkup draf: empat role, akses sesuai tanggung jawab, guru membuat dan mengubah perhalaqahan dengan validasi asisten manager, data lama tetap aktif selama pengajuan, riwayat perubahan dan alasan pengembalian, serta mempertahankan semua isian laporan. Persetujuan ini belum merupakan persetujuan seluruh detail teknis di dokumen.

**Pembaruan 15 Oktober 2026:** pengguna menegaskan aplikasi wajib mobile friendly. Persyaratan ini USER_CONFIRMED, berlaku untuk keempat role dan seluruh alur inti, serta menjadi syarat rilis. Ukuran layar dan ukuran kontrol di bawah merupakan kriteria teknis rancangan untuk membuktikan kebutuhan tersebut.

## 2. Ringkasan eksekutif

Awanputih digunakan untuk mengelola kelompok kursus atau halaqah, anggota/pemuda, dan laporan kegiatan pekanan. Perbaikan yang diminta berpusat pada pembagian tanggung jawab: manager memantau mahali, asisten manager mengawasi kelompok binaan dan memvalidasi perhalaqahan, guru menangani kelompok sendiri, sedangkan admin mengelola akun, role, dan pengaturan. Setiap pengguna mendapat beranda, navigasi, dan data yang relevan dengan pekerjaannya.

Pada peninjauan akun berlabel Guru, dashboard masih menampilkan ringkasan eksekutif mahali, statistik lintas kelompok, dan keuangan. Halaman laporan sudah berorientasi pada laporan milik guru, tetapi halaman kelompok yang ditinjau hanya menyediakan akses detail tanpa tindakan membuat atau mengubah kelompok. Perbaikan memerlukan pembatasan akses data, bukan hanya penyederhanaan tampilan.

MVP mempertahankan seluruh isian laporan yang sudah ada, termasuk informasi pelaksanaan, materi, kehadiran, kontrol, kontak, buletin, dan SPP. Guru dapat mengusulkan perhalaqahan baru atau perubahan data kelompoknya. Asisten manager memeriksa pengajuan, melihat perbandingan perubahan, lalu menyetujui atau mengembalikan dengan alasan. Perubahan baru berlaku sesudah persetujuan; riwayat laporan sebelumnya tetap utuh.

Hasil yang dituju adalah alur kerja yang terfokus, batas akses yang dapat diuji, serta perubahan data yang dapat ditelusuri. Stack, struktur organisasi rinci, aturan koreksi laporan terkirim, dan aturan historis perpindahan anggota masih memerlukan keputusan. Karena itu, dokumen ini menjadi dasar pembahasan dan perencanaan implementasi, bukan izin untuk menebak aturan tersebut atau mengganti sistem yang ada.

## 3. Visi dan prinsip

1. Halaman pertama menjawab tugas utama pengguna pada pekan berjalan.
2. Akses mengikuti role sekaligus penugasan data; role Guru tidak memberi akses semua guru.
3. Pengajuan dan data aktif dibedakan secara jelas.
4. Validasi asisten manager tidak boleh dilewati lewat tautan langsung atau permintaan server.
5. Perubahan kelompok tidak menulis ulang sejarah laporan.
6. Istilah, rentang tanggal, status, dan tindakan konsisten di seluruh halaman.

## 4. Masalah dan bukti kondisi saat ini

| ID | Temuan yang terlihat | Implikasi |
|---|---|---|
| OBS-001 | Akun berlabel Guru melihat “Ringkasan Eksekutif Mahali”, statistik asmen/guru, operasional, keuangan, dan detail kehadiran | Beranda belum sesuai kebutuhan guru; belum membuktikan perilaku semua akun atau celah otorisasi server |
| OBS-002 | `/laporan-pekanan` berjudul “Laporan Pekanan Saya”; tersedia Draft, Submitted, Edit, detail, dan pengajuan edit laporan | Sebagian pemisahan sudah ada; pertahankan kemampuan yang dibutuhkan |
| OBS-003 | `/kursuses` menampilkan empat kelompok dengan guru yang sama; tindakan yang terlihat hanya detail | Tambahkan alur pengajuan buat/ubah perhalaqahan; jangan menganggap fitur tersembunyi pasti tidak ada |
| OBS-004 | Form laporan memiliki langkah Info Umum, Laporan Pemuda, Ringkasan dan Simpan Draft | Pertahankan kemampuan mencicil pengisian; jangan menghilangkan field tanpa inventaris |
| OBS-005 | Detail laporan terkirim menampilkan kehadiran, kontrol, kontak, buletin cetak/digital, dan SPP per anggota | Ada data pribadi, kegiatan, dan nominal keuangan yang perlu dibatasi |
| OBS-006 | Sidebar “Pekan 41” dan baris laporan “Pekan 2” memakai rentang 11–17 Oktober 2026 yang sama | Arti nomor pekan perlu disepakati; jangan menyimpulkan salah hitung sebelum mengetahui definisinya |

Sumber: `https://awanputih.click/`, `/laporan-pekanan`, `/laporan-pekanan/163/edit`, `/laporan-pekanan/162`, `/kursuses`, `/kursuses/18`, `/pemudas`. Peninjauan hanya membaca melalui UI; tidak menyimpan, mengirim, menyetujui, atau menghapus data. Akun manager, asisten manager, dan admin serta kode/API belum ditinjau. Tidak ada pengujian penetrasi atau verifikasi seluruh formula.

## 5. Tujuan dan ukuran keberhasilan

| ID | Tujuan | Ukuran / target | Cara mengukur |
|---|---|---|---|
| G-001 | Guru bekerja dengan data sendiri | Nol akses berhasil pada skenario negatif lintas guru dan role | Uji UI, endpoint, pencarian, agregat, dan ekspor jika tersedia |
| G-002 | Perhalaqahan berubah melalui validasi | Seluruh aktivasi buat/ubah berasal dari persetujuan asisten manager berwenang | Audit transisi dan uji persetujuan |
| G-003 | Pelaporan lama tetap berfungsi | Seluruh field, kode pilihan, dan hasil laporan yang diinventaris tetap tersedia | Uji regresi dan rekonsiliasi data |
| G-004 | Pengguna mudah menemukan pekerjaannya | Target waktu penyelesaian tugas dan kenaikan ketepatan pelaporan: UNSPECIFIED | Ukur baseline sebelum rilis dan evaluasi pada periode yang disepakati |

G-001–003 merupakan ukuran penerimaan yang diturunkan dari kebutuhan terkonfirmasi, bukan baseline produksi. G-004 adalah GPT_RECOMMENDED; target dan waktu evaluasi belum ditentukan.

## 6. Pengguna dan pekerjaan utama

| Role | Pekerjaan / JTBD | Cakupan terkonfirmasi |
|---|---|---|
| Manager | Menilai kondisi mahali dan menentukan tindak lanjut | Rekap mahali |
| Asisten manager (Asmen) | Memantau guru/kelompok binaan dan memvalidasi pengajuan perhalaqahan | Kelompok binaannya |
| Guru | Mengelola perhalaqahan sendiri dan mengisi laporan pekanan | Kelompok sendiri dan anggota terkait |
| Admin | Mengatur akun, role, penugasan akses, dan pengaturan aplikasi | Administrasi sistem; bukan otomatis semua data operasional |

Pembagian dasar ini USER_CONFIRMED. Detail akses manager ke data individu/SPP, hak admin membaca isi laporan, dan kombinasi multi-role masih UNSPECIFIED. Tidak diasumsikan manager atau admin boleh melewati validasi Asmen.

## 7. Lingkup

**MVP terkonfirmasi:** empat role; beranda/menu sesuai fungsi; pembatasan data; guru mengajukan buat/ubah seluruh data perhalaqahan (guru, anggota/pemuda, materi, jadwal, tempat); Asmen memvalidasi; data lama berlaku sampai disetujui; riwayat pengajuan/perubahan dan alasan pengembalian; seluruh isian laporan dipertahankan.

Seluruh fungsi MVP wajib dapat diselesaikan melalui browser ponsel untuk empat role. Mobile friendly termasuk lingkup MVP, bukan peningkatan setelah rilis.

**Detail rancangan sementara untuk ditinjau:** satu pengajuan terbuka per kelompok; satu persetujuan Asmen; pengajuan baru belum menghasilkan laporan; larangan menyetujui pengajuan sendiri; pemakaian versi data untuk mendeteksi konflik. Detail ini ASSUMPTION atau GPT_RECOMMENDED, bukan keputusan final.

**Di luar perubahan awal:** aplikasi seluler native, AI, WhatsApp/email otomatis, pembayaran SPP daring, leaderboard baru, integrasi eksternal baru, perombakan formula KPI, dan pembangunan ulang stack. Kandidat setelah MVP hanya dibahas jika diminta. Fungsi lama yang masih diperlukan tidak boleh dihapus hanya karena tidak ditinjau.

**Ditunda:** arti penomoran pekan, koreksi laporan terkirim, perpindahan pengampu/anggota, retensi, multi-role, dan aturan akses historis.

## 8. Batasan dan asumsi

Platform web sudah ada. Repository, framework, database, hosting, skema autentikasi, anggaran, batas waktu, skala pengguna, dan lingkungan staging: UNSPECIFIED. Prioritaskan penyesuaian sistem existing setelah inspeksi, bukan memilih stack baru. Jangan menyimpulkan framework dari pola URL.

Mahali dipakai sebagai istilah yang terlihat di aplikasi; belum diketahui apakah ada banyak mahali atau tingkat organisasi tambahan. Batas organisasi wajib dipastikan sebelum migrasi akses. Data anggota dan SPP tidak boleh dianggap publik. Usia anggota belum diketahui; jangan menyimpulkan seluruh pelajar adalah anak.

## 9. Perjalanan pengguna

| ID | Pemicu dan prasyarat | Alur utama | Alternatif / kegagalan | Hasil / FR |
|---|---|---|---|---|
| J-001 | Pengguna masuk dengan akun aktif dan penugasan sah | Identifikasi role → beranda sesuai fungsi → tugas pekan ini | Belum ditugaskan: halaman kosong dengan penjelasan; tidak ada fallback ke data global. Sesi habis: login kembali | Cakupan benar / FR-001–003 |
| J-002 | Guru ingin membuat kelompok | Isi draf → validasi → ajukan → Asmen menilai → setujui → aktif | Belum ada Asmen: pengajuan tidak dikirim dan draf tetap ada. Dikembalikan: alasan → revisi → ajukan lagi | Kelompok tervalidasi / FR-004,006,007 |
| J-003 | Guru ingin mengubah kelompok aktif miliknya | Salin versi aktif → ubah draf → ajukan → Asmen melihat perbedaan → persetujuan | Versi sumber berubah: tampilkan konflik, tidak menimpa. Gagal persetujuan: data lama tetap aktif | Versi baru aktif / FR-005–007 |
| J-004 | Pekan pelaporan terbuka dan kelompok aktif | Buka laporan sendiri → isi informasi dan anggota → simpan draf → ringkasan → kirim | Tidak terlaksana: alasan mengikuti aturan existing. Offline/gagal simpan: jangan mengklaim tersimpan. Laporan terkirim dibuka baca saja | Laporan dan field lama terjaga / FR-008–009 |
| J-005 | Asmen/manager perlu pemantauan | Buka rekap sesuai cakupan → pilih periode → lihat status pelaporan → tindak lanjuti | Data belum masuk bukan nol kehadiran; filter kosong dijelaskan; akses di luar cakupan ditolak | Rekap terbatas / FR-003,010 |
| J-006 | Admin mengatur akun/penugasan | Buka administrasi → ubah role/cakupan dengan konfirmasi → audit → akses baru berlaku | Penugasan tidak valid ditolak; akun aktif tidak otomatis memperoleh data global | Administrasi terpisah / FR-002,011–012 |

## 10. Kebutuhan fungsional

Semua FR berikut adalah lingkup MVP. Detail dengan label berbeda di dalam FR tetap belum terkonfirmasi. Setiap FR wajib diuji terhadap matriks hak akses. Semua prasyarat mencakup akun aktif, sesi sah, dan otorisasi server kecuali disebutkan lain.

### FR-001 — Empat role dan navigasi sesuai pekerjaan

**Asal:** USER_CONFIRMED. **Nilai:** mengurangi menu dan informasi yang tidak relevan. **Dependensi:** FR-002. **Tujuan/perjalanan:** G-001,G-004 / J-001.

Sistem mengenali manager, asisten manager, guru, admin; beranda dan navigasi mengikuti matriks bagian 13.

**Kriteria penerimaan:**
1. Saat Guru masuk, halaman awal menampilkan pekerjaan/laporan kelompok sendiri, tanpa ringkasan global mahali dan keuangan global.
2. Menu Guru menyediakan Halaqah Saya, Anggota Halaqah Saya, Laporan Saya, dan Pengajuan Saya sebagai rancangan penamaan; nama akhir dapat ditinjau.
3. Saat role lain masuk, hanya menu dan tindakan yang diizinkan matriks yang tersedia; URL yang disembunyikan tetap ditolak server.
4. Akun tanpa penugasan tidak melihat data semua kelompok.

**Status:** loading, kosong, sukses, sesi habis, akses ditolak. **Audit:** kegagalan akses; jangan mencatat isi laporan di analitik navigasi.

### FR-002 — Otorisasi berdasarkan role dan penugasan

**Asal:** USER_CONFIRMED (batas akses), GPT_RECOMMENDED (mekanisme server). **Nilai:** membatasi akses data. **Dependensi:** identitas/penugasan existing yang perlu diinspeksi. **Tujuan/perjalanan:** G-001 / J-001,J-006.

**Kriteria penerimaan:**
1. Guru A tidak dapat membaca atau mengubah halaqah, anggota, laporan, pengajuan, hitungan, atau hasil pencarian Guru B melalui UI maupun manipulasi identifier/parameter.
2. Asmen hanya dapat melihat dan memvalidasi kelompok yang masuk cakupannya; manager hanya memperoleh rekap mahali yang ditugaskan.
3. Field pengampu, role, mahali, reviewer, status persetujuan, dan pemilik dari client tidak dapat menaikkan hak akses pemohon.
4. Perubahan role/penugasan berlaku pada permintaan berikutnya; cache/filter/link lama tidak mempertahankan akses yang sudah dicabut.
5. Endpoint, unduhan/ekspor existing jika ada, dan agregat memakai kebijakan yang sama; tidak mengirim data terlarang ke browser lalu menyembunyikannya.

**Status:** unauthorized, permission denied, sukses, stale session. **Audit:** perubahan hak akses dan penolakan akses tanpa payload sensitif.

### FR-003 — Beranda dan tugas berdasarkan cakupan

**Asal:** USER_CONFIRMED; urutan komponen GPT_RECOMMENDED. **Nilai:** menempatkan pekerjaan yang relevan di depan. **Dependensi:** FR-001,002,009. **Tujuan/perjalanan:** G-001,G-004 / J-001,J-005.

**Kriteria penerimaan:**
1. Guru melihat pekan aktif, kelompok sendiri, laporan belum dikirim, draf, dan status pengajuannya.
2. Asmen melihat antrean validasi dan status pelaporan kelompok binaan; manager melihat rekap mahali; admin melihat administrasi akun/penugasan.
3. Jumlah pada beranda memakai cakupan dan filter yang sama dengan daftar rinci.
4. Nilai belum tersedia ditandai “Belum ada laporan/data”, bukan dianggap hasil nol atau performa buruk.

**Status:** loading, kosong, filter kosong, sukses, gagal, stale. **Analitik:** kunjungan dan penyelesaian tugas tanpa identitas anggota.

### FR-004 — Guru mengajukan perhalaqahan baru

**Asal:** USER_CONFIRMED; detail validasi ASSUMPTION. **Nilai:** memberi guru kendali pengusulan. **Dependensi:** FR-002,006. **Tujuan/perjalanan:** G-002 / J-002.

**Kriteria penerimaan:**
1. Guru dapat menyimpan draf dan mengajukan data kelompok, guru, anggota, materi, jadwal, dan tempat; daftar field final mengikuti inventaris existing.
2. Sistem menetapkan pemohon dari sesi, bukan input bebas; perubahan pengampu kepada orang lain mengikuti OQ-005.
3. Data wajib yang belum lengkap mencegah pengajuan dan menampilkan kesalahan pada field; draf tidak wajib selengkap pengajuan.
4. Pengajuan diterima berstatus Menunggu Validasi dan belum menjadi kelompok aktif atau sumber laporan.
5. Jika reviewer berwenang belum ditetapkan, pengiriman diblokir dengan penjelasan dan draf dipertahankan.

**Status:** draf kosong, validation error, tersimpan, pending, gagal simpan, retry. **Audit:** penyimpanan/pengajuan dan pemohon. **Catatan:** aturan nama/kode unik dan anggota lintas kelompok belum diputuskan.

### FR-005 — Guru mengajukan perubahan perhalaqahan sendiri

**Asal:** USER_CONFIRMED; satu pengajuan terbuka ASSUMPTION. **Nilai:** pembaruan terkontrol. **Dependensi:** FR-002,004,006,007. **Tujuan/perjalanan:** G-002 / J-003.

**Kriteria penerimaan:**
1. Guru dapat memulai draf perubahan dari versi aktif kelompoknya, meliputi seluruh data perhalaqahan.
2. Selama draf atau Menunggu Validasi, pembaca data aktif dan pelaporan tetap memakai versi yang telah disetujui.
3. Pengajuan menyimpan versi sumber dan perbedaan nilai lama/usulan untuk reviewer; anggota ditampilkan sebagai penambahan/pengurangan, bukan daftar tanpa konteks.
4. Jika versi aktif berubah sebelum persetujuan, aplikasi menolak menimpa dan meminta pembaruan/review ulang.
5. Rancangan sementara membatasi satu pengajuan terbuka per kelompok; implementasi menunggu konfirmasi ASM-003.

**Status:** draf, pending, konflik/stale, gagal, retry. **Audit:** objek, versi sumber, perubahan dan waktu. **Catatan:** riwayat anggota tidak boleh berubah surut.

### FR-006 — Validasi oleh asisten manager

**Asal:** USER_CONFIRMED; larangan self-approval GPT_RECOMMENDED. **Nilai:** memastikan perubahan diperiksa pihak berwenang. **Dependensi:** FR-002,004,005. **Tujuan/perjalanan:** G-002 / J-002,J-003.

**Kriteria penerimaan:**
1. Asmen melihat antrean pengajuan binaannya serta detail usulan baru/perbandingan perubahan.
2. Setujui hanya tersedia untuk pengajuan Menunggu Validasi dengan data valid, cakupan sah, dan versi sumber yang masih berlaku.
3. Pengembalian untuk revisi wajib disertai alasan; guru melihat alasan, mengubah draf revisi, lalu dapat mengajukan ulang.
4. Persetujuan menerapkan seluruh perubahan dan mencatat keputusan dalam satu operasi atomik; jika gagal, data aktif serta status tetap seperti sebelum percobaan.
5. Percobaan persetujuan ganda/bersamaan menghasilkan satu keputusan efektif; retry tidak membuat kelompok atau versi ganda.
6. Rekomendasi: pemohon tidak boleh menyetujui sendiri; bila akun multi-role diperbolehkan, tentukan pengganti reviewer sebelum implementasi.

**Status:** pending, approved, returned, validation error, forbidden, konflik, timeout/retry. **Audit:** reviewer, keputusan, waktu, alasan, versi.

### FR-007 — Status, riwayat, dan hasil perubahan

**Asal:** USER_CONFIRMED; detail state ASSUMPTION. **Nilai:** guru mengetahui apa yang berlaku dan apa yang perlu dikerjakan. **Dependensi:** FR-004–006. **Tujuan/perjalanan:** G-002 / J-002,J-003.

**Kriteria penerimaan:**
1. Alur minimum: Draf → Menunggu Validasi → Disetujui atau Dikembalikan untuk Revisi → Draf Revisi → Menunggu Validasi.
2. Usulan yang dikirim tidak dapat diedit diam-diam; revisi yang dikirim ulang menyimpan jejak versi sebelumnya.
3. Guru melihat status pengajuan sendiri, alasan pengembalian, waktu keputusan, dan versi aktif; Asmen melihat pengajuan dalam cakupannya.
4. Sesudah disetujui, data aktif berubah dan riwayat lama tetap dapat ditelusuri oleh pengguna yang berwenang.
5. “Ditolak permanen”, pembatalan, penarikan, dan pengarsipan bukan state MVP yang diasumsikan tersedia; perlu keputusan jika diperlukan.

**Status:** seluruh state pengajuan, kosong, sukses, gagal, denied. **Audit:** transisi append-only sesuai kebijakan retensi yang akan diputuskan.

### FR-008 — Laporan pekanan mempertahankan fungsi dan field existing

**Asal:** USER_CONFIRMED. **Nilai:** perbaikan akses tidak menghilangkan kebutuhan pelaporan. **Dependensi:** FR-002,009. **Tujuan/perjalanan:** G-003 / J-004.

**Kriteria penerimaan:**
1. Inventaris seluruh field, pilihan kode dan artinya, aturan wajib/bersyarat, perhitungan, status, dan koreksi laporan existing disetujui sebelum migrasi; field yang belum terlihat tidak boleh dihapus.
2. Guru dapat mengisi laporan kelompoknya: pelaksanaan/alasan, buku/materi, tanggal, jam, halaman, serta seluruh isian anggota existing termasuk kehadiran, kontrol, kontak, buletin cetak/digital, dan SPP.
3. Simpan Draft dan Kirim Laporan memberi hasil berbeda yang jelas; gagal simpan/kirim tidak menampilkan sukses.
4. Ringkasan sebelum kirim memungkinkan guru memeriksa seluruh isian; validasi bersyarat “Tidak Terlaksana” mengikuti aturan existing yang telah diinventaris.
5. Pengiriman ulang akibat klik ganda/retry tidak membuat duplikat laporan untuk kunci bisnis yang telah disepakati.
6. Laporan Submitted tetap baca saja; pengajuan edit existing dipertahankan setelah alurnya diinventaris. Jangan otomatis memakai aturan validasi perhalaqahan untuk koreksi laporan (OQ-004).

**Status:** loading, draf, validation error, submitted, offline, gagal/timeout/retry. **Audit:** simpan/kirim/koreksi tanpa isian pribadi di log umum.

### FR-009 — Periode dan keutuhan sejarah

**Asal:** GPT_RECOMMENDED untuk konsistensi; kebutuhan preservasi USER_INFERRED. **Nilai:** laporan tidak bergeser karena perubahan master. **Dependensi:** FR-005,008. **Tujuan/perjalanan:** G-003 / J-004.

**Kriteria penerimaan:**
1. Satu periode mempunyai identitas dan rentang tanggal yang konsisten di beranda, daftar, form, dan rekap.
2. Jika “Pekan 41” dan “Pekan 2” mewakili kalender berbeda, keduanya diberi label yang menjelaskan artinya; definisi menunggu OQ-003.
3. Perubahan guru, anggota, jadwal, atau materi tidak menghapus maupun menulis ulang laporan terkirim; laporan tetap menunjuk konteks historisnya.
4. Pilihan strategi snapshot/versi dan tanggal efektif harus ditetapkan sebelum migrasi; tidak menebak akses guru lama/baru ke laporan historis.

**Status:** periode kosong, invalid, stale, sukses. **Audit:** koreksi periode jika diizinkan; tidak ada migrasi destruktif otomatis.

### FR-010 — Pemantauan manager dan asisten manager

**Asal:** USER_CONFIRMED; detail drill-down UNSPECIFIED. **Nilai:** pemantauan mengikuti tanggung jawab. **Dependensi:** FR-002,003,008,009. **Tujuan/perjalanan:** G-001,G-003 / J-005.

**Kriteria penerimaan:**
1. Manager melihat rekap mahali yang ditugaskan; Asmen melihat rekap dan status pelaporan kelompok binaannya.
2. Filter periode dan kelompok tidak memperluas cakupan akses dan selalu memperbarui daftar serta agregat dengan kondisi sama.
3. Agregat mempertahankan definisi existing yang disahkan; perubahan formula bukan bagian perbaikan ini.
4. Detail pribadi/SPP manager hanya diaktifkan setelah OQ-002 diputuskan; default sementara hanya rekap.
5. Sistem membedakan laporan belum dikirim, tidak terlaksana, dan nilai terlapor nol.

**Status:** loading, kosong/filter kosong, sukses, gagal, stale, denied. **Analitik:** penggunaan filter tanpa payload pribadi.

### FR-011 — Administrasi akun, role, dan penugasan

**Asal:** USER_CONFIRMED untuk akun/role/pengaturan; penugasan akses merupakan turunan kebutuhan. **Nilai:** cakupan role dapat dioperasikan. **Dependensi:** FR-002. **Tujuan/perjalanan:** G-001 / J-006.

**Kriteria penerimaan:**
1. Admin dapat mengelola akun, role dan pengaturan sesuai fungsi existing yang diinventaris; perubahan hak akses menampilkan ringkasan sebelum disimpan.
2. Hubungan guru–kelompok, Asmen–binaan, manager–mahali disimpan eksplisit; penugasan tidak valid ditolak.
3. Admin tidak otomatis mendapat izin mengubah laporan atau menyetujui perhalaqahan.
4. Perubahan penugasan tidak memindahkan kepemilikan historis tanpa aturan OQ-005/OQ-006.

**Status:** sukses, validation error, forbidden, konflik, gagal. **Audit:** nilai akses sebelum/sesudah, pelaku, waktu; jangan catat password/token.

### FR-012 — Audit dan kegagalan yang dapat dipulihkan

**Asal:** USER_CONFIRMED untuk riwayat perubahan; GPT_RECOMMENDED untuk detail operasi. **Nilai:** keputusan dapat ditelusuri dan kegagalan tidak merusak data. **Dependensi:** FR-002,006–011. **Tujuan/perjalanan:** G-001–003 / J-002,J-003,J-004,J-006.

**Kriteria penerimaan:**
1. Audit mencatat pelaku, tindakan, objek/versi, waktu, hasil, dan alasan keputusan jika ada; akses audit mengikuti cakupan tugas.
2. Kegagalan parsial tidak menghasilkan status Disetujui dengan data lama atau data baru tanpa keputusan.
3. Retry yang sama tidak menduplikasi efek; waktu tunggu yang habis memberi pesan hasil belum pasti dan cara memeriksa status sebelum mencoba ulang.
4. Log operasional/analitik tidak berisi password, token, data kontak pribadi, atau seluruh isi laporan; detail perbedaan disimpan dalam riwayat bisnis dengan akses terbatas.

**Status:** sukses, partial failure, timeout, retry, denied. **Catatan:** retensi audit dan pelaku yang boleh membacanya perlu ditetapkan.

## 11. UX dan arsitektur informasi

| Role | Halaman awal | Menu inti | Tindakan utama |
|---|---|---|---|
| Guru | Pekerjaan Saya Pekan Ini | Halaqah Saya; Anggota Halaqah Saya; Laporan Saya; Pengajuan Saya | Isi/Lanjutkan Laporan; Ajukan Halaqah; Ajukan Perubahan |
| Asmen | Binaan dan Validasi | Ringkasan Binaan; Kelompok Binaan; Laporan Binaan; Validasi Perhalaqahan | Tinjau; Setujui; Kembalikan untuk Revisi |
| Manager | Ringkasan Mahali | Rekap Mahali; Status Pelaporan; Ringkasan per Asmen | Filter periode; identifikasi kebutuhan tindak lanjut |
| Admin | Administrasi | Akun; Role dan Penugasan; Pengaturan | Kelola akun/akses dan konfigurasi |

Nama/urutan menu merupakan GPT_RECOMMENDED. Guru tidak dibebani ringkasan eksekutif mahali. Beranda memprioritaskan tugas tertunda, lalu ringkasan kelompok sendiri. Tombol penting diberi teks; ikon dapat menjadi pelengkap. Gunakan “Draf”, “Dikirim”, “Menunggu Validasi”, “Disetujui”, dan “Dikembalikan untuk Revisi” dengan makna tetap; status laporan dibedakan dari status pengajuan.

Form perhalaqahan mengelompokkan identitas, penanggung jawab, anggota, materi, jadwal, tempat. Halaman review memperlihatkan data aktif dan usulan berdampingan di desktop, berurutan dengan label jelas di ponsel. Daftar anggota harus tetap dapat dipakai tanpa tabel melebar seluruh halaman. Identitas role dan cakupan aktif terlihat; role tidak dapat dipilih pengguna untuk menaikkan haknya.

Pertahankan tiga langkah laporan jika inventaris dan pengujian menunjukkan alur tersebut diperlukan. Tampilkan progres serta status penyimpanan aktual; jangan menambahkan klaim autosave bila belum dibangun. Tidak ada kebutuhan mengganti merek, warna, atau tema pada MVP.

### Persyaratan mobile wajib — NFR-003

**Hasil USER_CONFIRMED:** aplikasi dapat dipakai dari ponsel untuk seluruh fungsi inti empat role. Kriteria teknis rancangan berikut wajib diverifikasi sebelum rilis; perubahan angka dapat ditinjau tanpa menghapus kebutuhan mobile friendly.

1. Layout dirancang mulai dari layar ponsel. Uji pada lebar viewport 360, 390, dan 430 CSS px, tablet 768 px, serta desktop 1280 px. Tidak ada teks, form, modal, atau tombol terpotong; halaman tidak memerlukan scroll horizontal. Tabel rekap yang benar-benar membutuhkan dua dimensi boleh memakai scroll lokal berlabel, dengan identitas baris dan tindakan tetap dapat diakses.
2. Navigasi ponsel memakai menu ringkas yang dapat dibuka/ditutup melalui sentuhan dan keyboard, memperlihatkan role aktif, serta hanya memuat fungsi role tersebut. Drawer tidak menutupi halaman setelah ditutup; fokus kembali ke pemicunya.
3. Form ponsel memakai satu kolom. Input utama menggunakan ukuran teks minimal 16 CSS px; target sentuh tombol, ikon interaktif, dan pilihan minimal 44 × 44 CSS px. Tidak ada tindakan yang hanya tersedia melalui hover.
4. Daftar halaqah, anggota, laporan, dan pengajuan menampilkan informasi serta tindakan penting dalam susunan yang terbaca di ponsel. Kehadiran/kontrol/kontak/SPP tidak dipaksakan menjadi tabel lebar; gunakan blok per anggota atau susunan responsif setara tanpa menghilangkan field.
5. Guru dapat menyelesaikan isi laporan, simpan draf, tinjau ringkasan, kirim, buat pengajuan, dan revisi pengajuan di ponsel. Asmen dapat membaca semua perbedaan, menyetujui, serta mengisi alasan pengembalian. Manager dapat memakai filter dan membaca rekap. Admin dapat mengelola akun/role/penugasan tanpa bergantung pada desktop.
6. Keyboard layar tidak menutupi field aktif, pesan validasi, atau tindakan utama. Tombol melekat jika digunakan tidak menutupi isi terakhir; pertimbangkan area aman perangkat. Modal panjang dapat digulir dan tombol tutup/konfirmasi tetap terjangkau.
7. Beralih orientasi atau ukuran layar tidak membuang isian yang belum dikirim. Loading, kesalahan, konflik, offline, dan hasil penyimpanan terbaca di layar kecil; tampilkan status tersimpan hanya setelah server mengonfirmasi. Ini tidak menambahkan fitur sinkronisasi offline.
8. Safari iOS dan Chrome Android menjadi sasaran verifikasi mobile yang direkomendasikan, dengan versi aktual dan perangkat dicatat saat pengujian. Uji minimal satu perangkat fisik Android dan satu iPhone atau lingkungan perangkat setara; emulasi ukuran layar saja tidak cukup untuk membuktikan perilaku keyboard dan sentuhan.

Tidak boleh menandai aplikasi mobile friendly hanya karena halaman dapat dibuka atau mengecil. Bukti penerimaan adalah penyelesaian tugas inti di layar ponsel tanpa fungsi hilang, terpotong, atau tak terjangkau.

## 12. Status aplikasi dan respons UI

| Kondisi | Respons yang diwajibkan |
|---|---|
| Loading | Penanda muat; tombol kirim/review tidak dapat dipicu berulang |
| Kosong awal | Jelaskan belum ada penugasan/halaqah/pengajuan; tampilkan tindakan yang berwenang |
| Filter kosong | “Tidak ada hasil untuk filter ini”, sediakan reset |
| Sukses | Konfirmasi objek, status terbaru, dan tindakan berikutnya |
| Validasi | Pesan pada field dan ringkasan; input tidak hilang |
| Sistem error | Pesan dapat dipahami dan identifier bantuan tanpa rincian internal |
| Unauthorized | Minta login kembali; jangan bocorkan data atau hilangkan input tanpa penjelasan |
| Permission denied | Tolak server; UI menjelaskan akses terbatas tanpa membocorkan objek |
| Offline | Jelaskan belum tersimpan; sinkronisasi offline tidak termasuk MVP |
| Stale / konflik | Tunjukkan bahwa versi berubah dan minta review ulang |
| Partial completion | Operasi persetujuan atomik; jangan laporkan sukses sebagian |
| Timeout / retry | Periksa status operasi; cegah efek ganda sebelum retry |
| Rate limit | Beri pesan coba lagi sesuai kebijakan existing; nilai batas belum diketahui |

Seluruh status telah dipertimbangkan; implementasi mengikuti relevansi pada tiap FR, bukan membuat fitur offline baru.

## 13. Matriks hak akses

“Sendiri” dan “binaan” selalu berarti penugasan sah pada server. Kolom ini tidak memberi izin lintas mahali. Tidak ada role kelima.

| Kemampuan | Guru | Asmen | Manager | Admin |
|---|---|---|---|---|
| Lihat beranda | Tugas sendiri | Binaan | Rekap mahali | Administrasi |
| Lihat halaqah/anggota | Sendiri | Binaan | Rekap; detail belum diputuskan | Tidak otomatis |
| Buat halaqah | Ajukan | Validasi pengajuan binaan | Tidak ditetapkan | Tidak otomatis |
| Ubah master halaqah | Ajukan perubahan sendiri | Setujui/kembalikan binaan | Tidak ditetapkan | Tidak otomatis |
| Lihat pengajuan | Sendiri | Binaan | Belum diputuskan | Audit teknis terbatas bila diperlukan; belum diputuskan |
| Isi/kirim laporan | Kelompok sendiri | Tidak otomatis | Tidak | Tidak otomatis |
| Lihat laporan | Sendiri | Binaan | Rekap; detail belum diputuskan | Tidak otomatis |
| Edit laporan terkirim | Alur pengajuan existing; keputusan reviewer belum diketahui | Belum diputuskan | Tidak otomatis | Tidak otomatis |
| Lihat SPP | Kelompok sendiri | Binaan sesuai tugas pelaporan | Rekap; rincian belum diputuskan | Tidak otomatis |
| Ekspor | Tidak ada fitur baru; existing mengikuti cakupan | Sama | Sama | Sama |
| Kelola akun/role/pengaturan | Tidak | Tidak | Tidak | Ya |
| Hapus/arsip kelompok | Belum diputuskan; bukan tindakan baru MVP | Sama | Sama | Sama |

Sel yang belum diputuskan memakai **deny by default** untuk fitur baru. Sebelum menutup akses existing, inventaris dan keputusan pemilik produk diperlukan agar fungsi bisnis yang sah tidak terputus. Hak baca administrator infrastruktur tidak boleh disamakan dengan hak operasional dalam aplikasi.

## 14. Kebutuhan data

Model berikut konseptual, bukan perintah mengganti tabel existing.

| ID | Entitas / field utama | Hubungan, validasi dan siklus hidup |
|---|---|---|
| DATA-001 | Akun/Role/Penugasan: user_id, role, aktif, scope_id, masa berlaku | Identitas terautentikasi; empat role. Multi-role dan masa berlaku perlu keputusan. Tidak menyimpan kredensial di PRD/log |
| DATA-002 | Struktur cakupan: mahali, Asmen, kelompok, relasi penugasan | Hierarki existing harus diinspeksi; identifier cakupan tidak dipercaya dari client |
| DATA-003 | Perhalaqahan aktif: id/kode, nama, guru, anggota, materi, jadwal, tempat, cakupan, versi | Guru–kelompok dan keanggotaan eksplisit; kode unik sesuai aturan existing; aktif setelah validasi |
| DATA-004 | Pengajuan/revisi: id, create/update, pemohon, kelompok target, versi sumber, payload usulan, status, reviewer, alasan, timestamps | Perubahan anggota disimpan sebagai diff atau representasi setara; pengajuan disetujui tidak diedit; retry tidak menghasilkan efek ganda |
| DATA-005 | Anggota/pemuda: id, atribut existing, tipe, relasi kelompok | Data pribadi dan kegiatan terbatas. Jangan menambah field identitas/kontak yang tidak dibutuhkan; aturan keanggotaan rangkap belum diketahui |
| DATA-006 | Periode dan laporan: id periode, tanggal mulai/akhir, kelompok/versi konteks, status, field laporan existing | Kunci unik laporan mengikuti aturan existing yang disahkan; konteks historis tidak berubah oleh master terkini |
| DATA-007 | Detail laporan anggota: relasi laporan–anggota, kehadiran, kontrol, kontak, buletin, SPP, field lain hasil inventaris | Kode dan makna harus dipertahankan; nominal/angka divalidasi sesuai aturan existing, bukan ditebak |
| DATA-008 | Audit: actor, action, target/version, time, outcome, reason, correlation_id | Riwayat bisnis terbatas; log umum tidak memuat payload sensitif; retensi/deletion belum ditetapkan |

Klasifikasi: identitas anggota, aktivitas kelompok, dan isi laporan bersifat internal terbatas; kegiatan dalam konteks ini dapat mengungkap afiliasi/keyakinan sehingga perlakukan sebagai informasi sensitif untuk desain akses. SPP merupakan data nominal keuangan. Data contoh menggunakan akun/anggota sintetis, bukan salinan produksi. Retensi, penghapusan, pemindahan anggota, impor/ekspor, dan akses historis memerlukan keputusan. Tidak ada penghapusan fisik otomatis pada migrasi.

## 15. Integrasi

INT-001 — Integrasi internal dengan autentikasi, master kelompok/anggota, periode, laporan, dan perhitungan existing. Status USER_INFERRED: produk existing harus tetap bekerja; cara integrasi UNSPECIFIED sampai inspeksi repository. Arah baca/tulis internal, autentikasi melalui sesi existing, validasi cakupan di setiap operasi. Trigger: pembukaan halaman, simpan, pengajuan, keputusan. Kegagalan memberi status jelas; persetujuan atomik; retry idempoten. Timeout dan rate limit numerik belum diketahui. Tidak ada integrasi pihak ketiga baru yang disetujui.

## 16. AI

Tidak ada fitur AI dalam produk yang diminta. Penggunaan coding agent untuk implementasi bukan kebutuhan AI aplikasi. Tidak menambahkan model, chatbot, atau keputusan otomatis atas persetujuan.

## 17. Kebutuhan nonfungsional

| ID | Kebutuhan / target | Pengukuran / asal |
|---|---|---|
| NFR-001 | Otorisasi server mencakup semua operasi dan agregat; semua uji negatif cakupan harus ditolak | Uji integrasi lintas akun/role; GPT_RECOMMENDED, mendukung G-001 |
| NFR-002 | Persetujuan atomik, konflik versi terdeteksi, retry tidak menghasilkan duplikat | Uji race, timeout, dan injeksi kegagalan; GPT_RECOMMENDED |
| NFR-003 | Seluruh alur inti empat role wajib mobile friendly; kriteria rancangan: viewport 360/390/430/768/1280 CSS px, target sentuh minimal 44 × 44 px, input utama minimal 16 px, tanpa overflow halaman atau fungsi khusus desktop | USER_CONFIRMED untuk hasil mobile friendly; detail teknis rancangan dan uji tugas, keyboard layar, orientasi, fokus, label/error mengikuti bagian 11 |
| NFR-004 | Data pribadi, keuangan, kredensial tidak masuk log/analitik umum; riwayat bisnis dibatasi | Review logging, payload, dan izin audit; GPT_RECOMMENDED |
| NFR-005 | Target p95 latency, pengguna bersamaan, ukuran dataset, uptime, RPO/RTO: UNSPECIFIED | Benchmark setelah beban dan lingkungan disepakati; tanpa klaim performa |
| NFR-006 | Field, pilihan, nominal, periode, dan jumlah laporan hasil migrasi cocok dengan inventaris baseline yang disahkan | Rekonsiliasi pra/pascamigrasi dan restore di staging; USER_INFERRED |
| NFR-007 | Bahasa Indonesia dan tanggal/rentang pekan konsisten; zona waktu mengikuti kebijakan produk yang disepakati | Uji batas tanggal dan format; GPT_RECOMMENDED. Asia/Jakarta digunakan pada dokumen, bukan bukti seluruh pengguna di zona itu |
| NFR-008 | Browser dan perangkat sasaran selain Edge: UNSPECIFIED; suite otorisasi dan transisi harus dapat dijalankan ulang | Uji kompatibilitas setelah daftar sasaran disepakati; pemeliharaan dan observabilitas masuk rencana rilis |

## 18. Keamanan dan privasi

Titik kepercayaan: client tidak berwenang menentukan role, kepemilikan, reviewer, atau status aktif. Server memeriksa sesi, penugasan, keadaan objek, dan versi. List/search/detail/agregat/ekspor dilindungi kebijakan sama. Hak admin aplikasi dipisah dari keputusan bisnis Asmen. Gunakan mekanisme autentikasi, validasi, proteksi request, dan pengelolaan secret existing setelah diinspeksi; jangan menulis kredensial di source, fixture, atau dokumen.

Persetujuan dan perubahan akses dicatat. Tampilan error tidak membocorkan rincian pribadi atau keberadaan objek di luar cakupan. Kebijakan transport, enkripsi penyimpanan, backup, akses infrastruktur, retensi, penghapusan, pemulihan akun, dan batas percobaan login perlu diverifikasi sebelum rilis; tidak ada klaim kepatuhan atau keamanan implementasi saat ini.

REQUIRES_SPECIALIST_REVIEW: tata kelola data pribadi/kegiatan yang berpotensi mengungkap keyakinan dan data SPP; status usia anggota dan kebutuhan penanganan data anak perlu diklarifikasi. Ini catatan peninjauan desain, bukan kesimpulan hukum atau perluasan fitur.

## 19. Analitik dan observabilitas

Catat peristiwa tugas: draft_saved, request_submitted, request_returned, request_approved, report_submitted, authorization_denied, assignment_changed. Definisi, penyimpanan dan alat analitik belum dipilih. Data minimum: tipe event, waktu, identifier operasi/objek yang dibatasi aksesnya, role/cakupan yang diperlukan, hasil, durasi. Jangan kirim nama anggota, alasan pribadi, nominal individual, kontak, atau payload form ke layanan analitik eksternal.

Pantau kegagalan persetujuan, konflik versi, percobaan duplikat, dan penolakan akses berulang. Ambang alert dan penerima operasional UNSPECIFIED; tidak menambahkan notifikasi eksternal. Rekap performa mempertahankan formula existing sampai pemilik definisi metrik menyetujuinya.

## 20. Pengujian dan validasi

| ID | Pengujian | FR terkait |
|---|---|---|
| TEST-001 | Role/menu dan akun tanpa penugasan; empat akun role serta minimal dua Guru/Asmen berbeda | FR-001–003 |
| TEST-002 | Identifier/parameter tampering, pencarian, agregat, ekspor existing, pencabutan akses, client field escalation | FR-002,010,011 |
| TEST-003 | Buat halaqah → draf → pengajuan → persetujuan → aktif; tanpa reviewer dan validasi field | FR-004,006,007 |
| TEST-004 | Perubahan → data lama tetap aktif → dikembalikan dengan alasan → revisi → disetujui; riwayat lengkap | FR-005–007,012 |
| TEST-005 | Dua reviewer bersamaan, versi stale, timeout, retry, kegagalan transaksi; tidak ada efek parsial/ganda | FR-005,006,012 |
| TEST-006 | Field/kode/aturan laporan existing; simpan draf, tidak terlaksana, kirim, submitted read-only, alur koreksi existing | FR-008 |
| TEST-007 | Batas periode, dua label nomor pekan, perubahan anggota/guru dan akses historis sesuai keputusan | FR-009 |
| TEST-008 | Rekap sesuai scope/filter; belum ada data vs nilai nol; formula baseline tidak berubah | FR-003,010 |
| TEST-009 | Audit, kebocoran log, perubahan hak akses, kegagalan dan retry | FR-011,012 |
| TEST-010 | Rekonsiliasi migrasi, backup/restore dan rollback di staging | FR-002,008,009; NFR-006 |
| TEST-011 | Uji seluruh tugas inti empat role pada viewport 360/390/430/768/1280 px; sentuhan, keyboard layar, orientasi, navigasi, form, modal, diff, tabel, target sentuh, label/error, kosong, offline dan sesi habis; catat browser/perangkat serta bukti visual | FR-001–012; NFR-003 |

Unit: evaluator izin, validasi dan transisi. Integrasi: query scope, transaksi persetujuan, kontrak existing. E2E: perjalanan J-001–006. Uji kinerja/kompatibilitas menunggu target. Semua di atas merupakan rencana, **belum dieksekusi terhadap aplikasi**.

## 21. Kriteria rilis

**Siap mulai implementasi terkait:** repository/inventaris tersedia; keputusan penghambat untuk modul itu diselesaikan; data uji dan staging tersedia; setiap tugas mengacu ID PRD. Tidak perlu menunda seluruh perencanaan jika hanya keputusan detail nonblokir yang tersisa.

**Siap rilis:** seluruh FR MVP yang telah disahkan lulus; nol akses lintas cakupan pada suite penerimaan; alur persetujuan atomik dan historis benar; field laporan tidak hilang; migrasi direkonsiliasi; restore/rollback dibuktikan; pemilik operasi dan prosedur bantuan ditetapkan. Target NFR yang belum disepakati tidak boleh dilaporkan lulus.

**Penghambat rilis:** kebocoran lintas role/scope, perubahan master tanpa validasi, data lama tertimpa/hilang, status persetujuan tidak konsisten, atau aturan laporan historis belum diputuskan. Rollback harus menghentikan penulisan yang berisiko dan menjaga pengajuan/laporan baru; strategi tepat ditentukan setelah inspeksi schema. Jangan memulihkan backup dengan menghapus transaksi baru tanpa rekonsiliasi.

**Gerbang rilis mobile:** TEST-011 dan seluruh kriteria NFR-003 harus lulus untuk alur inti keempat role. Fungsi yang hanya dapat diselesaikan di desktop, kontrol terpotong/tak dapat disentuh, atau keyboard layar yang menghalangi penyelesaian tugas adalah penghambat rilis. Lampirkan hasil pengujian dan screenshot per role/perangkat; pengujian ini belum dilakukan pada aplikasi existing.

## 22. Risiko

| ID | Risiko / kemungkinan / dampak | Mitigasi dan kontingensi | Terkait |
|---|---|---|---|
| RISK-001 | Menu sudah terpisah tetapi data server masih global / UNKNOWN / CRITICAL | Kebijakan scope bersama dan uji negatif; blokir rilis jika bocor | FR-001,002 |
| RISK-002 | Perubahan anggota/guru merusak sejarah / MEDIUM / HIGH | Tetapkan tanggal efektif/snapshot; rekonsiliasi dan rollback teruji | FR-005,009 |
| RISK-003 | Pengajuan tidak punya reviewer atau reviewer berganti / UNKNOWN / HIGH | Penugasan eksplisit, blokir kirim tanpa reviewer; proses reasign perlu keputusan | FR-004,006 |
| RISK-004 | Field/kode atau formula lama hilang saat redesain / MEDIUM / HIGH | Inventaris/regresi sebelum migrasi; hentikan migrasi bila hasil berbeda | FR-008,010 |
| RISK-005 | Persetujuan ganda atau overwrite versi / MEDIUM / HIGH | Transaksi, versi sumber, operasi idempoten; konflik harus direview ulang | FR-005,006,012 |
| RISK-006 | Hak admin/multi-role terlalu luas / UNKNOWN / HIGH | Deny default; putuskan delegasi dan self-approval | FR-002,011 |
| RISK-007 | Data pribadi/kegiatan/SPP terbuka melalui ekspor/log / UNKNOWN / HIGH | Minimisasi, scope ekspor, review logging dan tata kelola; blokir keluaran yang bocor | FR-002,012 |

Seluruh risiko OPEN; owner UNASSIGNED sampai penanggung jawab ditetapkan.

## 23. Pertanyaan terbuka

| ID | Pertanyaan / rekomendasi awal | Dampak / status |
|---|---|---|
| OQ-001 | Bagaimana mahali, Asmen, guru, dan kelompok saling ditugaskan? Apakah banyak mahali? | Menghambat finalisasi kebijakan akses dan migrasi |
| OQ-002 | Apakah manager perlu detail individu/SPP dan admin perlu membaca isi laporan? Default usulan: rekap manager; admin administratif | Menghambat pemberian akses detail baru |
| OQ-003 | Apa beda Pekan 41 dan Pekan 2? Kapan pekan dibuka/ditutup; boleh terlambat/mundur? | Menghambat perubahan logika periode; jangan ubah definisi lama tanpa jawaban |
| OQ-004 | Siapa memvalidasi koreksi laporan terkirim dan bagaimana alur existing? | Menghambat perubahan alur koreksi; inventaris/preservasi tetap dapat dimulai |
| OQ-005 | Siapa mengajukan pergantian guru, ke mana persetujuan diarahkan, kapan efektif, siapa melihat sejarah? | Menghambat implementasi perpindahan pengampu/anggota |
| OQ-006 | Apakah satu anggota boleh di beberapa kelompok? Apakah perubahan berlaku di tengah pekan? | Menghambat kontrak keanggotaan dan konteks laporan |
| OQ-007 | Apakah satu akun boleh beberapa role? Siapa reviewer pengganti jika Asmen menjadi pemohon/berhalangan? | Menghambat multi-role/delegasi; jangan membuat bypass |
| OQ-008 | Repository, stack, schema, staging, hosting, target rilis, dan penanggung jawab teknis? | Menghambat handoff implementasi yang spesifik |
| OQ-009 | Apakah ada anggota anak; siapa boleh mengakses apa, berapa lama data/audit disimpan, bagaimana penghapusan/backup? | Menghambat finalisasi tata kelola dan rilis |
| OQ-010 | Setuju satu pengajuan terbuka, tanpa penolakan permanen/penarikan, dan aktif langsung setelah disetujui? | Menghambat detail state dan konflik; rekomendasi awal belum final |
| OQ-011 | Apa target waktu tugas, performa, beban, pemulihan, dan daftar browser/perangkat? | Menghambat penetapan target NFR; bukan alasan menebak angka |

Owner seluruh pertanyaan: pemilik produk bersama penanggung jawab teknis; tenggat UNSPECIFIED. Jawaban awal pengguna telah dimasukkan; pertanyaan di atas tidak mengulang pembagian role atau lingkup field yang sudah disetujui.

## 24. Register asumsi

| ID | Asumsi / alasan | Risiko dan validasi | Status |
|---|---|---|---|
| ASM-001 | “Perhalaqahan” mencakup seluruh data menu Kursus Saya | Dikonfirmasi pengguna: guru, anggota, materi, jadwal, tempat | VALIDATED |
| ASM-002 | Satu tahap validasi Asmen cukup untuk pengajuan perhalaqahan | Bisa memerlukan lintas wilayah; konfirmasi OQ-001,005,007 | OPEN |
| ASM-003 | Satu pengajuan terbuka per kelompok | Membatasi konflik tetapi mungkin menghambat kerja; konfirmasi OQ-010 | OPEN |
| ASM-004 | Aktivasi berlaku sejak persetujuan dan tidak surut | Belum menjawab pertengahan pekan; konfirmasi OQ-005,006,010 | OPEN |
| ASM-005 | Sistem existing disesuaikan tanpa mengganti stack | Stack belum diinspeksi; validasi repository/OQ-008 | OPEN |
| ASM-006 | Laporan mengikat konteks historis anggota/guru melalui snapshot atau versi | Cara existing belum diketahui; pilih setelah inspeksi/OQ-005,006 | OPEN |

Pemilik validasi: pemilik produk dan penanggung jawab teknis, nama UNASSIGNED. Tidak ada konflik keputusan pengguna yang teridentifikasi. Ambiguitas penomoran pekan merupakan konflik tampilan/istilah, bukan bukti konflik kebutuhan.

## 25. Ketertelusuran dan review kualitas

| FR | Tujuan | Perjalanan | Kriteria tersedia | Uji | Status |
|---|---|---|---|---|---|
| FR-001 | G-001,G-004 | J-001 | Ya | TEST-001,011 | Draf |
| FR-002 | G-001 | J-001,006 | Ya | TEST-001,002 | Draf; OQ-001,002,007 |
| FR-003 | G-001,G-004 | J-001,005 | Ya | TEST-001,008 | Draf |
| FR-004 | G-002 | J-002 | Ya | TEST-003 | Draf; reviewer/field perlu inventaris |
| FR-005 | G-002 | J-003 | Ya | TEST-004,005 | Draf; OQ-005,006,010 |
| FR-006 | G-002 | J-002,003 | Ya | TEST-003,004,005 | Draf; OQ-007 |
| FR-007 | G-002 | J-002,003 | Ya | TEST-004 | Draf; OQ-010 |
| FR-008 | G-003 | J-004 | Ya | TEST-006 | Draf; OQ-004,008 |
| FR-009 | G-003 | J-004 | Ya | TEST-007,010 | Draf; OQ-003,005,006 |
| FR-010 | G-001,G-003 | J-005 | Ya | TEST-002,008 | Draf; OQ-002 |
| FR-011 | G-001 | J-006 | Ya | TEST-002,009 | Draf; OQ-001,007 |
| FR-012 | G-001,G-002,G-003 | J-002,003,004,006 | Ya | TEST-005,009 | Draf; OQ-009 |

Kesiapan 72/100: masalah 10/10; pengguna 9/10; kriteria sukses 7/10; scope 13/15; perjalanan 12/15; data 6/10; integrasi 6/10; teknis 1/5; NFR/risiko 6/10; rilis 2/5. Skor tidak meniadakan pertanyaan penghambat.

Review kualitas internal 80/100: kelengkapan 4/5; kejelasan 4/5; keterujian 4/5; ketertelusuran 5/5; scope 4/5; state UX 4/5; kesiapan teknis 2/5; keamanan/privasi 4/5; transparansi risiko 5/5; handoff 5/5. Kekuatan: pemisahan role/scope, alur pengajuan, state gagal, dan rencana uji. Kekurangan utama: inventaris existing belum lengkap, kontrak historis dan organisasi belum diputuskan, repository belum tersedia. Klaim unsupported dihindari: tidak ada kesimpulan celah server, framework, formula salah, kepatuhan, atau hasil uji produksi. Tidak ada perluasan fitur yang disamarkan sebagai kebutuhan terkonfirmasi.
