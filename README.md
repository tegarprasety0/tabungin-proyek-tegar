# Tabungin

Aplikasi web pencatatan tabungan yang membantu pengguna merencanakan target keuangan, mencatat setoran dan penarikan, serta memantau progres tabungan.

🔗 **Live Demo:** [https://tabungin-web-nu.vercel.app](https://tabungin-web-nu.vercel.app)

> **Status pengembangan:** Fitur utama untuk pengguna sudah berjalan. Fitur Admin dan pengujian keamanan menyeluruh masih dalam rencana pengembangan.

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Struktur Data](#struktur-data)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Deployment](#deployment)
- [Rencana Pengembangan](#rencana-pengembangan)

## Tentang Proyek

Tabungin dikembangkan untuk membantu pengguna, khususnya mahasiswa, mengelola tabungan secara lebih terarah.

Pengguna membuat target tabungan berdasarkan barang atau kebutuhan yang ingin dibeli, lengkap dengan nominal, kategori, dan tanggal target. Setiap setoran (deposit) atau penarikan dicatat pada target terkait, sehingga saldo dan progres tiap target selalu dapat dipantau.

## Fitur

### Autentikasi dan Akses

- Registrasi dan login dengan Supabase Authentication.
- Pemulihan sesi login saat halaman dimuat ulang.
- Lupa password dan reset password.
- Logout.
- Proteksi halaman: Dashboard hanya dapat diakses setelah login.
- Pengguna yang sudah login dialihkan dari halaman login dan registrasi.

### Target Tabungan

- Membuat, melihat, mengubah, dan menghapus target tabungan.
- Memilih kategori, nominal target, dan tanggal target.
- Progress bar dan sisa nominal untuk setiap target.
- Pencarian target berdasarkan nama.
- Filter berdasarkan kategori.
- Pengurutan: terbaru, nama A–Z, nominal terbesar/terkecil, progres tertinggi, dan tanggal target terdekat.
- Tampilan kartu per halaman pada layar ponsel.

### Transaksi

- Mencatat transaksi deposit dan penarikan per target.
- Mengubah dan menghapus transaksi.
- Riwayat transaksi dari seluruh target.
- Saldo target dihitung dari seluruh transaksinya (deposit menambah, penarikan mengurangi).
- Validasi agar penarikan tidak membuat saldo menjadi negatif.

### Dashboard

- Ringkasan: total terkumpul, jumlah target aktif, dan jumlah kategori.
- **Kalkulator tabungan:** menghitung kebutuhan menabung per hari dari sisa target dibagi sisa hari menuju tanggal target.

### Keamanan Data

- Setiap query data pengguna difilter berdasarkan `user_id`.
- Row Level Security (RLS) dasar di Supabase untuk membatasi akses data antar pengguna.

## Teknologi

| Teknologi | Kegunaan |
| --- | --- |
| React 19 | Membangun antarmuka pengguna |
| Vite | Development server dan build tool |
| Tailwind CSS 4 | Styling antarmuka |
| Supabase | Database PostgreSQL dan autentikasi |
| React Router DOM | Navigasi dan routing |
| React Hook Form | Pengelolaan form |
| Zod | Validasi data form |
| `@hookform/resolvers` | Integrasi React Hook Form dengan Zod |
| Oxlint | Linting |
| Vercel | Hosting dan deployment |

## Struktur Proyek

```text
tabungin-proyek-tegar/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── GoalCard.jsx
│   │   ├── GoalForm.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── PublicOnlyRoute.jsx
│   │   ├── TransactionForm.jsx
│   │   └── TransactionHistory.jsx
│   ├── lib/
│   │   ├── AuthContext.jsx
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── Register.jsx
│   │   └── ResetPassword.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

## Struktur Data

Aplikasi memakai tiga tabel di Supabase:

| Tabel | Isi |
| --- | --- |
| `categories` | Daftar kategori target tabungan |
| `savings_goals` | Target tabungan: nama, deskripsi, kategori, nominal, tanggal target, dan pemilik (`user_id`) |
| `transactions` | Transaksi per target: tipe (`deposit`/`withdrawal`), nominal, deskripsi, tanggal, dan pemilik (`user_id`) |

## Menjalankan Secara Lokal

### Prasyarat

- Node.js (disarankan versi LTS terbaru)
- Proyek Supabase dengan tabel seperti pada bagian [Struktur Data](#struktur-data)

### Langkah

1. Clone repositori dan masuk ke folder proyek:

   ```bash
   git clone https://github.com/tegarprasety0/tabungin-proyek-tegar.git
   cd tabungin-proyek-tegar
   ```

2. Pasang dependensi:

   ```bash
   npm install
   ```

3. Buat file `.env` di root proyek:

   ```env
   VITE_SUPABASE_URL=url-proyek-supabase-kamu
   VITE_SUPABASE_PUBLISHABLE_KEY=publishable-key-supabase-kamu
   ```

4. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

### Skrip yang Tersedia

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Membuat build produksi |
| `npm run preview` | Melihat hasil build secara lokal |
| `npm run lint` | Menjalankan Oxlint |

## Deployment

Aplikasi di-deploy di Vercel. File `vercel.json` mengarahkan semua rute ke `index.html` agar routing sisi klien (React Router) tetap berfungsi saat halaman dimuat ulang. Variabel lingkungan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` perlu diisi di pengaturan proyek Vercel.

## Rencana Pengembangan

- Dashboard dan pengelolaan khusus Admin.
- Penyempurnaan CRUD profil dan kategori.
- Validasi saldo penarikan di sisi database (constraint atau trigger), selain validasi di frontend.
- Pengujian keamanan dan hak akses untuk seluruh role.
- Pengujian menyeluruh pada alur transaksi.