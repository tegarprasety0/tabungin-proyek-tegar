import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const goalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nama target minimal 3 karakter'),

  description: z
    .string()
    .trim(),

  category_id: z
    .string(),

  target_amount: z
    .string()
    .trim()
    .min(1, 'Target nominal wajib diisi')
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      'Nominal harus lebih besar dari 0',
    ),

  target_date: z.string(),
})

function GoalForm({
  categories = [],
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
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      target_amount: '',
      target_date: '',
    },
  })

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name ?? '',
        description: initialValues.description ?? '',
        category_id: initialValues.category_id
          ? String(initialValues.category_id)
          : '',
        target_amount: String(initialValues.target_amount ?? ''),
        target_date: initialValues.target_date ?? '',
      })
    } else {
      reset({
        name: '',
        description: '',
        category_id: '',
        target_amount: '',
        target_date: '',
      })
    }
  }, [initialValues, reset])

  async function handleFormSubmit(values) {
    try {
      await onSubmit({
        ...values,
        category_id: values.category_id
          ? Number(values.category_id)
          : null,
        target_amount: Number(values.target_amount),
        target_date: values.target_date || null,
      })

      if (!isEditing) {
        reset()
      }
    } catch (error) {
      setError('root', {
        message: error.message || 'Gagal menyimpan target tabungan.',
      })
    }
  }

  const inputClass =
    'mt-2 w-full border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-5"
    >
      {/* Nama target */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Nama Target
        </label>

        <input
          type="text"
          placeholder="Contoh: Membeli Laptop"
          {...register('name')}
          className={inputClass}
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Deskripsi */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Deskripsi
        </label>

        <textarea
          rows={3}
          placeholder="Ceritakan barang yang ingin kamu beli..."
          {...register('description')}
          className={inputClass}
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Kategori */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Kategori
        </label>

        <select
          {...register('category_id')}
          className={inputClass}
        >
          <option value="">Pilih kategori</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {errors.category_id && (
          <p className="mt-1 text-sm text-red-500">
            {errors.category_id.message}
          </p>
        )}
      </div>

      {/* Target nominal */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Target Tabungan (Rp)
        </label>

        <input
          type="number"
          min="1"
          placeholder="Contoh: 5000000"
          {...register('target_amount')}
          className={inputClass}
        />

        {errors.target_amount && (
          <p className="mt-1 text-sm text-red-500">
            {errors.target_amount.message}
          </p>
        )}
      </div>

      {/* Tanggal target */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Target Tanggal (Opsional)
        </label>

        <input
          type="date"
          {...register('target_date')}
          className={inputClass}
        />

        {errors.target_date && (
          <p className="mt-1 text-sm text-red-500">
            {errors.target_date.message}
          </p>
        )}
      </div>

      {/* Error dari Supabase */}
      {errors.root && (
        <p className="bg-red-50 p-3 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      {/* Tombol */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? 'Menyimpan...'
            : isEditing
              ? 'Simpan Perubahan'
              : 'Buat Target'}
        </button>
      </div>
    </form>
  )
}

export default GoalForm