# Skenario Pengujian Kebutuhan Fungsional (FR)

Dokumen ini berisi 18 skenario pengujian spesifik, di mana setiap skenario dirancang untuk menguji satu Kebutuhan Fungsional (FR) secara mandiri untuk sistem Dapur Ceu El.

---

### Skenario FR-01: Menampilkan Katalog Produk
- **Kebutuhan**: Sistem menampilkan katalog produk (nama, foto, kategori, harga, status ketersediaan).
- **Langkah**:
  1. Akses halaman utama sistem (sebagai *guest* atau login sebagai Pelanggan).
  2. Buka halaman Katalog Produk (`/pelanggan`).
- **Hasil yang Diharapkan**: Sistem menampilkan daftar produk dalam bentuk kartu/tabel yang memuat nama produk, foto (jika ada), kategori, harga, dan status ketersediaan stoknya.

### Skenario FR-02: Membuat Pesanan Baru
- **Kebutuhan**: Pelanggan dapat membuat pesanan baru (satuan atau bulk order) dengan memilih produk, jumlah, dan tanggal kebutuhan.
- **Langkah**:
  1. Login sebagai Pelanggan.
  2. Pilih satu atau beberapa produk dari Katalog, tentukan jumlahnya (satuan atau *bulk*).
  3. Masukkan "Tanggal Kebutuhan" pesanan.
  4. Klik tombol "Buat Pesanan" atau "Submit".
- **Hasil yang Diharapkan**: Pesanan berhasil terbuat dan muncul notifikasi sukses pembuatan pesanan.

### Skenario FR-03: Menyimpan Detail Pesanan
- **Kebutuhan**: Sistem menyimpan detail pesanan (data pelanggan, daftar item, jumlah, catatan khusus, tanggal kebutuhan).
- **Langkah**:
  1. Selesaikan proses pembuatan pesanan seperti pada FR-02 dengan menyertakan catatan khusus.
  2. Login sebagai Admin.
  3. Buka detail pesanan yang baru dibuat tersebut di Dasbor Admin.
- **Hasil yang Diharapkan**: Detail pesanan mencantumkan data yang sama persis dengan yang diinputkan pelanggan (nama pelanggan, daftar item, jumlah, tanggal kebutuhan, dan catatan khusus).

### Skenario FR-04: Dasbor Pesanan Masuk (Admin)
- **Kebutuhan**: Admin dapat melihat seluruh pesanan masuk dalam satu tampilan beserta statusnya.
- **Langkah**:
  1. Login sebagai Admin.
  2. Arahkan ke halaman Dasbor / Daftar Pesanan (`/admin`).
- **Hasil yang Diharapkan**: Terdapat sebuah tabel atau daftar (list) yang merangkum semua pesanan dari seluruh pelanggan, lengkap dengan indikator statusnya (contoh: "Menunggu Konfirmasi", "Diproses").

### Skenario FR-05: Mengubah Status Pesanan
- **Kebutuhan**: Admin dapat mengubah status pesanan (Menunggu Konfirmasi → Dikonfirmasi → Diproses → Siap Diambil → Selesai / Dibatalkan).
- **Langkah**:
  1. Login sebagai Admin.
  2. Buka Dasbor Pesanan, temukan satu pesanan dengan status "Menunggu Konfirmasi".
  3. Klik tombol/opsi "Konfirmasi" pada pesanan tersebut.
- **Hasil yang Diharapkan**: Status pesanan tersebut berubah menjadi "Dikonfirmasi" pada antarmuka, dan tersimpan di sistem.

### Skenario FR-06: Notifikasi Perubahan Status Pesanan
- **Kebutuhan**: Sistem mengirim notifikasi otomatis ke pelanggan saat status pesanan berubah.
- **Langkah**:
  1. Admin mengubah status pesanan milik pelanggan A menjadi "Siap Diambil".
  2. Login ke akun Pelanggan A.
  3. Periksa ikon notifikasi di bilah navigasi (header).
- **Hasil yang Diharapkan**: Terdapat pesan notifikasi baru untuk pelanggan A yang berbunyi bahwa pesanan mereka telah berstatus "Siap Diambil".

### Skenario FR-07: Riwayat Pesanan
- **Kebutuhan**: Sistem menampilkan riwayat pesanan per pelanggan dan per admin.
- **Langkah**:
  1. Login sebagai Pelanggan.
  2. Buka menu "Riwayat Pesanan" (`/pelanggan/history`).
- **Hasil yang Diharapkan**: Sistem menampilkan seluruh daftar pesanan yang pernah dibuat oleh pelanggan tersebut dari waktu ke waktu, lengkap dengan status akhir pesanan.

### Skenario FR-08: Validasi Ketersediaan Bahan Baku
- **Kebutuhan**: Sistem memvalidasi ketersediaan bahan baku terhadap resep produk sebelum pesanan dapat dikonfirmasi/diproses.
- **Langkah**:
  1. Buat pesanan dalam jumlah sangat besar (yang mana total kebutuhan bahan bakunya melebihi stok di gudang).
  2. Login sebagai Admin dan coba ubah status pesanan tersebut menjadi "Diproses".
- **Hasil yang Diharapkan**: Sistem menolak perubahan status (muncul error/HTTP 400) disertai keterangan bahwa stok bahan baku tidak mencukupi untuk memproses pesanan tersebut.

### Skenario FR-09: Ringkasan Kebutuhan Bahan Baku Operasional
- **Kebutuhan**: Sistem menampilkan ringkasan kebutuhan bahan baku untuk pesanan yang sedang berjalan.
- **Langkah**:
  1. Login sebagai Staf Produksi (`/staf`).
  2. Periksa pesanan-pesanan di halaman Dasbor yang berstatus "Diproses".
  3. Buka bagian rincian/estimasi bahan.
- **Hasil yang Diharapkan**: Muncul ringkasan yang menampilkan daftar bahan baku beserta total kuantitas yang perlu disiapkan oleh Staf Produksi untuk mengerjakan pesanan tersebut.

### Skenario FR-10: Pencatatan Data Bahan Baku
- **Kebutuhan**: Sistem mencatat data bahan baku (nama, satuan, stok saat ini, batas stok minimum).
- **Langkah**:
  1. Login sebagai Admin.
  2. Buka halaman Kelola Bahan Baku (`/admin/ingredients`).
  3. Tambahkan bahan baku baru (contoh: "Gula", satuan "kg", minimum stok "5"). Klik Simpan.
- **Hasil yang Diharapkan**: Data "Gula" berhasil tersimpan dan langsung muncul di daftar bahan baku dengan informasi yang sesuai.

### Skenario FR-11: Menambah/Mengurangi Stok Bahan Baku Manual
- **Kebutuhan**: Admin/Staf dapat menambah/mengurangi stok bahan baku secara manual (restock, koreksi).
- **Langkah**:
  1. Login sebagai Admin atau Staf Produksi.
  2. Buka halaman Update Stok (`/staf/stock` atau menu serupa di Admin).
  3. Pilih bahan baku "Gula", lalu tambahkan kuantitas penyesuaian (misal +10). Klik Update.
- **Hasil yang Diharapkan**: Stok riil "Gula" di dalam sistem langsung bertambah sebanyak 10 satuan.

### Skenario FR-12: Pengurangan Stok Bahan Baku Otomatis
- **Kebutuhan**: Sistem mengurangi stok bahan baku secara otomatis berdasarkan resep/BOM saat pesanan berpindah ke status "Diproses".
- **Langkah**:
  1. Catat jumlah stok awal sebuah bahan baku (misal Tepung = 20 kg).
  2. Admin mengubah status sebuah pesanan (yang resepnya membutuhkan 3 kg Tepung) menjadi "Diproses".
  3. Periksa kembali stok Tepung di halaman Bahan Baku.
- **Hasil yang Diharapkan**: Stok Tepung otomatis berkurang dari 20 kg menjadi 17 kg tanpa campur tangan manual (sistem *backflushing* bekerja).

### Skenario FR-13: Notifikasi Peringatan Stok Minimum
- **Kebutuhan**: Sistem mengirim notifikasi peringatan ke Admin saat stok bahan mendekati/di bawah batas minimum.
- **Langkah**:
  1. Set batas minimum stok Telur adalah 10 kg.
  2. Lakukan pengurangan manual pada stok Telur menjadi 5 kg.
  3. Login sebagai Admin dan cek panel notifikasi.
- **Hasil yang Diharapkan**: Muncul *alert* notifikasi kepada Admin bahwa stok "Telur" telah berada di bawah batas minimum dan perlu segera di-restock.

### Skenario FR-14: Riwayat Pergerakan Stok
- **Kebutuhan**: Sistem menampilkan riwayat pergerakan stok (masuk/keluar) bahan baku.
- **Langkah**:
  1. Login sebagai Admin.
  2. Lakukan satu penambahan stok manual, lalu konfirmasi satu pesanan untuk memicu pengurangan otomatis.
  3. Buka endpoint riwayat pergerakan stok (contoh `GET /api/stock/movements`).
- **Hasil yang Diharapkan**: Tersedia data JSON/tabel (Audit Log) yang merekam histori perubahan stok (seperti: "Masuk 10 kg secara manual", "Keluar otomatis 3 kg untuk Pesanan #123").

### Skenario FR-15: Pengelolaan Resep / BOM
- **Kebutuhan**: Admin dapat mengelola data resep/BOM (komposisi bahan baku per produk).
- **Langkah**:
  1. Login sebagai Admin.
  2. Buka halaman Kelola Resep/BOM (`/admin/recipes`).
  3. Pilih produk "Kue Sus" dan tambahkan komposisi bahan: 0.5 kg Terigu dan 0.2 kg Mentega. Simpan.
- **Hasil yang Diharapkan**: Hubungan komposisi (Resep) antara produk "Kue Sus" dengan bahan baku "Terigu" dan "Mentega" berhasil tersimpan di sistem.

### Skenario FR-16: Daftar Bahan Baku Stok Kritis
- **Kebutuhan**: Sistem menampilkan daftar bahan baku dengan status stok kritis dalam satu tampilan ringkas.
- **Langkah**:
  1. Pastikan ada minimal dua bahan baku yang stok riilnya di bawah batas stok minimum.
  2. Login sebagai Admin atau Staf Produksi, dan lihat panel peringatan stok kritis atau panggil endpoint `/api/stock/critical`.
- **Hasil yang Diharapkan**: Muncul satu tampilan ringkas / daftar yang secara spesifik hanya menampilkan bahan-bahan baku dengan status krisis/kritis (perlu disuplai segera).

### Skenario FR-17: Autentikasi & Otorisasi Berbasis Peran
- **Kebutuhan**: Sistem menyediakan autentikasi & otorisasi berbasis peran (Admin/Pemilik, Staf Produksi, Pelanggan).
- **Langkah**:
  1. Buka aplikasi, dan masuk ke halaman Login.
  2. Buat akun baru sebagai "Pelanggan", lalu lakukan Login. Coba akses rute URL `/admin`.
- **Hasil yang Diharapkan**: Sistem mencegah Pelanggan mengakses rute `/admin`, melindungi halaman tersebut, dan mengembalikan/mengalihkan Pelanggan ke dasbor miliknya (`/pelanggan`), membuktikan proteksi otorisasi berfungsi.

### Skenario FR-18: Akses Melalui Aplikasi Mobile (PWA / Responsif)
- **Kebutuhan**: Sistem dapat diakses melalui aplikasi mobile (Android).
- **Langkah**:
  1. Buka aplikasi web melalui browser *smartphone* (atau menggunakan *Developer Tools* mode *mobile/responsive* di Chrome desktop).
  2. Lakukan navigasi dan buka menu-menu yang ada.
- **Hasil yang Diharapkan**: Antarmuka sistem secara otomatis menyesuaikan diri dengan lebar layar ponsel (responsif/PWA), menu dapat ditekan dengan baik via sentuhan, dan seluruh fungsionalitas aplikasi web berjalan mulus tanpa masalah layout yang hancur.
