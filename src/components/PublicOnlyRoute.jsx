import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

function PublicOnlyRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">
          Memeriksa sesi login...
        </p>
      </main>
    )
  }

  if (user) {
    const destination =
      location.state?.from?.pathname || '/dashboard'

    return <Navigate to={destination} replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
