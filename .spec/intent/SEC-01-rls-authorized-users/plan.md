# Plan: SEC-01 — RLS en public.authorized_users

## Estado: PENDIENTE VALIDACIÓN

---

## Análisis previo

### ¿Quién lee `authorized_users` en el código?
Solo `usersApi.checkDashboardAccess()` en `database.js`, en el bloque fallback:
```js
// Solo se llega aquí si el usuario NO está en user_profiles
const { data, error } = await supabase
  .from('authorized_users')
  .select('has_dashboard_access')
  .eq('email', lowerEmail)
  .single()
```
Esta llamada la hace el **cliente autenticado**, con sus propias credenciales de Supabase (anon key). RLS aplica sobre estas llamadas.

### ¿Quién escribe en `authorized_users`?
`usersApi.addAuthorizedUser()` y `usersApi.removeAuthorizedUser()` — ambas usan la anon key del cliente (frontend). Con RLS habilitado, estas operaciones serían bloqueadas sin una policy explícita.

---

## Decisiones tomadas (con base en validación)

| Pregunta | Respuesta | Consecuencia |
|---|---|---|
| ¿addAuthorizedUser/remove se usan desde frontend? | Sí | Las writes necesitan policy explícita para super admin, o migramos esa lógica |
| ¿Hay registros activos en authorized_users? | Solo 1 (el propio admin) | La tabla es casi un vestigio — el admin ya debería estar en user_profiles |
| ¿Otras tablas con alerta? | No | Scope acotado a esta tabla |

### Conclusión de diseño
Dado que `authorized_users` tiene un solo registro (el admin) y ese admin ya existe en `user_profiles`, **la tabla es funcionalmente redundante**. El camino más limpio no es agregar políticas complejas sobre una tabla que ya no cumple un rol real — es **deprecar `authorized_users` en favor de `user_profiles`** y habilitar RLS como tabla vacía o eliminada.

**Plan elegido: Migración + RLS**
1. Verificar que el admin está en `user_profiles` con `is_super_admin = true`.
2. Habilitar RLS en `authorized_users` con una policy mínima (solo lectura propia).
3. Dejar las funciones `addAuthorizedUser` / `removeAuthorizedUser` en el código pero documentadas como deprecadas — no se eliminan aún para no romper nada, pero dejan de ser el camino para agregar usuarios (eso ya se hace desde AdminUsers.jsx vía `updateUserPermissions`).

---

## SQL a ejecutar en Supabase

```sql
-- 1. Habilitar RLS
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- 2. Policy SELECT: cada usuario autenticado solo ve su propio registro
CREATE POLICY "select_own_record"
ON public.authorized_users
FOR SELECT
TO authenticated
USING (email = lower(auth.jwt() ->> 'email'));

-- 3. Sin policies de INSERT/UPDATE/DELETE desde el cliente
--    → esas operaciones quedan bloqueadas por RLS por defecto
--    → si se necesitan en el futuro, deben hacerse desde el Dashboard de Supabase
```

---

## Impacto en la app

| Flujo | ¿Se rompe? | Acción |
|---|---|---|
| Login / checkDashboardAccess (SELECT fallback) | ✅ No | La policy SELECT cubre este caso exactamente |
| Flujo normal de usuarios | ✅ No | Nunca tocan esta tabla |
| addAuthorizedUser() desde AdminUsers | ⚠️ Bloqueado por RLS | Documentar como deprecado — el alta de usuarios ya usa updateUserPermissions() sobre user_profiles |
| removeAuthorizedUser() | ⚠️ Bloqueado por RLS | Ídem — deprecar |

---

## Tareas

- [ ] Confirmar en Supabase Dashboard que el admin tiene registro en `user_profiles` con `is_super_admin = true`
- [ ] Ejecutar el SQL anterior en el SQL Editor de Supabase
- [ ] Probar el flujo completo: login → verificación de acceso → dashboard
- [ ] Agregar comentario JSDoc de `@deprecated` en `addAuthorizedUser` y `removeAuthorizedUser` en `database.js`
- [ ] Actualizar intent.md con decisión final
