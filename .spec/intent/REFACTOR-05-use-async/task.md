# Tasks — REFACTOR-05 useAsync

## Decisiones aprobadas
- Scope: Grupo A (loadProjects, loadUsers) + Step3Summary (handleSaveProject)
- `handlePermissionChange` en AdminUsers queda sin tocar (saving por clave)
- Contrato: `useAsync({ initialLoading? })` → `{ loading, error, execute }`

## Tareas

- [x] Crear `src/hooks/useAsync.js`
- [x] Refactorizar `SavedProjects.jsx` — usar useAsync para loadProjects
- [x] Refactorizar `AdminUsers.jsx` — usar useAsync para loadUsers
- [x] Refactorizar `Step3Summary.jsx` — usar useAsync para handleSaveProject
- [x] Actualizar `CLAUDE.md`
- [x] Verificar build sin errores
- [x] Cerrar intent con decisión final
