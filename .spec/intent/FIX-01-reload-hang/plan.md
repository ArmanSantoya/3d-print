# Plan — FIX-01 Reload hang

## Diagnóstico

### El bug raíz: el timeout de seguridad se cancela demasiado temprano

En un hard reload (Ctrl+Shift+R) Supabase puede disparar los eventos en este orden:

```
TOKEN_REFRESHED  →  INITIAL_SESSION
```

El token estaba guardado en localStorage pero expirado, entonces el cliente lo
refresca antes de entregar la sesión inicial.

El handler actual usa un bloque `try/finally` que corre para **todos** los eventos:

```js
try {
  if (event === 'TOKEN_REFRESHED') return   // sale… pero finally igual corre
  ...
  await checkUserAccess(userData)
} finally {
  if (mounted) {
    setLoading(false)
    clearTimeout(timeoutId)  // ← MATA el safety net
  }
}
```

Cuando `TOKEN_REFRESHED` dispara primero:
1. El `return` sale del `try`
2. El `finally` igual ejecuta → llama `clearTimeout(timeoutId)`
3. El timeout de seguridad (5s) queda cancelado
4. Luego llega `INITIAL_SESSION` → `checkUserAccess` hace llamadas a Supabase
5. Si esas llamadas tardan o cuelgan → `loadingAccess` queda `true` para siempre
6. `ProtectedRoute` evalúa `loading || (requiresDashboardAccess && loadingAccess)`
   → muestra "Cargando..." sin salida

Y como el `DashboardLayout` (con el botón de cerrar sesión) está envuelto en
`ProtectedRoute`, tampoco se puede hacer logout desde la pantalla colgada.

### Por qué Ctrl+Shift+R lo activa más seguido que F5

`Ctrl+Shift+R` vacía la caché del navegador. Esto fuerza que todos los recursos
(JS, CSS) se descarguen de nuevo, lo que:
- Toma más tiempo → mayor ventana para que el token expire entre la carga del JS
  y la primera evaluación del cliente Supabase
- Más probable que el cliente necesite refrescar el token primero →
  `TOKEN_REFRESHED` llega antes que `INITIAL_SESSION`

### El bug secundario: `loadingAccess` no tiene timeout propio

`usePermissionCheck.check()` hace tres llamadas en serie a Supabase sin ningún
timeout de red. Si cualquiera de ellas cuelga, `loadingAccess` queda `true`
indefinidamente aunque el safety timeout del `AuthContext` hubiera sobrevivido.

---

## Solución propuesta

### Cambio 1 — Sacar los `return` tempranos del bloque `try/finally` (archivo: `AuthContext.jsx`)

Mover los eventos que NO son de inicialización fuera del `try/finally`, para que
`clearTimeout` y `setLoading(false)` solo se llamen después de los eventos reales
de init (`INITIAL_SESSION`, `SIGNED_IN`, `SIGNED_OUT`):

```js
supabase.auth.onAuthStateChange(async (event, session) => {
  if (!mounted) return
  const userData = session?.user || null
  setUser(userData)

  // Estos eventos no afectan el estado de inicialización:
  // salimos ANTES del try/finally para no tocar el timeout.
  if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return

  try {
    if (event === 'SIGNED_OUT' || !userData) {
      resetPermissions()
      return
    }
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      if (lastCheckedUserIdRef.current !== userData.id) {
        await checkUserAccess(userData)
      }
    }
  } catch (error) {
    console.error('Auth state change error:', error)
    resetPermissions()
  } finally {
    // Solo corre para SIGNED_IN / INITIAL_SESSION / SIGNED_OUT.
    // El safety timeout sigue vivo hasta aquí.
    if (mounted) {
      setLoading(false)
      clearTimeout(timeoutId)
    }
  }
})
```

Este cambio mínimo preserva el safety timeout hasta que la inicialización
real termina.

### Cambio 2 — Timeout propio en `usePermissionCheck.check()` (archivo: `usePermissionCheck.js`)

Agregar un `AbortController` con 8 segundos para que `check()` nunca cuelgue
indefinidamente:

```js
const check = useCallback(async (userData) => {
  if (!userData?.id) return
  if (inFlightUserIdRef.current === userData.id) return
  inFlightUserIdRef.current = userData.id
  setLoadingAccess(true)

  const timeout = setTimeout(() => {
    // Si las llamadas a Supabase no respondieron en 8s,
    // liberamos el estado de carga sin acceso.
    setHasAccess(false)
    setIsSuperAdmin(false)
    inFlightUserIdRef.current = null
    setLoadingAccess(false)
  }, 8000)

  try {
    await usersApi.getOrCreateProfile(userData)
    const access = await usersApi.checkDashboardAccess(userData.email)
    setHasAccess(access)
    const superAdmin = await usersApi.checkIfSuperAdmin(userData.id)
    setIsSuperAdmin(superAdmin)
    lastCheckedUserIdRef.current = userData.id
  } catch (error) {
    setHasAccess(false)
    setIsSuperAdmin(false)
  } finally {
    clearTimeout(timeout)
    inFlightUserIdRef.current = null
    setLoadingAccess(false)
  }
}, [])
```

---

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `src/context/AuthContext.jsx` | Mover returns de TOKEN_REFRESHED/USER_UPDATED fuera del try/finally |
| `src/hooks/usePermissionCheck.js` | Agregar timeout de 8s en `check()` |

---

## Preguntas abiertas

Ninguna — el diagnóstico es concluyente y la solución es quirúrgica.
