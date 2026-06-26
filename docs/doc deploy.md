# Panduan Deployment Dapur Ceu El ke Vercel

## Apakah Proyek Ini Bisa Di-deploy di Vercel via GitHub?

Jawabannya adalah **Bisa, namun memerlukan beberapa penyesuaian arsitektur**. 

Vercel adalah platform yang sangat optimal untuk melakukan *hosting* aplikasi *Frontend* statis atau SPA (seperti React + Vite). Namun, Vercel beroperasi menggunakan arsitektur **Serverless** yang tidak membaca file `docker-compose.yml`. Oleh karena itu, ada dua komponen dari proyek kita yang tidak bisa langsung di-*deploy* begitu saja di Vercel:

1. **Database PostgreSQL**: Vercel tidak menyediakan layanan *hosting database container*. Anda tidak bisa menjalankan PostgreSQL secara lokal di Vercel.
2. **Backend FastAPI (Python)**: Vercel mendukung bahasa Python melalui *Serverless Functions*. FastAPI bisa di-*deploy* di Vercel, tetapi membutuhkan file konfigurasi khusus (`vercel.json`) agar aplikasi diubah menjadi fungsi *serverless*.

### Solusi Arsitektur
Untuk mendeloy aplikasi ini ke internet secara gratis/murah, arsitektur yang paling direkomendasikan adalah **Pemisahan Layanan (Decoupling)**:
- **Frontend (React + Vite)**: Di-deploy di **Vercel**.
- **Database (PostgreSQL)**: Menggunakan layanan *Cloud Database* gratis seperti **Neon.tech**, **Supabase**, atau **Aiven**.
- **Backend (FastAPI)**: Di-deploy di layanan *Platform as a Service (PaaS)* seperti **Render**, **Railway**, atau **Koyeb** (direkomendasikan karena native mendukung Docker/Python), atau di Vercel menggunakan *Serverless Functions* (membutuhkan konfigurasi tambahan).

---

## Langkah-Langkah Deployment (Step-by-Step)

Berikut adalah panduan *deploy* dengan skema: **Frontend di Vercel**, **Database di Neon.tech**, dan **Backend di Render** (solusi paling stabil dan gratis).

### Tahap 1: Setup Database PostgreSQL (via Neon.tech)
1. Buka [neon.tech](https://neon.tech/) dan buat akun menggunakan GitHub.
2. Buat proyek baru (contoh: `dapur-ceu-el-db`).
3. Setelah database selesai dibuat, Anda akan mendapatkan **Connection String** (URL Database), formatnya mirip seperti: 
   `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`
4. Simpan URL ini, kita akan memasukkannya ke Backend.

### Tahap 2: Deploy Backend FastAPI (via Render.com)
Meskipun Vercel bisa menjalankan Python, Render jauh lebih cocok untuk FastAPI karena berjalan sebagai layanan utuh, bukan *serverless* yang sering mengalami *cold-start*.
1. Buka [render.com](https://render.com/) dan *Sign In* dengan GitHub.
2. Pilih **New** -> **Web Service**.
3. Hubungkan dengan repository GitHub Dapur Ceu El milik Anda (`incognieto/dapur-ceu-el-offline-first`).
4. Pada form konfigurasi Web Service, pastikan isiannya seperti ini:
   - **Name**: `dapur-ceu-el-backend`
   - **Language**: `Docker` (Render biasanya mendeteksi ini secara otomatis)
   - **Root Directory**: `backend` (Sangat penting! Ketikkan "backend" di sini)
   - **Instance Type**: Pilih `Free`
   - Gulir ke bawah pada bagian **Docker Build Context Directory**, biarkan terisi `.`
   - Pada bagian **Dockerfile Path**, biarkan terisi `./Dockerfile` atau `.`
5. Buka bagian **Environment Variables** di Render dan tambahkan:
   - `DATABASE_URL` = *(Masukkan Connection String dari Neon.tech di Tahap 1)*
   - `CORS_ORIGINS` = `*` *(Untuk sementara agar frontend bisa terkoneksi)*
6. Klik **Create Web Service**. Tunggu hingga proses *build* selesai. Anda akan mendapatkan URL Backend (contoh: `https://dapur-ceu-el-backend.onrender.com`).

### Tahap 3: Inisialisasi Database (Migrasi/Seeding)
Karena database di Neon masih kosong, Anda harus memasukkan struktur tabel dari file `db/init/01_schema.sql` dan `02_seed.sql`.
1. Anda bisa menggunakan software seperti **DBeaver** atau **pgAdmin** di komputer Anda.
2. Hubungkan ke database Neon menggunakan URL dari Tahap 1.
3. Jalankan *query* (Copy-Paste) seluruh isi dari file `01_schema.sql` lalu `02_seed.sql` agar tabel dan data dummy terbentuk.

### Tahap 4: Deploy Frontend React/Vite (via Vercel)
Sekarang, kita mendeploy Frontend ke Vercel dan menghubungkannya dengan Backend di Render.
1. Buka [vercel.com](https://vercel.com/) dan *Sign In* dengan GitHub.
2. Klik **Add New...** -> **Project**.
3. *Import* repository GitHub Dapur Ceu El Anda.
4. Di bagian **Configure Project**, ubah hal berikut:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Penting! Klik Edit dan pilih folder `frontend`).
5. Buka menu akordeon **Environment Variables**, tambahkan:
   - Name: `VITE_API_URL`
   - Value: `https://dapur-ceu-el-backend.onrender.com` *(URL Render dari Tahap 2, TANPA garis miring (/) di akhir).*
6. Klik **Deploy**.
7. Tunggu beberapa detik, Vercel akan mem-build aplikasi dan memberikan URL publik.

### Tahap 5: Selesai!
Buka URL Vercel yang diberikan (misalnya `https://dapur-ceu-el-frontend.vercel.app`).
Aplikasi Anda kini sudah *online* secara penuh. Pelanggan bisa memesan dari Vercel, API diproses di Render, dan data disimpan dengan aman di Neon PostgreSQL!

---

## Opsi Alternatif: Deploy Backend & Frontend Keduanya di Vercel
Jika Anda bersikeras ingin melakukan deploy **Backend FastAPI** di Vercel, Anda harus membuat file `vercel.json` di *root directory* proyek Anda dengan kode berikut:

```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "backend/app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/app/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```
**Kekurangan Metode Ini:**
1. Setup *Serverless Python* di Vercel sering menemui batas limit file (maksimal 250MB dependensi).
2. FastAPI *Background Tasks* atau *WebSockets* (jika kelak digunakan) **tidak akan berjalan** di arsitektur Serverless Vercel.
3. Arsitektur ini menggabungkan Frontend dan Backend menjadi satu instance deployment, yang dapat menyulitkan pembacaan *log* error.

Oleh karena itu, sangat direkomendasikan mengikuti metode **Pemisahan Layanan (Tahap 1-4)** di atas.
