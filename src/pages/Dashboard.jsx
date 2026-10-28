
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

function Dashboard() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="font-semibold text-emerald-600">
          Tabungin
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Dashboard Tabungan
        </h1>

        <p className="mt-3 text-slate-600">
          Selamat datang, {user?.email}!
        </p>

        <p className="mt-4 text-slate-600">
          Nanti di sini kamu bisa membuat target tabungan,
          mencatat transaksi, dan memantau progres.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Kembali ke Beranda
        </Link>
      </section>
    </main>
  )
}

export default Dashboard
