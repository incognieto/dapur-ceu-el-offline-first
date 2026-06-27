# Panduan Deployment Dapur Ceu El

Proyek ini menggunakan arsitektur pemisahan layanan (*Decoupling*) di mana **Frontend** dan **Backend** berjalan di **Railway**, dan **Database** menggunakan layanan Cloud eksternal yaitu **Supabase**.

Kombinasi ini sangat disukai oleh *developer* modern karena Anda bisa mendeploy layanan Frontend dan Backend secara terpusat dalam satu "Project" (satu *dashboard*) di Railway secara rapi.

## Langkah-Langkah Deployment: Railway + Supabase

### Tahap 1: Setup Database PostgreSQL (via Supabase)
1. Buka [supabase.com](https://supabase.com/) dan buat proyek baru (New Project).
2. Masukkan nama proyek dan buat *Database Password* yang kuat. Tunggu beberapa menit hingga database siap.
3. Buka menu **Project Settings** (ikon gerigi) -> **Database**.
4. Gulir ke bawah ke bagian **Connection string** dan pilih tab **URI**.
5. Copy URL tersebut (jangan lupa ganti bagian `[YOUR-PASSWORD]` dengan password yang Anda buat di langkah 2). Simpan URL ini.

### Tahap 2: Deploy Backend FastAPI (via Railway)
1. Buka [railway.app](https://railway.app/) dan *Login* menggunakan akun GitHub.
2. Di Dashboard Railway, klik tombol **New Project** -> pilih **Deploy from GitHub repo**.
3. Pilih repository proyek Dapur Ceu El Anda.
4. Klik tombol **Add variables** atau buka tab **Variables** pada *service* yang baru saja dibuat, lalu tambahkan:
   - `DATABASE_URL` = *(Masukkan URI Connection String dari Supabase)*
   - `CORS_ORIGINS` = `*` *(untuk sementara)*
5. Buka tab **Settings** pada *service* tersebut:
   - Cari bagian **Root Directory** dan ubah nilainya menjadi `/backend` (agar Railway mengeksekusi folder backend).
   - Gulir ke bawah ke bagian **Networking** dan klik **Generate Domain** agar API Backend Anda memiliki URL publik (misalnya: `https://dapur-backend-xxx.up.railway.app`). Simpan URL ini.

### Tahap 3: Inisialisasi Database (via Supabase SQL Editor)
Supabase sangat memudahkan inisialisasi karena memiliki SQL Editor bawaan di *browser*.
1. Di Dashboard Supabase Anda, masuk ke menu **SQL Editor** (ikon terminal/kode di *sidebar* kiri).
2. Klik **New Query**.
3. Buka file `db/init/01_schema.sql` dari komputer Anda, *copy* seluruh isinya, *paste* ke SQL Editor Supabase, lalu klik tombol **Run**. (File ini sudah mencakup pembuatan tabel sekaligus pengisian data *dummy*/awal).
4. Tabel dan data *dummy* Anda kini sudah berhasil dimasukkan ke Cloud Database!

### Tahap 4: Deploy Frontend React/Vite (via Railway)
1. Kembali ke layar utama *Project* Anda di Railway (tetap di proyek yang sama, jangan buat proyek baru).
2. Klik tombol **+ New** di sudut kanan atas *canvas* -> pilih **GitHub Repo**.
3. Pilih repository proyek Dapur Ceu El yang sama lagi. (Sekarang Anda memiliki 2 *service* berdampingan di satu proyek).
4. Klik pada kotak *service* yang baru (untuk frontend), masuk ke tab **Settings**:
   - Cari **Root Directory** dan ubah nilainya menjadi `/frontend`.
   - Gulir ke **Networking** dan klik **Generate Domain**.
5. Buka tab **Variables** pada *service* frontend ini, lalu tambahkan:
   - `VITE_API_URL` = *(Masukkan URL publik Backend Anda yang didapat di Tahap 2, tanpa tanda `/` di akhir)*
6. Railway akan secara otomatis mendeteksi perubahan *environment variable* dan mem-*build* ulang frontend Anda (biasanya terdeteksi otomatis sebagai Vite).
7. Selesai! Anda tinggal membuka Domain publik *frontend* dari Railway untuk menggunakan aplikasinya.
