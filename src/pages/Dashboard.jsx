import { useCallback, useEffect, useState } from 'react'

import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

import GoalCard from '../components/GoalCard'
import GoalForm from '../components/GoalForm'

import TransactionForm from '../components/TransactionForm'
import TransactionHistory from '../components/TransactionHistory'

import { Link } from 'react-router-dom'

function Dashboard() {
  const { user } = useAuth()

  const [goals, setGoals] = useState([])
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  const [saving, setSaving] = useState(false)

  const [transactions, setTransactions] = useState([])
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [savingTransaction, setSavingTransaction] = useState(false)

  // Mengambil target dan kategori dari Supabase
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [goalsResult, categoriesResult, transactionsResult] =
        await Promise.all([
          supabase
            .from('savings_goals')
            .select('*, categories(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        
          supabase
            .from('categories')
            .select('*')
            .order('name'),
        
          supabase
            .from('transactions')
            .select('*, savings_goals(name)')
            .eq('user_id', user.id)
            .order('transaction_date', { ascending: false }),
      ])

      if (goalsResult.error) {
        throw goalsResult.error
      }

      if (categoriesResult.error) {
        throw categoriesResult.error
      }

      if (transactionsResult.error) {
        throw transactionsResult.error
      }

      setGoals(goalsResult.data ?? [])
      setCategories(categoriesResult.data ?? [])
      setTransactions(transactionsResult.data ?? [])
    } catch (err) {
      console.error('Gagal mengambil data:', err)
      setError(err.message || 'Gagal mengambil data tabungan.')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Menghitung saldo setiap target berdasarkan transaksi
  const balances = transactions.reduce((acc, transaction) => {
    const amount = Number(transaction.amount)

    const difference =
      transaction.type === 'deposit' ? amount : -amount

    acc[transaction.goal_id] =
      (acc[transaction.goal_id] || 0) + difference

    return acc
  }, {})

  // Membuka form tambah target
  function handleAdd() {
    setEditingGoal(null)
    setShowForm(true)
  }

  // Membuka form edit target
  function handleEdit(goal) {
    setEditingGoal(goal)
    setShowForm(true)
  }

    // Membuka form tambah transaksi
  function handleAddTransaction(goal) {
    setSelectedGoal(goal)
    setEditingTransaction(null)
    setShowTransactionForm(true)
  }

  // Membuka form edit transaksi
  function handleEditTransaction(transaction) {
    const goal = goals.find(
      (item) => item.id === transaction.goal_id,
    )

    setSelectedGoal(goal)
    setEditingTransaction(transaction)
    setShowTransactionForm(true)
  }

  // Menyimpan target baru atau perubahan target
  async function handleSave(values) {
    setSaving(true)

    try {
      const goalData = {
        name: values.name,
        description: values.description,
        category_id: values.category_id,
        target_amount: values.target_amount,
        target_date: values.target_date,
      }

      if (editingGoal) {
        const { error } = await supabase
          .from('savings_goals')
          .update(goalData)
          .eq('id', editingGoal.id)
          .eq('user_id', user.id)

        if (error) {
          throw error
        }
      } else {
        const { error } = await supabase
          .from('savings_goals')
          .insert({
            ...goalData,
            user_id: user.id,
          })

        if (error) {
          throw error
        }
      }

      setShowForm(false)
      setEditingGoal(null)

      await fetchData()
    } finally {
      setSaving(false)
    }
  }

  // Menyimpan transaksi baru atau perubahan transaksi
  async function handleSaveTransaction(values) {
    if (!selectedGoal) {
      alert('Pilih target tabungan terlebih dahulu.')
      return
    }

    setSavingTransaction(true)

    try {
      // Menghitung saldo target saat ini
      let currentBalance = transactions
        .filter((transaction) => transaction.goal_id === selectedGoal.id)
        .reduce((total, transaction) => {
          const amount = Number(transaction.amount)

          return total + (
            transaction.type === 'deposit' ? amount : -amount
          )
        }, 0)

      // Jika sedang mengedit, keluarkan transaksi lama dari perhitungan
      if (editingTransaction) {
        const oldAmount = Number(editingTransaction.amount)

        currentBalance -=
          editingTransaction.type === 'deposit'
            ? oldAmount
            : -oldAmount
      }

      // Hitung dampak transaksi baru terhadap saldo
      const newAmount = Number(values.amount)

      const newBalance =
        currentBalance +
        (values.type === 'deposit' ? newAmount : -newAmount)

      // Cegah saldo menjadi negatif
      if (newBalance < 0) {
        throw new Error('Saldo tidak mencukupi untuk melakukan penarikan.')
      }

      const transactionData = {
        goal_id: selectedGoal.id,
        user_id: user.id,
        type: values.type,
        amount: newAmount,
        description: values.description,
        transaction_date: values.transaction_date,
      }

      if (editingTransaction) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert(transactionData)

        if (error) throw error
      }

      setShowTransactionForm(false)
      setEditingTransaction(null)
      setSelectedGoal(null)

      await fetchData()
    } catch (err) {
      console.error('Gagal menyimpan transaksi:', err)
      alert(`Gagal menyimpan transaksi: ${err.message}`)
    } finally {
      setSavingTransaction(false)
    }
  }
  
  // Menghapus transaksi
  async function handleDeleteTransaction(transaction) {
    const confirmed = window.confirm(
      'Yakin ingin menghapus transaksi ini?',
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Gagal menghapus transaksi:', error)
      alert(`Gagal menghapus transaksi: ${error.message}`)
      return
    }

    await fetchData()
  }


  // Menghapus target
  async function handleDelete(goal) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus target "${goal.name}"?`,
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', goal.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Gagal menghapus target:', error)
      alert(`Gagal menghapus target: ${error.message}`)
      return
    }

    await fetchData()
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-emerald-600">
              Tabungin
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Dashboard Tabungan
            </h1>

            <p className="mt-2 text-slate-500">
              Selamat datang, {user?.email}!
            </p>
          </div>

            <div className="flex gap-3">
              <Link
                to="/"
                className="border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                ← Beranda
              </Link>
            
              <button
                type="button"
                onClick={handleAdd}
                className="bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                + Buat Target
              </button>
            </div>
        </section>

        {/* Ringkasan */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Target Tabungan
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {goals.length}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Target yang sedang kamu rencanakan
            </p>
          </div>

          <div className="border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Kategori Tersedia
            </p>

            <h2 className="mt-2 text-3xl font-bold text-emerald-600">
              {categories.length}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pilihan kategori tabungan
            </p>
          </div>
        </section>

        {/* Daftar target */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Target Tabungan Saya
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Kelola dan pantau semua target tabunganmu.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white p-10 text-center">
              <p className="text-slate-500">
                Memuat data tabungan...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="border border-red-100 bg-red-50 p-6">
              <p className="font-medium text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchData}
                className="mt-3 text-sm font-semibold text-red-700 underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && goals.length === 0 && (
            <div className="border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                Belum Ada Target Tabungan
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Mulai rencanakan keuanganmu dengan membuat
                target tabungan pertama.
              </p>

              <button
                type="button"
                onClick={handleAdd}
                className="mt-5 bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Buat Target Pertama
              </button>
            </div>
          )}

          {/* Daftar target */}
          {!loading && !error && goals.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  progress={Math.max(balances[goal.id] || 0, 0)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddTransaction={handleAddTransaction}
                />
              ))}
            </div>
          )}
        </section>
        
        {/* Riwayat transaksi */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Riwayat Transaksi
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Catatan deposit dan penarikan dari seluruh target tabungan.
            </p>
          </div>

          {!loading && !error && (
            <TransactionHistory
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          )}
        </section>

      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-auto w-full max-w-lg bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingGoal
                  ? 'Edit Target Tabungan'
                  : 'Buat Target Tabungan'}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Lengkapi informasi target tabunganmu.
              </p>
            </div>

            <GoalForm
              categories={categories}
              initialValues={editingGoal}
              onSubmit={handleSave}
              onCancel={() => {
                setShowForm(false)
                setEditingGoal(null)
              }}
            />
          </div>
        </div>
      )}

    {/* Modal Form Transaksi */}
      {showTransactionForm && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-auto w-full max-w-lg bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingTransaction
                  ? 'Edit Transaksi'
                  : 'Catat Transaksi'}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Target: {selectedGoal.name}
              </p>
            </div>

            <TransactionForm
              initialValues={editingTransaction}
              onSubmit={handleSaveTransaction}
              onCancel={() => {
                setShowTransactionForm(false)
                setEditingTransaction(null)
                setSelectedGoal(null)
              }}
            />
          </div>
        </div>
      )}

    </main>
  )
}

export default Dashboard