import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { supabase } from '../lib/supabaseClient'

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter.'),

  email: z
    .string()
    .trim()
    .email('Masukkan alamat email yang valid.'),

  password: z
    .string()
    .min(8, 'Password minimal 8 karakter.'),
})

function Register() {
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(values) {
    setSuccessMessage('')

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    })

    if (error) {
      setError('root.serverError', {
        message: error.message,
      })
      return
    }

    if (data.session) {
      setSuccessMessage(
        'Akun berhasil dibuat. Kamu bisa masuk ke Tabungin.'
      )
    } else {
      setSuccessMessage(
        'Pendaftaran berhasil. Periksa email untuk konfirmasi jika diminta, lalu masuk.'
      )
    }
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

  return (
    <main className="flex min-h-screen items-center justify-center bg-emerald-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <Link
          to="/"
          className="text-sm font-semibold text-emerald-700"
        >
          ← Kembali ke Tabungin
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Buat akun
        </h1>

        <p className="mt-2 text-slate-600">
          Mulai rencanakan tabungan untuk barang impianmu.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-slate-700"
            >
              Nama lengkap
            </label>

            <input
              id="fullName"
              autoComplete="name"
              className={inputClass}
              placeholder="Nama kamu"
              {...register('fullName')}
            />

            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

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
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              placeholder="Minimal 8 karakter"
              {...register('password')}
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root?.serverError && (
            <p role="alert" className="text-sm text-red-600">
              {errors.root.serverError.message}
            </p>
          )}

          {successMessage && (
            <p
              role="status"
              className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-700 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Register