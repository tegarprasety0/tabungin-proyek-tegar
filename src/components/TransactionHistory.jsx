function TransactionHistory({
  transactions,
  onEdit,
  onDelete,
}) {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })

  function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-3xl">💰</p>

        <h3 className="mt-3 font-semibold text-slate-800">
          Belum Ada Transaksi
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Transaksi tabunganmu akan muncul di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {transactions.map((transaction) => {
          const isDeposit = transaction.type === 'deposit'

          return (
            <article
              key={transaction.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Informasi transaksi */}
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                    isDeposit
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {isDeposit ? '↓' : '↑'}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">
                    {transaction.savings_goals?.name || 'Target Tabungan'}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {transaction.description || 'Tanpa keterangan'}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(transaction.transaction_date)}
                  </p>
                </div>
              </div>

              {/* Nominal dan tindakan */}
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-left sm:text-right">
                  <p
                    className={`font-bold ${
                      isDeposit
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }`}
                  >
                    {isDeposit ? '+' : '-'}
                    {formatter.format(Number(transaction.amount))}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {isDeposit ? 'Deposit' : 'Withdrawal'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(transaction)}
                    className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(transaction)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default TransactionHistory