import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from './supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (active) {
        setSession(currentSession)
        setLoading(false)
      }
    })

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!active) return

      if (error) {
        console.error('Gagal memulihkan sesi:', error.message)
      }

      setSession(data?.session ?? null)
      setLoading(false)
    }

    restoreSession()

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }

  return context
}
