import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/login.css'

export default function Login() {
  const { signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión con Google')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🖨️ 3D Pricing Calculator</h1>
          <p>Bienvenido</p>
        </div>

        <div className="login-content">
          <h2>Inicia sesión para continuar</h2>
          
          {error && <div className="login-error">{error}</div>}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="google-signin-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Conectando...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6m0 0v6"></path>
                </svg>
                Inicia sesión con Google
              </>
            )}
          </button>
        </div>

        <div className="login-footer">
          <p>Tus datos estarán seguros y encriptados</p>
        </div>
      </div>
    </div>
  )
}
