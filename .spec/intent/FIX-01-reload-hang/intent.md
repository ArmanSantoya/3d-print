# FIX-01 — Recarga dura deja la UI colgada; logout no limpia sesión

## Objetivo

Corregir el bug por el que Ctrl+Shift+R (hard reload) deja la aplicación mostrando
"Cargando..." indefinidamente, y el botón de cerrar sesión no logra salir del estado
colgado.

## Contexto

La app usa `onAuthStateChange` para inicializar el estado de autenticación.
El flujo de inicialización depende de un timeout de seguridad de 5 segundos
(`setTimeout` en el `useEffect` de `AuthContext`) para liberar la UI si algo falla.

## Síntomas reportados

- Ctrl+Shift+R en cualquier ruta → pantalla "Cargando..." permanente
- El botón "Cerrar sesión" no logra limpiar el estado / salir de la pantalla colgada

## Decisión final

Dos cambios quirúrgicos aplicados:

1. **`AuthContext.jsx`**: `TOKEN_REFRESHED` y `USER_UPDATED` ahora retornan antes del bloque `try/finally`. El `clearTimeout(timeoutId)` ya no se ejecuta en estos eventos, preservando el safety-net de 5s hasta que `INITIAL_SESSION` o `SIGNED_IN` terminen su ciclo completo.

2. **`usePermissionCheck.js`**: `check()` tiene timeout propio de 8s con flag `timedOut` para evitar race conditions si la red tarda más que el timeout. Segunda línea de defensa independiente del timeout de `AuthContext`.
