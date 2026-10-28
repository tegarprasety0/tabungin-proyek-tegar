
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
    <header className="border-b border-emerald-100 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          {/* <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white">
            t
          </span> */}

          <span className="text-xl font-bold text-emerald-800">
            Tabungin
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <a
            href="/#fitur"
            className="hidden text-sm font-medium text-slate-600 hover:text-emerald-700 sm:block"
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
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Masuk
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
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
