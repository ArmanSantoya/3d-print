# Tasks: SEC-01 — RLS en public.authorized_users

## Estado: COMPLETADO ✅

---

- [x] Confirmar en Supabase Dashboard que el admin tiene `is_super_admin = true` en `user_profiles` → **Confirmado**
- [x] Ejecutar SQL en Supabase SQL Editor → **Success, no rows returned**
- [x] Agregar `@deprecated` en `addAuthorizedUser` y `removeAuthorizedUser` en `database.js`
- [x] Prueba manual: login → dashboard → consola sin errores → **OK ✅**

---

## SQL ejecutado

```sql
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_record"
ON public.authorized_users
FOR SELECT
TO authenticated
USING (email = lower(auth.jwt() ->> 'email'));
```
