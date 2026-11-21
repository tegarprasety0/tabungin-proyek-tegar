import { useState } from 'react'
import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { supabase } from '../lib/supabaseClient'

const loginSchema = z.object({
  email: z.string().trim().email('Masukkan email yang valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
})

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values) {
    setServerError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setServerError(
        'Login gagal. Periksa email, password, atau konfirmasi emailmu.'
      )
      return
    }

    const destination = location.state?.from?.pathname
      || (data.user?.app_metadata?.role === 'admin' ? '/admin' : '/dashboard')

    navigate(destination, { replace: true })
  }

  const inputClass =
    'mt-1 w-full border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

  return (
    <main className="tabungin-background flex min-h-screen items-center justify-center px-4 py-6 sm:py-10">
      <section className="w-full max-w-md border-2 border-emerald-300 bg-white p-5 shadow-2xl sm:p-8">
        <Link
          to="/"
          className="text-sm font-semibold text-emerald-700"
        >
          ← Kembali ke Tabungin
        </Link>

        <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:mt-6 sm:text-3xl">
          Selamat datang kembali
        </h1>

        <p className="mt-2 text-slate-600">
          Masuk untuk melanjutkan perjalanan tabunganmu.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-5 sm:mt-8"
        >
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputClass}
              placeholder="nama@email.com"
              {...register('email')}
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 hover:underline">
                Lupa sandi?
              </Link>
            </div>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={inputClass}
              placeholder="Masukkan password"
              {...register('password')}
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="text-sm text-red-600">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="font-semibold text-emerald-700 hover:underline"
          >
            Daftar
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Login
