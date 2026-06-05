# REFACTOR-05 — useAsync: centralizar el patrón loading/error/try-catch

## Objetivo

Eliminar la repetición del patrón `loading/error/try-catch/finally` que aparece en múltiples componentes, extrayéndolo a un hook `useAsync()`.

## Contexto

Hay cuatro operaciones async con el mismo esqueleto:

| Componente | Operación | Estado propio |
|---|---|---|
| SavedProjects | `loadProjects()` | `loading` + `error` |
| AdminUsers | `loadUsers()` | `loading` + `message` |
| AdminUsers | `handlePermissionChange()` | `saving` (objeto por email) + `message` |
| Step3Summary | `handleSaveProject()` | `isSaving` + `saveMessage` |

Los cuatro repiten:
```js
setLoading(true);
try {
  await operacion();
} catch (err) {
  setError('Mensaje de error');
} finally {
  setLoading(false);
}
```

## Matiz importante

No todos los patrones son idénticos:
- `loadProjects` y `loadUsers` son **operaciones de carga** — solo reportan error, no tienen mensaje de éxito
- `handleSaveProject` y `handlePermissionChange` son **operaciones de acción** — reportan tanto éxito como error con mensajes específicos en el componente
- `handlePermissionChange` usa `saving` como objeto con clave por email, no un booleano simple

## Decisión final

`useAsync` aplicado a `SavedProjects`, `AdminUsers` (solo `loadUsers`) y `Step3Summary` (`handleSaveProject`).

- `SavedProjects`: `useAsync({ initialLoading: true })` — elimina 3 `useState` + try/catch/finally manual.
- `AdminUsers`: `useAsync({ initialLoading: true })` — reemplaza `loading` y el bloque try/catch de `loadUsers`. `handling PermissionChange` y su `saving` por clave quedan sin tocar.
- `Step3Summary`: `useAsync()` — `runSave` envuelve el bloque de guardado; el mensaje de éxito/error queda en el componente.

Build pasa sin errores. `CLAUDE.md` actualizado con regla de uso del hook.
