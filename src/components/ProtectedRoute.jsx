import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ element, requiresDashboardAccess = false }) {
  const { user, loading, hasAccess, loadingAccess } = useAuth()

  if (loading || (requiresDashboardAccess && loadingAccess)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Cargando...
      </div>
    )
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Dashboard access required but user doesn't have it
  if (requiresDashboardAccess && !hasAccess) {
    return <Navigate to="/calculator" replace />
  }

  return element
}
