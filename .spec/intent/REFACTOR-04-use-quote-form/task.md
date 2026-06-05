# Tasks — REFACTOR-04 useQuoteForm

## Decisiones aprobadas
- Callbacks de dominio: `updateTray`, `updateTrayTime`, `resetTrays`, `setTrayCount`, `setProjectName`, `resetAndCreateNew`
- La conversión horas+minutos → decimal sale de Step2TrayInputs y va al hook
- La inicialización del array de bandejas sale de Step1TrayCount y va al hook

## Tareas

- [x] Crear `src/hooks/useQuoteForm.js`
- [x] Refactorizar `MultiStepForm.jsx` — usar hook
- [x] Refactorizar `Step1TrayCount.jsx` — quitar setTrayData, usar setTrayCount del hook
- [x] Refactorizar `Step2TrayInputs.jsx` — usar updateTray, updateTrayTime, resetTrays
- [x] Refactorizar `Step3Summary.jsx` — sin cambios necesarios (no tenía dependencias de setters)
- [x] Actualizar `CLAUDE.md`
- [x] Verificar build sin errores
- [x] Cerrar intent con decisión final
