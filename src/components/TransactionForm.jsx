import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const transactionSchema = z.object({
  type: z.enum(['deposit', 'withdrawal']),
  amount: z
    .string()
    .trim()
    .min(1, 'Nominal wajib diisi')
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      'Nominal harus lebih besar dari 0',
    ),
  description: z.string().trim(),
  transaction_date: z.string().min(1, 'Tanggal wajib diisi'),
})

function TransactionForm({
  initialValues,
  onSubmit,
  onCancel,
}) {
  const isEditing = Boolean(initialValues)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'deposit',
      amount: '',
      description: '',
      transaction_date: new Date().toLocaleDateString('en-CA'),
    },
  })

  useEffect(() => {
    if (initialValues) {
      reset({
        type: initialValues.type,
        amount: String(initialValues.amount),
        description: initialValues.description ?? '',
        transaction_date: initialValues.transaction_date
          ? new Date(initialValues.transaction_date)
              .toLocaleDateString('en-CA')
          : new Date().toLocaleDateString('en-CA'),
      })
    } else {
      reset({
        type: 'deposit',
        amount: '',
        description: '',
        transaction_date: new Date().toLocaleDateString('en-CA'),
      })
    }
  }, [initialValues, reset])

  async function handleFormSubmit(values) {
    try {
      await onSubmit({
        ...values,
        amount: Number(values.amount),
        transaction_date: new Date(
          `${values.transaction_date}T12:00:00`,
        ).toISOString(),
      })

      if (!isEditing) {
        reset()
      }
    } catch (error) {
      setError('root', {
        message: error.message || 'Gagal menyimpan transaksi.',
      })
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-5"
    >
      {/* Jenis transaksi */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Jenis Transaksi
        </label>

        <select
          {...register('type')}
          className={inputClass}
        >
          <option value="deposit">Deposit (Uang Masuk)</option>
          <option value="withdrawal">Withdrawal (Uang Keluar)</option>
        </select>

        {errors.type && (
          <p className="mt-1 text-sm text-red-500">
            {errors.type.message}
          </p>
        )}
      </div>

      {/* Nominal */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Nominal (Rp)
        </label>

        <input
          type="number"
          min="1"
          placeholder="Contoh: 100000"
          {...register('amount')}
          className={inputClass}
        />

        {errors.amount && (
          <p className="mt-1 text-sm text-red-500">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Deskripsi */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Keterangan
        </label>

        <textarea
          rows={3}
          placeholder="Contoh: Menabung dari uang saku"
          {...register('description')}
          className={inputClass}
        />
      </div>

      {/* Tanggal */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Tanggal Transaksi
        </label>

        <input
          type="date"
          {...register('transaction_date')}
          className={inputClass}
        />

        {errors.transaction_date && (
          <p className="mt-1 text-sm text-red-500">
            {errors.transaction_date.message}
          </p>
        )}
      </div>

      {/* Error */}
      {errors.root && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      {/* Tombol */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Menyimpan...'
            : isEditing
              ? 'Simpan Perubahan'
              : 'Simpan Transaksi'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm