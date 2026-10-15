# Coding-Agent Handoff — Awanputih v0.1

**Status:** PROVISIONAL. **Sumber kebenaran:** PRD-Laporan-Pekanan-v0.1.md, versi 0.1, 15 Oktober 2026. **Target:** coding agent yang bekerja pada repository. **Repository:** aplikasi existing, lokasi/kode belum diberikan. **Stack terkonfirmasi:** UNSPECIFIED. Jangan menganggap dokumen ini izin menerapkan keputusan terbuka.

## Misi dan batas

Perbaiki sistem existing menjadi empat role dengan akses role + penugasan. Guru hanya mengurus kelompok sendiri dan mengajukan buat/ubah perhalaqahan; Asmen memvalidasi; manager memantau rekap mahali; admin mengelola akun/role/pengaturan. Pertahankan seluruh field laporan existing. Data aktif berubah setelah persetujuan; sejarah laporan tidak berubah surut.

Tidak ada aplikasi native, AI, integrasi pesan, pembayaran daring, formula KPI baru, atau penggantian stack. Jangan menambahkan kemampuan manager/admin melewati Asmen. Jika PRD dan handoff berbeda, ikuti PRD dan laporkan ketidaksesuaian.

## Langkah pertama: inspeksi, bukan menebak

Periksa instruksi repository, framework, pengelola paket, autentikasi/session, middleware/policy, query scope, schema, periode, pembuatan laporan, formula, seed, migrasi, ekspor, tes, CI, deployment, backup dan staging. Laporkan file/command nyata dari hasil inspeksi; dokumen ini tidak menetapkan path atau command fiktif.

Inventaris seluruh field/kode/status/alur koreksi existing, termasuk field yang tidak terlihat di audit UI. Siapkan akun sintetis: empat role, minimal dua guru dan dua Asmen dengan cakupan berbeda, serta akun tanpa penugasan. Jangan memakai data pribadi produksi sebagai fixture.

## Penghambat dan batas keputusan

OQ-001/002/007 memengaruhi akses; OQ-003 periode; OQ-004 koreksi laporan; OQ-005/006 sejarah/perpindahan; OQ-008 repository; OQ-009 tata kelola; OQ-010 state; OQ-011 NFR. Selesaikan pertanyaan relevan sebelum mengimplementasikan modul yang bergantung padanya. Modul lain boleh direncanakan sambil menunggu. Jangan mengubah asumsi menjadi keputusan pengguna.

## Arah arsitektur dan modul

Gunakan struktur existing sejauh kompatibel. Batas konseptual:

| Modul | Tanggung jawab / input-output | FR |
|---|---|---|
| Akses | Identitas + role + penugasan → keputusan izin/query scope; berlaku sama untuk UI/API/search/agregat/ekspor | FR-001,002,011 |
| Perhalaqahan aktif | Data kelompok tervalidasi dan versi/konteksnya; tidak menerima perubahan langsung dari form guru | FR-004,005,009 |
| Pengajuan | Draf/payload/versi sumber → pengajuan dan riwayat; tidak menimpa master sebelum persetujuan | FR-004–007 |
| Review | Pengajuan + reviewer sah + versi saat ini → satu keputusan atomik | FR-006,012 |
| Pelaporan | Konteks kelompok/periode dan field existing → draf/submitted/detail | FR-008,009 |
| Beranda/rekap | Query berizin + filter → tugas dan agregat sesuai cakupan | FR-003,010 |
| Audit | Peristiwa bisnis/akses → riwayat terbatas dan log minimal | FR-007,012 |

Server merupakan batas kepercayaan. Frontend tidak menentukan pemilik, reviewer, cakupan, atau status final. Hindari izin yang diulang dengan logika berbeda di setiap halaman. Rekomendasi transaksi, pengendalian versi, dan idempotensi tidak berarti kewajiban memilih library/database baru.

## Urutan milestone

| ID | Hasil / FR | Bukti selesai / tes | Tidak termasuk |
|---|---|---|---|
| M-001 | Inventaris baseline, organisasi/penugasan, keputusan terbuka dan rancangan akses / FR-002,008,009,011 | Peta field/status/route nyata; fixture; baseline rekap; pemilik produk mengesahkan aturan terkait | Migrasi produksi dan desain ulang schema tanpa bukti |
| M-002 | Otorisasi dan beranda/menu empat role / FR-001–003,011 | TEST-001,002; akses lintas guru/Asmen ditolak server; akun tanpa penugasan tidak melihat global | Memberi admin hak operasional otomatis |
| M-003 | Buat/ubah perhalaqahan dan review / FR-004–007,012 | TEST-003–005,009; data lama tetap aktif; persetujuan atomik/idempoten; alasan revisi/riwayat terbaca | Self-approval/delegasi/arsip yang belum diputuskan |
| M-004 | Pelaporan dan sejarah/rekap terjaga / FR-008–010 | TEST-006–008; rekonsiliasi field, kode, nominal, periode dan formula | Menyederhanakan field/formula tanpa persetujuan |
| M-005 | Migrasi, akses audit, UX gagal/responsif dan rilis / FR-001–012 | TEST-010,011 dan suite kritis; backup/restore/rollback; OQ rilis terselesaikan | Klaim lulus NFR tanpa target dan bukti |

Selesaikan verifikasi tiap milestone sebelum lanjut ke dependennya. Laporkan keputusan yang diperlukan beserta dampak konkret; jangan bertanya kembali tentang empat role dan pemeliharaan field yang sudah disepakati.

## Kontrak data

Ikuti DATA-001–008 di PRD. Adaptasikan relasi existing; jangan otomatis membuat ulang semuanya. Identitas role/cakupan datang dari server. Pengajuan menyimpan tipe create/update, pemohon, target, versi sumber, usulan, status, keputusan dan waktu. Master hanya memuat data yang berlaku. Laporan mengacu konteks historis yang disepakati, bukan join ke master terkini yang dapat mengubah sejarah.

Putuskan aturan keunikan kode kelompok, laporan per periode, keanggotaan rangkap, tanggal efektif, multi-role, akses historis dan retensi sebelum menetapkan constraint terkait. Migrasi bersifat aditif dahulu jika feasible; validasi jumlah dan isi, jangan menghapus kolom lama sebelum pemetaan dibuktikan. Strategi pasti mengikuti schema existing.

## Kontrak operasi konseptual

Nama berikut bukan URL endpoint yang telah ditemukan. Sesuaikan routing dan format existing setelah inspeksi.

| Operasi | Aktor/input | Hasil / kegagalan / efek |
|---|---|---|
| ListOwnHalaqah / GetOwnReport | Guru, filter/identifier | Data sendiri; identifier di luar scope ditolak tanpa kebocoran |
| SaveRequestDraft | Guru, target/versi sumber/payload yang diizinkan | Draf milik pemohon; error field tidak membuang input |
| SubmitRequest | Guru, identifier draf dan versi | Pending jika lengkap dan reviewer tersedia; retry tidak menduplikasi |
| ListReviewQueue / GetRequestDiff | Asmen, filter/identifier | Binaan saja; diff terbatas pada kebutuhan review |
| ApproveRequest | Asmen, identifier/expected version/id operasi | Master + keputusan + audit konsisten; konflik/izin/status invalid menolak; retry memberi hasil operasi yang sama |
| ReturnForRevision | Asmen, identifier/versi/alasan | Returned + alasan + riwayat; alasan wajib; penanganan race setara |
| SaveReportDraft / SubmitReport | Guru, laporan/periode/field existing | Draf atau submitted; validasi existing; duplikasi dicegah sesuai kunci bisnis disahkan |
| GetScopedSummary | Asmen/manager, filter | Agregat sesuai cakupan; data belum ada dibedakan dari nol |
| UpdateAccessAssignment | Admin, objek akses/perubahan | Penugasan valid + audit; request berikutnya memakai akses terbaru |

Kategori error: unauthenticated, forbidden, validation, conflict/stale, reviewer unavailable, timeout, transient server failure. Mapping kode/status HTTP mengikuti konvensi existing. Timeout/rate limit numerik belum disepakati. Tidak ada side effect eksternal baru. Error tak pasti harus memungkinkan pemeriksaan status operasi sebelum retry.

## Inventaris UI

Implementasikan inventory role pada PRD bagian 11 serta semua state bagian 12. Guru mendapat Halaqah Saya, Anggota Saya, Laporan Saya, Pengajuan Saya; Asmen mendapat antrean validasi dan binaan; manager mendapat rekap; admin administrasi. Buat/ubah kelompok memakai draf; review memperlihatkan perbedaan dan alasan. Label status laporan dan pengajuan dibedakan. Aktifkan hak detail/ekspor hanya sesuai keputusan PRD.

Uji loading, kosong, filter kosong, validasi, error, sesi habis, denied, offline, stale, timeout, retry. Tidak menambah sinkronisasi offline atau autosave tanpa keputusan. Mobile friendly merupakan kebutuhan terkonfirmasi dan wajib memenuhi NFR-003; pertahankan keyboard dan label yang jelas.

**Persyaratan wajib mobile:** ikuti NFR-003 dan bagian 11 PRD. Implementasikan semua alur inti empat role di ponsel. Gunakan layout ponsel terlebih dahulu, form satu kolom, menu ringkas, daftar/rekap responsif, target sentuh minimal 44 × 44 CSS px, input utama minimal 16 CSS px. Tidak ada fungsi yang hanya tersedia melalui hover atau desktop. Pastikan keyboard layar, orientasi, area aman perangkat, modal, dan tombol melekat tidak menutupi isi atau tindakan.

TEST-011 mencakup viewport 360/390/430/768/1280 CSS px dan seluruh FR-001–012. Verifikasi tugas Guru, review Asmen, rekap Manager, serta administrasi Admin; sertakan Android dan iPhone/perangkat setara, dengan Chrome Android dan Safari iOS sebagai sasaran browser yang direkomendasikan. Catat versi dan bukti aktual; jangan mengaku menguji perangkat yang tidak tersedia. Kegagalan penyelesaian alur inti mobile memblokir milestone M-005 dan rilis. Tidak ada kewajiban membuat aplikasi native.

## Keamanan dan pengujian

Terapkan default deny, pemeriksaan objek/scope, validasi input, proteksi request dan pengelolaan secret yang sesuai stack existing. Jangan mengambil role/reviewer/status dari input bebas. Riwayat bisnis berisi diff secukupnya dan dibatasi; log umum tidak berisi payload pribadi. Jangan mengklaim aman/compliant hanya karena menu tersembunyi.

TEST-001–011 di PRD adalah rencana wajib sesuai modul, bukan hasil yang sudah dijalankan. Prioritas: negative authorization, state transition, concurrency/partial failure, regression laporan, migrasi dan restore. Tambahkan pengujian yang membuktikan perilaku, bukan yang hanya menyalin implementasi. Target performa/retensi/ketersediaan menunggu keputusan.

## Larangan asumsi dan definition of done

Jangan menebak: stack/schema/command; seluruh pelajar anak; akses admin global; manager boleh mengedit laporan; multi-role; guru boleh mengambil anggota kelompok lain; anggota hanya satu kelompok; formula KPI; penomoran pekan; reviewer koreksi laporan; tanggal efektif perpindahan; retensi dan legal compliance.

Selesai berarti FR yang disahkan dipenuhi, suite terkait lulus, state gagal dan akses diuji, field/laporan lama utuh, migrasi/rollback terdokumentasi, pertanyaan penghambat tidak disembunyikan, serta tidak ada fitur di luar scope. Belum boleh menandai implementasi penuh selesai selama keputusan penghambatnya belum tersedia.

## Format laporan penyelesaian

Laporkan ringkasan hasil; file yang diubah; FR yang dipenuhi; tes dan hasil aktual; migrasi/konfigurasi; penyimpangan PRD; asumsi baru; keterbatasan; pekerjaan tersisa; risiko operasi/keamanan. Pisahkan “diimplementasikan”, “diuji”, dan “belum diverifikasi”.
