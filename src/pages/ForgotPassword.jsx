import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setSending(true)
    setMessage('')
    setError('')

    const redirectTo = new URL('/reset-password', window.location.origin).toString()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })

    if (resetError) {
      setError('Email reset belum bisa dikirim. Coba lagi beberapa saat.')
    } else {
      setMessage('Jika email tersebut terdaftar, tautan untuk mengatur ulang sandi akan segera dikirim.')
    }

    setSending(false)
  }

  return (
    <main className="tabungin-background flex min-h-screen items-center justify-center px-4 py-6 sm:py-10">
      <section className="w-full max-w-md border-2 border-emerald-300 bg-white p-5 shadow-2xl sm:p-8">
        <Link to="/login" className="text-sm font-semibold text-emerald-800 hover:underline">
          Kembali ke login
        </Link>
        <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">Lupa sandi?</h1>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Masukkan email akunmu. Kami akan mengirim tautan untuk membuat sandi baru.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="reset-email" className="text-sm font-semibold text-slate-800">Email</label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              className="mt-1 w-full border border-slate-400 px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {message && <p role="status" className="border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}
          {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

          <button type="submit" disabled={sending} className="w-full border border-emerald-800 bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
            {sending ? 'Mengirim...' : 'Kirim tautan reset'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default ForgotPassword
