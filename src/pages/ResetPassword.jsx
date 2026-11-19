import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function ResetPassword() {
  const navigate = useNavigate()
  const [recoveryReady, setRecoveryReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Sandi baru minimal 8 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi sandi tidak sama.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('Sandi belum berhasil diperbarui. Tautan mungkin sudah kedaluwarsa; minta tautan reset baru.')
      setSaving(false)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <main className="tabungin-background flex min-h-screen items-center justify-center px-4 py-6 sm:py-10">
      <section className="w-full max-w-md border-2 border-emerald-300 bg-white p-5 shadow-2xl sm:p-8">
        <Link to="/login" className="text-sm font-semibold text-emerald-800 hover:underline">Kembali ke login</Link>
        <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">Buat sandi baru</h1>

        {recoveryReady ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <p className="text-sm leading-6 text-slate-700">Gunakan sandi minimal 8 karakter.</p>
            <div>
              <label htmlFor="new-password" className="text-sm font-semibold text-slate-800">Sandi baru</label>
              <input id="new-password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full border border-slate-400 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="text-sm font-semibold text-slate-800">Ulangi sandi baru</label>
              <input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full border border-slate-400 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            </div>
            {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button type="submit" disabled={saving} className="w-full border border-emerald-800 bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Menyimpan...' : 'Simpan sandi baru'}
            </button>
          </form>
        ) : (
          <div className="mt-5 border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm leading-6 text-amber-950">Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru untuk melanjutkan.</p>
            <Link to="/forgot-password" className="mt-3 inline-block font-semibold text-emerald-800 underline">Kirim ulang tautan</Link>
          </div>
        )}
      </section>
    </main>
  )
}

export default ResetPassword
