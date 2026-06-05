# Intent: SEC-01 — Habilitar RLS en public.authorized_users

## Estado: COMPLETADO ✅ — 2026-06-05

## Origen
Alerta de seguridad de Supabase Lint.

## Problema
La tabla `public.authorized_users` estaba expuesta a PostgREST sin Row Level Security, permitiendo que cualquier usuario autenticado leyera o manipulara sus registros sin restricción.

## Decisión tomada
Se habilitó RLS con una policy mínima de SELECT (cada usuario ve solo su propio registro). No se crearon policies de escritura porque:
- La tabla tiene un único registro activo (el admin).
- El admin ya está en `user_profiles` con `is_super_admin = true`.
- Las operaciones de escritura sobre `authorized_users` desde el frontend (`addAuthorizedUser`, `removeAuthorizedUser`) fueron marcadas como `@deprecated` — la gestión de usuarios opera íntegramente sobre `user_profiles` vía `updateUserPermissions()`.

## Cambios realizados
- **Supabase:** RLS habilitado + policy `select_own_record` en `authorized_users`
- **`src/utils/database.js`:** JSDoc `@deprecated` en `addAuthorizedUser` y `removeAuthorizedUser`
