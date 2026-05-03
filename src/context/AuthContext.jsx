import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, features } from '../supabase'
import { usersApi } from '../utils/database'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loadingAccess, setLoadingAccess] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        const userData = session?.user || null
        setUser(userData)
        
        if (userData) {
          await checkUserAccess(userData)
        }
      } catch (error) {
        console.error('Error checking auth session:', error)
      } finally {
        setLoading(false)
      }
    }

    // Set a 5-second timeout for initial load - if it takes longer, just proceed
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setLoadingAccess(false)
    }, 5000)

    checkUser().finally(() => clearTimeout(timeoutId))

    // Listen for auth changes - simpler approach, don't filter events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event)
        const userData = session?.user || null
        setUser(userData)
        
        if (userData) {
          await checkUserAccess(userData)
        } else {
          setHasAccess(false)
          setIsSuperAdmin(false)
          setLoadingAccess(false)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const checkUserAccess = async (userData) => {
    setLoadingAccess(true)
    try {
      console.log('🔍 Checking user access for:', userData?.email)
      
      // Get or create user profile
      await usersApi.getOrCreateProfile(userData)
      
      // Check dashboard access
      const hasAccess = await usersApi.checkDashboardAccess(userData.email)
      console.log('✅ Dashboard access:', hasAccess)
      setHasAccess(hasAccess)

      // Check if super admin
      const isSuperAdmin = await usersApi.checkIfSuperAdmin(userData.id)
      console.log('✅ Super admin status:', isSuperAdmin)
      setIsSuperAdmin(isSuperAdmin)
    } catch (error) {
      console.error('❌ Error checking user access:', error)
      setHasAccess(false)
      setIsSuperAdmin(false)
    } finally {
      setLoadingAccess(false)
    }
  }

  const signInWithGoogle = async () => {
    if (!features.googleAuth) {
      throw new Error('Google authentication is disabled')
    }
    
    try {
      const origin = window.location.origin
      const redirectUrl = `${origin}/3d-print/`
      
      console.log('🔐 Redirecting OAuth to:', redirectUrl)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
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
        options: {
          data: {
            full_name: fullName
          }
        }
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

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setHasAccess(false)
      setIsSuperAdmin(false)
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
