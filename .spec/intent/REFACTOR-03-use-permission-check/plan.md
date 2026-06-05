# Plan — REFACTOR-03 usePermissionCheck

## Análisis del estado actual

### Qué vive en AuthContext hoy

| Código | Responsabilidad |
|---|---|
| `user`, `loading` | Sesión |
| `hasAccess`, `isSuperAdmin`, `loadingAccess` | Permisos |
| `lastCheckedUserIdRef`, `inFlightUserIdRef` | Deduplicación de llamadas |
| `checkUserAccess()` | Lógica de verificación |
| `resetAuthState()` | Resetea ambas responsabilidades mezcladas |
| `onAuthStateChange` listener | Orquesta ambas responsabilidades |
| `signIn*`, `logout`, `getUserName` | Autenticación pura |

### Entrelazamiento concreto

`resetAuthState` (línea 190) resetea refs + estado de permisos + estado de sesión en un solo bloque. El listener de `SIGNED_OUT` llama a esa función. Si se extrae la deduplicación, `resetAuthState` queda como:

```js
// AuthContext — solo sesión
const resetAuthState = () => {
  setUser(null);
  setHasAccess(false);  // ← vendrían del hook
  ...
};
```

Solución: `resetAuthState` llama a `resetPermissions()` del hook para su parte, y resetea `user`/`loading` localmente.

## Propuesta

### Nuevo módulo

```
src/hooks/usePermissionCheck.js
```

### Contrato del hook

```js
const { hasAccess, isSuperAdmin, loadingAccess, check, reset } = usePermissionCheck();
```

- **`check(userData)`** — ejecuta la verificación de permisos con deduplicación. Idéntico a `checkUserAccess` actual.
- **`reset()`** — limpia `hasAccess`, `isSuperAdmin`, `loadingAccess` y los dos refs. Se llama en SIGNED_OUT y en el timeout de 5s.

### Cambios en AuthContext

```js
// Antes: ~30 líneas de estado + refs + checkUserAccess
const [hasAccess, setHasAccess] = useState(false);
const [isSuperAdmin, setIsSuperAdmin] = useState(false);
const [loadingAccess, setLoadingAccess] = useState(false);
const lastCheckedUserIdRef = useRef(null);
const inFlightUserIdRef = useRef(null);
const checkUserAccess = useCallback(async (userData) => { ... }, []);

// Después: una línea
const { hasAccess, isSuperAdmin, loadingAccess, check: checkUserAccess, reset: resetPermissions } = usePermissionCheck();
```

El listener queda igual en estructura — solo cambia `checkUserAccess(userData)` → `checkUserAccess(userData)` (mismo nombre, llama al hook) y `lastCheckedUserIdRef.current = null` + `inFlightUserIdRef.current = null` → `resetPermissions()`.

`resetAuthState` se simplifica:
```js
const resetAuthState = () => {
  setUser(null);
  setLoading(false);  // (no, loading se controla en el listener)
  resetPermissions();
};
```

### Impacto en el context value

`checkUserAccess` sigue expuesto en el context value con el mismo nombre — `AuthProvider` lo recibe del hook y lo pasa igual. Cero cambios en consumidores.

## Impacto esperado

- **Archivos creados:** `src/hooks/usePermissionCheck.js`
- **Archivos modificados:** `src/context/AuthContext.jsx`, `CLAUDE.md`
- **Sin cambio de comportamiento ni de interfaz** — el context value es idéntico
- **AuthContext pasa de ~250 a ~180 líneas** — toda la lógica de deduplicación sale

## Preguntas abiertas

1. **¿`checkUserAccess` sigue en el context value?** — Hoy está expuesto en el Provider (línea 234). ¿Algún componente lo llama directamente, o solo se usa internamente para el flujo de login? Si nadie lo llama desde fuera, podría quitarse del value (simplificando la interfaz pública del contexto).

2. **Nombre del hook:** `usePermissionCheck` describe el mecanismo. ¿Prefieres `useUserAccess` que describe el dominio (qué acceso tiene el usuario) más que la implementación?
