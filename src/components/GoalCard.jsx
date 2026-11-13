function GoalCard({
  goal,
  progress = 0,
  onEdit,
  onDelete,
  onAddTransaction,
}) {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })

  const targetAmount = Number(goal.target_amount)
  const currentAmount = Number(progress)

  const percentage =
    targetAmount > 0
      ? Math.min((currentAmount / targetAmount) * 100, 100)
      : 0

  const remainingAmount = Math.max(
    targetAmount - currentAmount,
    0,
  )

  const formattedDate = goal.target_date
    ? new Date(`${goal.target_date}T00:00:00`).toLocaleDateString(
        'id-ID',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
      )
    : 'Tidak ditentukan'

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {goal.categories?.name || 'Tanpa Kategori'}
          </span>

          <h3 className="mt-3 text-lg font-bold text-slate-900">
            {goal.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {goal.description || 'Tidak ada deskripsi.'}
          </p>
        </div>

      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">
            Progres Tabungan
          </span>

          <span className="font-bold text-emerald-700">
            {percentage.toFixed(1)}%
          </span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">Terkumpul</p>
          <p className="mt-1 text-sm font-bold text-emerald-700">
            {formatter.format(currentAmount)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Target</p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatter.format(targetAmount)}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex justify-between gap-3 text-xs">
          <span className="text-slate-500">Kekurangan</span>
          <span className="font-semibold text-slate-700">
            {formatter.format(remainingAmount)}
          </span>
        </div>

        <div className="mt-2 flex justify-between gap-3 text-xs">
          <span className="text-slate-500">Target tanggal</span>
          <span className="font-medium text-slate-700">
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onAddTransaction(goal)}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Catat Transaksi
        </button>

        <button
          type="button"
          onClick={() => onEdit(goal)}
          className="flex-1 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(goal)}
          className="flex-1 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Hapus
        </button>
    </div>
    </article>
  )
}

export default GoalCard