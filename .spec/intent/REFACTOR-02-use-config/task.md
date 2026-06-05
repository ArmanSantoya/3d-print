# Tasks — REFACTOR-02 useConfig

## Decisiones aprobadas
- `migrateConfig` exportada (testeable)
- `saveConfig` como prop a Settings (App es fuente única de estado)
- No auto-save — guardar explícito en Settings

## Tareas

- [x] Crear `src/hooks/useConfig.js` con `migrateConfig` exportada y hook `useConfig`
- [x] Refactorizar `App.jsx` — usar hook, pasar `saveConfig` a Settings
- [x] Refactorizar `SavedProjects.jsx` — reemplazar IIFE con hook
- [x] Refactorizar `Settings.jsx` — recibir `saveConfig` como prop, eliminar localStorage directo
- [x] Actualizar `CLAUDE.md`
- [x] Verificar build sin errores
- [x] Cerrar intent con decisión final
