# Tabungin

Aplikasi web pencatatan tabungan yang membantu pengguna merencanakan
target keuangan, mencatat pemasukan dan penarikan tabungan, serta
memantau perkembangan tabungan.

> **Status pengembangan:** Dalam proses pengerjaan. Beberapa fitur masih
> direncanakan atau perlu diuji lebih lanjut.

## Daftar Isi

-   [Tentang Proyek](#tentang-proyek)
-   [Fitur](#fitur)
-   [Teknologi](#teknologi)
-   [Struktur Proyek](#struktur-proyek)
-   [Persyaratan](#persyaratan)
-   [Instalasi dan Menjalankan
    Proyek](#instalasi-dan-menjalankan-proyek)
-   [Konfigurasi Supabase](#konfigurasi-supabase)
-   [Database](#database)
-   [Alur Kerja Git](#alur-kerja-git)
-   [Rencana Pengembangan](#rencana-pengembangan)

## Tentang Proyek

Tabungin dikembangkan sebagai aplikasi web untuk membantu pengguna,
khususnya mahasiswa, mengelola tabungan secara lebih terarah.

Pengguna dapat membuat target tabungan berdasarkan barang atau kebutuhan
yang ingin dibeli. Setiap target dapat dilengkapi nominal yang ingin
dicapai dan kategori. Pengguna juga dapat mencatat transaksi deposit
maupun penarikan sehingga saldo dan perkembangan target dapat dipantau.

## Fitur

### Fitur yang sudah diimplementasikan

-   Registrasi dan login menggunakan Supabase Authentication.
-   Pemulihan sesi autentikasi.
-   Logout.
-   Proteksi halaman yang hanya dapat diakses setelah login.
-   Pengalihan pengguna yang sudah login dari halaman login dan
    registrasi.
-   Membuat, melihat, mengubah, dan menghapus target tabungan.
-   Memilih kategori untuk target tabungan.
-   Mencatat transaksi deposit dan penarikan.
-   Mengubah dan menghapus transaksi.
-   Menampilkan riwayat transaksi.
-   Menghitung saldo target berdasarkan transaksi.
-   Validasi agar penarikan tidak membuat saldo menjadi negatif.
-   Row Level Security (RLS) dasar untuk membatasi akses data pengguna.

**Catatan:** Fitur transaksi dan riwayat transaksi sudah diintegrasikan
ke Dashboard, tetapi tetap perlu diuji menyeluruh pada lingkungan
aplikasi.

### Fitur yang direncanakan

-   Kalkulator kebutuhan tabungan harian.
-   Pencarian target tabungan.
-   Filter berdasarkan kategori.
-   Pengurutan target tabungan.
-   Dashboard dan pengelolaan khusus Admin.
-   Penyempurnaan CRUD profil dan kategori.
-   Pengujian keamanan dan hak akses untuk seluruh role.

## Teknologi

  Teknologi               Kegunaan
  ----------------------- -----------------------------------------------
  React                   Membangun antarmuka pengguna
  Vite                    Development server dan build tool
  Tailwind CSS            Styling antarmuka
  Supabase                Backend, database PostgreSQL, dan autentikasi
  React Router DOM        Navigasi dan routing
  React Hook Form         Pengelolaan form
  Zod                     Validasi data form
  `@hookform/resolvers`   Integrasi React Hook Form dengan Zod

## Struktur Proyek

Struktur utama yang digunakan saat ini:

``` text
final-project-tegar/
├── public/
├── src/
│   ├── components/
│   │   ├── GoalCard.jsx
│   │   ├── GoalForm.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── PublicOnlyRoute.jsx
│   │   ├── TransactionForm.jsx
│   │   └── TransactionHistory.jsx
│   ├── lib/
│   │   ├── AuthContext.jsx
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   └── Register.jsx
│   ├── schemas/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase/
│   └── migrations/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

> Struktur dapat berubah mengikuti perkembangan implementasi. Sesuaikan
> daftar file di atas jika ada perubahan pada direktori proyek.