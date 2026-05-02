import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/login.css'

export default function Signup() {
  const { signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email || !password || !fullName) {
        throw new Error('Por favor completa todos los campos')
      }

      if (password !== passwordConfirm) {
        throw new Error('Las contraseñas no coinciden')
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      await signUpWithEmail(email, password, fullName)
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Error al registrarse')
    } finally {
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
          <h2>Crear Cuenta</h2>
          
          {error && <div className="login-error">{error}</div>}
          {success && (
            <div className="login-success">
              ✓ Cuenta creada exitosamente. Redirigiendo al login...
            </div>
          )}

          {!success && (
            <form onSubmit={handleSignUp} className="login-form">
              <div className="form-group">
                <label htmlFor="fullName">Nombre Completo</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  disabled={loading}
                />
              </div>

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

              <div className="form-group">
                <label htmlFor="passwordConfirm">Confirmar Contraseña</label>
                <input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="email-signin-button"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          )}

          <div className="signup-link">
            ¿Ya tienes cuenta? <a href="/3d-print/login">Inicia sesión aquí</a>
          </div>
        </div>

        <div className="login-footer">
          <p>🔒 Tus datos estarán protegidos y encriptados</p>
        </div>
      </div>
    </div>
  )
}
