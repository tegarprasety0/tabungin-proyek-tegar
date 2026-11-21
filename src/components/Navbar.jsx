import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'

function Navbar() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Gagal logout:', error.message)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <header className="bg-transparent">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" aria-label="Tabungin — beranda" className="shrink-0 text-xl font-extrabold tracking-wide text-white sm:text-2xl">
          TABUNGIN
        </Link>

        <div className="flex items-center gap-2 sm:gap-5">
          <a
            href="/#fitur"
            className="hidden text-sm font-semibold text-slate-800 hover:text-emerald-700 sm:block"
          >
            Fitur
          </a>

          {loading ? (
            <span className="text-sm text-slate-500">
              Memuat...
            </span>
          ) : user ? (
            <>
              <Link
                to="/dashboard"
                className="border border-emerald-700 bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 sm:px-4 sm:text-sm"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="border border-slate-800 bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 sm:px-4 sm:text-sm"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-emerald-700 bg-white px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 sm:px-4 sm:text-sm"
              >
                Masuk
              </Link>

              <Link
                to="/register"
                className="border border-emerald-600 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 sm:px-4 sm:text-sm"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
