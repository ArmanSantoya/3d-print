# REFACTOR-02 — useConfig: centralizar carga y migración del config

## Objetivo

Eliminar las tres implementaciones dispersas de lectura del config desde localStorage, extrayendo la lógica a un hook `useConfig()` que centraliza lectura, migración y escritura.

## Contexto

El config se persiste en `localStorage` bajo la clave `'config'`. Hoy tres módulos lo manejan de forma diferente:

**App.jsx** (líneas 16–46):
- Lee localStorage, parsea JSON
- Ejecuta 3 migraciones de schema (consumptionKw → printers, machineCostPerHour, iva → retentionRate)
- Almacena resultado en `useState`
- Pasa `config` y `setConfig` como props a `Settings` y `MultiStepForm`

**SavedProjects.jsx** (líneas 12–15):
- Lee localStorage con un IIFE inline
- **No ejecuta ninguna migración** — lee datos crudos
- Usa el config solo para fallback de proyectos viejos (electricidad y costo líquido)

**Settings.jsx** (líneas 43–46):
- Escribe a localStorage directamente con `localStorage.setItem`
- Recibe `config` y `setConfig` como props (no lee localStorage)

## Riesgo actual

Si el usuario navega directo a `/saved-projects` (ruta separada), `SavedProjects` lee el config sin migrar. Si hay un campo viejo (`iva`, `electricity.consumptionKw`), los cálculos de fallback pueden fallar silenciosamente.

## Decisión final

`migrateConfig` exportada + `saveConfig` como prop a Settings. Creado `src/hooks/useConfig.js`. App.jsx eliminó 30 líneas de lógica inline. SavedProjects ahora lee config migrado. Settings ya no toca localStorage directamente. CLAUDE.md actualizado. Build limpio.
