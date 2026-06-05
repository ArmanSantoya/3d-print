# Plan — REFACTOR-02 useConfig

## Análisis del estado actual

### Lo que hace cada módulo hoy

| Módulo | Lee localStorage | Migra | Escribe localStorage |
|---|---|---|---|
| App.jsx | ✅ (useState init) | ✅ (3 migraciones) | ❌ |
| SavedProjects.jsx | ✅ (IIFE inline) | ❌ | ❌ |
| Settings.jsx | ❌ (recibe props) | ❌ | ✅ (localStorage.setItem directo) |

### Problema de diseño concreto

`SavedProjects` llama a `loadConfig()` propio sin migración. Las funciones `getTotalElectricityCost` y `getLiquidCost` dependen de `config.printers[d.printer].consumptionKw` y `config.retentionRate`. Si el schema es viejo (campo `iva` en vez de `retentionRate`), `getLiquidCost` devuelve un número incorrecto sin avisar.

## Propuesta de implementación

### Estructura

```
src/
  hooks/
    useConfig.js      ← nuevo
```

### Contrato del hook

```js
const [config, setConfig, saveConfig] = useConfig();
```

- **`config`** — estado actual, ya migrado. Tipo: el mismo objeto que hoy devuelve App.
- **`setConfig(updater)`** — actualiza el estado en memoria (igual a `setState`). No persiste automáticamente.
- **`saveConfig()`** — persiste el estado actual a `localStorage`. Lo llama Settings al pulsar "Guardar".

### Internals del hook

```js
// src/hooks/useConfig.js
export const useConfig = () => {
  const [config, setConfig] = useState(() => {
    const raw = localStorage.getItem('config');
    return migrateConfig(raw ? JSON.parse(raw) : defaultConfig);
  });

  const saveConfig = useCallback(() => {
    localStorage.setItem('config', JSON.stringify(config));
  }, [config]);

  return [config, setConfig, saveConfig];
};
```

La lógica de migración se extrae a `migrateConfig(config)` — función pura, fácil de testear y de extender.

### Cambios por archivo

**`App.jsx`**
- Reemplaza el `useState` de 30 líneas con `const [config, setConfig, saveConfig] = useConfig()`
- Pasa `saveConfig` a `Settings` como prop nueva

**`SavedProjects.jsx`**
- Reemplaza el IIFE de config (líneas 12–15) con `const [config] = useConfig()`
- Ahora el config siempre está migrado

**`Settings.jsx`**
- Recibe `saveConfig` como prop nueva
- Reemplaza `localStorage.setItem(...)` en `handleSave` con `saveConfig()`
- Elimina el import de localStorage directo

### Auto-save: NO

La UX actual es "guardar explícitamente". El hook no hace auto-save en cada cambio de `setConfig` — el usuario tiene que pulsar "Guardar" en Settings. Esto se mantiene igual.

## Impacto esperado

- **Archivos creados:** `src/hooks/useConfig.js`
- **Archivos modificados:** `App.jsx`, `SavedProjects.jsx`, `Settings.jsx`, `CLAUDE.md`
- **Sin cambio de comportamiento visible** para el usuario
- **Corrección silenciosa:** SavedProjects ahora siempre lee config migrado

## Preguntas abiertas

1. **¿Dónde vive `migrateConfig`?** — ¿Dentro del hook (privado) o exportada desde `useConfig.js` (testeable desde fuera)?
2. **`Settings` recibe `saveConfig` como prop nueva**: ¿OK añadir esa prop, o prefieres que `Settings` también llame al hook directamente y sincronice con App de otra forma?
