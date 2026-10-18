# Intent: SEC-02 — Acotar visibilidad de proyectos al usuario propietario

## Estado: COMPLETADO ✅ — 2026-10-18

## Origen
Pregunta del usuario: "¿actualmente la persona que se registre puede ver todos los proyectos independientemente si no son de esta persona?" — seguida de investigación de código que confirmó el problema.

## Problema
Cualquier usuario autenticado con `hasAccess = true` (no necesariamente `isSuperAdmin`) puede ver proyectos de **otros** usuarios:

1. `src/components/SavedProjects.jsx:20` llama `projectsApi.getAll()` sin distinguir rol — a diferencia de `Home.jsx:25-30`, que sí usa `getUserProjects(user.id)` para usuarios no-admin. `SavedProjects` nunca filtra por `user_id`.
2. `projectsApi.getAll()` (`src/utils/database.js:68-76`) no acepta ni aplica filtro de `user_id` — trae toda la tabla `projects`.
3. `ProjectDetail.jsx` (ruta `/project/:id`) llama `projectsApi.getWithDetails(id)` (`database.js:91-109`) sin verificar que el proyecto pertenezca al usuario actual (ni que sea super admin). Cualquiera con `hasAccess = true` que conozca o adivine un `id` puede ver el detalle de un proyecto ajeno.
4. Pendiente de confirmar en el dashboard de Supabase: si la tabla `projects` no tiene Row Level Security (RLS) habilitado, el filtrado es puramente cosmético en el cliente — cualquiera con la anon key podría consultar la tabla directamente sin pasar por la app.

## Alcance
- Corregir `SavedProjects.jsx` y `ProjectDetail.jsx` para que un usuario sin `isSuperAdmin` solo pueda ver/operar sobre sus propios proyectos.
- Revisar y, si falta, habilitar RLS sobre `public.projects` (y `public.project_details`) en Supabase, siguiendo el precedente de `[[SEC-01]]` (RLS en `authorized_users`).
- No se modifica la fórmula de precios ni el flujo de cotización — fuera de alcance.

## Decisión tomada

**Causa raíz real:** `public.projects` y `public.project_details` ya tenían RLS habilitado y policies correctas de owner/super-admin, pero una policy huérfana `"Allow all operations on ..."` (`cmd ALL`, `USING (true)`) convivía con ellas. Postgres combina policies permisivas con OR, así que esa policy anulaba por completo la restricción — cualquier usuario autenticado podía leer/escribir cualquier fila. El bug de `SavedProjects.jsx`/`ProjectDetail.jsx` (sin scope por `user_id`) exponía el mismo hueco también en el cliente, pero la causa de fondo estaba en la base de datos.

**Cambios aplicados:**
- **Supabase:** `DROP POLICY` de las 2 policies huérfanas en `projects`/`project_details`, + `CREATE POLICY` para el DELETE que faltaba en `project_details`. Verificado leyendo `pg_policies` tras el cambio. Ejecutado con Supabase CLI (binario descargado directo de GitHub releases — el registro de npm falló por un error TLS local; login vía Personal Access Token porque el entorno no tiene TTY para el flujo OAuth interactivo).
- **`src/utils/database.js`:** `getWithDetails(id, { userId, isSuperAdmin })` ahora filtra por `user_id` salvo admin.
- **`src/components/SavedProjects.jsx`:** replica el patrón de `Home.jsx` — `isSuperAdmin ? getAll() : getUserProjects(user.id)`.
- **`src/components/ProjectDetail.jsx`:** pasa el scope a `getWithDetails`; si el fetch falla (proyecto ajeno o inexistente, sin distinguir para no revelar su existencia), redirect automático a `/saved-projects`. Los botones "Marcar como pagado"/"Eliminar" no necesitaron gating adicional: si el proyecto cargó, el viewer ya es dueño o admin.
- **`.gitignore`:** agregado `.supabase-token` y `supabase/.temp/` (metadata del CLI, puede incluir datos de conexión).

El fix de RLS por sí solo ya cerraba la exposición a nivel de datos (incluso si el frontend seguía con el bug, Supabase habría devuelto 0 filas a un no-admin). Los cambios de frontend son defensa en profundidad + UX consistente con `Home.jsx`.
