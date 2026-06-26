# Dapur Ceu El Offline-First

Kerangka proyek runnable untuk aplikasi web offline-first Sistem Pemesanan dan Manajemen Stok Produksi Dapur Ceu El. Aplikasi ini telah disempurnakan dengan dukungan sistem peran (Multi-Role) dan pemenuhan seluruh persyaratan sistem.

## Stack

- **Frontend**: React + Vite + TypeScript + React Router + Dexie (IndexedDB) + Service Worker.
- **Backend**: FastAPI di Python 3.13, arsitektur *layered modular monolith*.
- **Database**: PostgreSQL 16 dengan *init schema* dan *seed data*.
- **Orkestrasi**: Docker Compose.

## Cara Menjalankan Aplikasi

Aplikasi dapat dijalankan dengan mudah melalui Docker Compose. Pastikan Docker sudah terpasang di sistem Anda.

1. Buka terminal di *root directory* proyek.
2. Salin *environment variables* (jika belum):
   ```bash
   cp .env.example .env
   ```
3. Jalankan *container* (ini akan memakan waktu untuk *build* dependensi Frontend & Backend):
   ```bash
   docker compose up --build
   ```

Setelah seluruh layanan berjalan, akses aplikasi melalui URL berikut:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Database PostgreSQL**: `localhost:5432`, db: `dapur_ceu_el`, user: `dapur`, password: `dapur`

## Alur Navigasi & Login (Demo)

Aplikasi kini menerapkan proteksi rute berbasis Peran (*Role-Based Access Control*) dengan sistem Autentikasi penuh. Buka halaman utama [http://localhost:5173](http://localhost:5173) dan sistem akan mengarahkan Anda ke Halaman Login.

Karena Anda baru pertama kali menjalankan sistem, **Anda perlu melakukan Sign Up (Pendaftaran) terlebih dahulu**:
1. Di layar Login, klik tulisan **"Daftar di sini"**.
2. Masukkan *Username* dan *Password* yang Anda inginkan (minimal 6 karakter).
3. Pilih peran (*Role*) yang diinginkan:
   - **Pelanggan**: Akan diarahkan ke `/pelanggan` untuk melihat katalog, membuat pesanan (keranjang), dan melacak status pesanan.
   - **Admin**: Akan diarahkan ke `/admin` untuk melihat *dashboard* semua pesanan, menyetujui pesanan, mengelola produk (CRUD Katalog), mengelola bahan baku, dan menyetel resep (BOM).
   - **Staf Produksi**: Akan diarahkan ke `/staf` untuk melihat *dashboard* pesanan dengan status "Diproses", jumlah kebutuhan bahan, serta layar penyesuaian stok.
4. Klik **Daftar**. Anda akan langsung terautentikasi dan masuk ke *dashboard* yang sesuai dengan peran Anda.

## Catatan Fitur Offline-First

Aplikasi mendukung operasi tanpa koneksi internet. Coba lakukan langkah berikut:
1. *Login* dan buka halaman Katalog Pelanggan.
2. Matikan koneksi internet (atau setel "Offline" di Network Tab *Developer Tools* browser).
3. Lakukan pemesanan. Order akan tersimpan secara lokal di *IndexedDB*. Panel sinkronisasi di kanan atas akan menunjukkan *icon* terputus.
4. Nyalakan kembali koneksi internet, lalu klik tombol sinkronisasi. Pesanan otomatis dikirimkan ke backend.

## Dokumentasi & Pengujian

Sistem ini telah lulus pengujian komprehensif terhadap **18 Kebutuhan Fungsional (FR)** dan **14 Use Case (UC)**, mencakup:
- Pembuatan pesanan secara offline-first.
- Pembatalan pesanan mandiri oleh Pelanggan.
- Auto-fill profil dan validasi tanggal kebutuhan.
- Pengurangan otomatis bahan baku saat pesanan diproses.
- Notifikasi *real-time* untuk krisis stok maupun saat barang berhasil direstock (masuk).

Selengkapnya mengenai skenario uji (*test cases*) dapat Anda baca pada file **[Dokumentasi_Pengujian.md](./Dokumentasi_Pengujian.md)**.
