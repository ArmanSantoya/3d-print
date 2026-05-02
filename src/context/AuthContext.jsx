import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { usersApi } from '../utils/database'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
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

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const userData = session?.user || null
        setUser(userData)
        
        if (userData) {
          await checkUserAccess(userData)
        } else {
          setHasAccess(false)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const checkUserAccess = async (userData) => {
    try {
      setLoadingAccess(true)
      
      // Get or create user profile
      await usersApi.getOrCreateProfile(userData)
      
      // Check dashboard access
      const hasAccess = await usersApi.checkDashboardAccess(userData.email)
      setHasAccess(hasAccess)
    } catch (error) {
      console.error('Error checking user access:', error)
      setHasAccess(false)
    } finally {
      setLoadingAccess(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Get the current origin and add the app path
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

  const getUserName = () => {
    if (!user) return null
    // Try to get full name from Google metadata
    return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setHasAccess(false)
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, hasAccess, loadingAccess, signInWithGoogle, logout, getUserName, checkUserAccess }}>
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
