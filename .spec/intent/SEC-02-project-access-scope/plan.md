# Plan: SEC-02 — Acotar visibilidad de proyectos al usuario propietario

## Análisis

Hoy, cualquier usuario con `hasAccess = true` (no solo `isSuperAdmin`) puede:
- Ver **todos** los proyectos en `/saved-projects` (`SavedProjects.jsx` usa `projectsApi.getAll()` sin condicionar por rol).
- Ver el detalle de **cualquier** proyecto ajeno en `/project/:id` (`ProjectDetail.jsx` usa `getWithDetails(id)` sin chequeo de propiedad).
- **Marcar como pagado** o **eliminar** cualquier proyecto ajeno desde `ProjectDetail.jsx` (botones sin gating de rol/propiedad; `markAsPaid`/`delete` en `database.js` no filtran por `user_id`).

El patrón correcto ya existe en `Home.jsx:25-30` (si `isSuperAdmin` → `getAll()`, si no → `getUserProjects(user.id)`), pero no se replicó en `SavedProjects.jsx` ni en `ProjectDetail.jsx`.

Capa adicional pendiente de confirmar: si `public.projects` / `public.project_details` no tienen RLS habilitado en Supabase, el filtrado en frontend es cosmético — cualquiera con la anon key podría leer la tabla completa sin pasar por la app (mismo patrón de riesgo que `[[SEC-01]]`, ya resuelto para `authorized_users`).

## Cambios propuestos

### 1. Frontend (defensa en profundidad — capa 1)

- **`src/components/SavedProjects.jsx`**: usar `useAuth()` para obtener `user` e `isSuperAdmin`. En `loadProjects`, replicar el patrón de `Home.jsx`: `isSuperAdmin ? getAll() : getUserProjects(user.id)`.
- **`src/utils/database.js` → `getWithDetails(id, { userId, isSuperAdmin } = {})`**: si no es admin, agregar `.eq('user_id', userId)` a la query del proyecto. Si no hay fila (no es dueño), lanzar error controlado.
- **`src/components/ProjectDetail.jsx`**: usar `useAuth()`, pasar `user.id`/`isSuperAdmin` a `getWithDetails`. Si el fetch falla por no-propiedad, mostrar mensaje ("Proyecto no encontrado") y ofrecer volver a `/saved-projects` — mismo tratamiento que un 404, sin revelar que el proyecto existe pero es ajeno.
- **Botones "Marcar como pagado" / "Eliminar"** en `ProjectDetail.jsx`: ocultar o deshabilitar si el usuario no es dueño ni super admin. `markAsPaid` y `delete` en `database.js` quedan igual a nivel de firma (la protección real contra llamadas directas la da RLS, no el ocultamiento de botones).

### 2. Supabase — RLS (defensa en profundidad — capa 2, acción manual)

No tengo acceso directo al proyecto Supabase desde este entorno, así que este paso lo ejecutas tú en el SQL Editor del dashboard. Te entrego el script exacto en `task.md` una vez aprobado el plan. Cubre:
- Habilitar RLS en `public.projects` y `public.project_details` (si no está habilitado).
- Policy SELECT/UPDATE/DELETE: `user_id = auth.uid() OR` admin (vía `user_profiles.is_super_admin`).
- Policy INSERT: `user_id = auth.uid()`.

## Impacto esperado

- Usuarios regulares solo ven/operan sobre sus propios proyectos en `/saved-projects` y `/project/:id`.
- Super admin sin cambios (sigue viendo todo).
- Ningún cambio en la fórmula de precios, PDF, ni flujo de cotización.
- Si se aplica el paso 2, aunque un futuro bug de frontend repita el error, la base de datos no entregará filas ajenas.

## Preguntas antes de ejecutar

1. ¿Tienes acceso al SQL Editor de Supabase para correr el script de RLS, o prefieres que solo se aborde la capa 1 (frontend) por ahora y la capa 2 quede como tarea pendiente/manual?
2. Cuando un usuario no-admin intenta abrir `/project/:id` de otro usuario vía URL directa: ¿mensaje de "no encontrado" + botón volver, o redirigir automáticamente a `/saved-projects`?
3. ¿Confirmas que "Marcar como pagado" y "Eliminar" deben quedar disponibles para el dueño del proyecto **y** super admin (no solo super admin)?
