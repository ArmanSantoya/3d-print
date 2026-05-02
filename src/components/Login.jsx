import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/login.css'

export default function Login() {
  const { signInWithEmail, signInWithGoogle, features } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email || !password) {
        throw new Error('Por favor completa todos los campos')
      }
      
      await signInWithEmail(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

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
          <img src="/3d-print/logo.jpg" alt="3D Pricing Calculator" className="login-logo" />
          <p>Calculadora de costos para impresión 3D</p>
        </div>

        <div className="login-content">
          <h2>Inicia sesión</h2>
          
          {error && <div className="login-error">{error}</div>}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.email@ejemplo.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="email-signin-button"
            >
              {loading ? 'Conectando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="signup-link">
            ¿No tienes cuenta? <a href="/3d-print/signup">Regístrate aquí</a>
          </div>

          {/* Google Auth (if enabled) */}
          {features.googleAuth && (
            <>
              <div className="login-divider">
                <span>o</span>
              </div>

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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Inicia sesión con Google
                  </>
                )}
              </button>

              <p className="login-note">
                Accede de forma segura con tu cuenta de Google
              </p>
            </>
          )}
        </div>

        <div className="login-footer">
          <p>🔒 Tus datos estarán protegidos y encriptados</p>
        </div>
      </div>
    </div>
  )
}
