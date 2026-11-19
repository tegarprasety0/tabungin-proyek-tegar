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
  const [goalSearch, setGoalSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [goalSort, setGoalSort] = useState('newest')
  const [goalPage, setGoalPage] = useState(1)
  const [calculator, setCalculator] = useState({ goalId: '', target: '', saved: '', days: '' })

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

  const calculatorGoal = goals.find((goal) => String(goal.id) === calculator.goalId)

  useEffect(() => {
    if (!calculator.goalId) return

    const goal = goals.find((item) => String(item.id) === calculator.goalId)
    if (!goal) return

    const saved = transactions
      .filter((transaction) => transaction.goal_id === goal.id)
      .reduce((total, transaction) => {
        const amount = Number(transaction.amount)
        return total + (transaction.type === 'deposit' ? amount : -amount)
      }, 0)

    let days = ''
    if (goal.target_date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const targetDate = new Date(`${goal.target_date}T00:00:00`)
      days = String(Math.max(0, Math.ceil((targetDate - today) / 86400000)))
    }

    setCalculator((current) => ({
      ...current,
      target: String(goal.target_amount ?? ''),
      saved: String(Math.max(saved, 0)),
      days,
    }))
  }, [calculator.goalId, goals, transactions])

  const visibleGoals = goals
    .filter((goal) => {
      const matchesSearch = goal.name
        .toLocaleLowerCase('id-ID')
        .includes(goalSearch.trim().toLocaleLowerCase('id-ID'))
      const matchesCategory = categoryFilter === 'all'
        || String(goal.category_id ?? '') === categoryFilter

      return matchesSearch && matchesCategory
    })
    .sort((first, second) => {
      if (goalSort === 'name') return first.name.localeCompare(second.name, 'id')
      if (goalSort === 'amount-high') return Number(second.target_amount) - Number(first.target_amount)
      if (goalSort === 'amount-low') return Number(first.target_amount) - Number(second.target_amount)
      if (goalSort === 'progress') {
        const firstProgress = Math.max(balances[first.id] || 0, 0) / Number(first.target_amount || 1)
        const secondProgress = Math.max(balances[second.id] || 0, 0) / Number(second.target_amount || 1)
        return secondProgress - firstProgress
      }
      if (goalSort === 'deadline') {
        return (first.target_date || '9999-12-31').localeCompare(second.target_date || '9999-12-31')
      }
      return new Date(second.created_at) - new Date(first.created_at)
    })

  const mobileGoalPage = Math.min(goalPage, Math.max(visibleGoals.length, 1))
  const mobileGoal = visibleGoals[mobileGoalPage - 1]

  const calculatorRemaining = Math.max(
    Number(calculator.target || 0) - Number(calculator.saved || 0),
    0,
  )
  const calculatorDaily = Number(calculator.days) > 0
    ? Math.ceil(calculatorRemaining / Number(calculator.days))
    : null
  const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })

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
    <main className="tabungin-background min-h-screen px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <section className="grid gap-5 border-2 border-emerald-300 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
          <div>
            <p className="inline-flex border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
              Ruang tabunganmu
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Dashboard Tabungan
            </h1>

            <p className="mt-2 max-w-xl break-all text-sm leading-6 text-slate-500 sm:text-base">
              Selamat datang, {user?.email}. Pantau progres dan kelola rencana menabungmu.
            </p>
          </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 lg:min-w-64">
              <Link
                to="/"
                className="border border-slate-300 bg-white px-3 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-5"
              >
                ← Beranda
              </Link>
            
              <button
                type="button"
                onClick={handleAdd}
                className="border border-emerald-600 bg-emerald-600 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700 sm:px-5"
              >
                + Buat Target
              </button>
            </div>
        </section>

        {/* Ringkasan */}
        <section className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-4 lg:grid-cols-3">
          <div className="col-span-2 flex min-h-32 flex-col justify-between border border-emerald-700 bg-emerald-700 p-4 text-white sm:min-h-40 sm:p-6 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100 sm:text-sm">Total terkumpul</p>
            <div>
              <h2 className="mt-3 break-words text-2xl font-bold sm:text-3xl">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Object.values(balances).reduce((total, value) => total + Math.max(value, 0), 0))}
              </h2>
              <p className="mt-1 text-xs text-emerald-100 sm:text-sm">Akumulasi dari seluruh target</p>
            </div>
          </div>

          <div className="flex min-h-32 flex-col justify-between border border-slate-200 bg-white p-4 sm:min-h-40 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">Target aktif</p>
            <div>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{goals.length}</h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">Rencana yang sedang berjalan</p>
            </div>
          </div>

          <div className="flex min-h-32 flex-col justify-between border border-slate-200 bg-white p-4 sm:min-h-40 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">Kategori</p>
            <div>
              <h2 className="mt-3 text-3xl font-bold text-emerald-600 sm:text-4xl">{categories.length}</h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">Pilihan tabungan tersedia</p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 border-2 border-emerald-300 bg-white p-4 shadow-sm sm:mt-5 sm:p-6 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Kalkulator tabungan</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Berapa yang perlu ditabung?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Bagi sisa target dengan jumlah hari yang kamu punya.</p>
            <div aria-live="polite" className="mt-4 border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Kebutuhan per hari</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {calculatorDaily === null ? '—' : currencyFormatter.format(calculatorDaily)}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {calculatorDaily === null
                  ? calculatorGoal && Number(calculator.days) === 0
                    ? 'Tanggal target hari ini atau sudah lewat.'
                    : 'Pilih target dan isi jumlah hari untuk melihat hasil.'
                  : calculatorRemaining === 0
                    ? 'Target sudah tercapai.'
                    : `Sisa ${currencyFormatter.format(calculatorRemaining)} untuk ${calculator.days} hari.`}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Pilih target tabungan
              <select
                value={calculator.goalId}
                onChange={(event) => setCalculator((current) => ({ ...current, goalId: event.target.value }))}
                className="mt-1 w-full border border-slate-300 bg-white px-3 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Pilih target</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={String(goal.id)}>{goal.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Target (Rp)
              <input type="number" min="0" inputMode="numeric" value={calculator.target} readOnly className="mt-1 w-full border border-slate-300 bg-slate-50 px-3 py-3 outline-none" placeholder="Pilih target" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Terkumpul (Rp)
              <input type="number" min="0" inputMode="numeric" value={calculator.saved} readOnly className="mt-1 w-full border border-slate-300 bg-slate-50 px-3 py-3 outline-none" placeholder="Pilih target" />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              {calculatorGoal?.target_date ? 'Sisa waktu sampai tanggal target (hari)' : 'Waktu menabung (hari)'}
              <input type="number" min="1" inputMode="numeric" value={calculator.days} readOnly={Boolean(calculatorGoal?.target_date)} onChange={(event) => setCalculator((current) => ({ ...current, days: event.target.value }))} placeholder={calculatorGoal ? 'Masukkan jumlah hari' : 'Pilih target terlebih dahulu'} className="mt-1 w-full border border-slate-300 bg-white px-3 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 read-only:bg-slate-50" />
            </label>
          </div>
        </section>

        {/* Daftar target */}
        <section className="mt-8 border border-slate-200 bg-white p-4 sm:mt-10 sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Rencana</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Target Tabungan Saya</h2>
              <p className="mt-1 text-sm text-slate-500">Kelola dan pantau semua target tabunganmu.</p>
            </div>
            <span className="w-fit border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">{visibleGoals.length} dari {goals.length} target</span>
          </div>

          {!loading && !error && goals.length > 0 && (
            <div className="mb-5 grid gap-3 border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_1fr] sm:p-4">
              <label className="text-xs font-semibold text-slate-600">
                Cari target
                <input type="search" value={goalSearch} onChange={(event) => { setGoalSearch(event.target.value); setGoalPage(1) }} placeholder="Nama target..." className="mt-1 w-full border border-slate-300 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Kategori
                <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setGoalPage(1) }} className="mt-1 w-full border border-slate-300 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                  <option value="all">Semua kategori</option>
                  {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Urutkan
                <select value={goalSort} onChange={(event) => { setGoalSort(event.target.value); setGoalPage(1) }} className="mt-1 w-full border border-slate-300 bg-white px-3 py-3 text-sm font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                  <option value="newest">Terbaru</option>
                  <option value="name">Nama A–Z</option>
                  <option value="amount-high">Nominal terbesar</option>
                  <option value="amount-low">Nominal terkecil</option>
                  <option value="progress">Progres tertinggi</option>
                  <option value="deadline">Tanggal target terdekat</option>
                </select>
              </label>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="border border-slate-200 bg-white p-8 text-center sm:p-10">
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
          {!loading && !error && goals.length > 0 && visibleGoals.length === 0 && (
            <div className="border border-dashed border-slate-300 p-8 text-center">
              <p className="font-semibold text-slate-800">Target tidak ditemukan</p>
              <p className="mt-1 text-sm text-slate-500">Coba kata kunci atau kategori lain.</p>
            </div>
          )}

          {!loading && !error && visibleGoals.length > 0 && (
            <>
              <div className="grid gap-4 sm:hidden">
                <GoalCard
                  key={mobileGoal.id}
                  goal={mobileGoal}
                  progress={Math.max(balances[mobileGoal.id] || 0, 0)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddTransaction={handleAddTransaction}
                />
                {visibleGoals.length > 1 && (
                  <nav aria-label="Halaman target tabungan" className="flex items-center justify-between border border-slate-200 bg-white p-3">
                    <button
                      type="button"
                      onClick={() => setGoalPage((current) => Math.max(1, mobileGoalPage - 1))}
                      disabled={mobileGoalPage === 1}
                      className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    <span aria-live="polite" className="text-sm font-semibold text-slate-700">{mobileGoalPage} / {visibleGoals.length}</span>
                    <button
                      type="button"
                      onClick={() => setGoalPage((current) => Math.min(visibleGoals.length, mobileGoalPage + 1))}
                      disabled={mobileGoalPage === visibleGoals.length}
                      className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Berikutnya
                    </button>
                  </nav>
                )}
              </div>
              <div className="hidden gap-4 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {visibleGoals.map((goal) => (
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
            </>
          )}
        </section>
        
        {/* Riwayat transaksi */}
        <section className="mt-6 border border-slate-200 bg-white p-4 sm:mt-8 sm:p-6 lg:p-8">
          <div className="mb-5 border-b border-slate-200 pb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Aktivitas</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Riwayat Transaksi</h2>
            <p className="mt-1 text-sm text-slate-500">Catatan deposit dan penarikan dari seluruh target tabungan.</p>
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
          <div className="my-auto w-full max-w-lg border border-emerald-100 bg-white p-5 shadow-xl sm:p-6">
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
          <div className="my-auto w-full max-w-lg border border-emerald-100 bg-white p-5 shadow-xl sm:p-6">
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
