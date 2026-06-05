import { useState, useCallback, useRef } from 'react'
import { usersApi } from '../utils/database'

/**
 * Encapsula la verificación de permisos del usuario con deduplicación.
 *
 * - `check(userData)` ejecuta la verificación completa. Ignora la llamada si
 *   ya hay una en vuelo para el mismo usuario (inFlightUserIdRef) o si el
 *   usuario ya fue verificado en esta sesión (lastCheckedUserIdRef).
 * - `reset()` limpia todo el estado de permisos y los refs de deduplicación.
 *   Debe llamarse en SIGNED_OUT y en el timeout de seguridad de 5s.
 */
export const usePermissionCheck = () => {
  const [hasAccess, setHasAccess] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loadingAccess, setLoadingAccess] = useState(false)

  const lastCheckedUserIdRef = useRef(null)
  const inFlightUserIdRef = useRef(null)

  const check = useCallback(async (userData) => {
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
      inFlightUserIdRef.current = null
      setLoadingAccess(false)
    }
  }, [])

  const reset = useCallback(() => {
    setHasAccess(false)
    setIsSuperAdmin(false)
    setLoadingAccess(false)
    lastCheckedUserIdRef.current = null
    inFlightUserIdRef.current = null
  }, [])

  return { hasAccess, isSuperAdmin, loadingAccess, check, reset, lastCheckedUserIdRef }
}
