import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ element }) {
  const { user, loading } = useAuth()

  if (loading) {
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

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return element
}
