# Plan — REFACTOR-05 useAsync

## Análisis: ¿cuánto se puede unificar?

### Grupo A — operaciones de carga (fit perfecto)

`loadProjects` y `loadUsers` son idénticos en estructura:
```js
setLoading(true);
setError('');
try {
  const data = await api.getAll();
  setData(data);
} catch (err) {
  setError('Mensaje genérico');
} finally {
  setLoading(false);
}
```
Ninguno tiene mensaje de éxito. Solo importa si falló o no.

### Grupo B — operaciones de acción (fit parcial)

`handleSaveProject` y `handlePermissionChange` tienen mensaje de **éxito** específico (`'Proyecto guardado exitosamente'`, `'✅ Permisos actualizados'`), que vive en el estado del componente. El hook puede manejar el estado de carga y el error, pero el mensaje de éxito se queda en el componente.

`handlePermissionChange` además usa `saving` como objeto `{ [email]: true/false }` — un booleano global no alcanza. Este caso queda fuera del hook.

### Conclusión del análisis

`useAsync` encaja perfectamente en 2 de 4 operaciones, y parcialmente en 1 más. Forzar los 4 en el mismo hook requeriría añadir opciones que complican la interfaz.

---

## Propuesta

### Contrato del hook

```js
const { loading, error, execute } = useAsync({ initialLoading = false } = {});
```

- **`loading`** — booleano, verdadero mientras `execute` está corriendo
- **`error`** — string con el mensaje de error, vacío si no hay error
- **`execute(fn)`** — ejecuta la función async, maneja loading/error automáticamente. Retorna el valor de `fn()` si tiene éxito, `undefined` si falla.

`initialLoading = true` para operaciones que cargan datos en el mount (SavedProjects, AdminUsers — el spinner aparece desde el inicio).

### Uso concreto

**SavedProjects:**
```js
// Antes: 3 useState + try/catch/finally manual
const { loading, error, execute } = useAsync({ initialLoading: true });

const loadProjects = () => execute(async () => {
  const data = await projectsApi.getAll();
  setProjects(data);
});
```

**AdminUsers (loadUsers):**
```js
const { loading, execute: runLoadUsers } = useAsync({ initialLoading: true });

const loadUsers = () => runLoadUsers(async () => {
  const data = await usersApi.getAllUsers();
  setUsers(data);
});
```

**Step3Summary (handleSaveProject) — fit parcial:**
```js
const { loading: isSaving, execute: runSave } = useAsync();

const handleSaveProject = async () => {
  const result = await runSave(async () => {
    await projectsApi.saveWithDetails(...);
    return 'ok';
  });
  setSaveMessage(result ? 'Proyecto guardado exitosamente' : 'Error al guardar el proyecto');
};
```
El éxito/error del mensaje sigue en el componente; el hook solo maneja `isSaving`.

**AdminUsers (handlePermissionChange) — queda sin cambios:**
El `saving` por clave de email no encaja en un booleano simple. Se deja tal cual.

---

## Pregunta abierta — necesito tu decisión

**¿Aplicamos `useAsync` a los 3 grupos (Grupo A + Step3Summary), o solo al Grupo A?**

- **Solo Grupo A** (loadProjects + loadUsers): cambio mínimo, fit perfecto, sin complicar los componentes de acción.
- **Grupo A + Step3Summary**: un paso más, pero Step3Summary queda más consistente. El ajuste en Step3 es pequeño — el hook maneja `isSaving`, el mensaje de éxito/error sigue en el componente.

Mi recomendación: **Grupo A + Step3Summary**. El hook es igual de simple, y Step3 elimina un par de líneas de boilerplate. `handlePermissionChange` queda sin tocar (su `saving` por clave es genuinamente diferente).
