import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase, features } from '../supabase'
import { usersApi } from '../utils/database'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loadingAccess, setLoadingAccess] = useState(false)

  // Marca el ultimo user verificado para evitar verificaciones redundantes
  // (p. ej. si SIGNED_IN se dispara despues de INITIAL_SESSION para el mismo user).
  const lastCheckedUserIdRef = useRef(null)
  // Marca una verificacion en curso para prevenir condiciones de carrera entre
  // eventos consecutivos del listener de Supabase.
  const inFlightUserIdRef = useRef(null)

  const checkUserAccess = useCallback(async (userData) => {
    if (!userData?.id) return
    if (inFlightUserIdRef.current === userData.id) return

    inFlightUserIdRef.current = userData.id
    setLoadingAccess(true)
    try {
      console.log('Checking user access for:', userData?.email)
      await usersApi.getOrCreateProfile(userData)
      const access = await usersApi.checkDashboardAccess(userData.email)
      console.log('Dashboard access:', access)
      setHasAccess(access)
      const superAdmin = await usersApi.checkIfSuperAdmin(userData.id)
      console.log('Super admin status:', superAdmin)
      setIsSuperAdmin(superAdmin)
      lastCheckedUserIdRef.current = userData.id
    } catch (error) {
      console.error('Error checking user access:', error)
      setHasAccess(false)
      setIsSuperAdmin(false)
    } finally {
      // try/finally garantiza que loadingAccess se libere SIEMPRE, incluso si
      // la verificacion falla. Evita que la UI quede atascada en "Cargando...".
      inFlightUserIdRef.current = null
      setLoadingAccess(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Red de seguridad global: si por cualquier motivo no llega a ejecutarse
    // setLoading(false), liberamos la UI a los 5s para no bloquearla.
    const timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false)
        setLoadingAccess(false)
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

        try {
          // TOKEN_REFRESHED: la sesion sigue valida. Solo refrescamos el user
          // y SALIMOS. NO activamos loading ni re-consultamos user_profiles.
          // Esto fix la pantalla "Cargando..." infinita al volver de otra pestana
          // y elimina llamadas innecesarias a Supabase.
          if (event === 'TOKEN_REFRESHED') return

          // USER_UPDATED: cambian metadatos pero no permisos. No re-verificamos.
          if (event === 'USER_UPDATED') return

          // SIGNED_OUT o sin sesion: limpiar estado.
          if (event === 'SIGNED_OUT' || !userData) {
            setHasAccess(false)
            setIsSuperAdmin(false)
            setLoadingAccess(false)
            lastCheckedUserIdRef.current = null
            inFlightUserIdRef.current = null
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
          setHasAccess(false)
          setIsSuperAdmin(false)
        } finally {
          // GARANTIZADO: setLoading(false) siempre se ejecuta al terminar el
          // primer evento (tipicamente INITIAL_SESSION).
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
  }, [checkUserAccess])

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
    setHasAccess(false)
    setIsSuperAdmin(false)
    setLoadingAccess(false)
    lastCheckedUserIdRef.current = null
    inFlightUserIdRef.current = null
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
      checkUserAccess,
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
