import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

async function getFunctionErrorMessage(error) {
  try {
    const response = error?.context
    if (response && typeof response.json === 'function') {
      const body = await response.json()
      if (body?.error) return body.error
    }
  } catch {
    // Fall back to the Supabase Functions error message.
  }
  return error?.message || 'Terjadi kesalahan pada Edge Function.'
}

function Admin() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({ goals: 0, transactions: 0 })
  const [users, setUsers] = useState([])
  const [userPage, setUserPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedGoals, setSelectedGoals] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [goalsLoading, setGoalsLoading] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    const [categoriesResult, goalsResult, transactionsResult] = await Promise.all([
      supabase.from('categories').select('id, name').order('name'),
      supabase.from('savings_goals').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('id', { count: 'exact', head: true }),
    ])

    const firstError = categoriesResult.error || goalsResult.error || transactionsResult.error
    if (firstError) {
      setError(`Gagal memuat data admin: ${firstError.message}`)
    } else {
      setCategories(categoriesResult.data ?? [])
      setStats({ goals: goalsResult.count ?? 0, transactions: transactionsResult.count ?? 0 })
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const loadUsers = useCallback(async (page = 1) => {
    setUsersLoading(true)
    setError('')
    const { data, error: usersError } = await supabase.functions.invoke('admin-users', {
      method: 'GET',
      headers: { 'x-page': String(page) },
    })

    if (usersError) {
      setError(`Gagal memuat akun pengguna. Pastikan Edge Function admin-users sudah di-deploy: ${await getFunctionErrorMessage(usersError)}`)
      setUsers([])
    } else {
      setUsers(data?.users ?? [])
      setUserPage(page)
    }
    setUsersLoading(false)
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  async function showUserGoals(targetUser) {
    setSelectedUser(targetUser)
    setSelectedGoals([])
    setGoalsLoading(true)
    setError('')
    const { data, error: goalsError } = await supabase
      .from('savings_goals')
      .select('id, name, description, target_amount, target_date, created_at, categories(name)')
      .eq('user_id', targetUser.id)
      .order('created_at', { ascending: false })

    if (goalsError) setError(`Gagal memuat target tabungan: ${goalsError.message}`)
    else setSelectedGoals(data ?? [])
    setGoalsLoading(false)
  }

  async function deleteUser(targetUser) {
    const confirmed = window.confirm(`Hapus akun ${targetUser.email ?? targetUser.id} beserta seluruh target dan transaksinya? Tindakan ini tidak dapat dibatalkan.`)
    if (!confirmed) return

    setDeletingUserId(targetUser.id)
    setError('')
    setNotice('')
    const { error: deleteError } = await supabase.functions.invoke('admin-users', {
      method: 'DELETE',
      body: { userId: targetUser.id },
    })

    if (deleteError) {
      setError(`Gagal menghapus akun: ${await getFunctionErrorMessage(deleteError)}`)
    } else {
      setNotice(`Akun ${targetUser.email ?? ''} dan data tabungannya berhasil dihapus.`)
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser(null)
        setSelectedGoals([])
      }
      await loadUsers(userPage)
      await loadData()
    }
    setDeletingUserId(null)
  }

  function startEdit(category) {
    setEditingId(category.id)
    setCategoryName(category.name)
    setNotice('')
  }

  function resetForm() {
    setEditingId(null)
    setCategoryName('')
  }

  async function saveCategory(event) {
    event.preventDefault()
    const name = categoryName.trim()
    if (!name) return

    setSaving(true)
    setError('')
    setNotice('')
    const result = editingId
      ? await supabase.from('categories').update({ name }).eq('id', editingId)
      : await supabase.from('categories').insert({ name })

    if (result.error) {
      setError(`Gagal menyimpan kategori: ${result.error.message}`)
    } else {
      setNotice(editingId ? 'Kategori berhasil diperbarui.' : 'Kategori berhasil ditambahkan.')
      resetForm()
      await loadData()
    }
    setSaving(false)
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Hapus kategori "${category.name}"? Target yang memakai kategori ini mungkin mencegah penghapusan.`)) return

    setError('')
    setNotice('')
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', category.id)
    if (deleteError) {
      setError(`Gagal menghapus kategori: ${deleteError.message}`)
      return
    }

    setNotice('Kategori berhasil dihapus.')
    await loadData()
  }

  return (
    <main className="tabungin-background min-h-screen px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <section className="border-2 border-emerald-300 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">Panel Admin</p>
              <h1 className="mt-4 text-3xl font-bold text-slate-900">Dashboard Admin</h1>
              <p className="mt-2 break-all text-slate-600">Login sebagai {user?.email}</p>
            </div>
            <Link to="/dashboard" className="border border-emerald-700 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Dashboard pengguna</Link>
          </div>

          {error && <p role="alert" className="mt-5 border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {notice && <p role="status" className="mt-5 border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

          <section aria-label="Ringkasan data" className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-500">Total target tabungan</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '…' : stats.goals}</p>
            </div>
            <div className="border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-500">Total transaksi</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '…' : stats.transactions}</p>
            </div>
          </section>
        </section>

        <section className="mt-5 border border-slate-200 bg-white p-5 sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">Akun pengguna</h2>
            <p className="mt-1 text-sm text-slate-500">Lihat target tabungan atau hapus akun user beserta data tabungannya.</p>
          </div>
          {usersLoading ? <p className="text-sm text-slate-500">Memuat akun…</p> : users.length === 0 ? <p className="border border-dashed border-slate-300 p-5 text-sm text-slate-500">Tidak ada akun pada halaman ini.</p> : (
            <ul className="divide-y divide-slate-200 border-y border-slate-200">
              {users.map((account) => (
                <li key={account.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="break-all font-semibold text-slate-800">{account.email || '(tanpa email)'}</p>
                    <p className="mt-1 text-xs text-slate-500">{account.app_metadata?.role === 'admin' ? 'Admin' : 'User'} · dibuat {account.created_at ? new Date(account.created_at).toLocaleDateString('id-ID') : '—'}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => showUserGoals(account)} className="border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Lihat target</button>
                    {account.app_metadata?.role !== 'admin' && <button type="button" disabled={deletingUserId === account.id} onClick={() => deleteUser(account)} className="border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{deletingUserId === account.id ? 'Menghapus…' : 'Hapus akun'}</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between">
            <button type="button" disabled={usersLoading || userPage <= 1} onClick={() => loadUsers(userPage - 1)} className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Sebelumnya</button>
            <span className="text-sm text-slate-500">Halaman {userPage}</span>
            <button type="button" disabled={usersLoading || users.length < 100} onClick={() => loadUsers(userPage + 1)} className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Berikutnya</button>
          </div>
        </section>

        {selectedUser && <section className="mt-5 border border-slate-200 bg-white p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Target tabungan</h2>
              <p className="mt-1 break-all text-sm text-slate-500">{selectedUser.email}</p>
            </div>
            <button type="button" onClick={() => setSelectedUser(null)} className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Tutup</button>
          </div>
          {goalsLoading ? <p className="mt-4 text-sm text-slate-500">Memuat target…</p> : selectedGoals.length === 0 ? <p className="mt-4 border border-dashed border-slate-300 p-5 text-sm text-slate-500">Pengguna ini belum memiliki target tabungan.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-3 pr-4">Nama target</th><th className="py-3 pr-4">Kategori</th><th className="py-3 pr-4">Nominal target</th><th className="py-3">Tanggal target</th></tr></thead><tbody>{selectedGoals.map((goal) => <tr key={goal.id} className="border-b border-slate-100"><td className="py-3 pr-4 font-semibold text-slate-800">{goal.name}</td><td className="py-3 pr-4 text-slate-600">{goal.categories?.name || 'Tanpa kategori'}</td><td className="py-3 pr-4 text-slate-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(goal.target_amount) || 0)}</td><td className="py-3 text-slate-600">{goal.target_date ? new Date(`${goal.target_date}T00:00:00`).toLocaleDateString('id-ID') : '—'}</td></tr>)}</tbody></table></div>}
        </section>}

        <section className="mt-5 border border-slate-200 bg-white p-5 sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">Kelola kategori</h2>
            <p className="mt-1 text-sm text-slate-500">Kategori digunakan bersama oleh semua pengguna.</p>
          </div>

          <form onSubmit={saveCategory} className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="category-name" className="sr-only">Nama kategori</label>
            <input id="category-name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} maxLength={80} required placeholder="Nama kategori" className="min-w-0 flex-1 border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" />
            <button type="submit" disabled={saving} className="bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Tambah kategori'}</button>
            {editingId && <button type="button" onClick={resetForm} className="border border-slate-300 px-5 py-3 font-semibold text-slate-700">Batal</button>}
          </form>

          {loading ? <p className="mt-5 text-sm text-slate-500">Memuat kategori…</p> : categories.length === 0 ? <p className="mt-5 border border-dashed border-slate-300 p-5 text-sm text-slate-500">Belum ada kategori.</p> : (
            <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
              {categories.map((category) => (
                <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="font-medium text-slate-800">{category.name}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEdit(category)} className="border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit</button>
                    <button type="button" onClick={() => deleteCategory(category)} className="border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Hapus</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default Admin
