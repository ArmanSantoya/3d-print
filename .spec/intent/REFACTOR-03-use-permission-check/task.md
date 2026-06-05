# Tasks — REFACTOR-03 usePermissionCheck

## Decisiones aprobadas
- Nombre: `usePermissionCheck`
- `checkUserAccess` se quita del context value (no lo usa ningún componente externo)
- Contrato del hook: `{ hasAccess, isSuperAdmin, loadingAccess, check, reset }`
- `resetAuthState` en AuthContext llamará a `reset()` del hook para la parte de permisos

## Tareas

- [x] Crear `src/hooks/usePermissionCheck.js`
- [x] Refactorizar `AuthContext.jsx` — usar hook, quitar `checkUserAccess` del context value
- [x] Actualizar `CLAUDE.md`
- [x] Verificar build sin errores
- [x] Cerrar intent con decisión final
