# REFACTOR-03 — usePermissionCheck: extraer deduplicación de permisos de AuthContext

## Objetivo

Separar las dos responsabilidades que hoy conviven en `AuthContext.jsx`:
1. Escuchar el estado de sesión (Supabase listener)
2. Verificar permisos del usuario y deduplicar esas llamadas

## Contexto

`AuthContext.jsx` tiene 250 líneas porque hace dos cosas al mismo tiempo.

**Responsabilidad 1 — Sesión:** el `useEffect` con `onAuthStateChange` escucha eventos de Supabase (`INITIAL_SESSION`, `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`) y actualiza `user` y `loading`.

**Responsabilidad 2 — Permisos + deduplicación:**
- `checkUserAccess(userData)` — llama a `usersApi.getOrCreateProfile`, `checkDashboardAccess` y `checkIfSuperAdmin`
- `lastCheckedUserIdRef` — evita re-verificar si ya se verificó el mismo usuario
- `inFlightUserIdRef` — evita race condition si dos eventos llegan juntos para el mismo usuario
- Estado derivado: `hasAccess`, `isSuperAdmin`, `loadingAccess`

**Deletion test:** Si borras `lastCheckedUserIdRef` e `inFlightUserIdRef`, la app funciona igual excepto que puede llamar a Supabase más veces de lo necesario. El problema es de implementación (deduplicación), no de interfaz.

## Restricciones conocidas

- `checkUserAccess` está expuesto en el context value (línea 234) — puede que algún componente lo llame directamente.
- `resetAuthState` (línea 190) resetea tanto estado de sesión como de permisos — al separar hay que dividir esa función.
- El timeout de 5s (línea 54) llama `setLoadingAccess(false)` — necesita acceso al reset del hook.
- El listener de SIGNED_OUT resetea los refs (líneas 88-89) — necesita acceso al reset del hook.

## Decisión final

`usePermissionCheck` como nombre. `checkUserAccess` quitado del context value (ningún componente externo lo usaba). `AuthContext` pasa de 250 a 175 líneas. Toda la lógica de deduplicación y state de permisos vive en `usePermissionCheck.js`. CLAUDE.md actualizado. Build limpio.
