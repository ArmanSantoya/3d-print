# Tasks: SEC-02 — Acotar visibilidad de proyectos al usuario propietario

Decisiones confirmadas por el usuario:
1. RLS lo ejecuto yo mismo vía Supabase CLI (`npx supabase`, login interactivo del usuario).
2. Acceso no autorizado a `/project/:id` → redirect automático a `/saved-projects`.
3. "Marcar como pagado" / "Eliminar" visibles para dueño del proyecto **y** super admin.

## Capa 1 — Frontend

- [x] `src/utils/database.js`: `getWithDetails(id, { userId, isSuperAdmin } = {})` — filtra por `user_id` cuando no es admin.
- [x] `src/components/SavedProjects.jsx`: usa `useAuth()`, `isSuperAdmin ? getAll() : getUserProjects(user.id)`.
- [x] `src/components/ProjectDetail.jsx`: usa `useAuth()`, pasa scope a `getWithDetails`; si falla por no-propiedad, redirect automático a `/saved-projects`. Los botones "Marcar como pagado"/"Eliminar" ya no necesitan gating adicional: si el proyecto cargó, el viewer es dueño o admin (lo garantiza el scope + RLS).

## Capa 2 — Supabase RLS

- [x] Supabase CLI descargado directo desde GitHub releases (npm registry falló por TLS — `UNABLE_TO_VERIFY_LEAF_SIGNATURE`). Login vía Personal Access Token (`SUPABASE_ACCESS_TOKEN`), ya que el entorno no tiene TTY para el flujo de login interactivo (se confirmó que ni `winpty` resuelve esto — el proceso padre tampoco tiene consola real).
- [x] Proyecto linkeado: `jqnxljokfebvyekkqukw` ("3D Printing Calculator").
- [x] **Causa raíz real encontrada**: RLS ya estaba habilitado en `projects` y `project_details`, y ya existían policies correctas de owner/super-admin — pero una policy huérfana `"Allow all operations on ..."` (`cmd ALL`, `USING (true)`) convivía con ellas. Postgres combina policies permisivas con OR, así que esa policy anulaba por completo la restricción. Esa era la causa real de que cualquier usuario viera todos los proyectos.
- [x] Aplicado `rls_fix.sql`: DROP de las 2 policies huérfanas + CREATE de la policy DELETE que faltaba en `project_details` (la usa `projectsApi.delete()` al borrar los detalles antes del proyecto).
- [x] Verificado leyendo `pg_policies` tras el cambio: solo quedan las policies scoped a owner/admin en `projects` (SELECT/INSERT/UPDATE/DELETE) y `project_details` (SELECT/INSERT/DELETE).
- [x] Token (`.supabase-token`) borrado tras uso; `.gitignore` actualizado con `.supabase-token` y `supabase/.temp/`.

## Cierre

- [x] `npm run lint` y `npm run build` verificados — sin errores nuevos (los 5 errores preexistentes en `MultiStepForm.jsx`/`useConfig.js` no están relacionados con este cambio).
- [x] Marcado Done.
- [x] `intent.md` actualizado con la decisión final y estado COMPLETADO.
