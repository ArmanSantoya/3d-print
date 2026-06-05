import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, features } from '../supabase'
import { usePermissionCheck } from '../hooks/usePermissionCheck'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const {
    hasAccess,
    isSuperAdmin,
    loadingAccess,
    check: checkUserAccess,
    reset: resetPermissions,
    lastCheckedUserIdRef,
  } = usePermissionCheck()

  useEffect(() => {
    let mounted = true

    // Red de seguridad global: si por cualquier motivo no llega a ejecutarse
    // setLoading(false), liberamos la UI a los 5s para no bloquearla.
    const timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false)
        resetPermissions()
      }
    }, 5000)

    // onAuthStateChange dispara INITIAL_SESSION automaticamente al suscribirse,
    // asi que NO duplicamos con un getSession() manual (eso provocaba dobles
    // checkUserAccess y posibles race conditions).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        console.log('Auth event:', event)
        const userData = session?.user || null

        // Siempre actualizamos el usuario en estado, sin importar el evento.
        setUser(userData)

        // TOKEN_REFRESHED y USER_UPDATED no son eventos de inicialización.
        // Salimos ANTES del try/finally para no cancelar el timeout de seguridad
        // ni llamar setLoading(false) prematuramente. En un hard reload el cliente
        // Supabase puede disparar TOKEN_REFRESHED antes que INITIAL_SESSION; si
        // el finally corriera aquí mataría el safety-timeout justo antes de que
        // checkUserAccess empiece, dejando la UI colgada sin red de rescate.
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return

        try {
          // SIGNED_OUT o sin sesion: limpiar estado.
          if (event === 'SIGNED_OUT' || !userData) {
            resetPermissions()
            return
          }

          // SIGNED_IN o INITIAL_SESSION: unicos eventos que ejecutan el flujo
          // completo de verificacion de acceso.
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            if (lastCheckedUserIdRef.current === userData.id) return
            await checkUserAccess(userData)
          }
        } catch (error) {
          console.error('Auth state change error:', error)
          resetPermissions()
        } finally {
          // Solo corre para SIGNED_IN / INITIAL_SESSION / SIGNED_OUT.
          // El safety-timeout sigue vivo hasta aquí.
          if (mounted) {
            setLoading(false)
            clearTimeout(timeoutId)
          }
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription?.unsubscribe()
    }
  }, [checkUserAccess, resetPermissions, lastCheckedUserIdRef])

  const signInWithGoogle = async () => {
    if (!features.googleAuth) {
      throw new Error('Google authentication is disabled')
    }
    try {
      const origin = window.location.origin
      const redirectUrl = origin + '/3d-print/'
      console.log('Redirecting OAuth to:', redirectUrl)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in with email:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email, password, fullName = '') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing up with email:', error)
      throw error
    }
  }

  const getUserName = () => {
    if (!user) return null
    return user.user_metadata?.full_name || user.email?.split('@')[0]
  }

  // Limpia todo rastro de sesion: tokens de Supabase en localStorage y
  // sessionStorage. Preserva la `config` del calculador.
  const clearAuthStorage = () => {
    try {
      const authKeyPatterns = [/^sb-/i, /^supabase\./i, /auth-token$/i]
      const lsKeysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && authKeyPatterns.some((pattern) => pattern.test(key))) {
          lsKeysToRemove.push(key)
        }
      }
      lsKeysToRemove.forEach((key) => localStorage.removeItem(key))
      sessionStorage.clear()
    } catch (err) {
      console.warn('No se pudo limpiar el storage de auth:', err)
    }
  }

  const resetAuthState = () => {
    setUser(null)
    resetPermissions()
  }

  // Logout robusto: SIEMPRE limpia estado local + storage y redirige a /login,
  // sin importar si la sesion esta activa, expirada o ya invalida en Supabase.
  // Si supabase.auth.signOut() falla (sesion perdida, error de red, token
  // invalido), igual completamos el cierre local para no dejar al usuario
  // atrapado en una sesion zombi.
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('supabase.signOut() reporto error, continuando con limpieza local:', error.message)
      }
    } catch (error) {
      console.warn('supabase.signOut() lanzo excepcion, continuando con limpieza local:', error)
    } finally {
      resetAuthState()
      clearAuthStorage()
      const target = '/3d-print/login'
      if (typeof window !== 'undefined' && window.location.pathname !== target) {
        window.location.replace(target)
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      hasAccess,
      isSuperAdmin,
      loadingAccess,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      getUserName,
      features
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
