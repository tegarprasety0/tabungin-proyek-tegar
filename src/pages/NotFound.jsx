import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <p className="text-7xl font-bold text-emerald-600">404</p>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Halaman tidak ditemukan
      </h1>

      <p className="mt-3 text-slate-600">
        Maaf, halaman yang kamu cari tidak tersedia.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
      >
        Kembali ke Beranda
      </Link>
    </main>
  )
}

export default NotFound
