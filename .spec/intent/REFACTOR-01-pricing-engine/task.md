# Tasks — REFACTOR-01 Pricing Engine

## Decisiones aprobadas
- Opción B: nuevo módulo `pricingEngine.js` que importa primitivas de `costCalculator.js`
- Corregir bug de redondeo (unificar a margen por bandeja)
- Actualizar CLAUDE.md para reflejar la nueva estructura

## Tareas

- [x] Crear `src/utils/pricingEngine.js` con `calculateQuote(trayData, config, options)`
- [x] Refactorizar `Step3Summary.jsx` para usar `calculateQuote`
- [x] Refactorizar `PdfGenerator.jsx` para usar `calculateQuote`
- [x] Actualizar `CLAUDE.md` — estructura de utils y regla de lógica de cálculo
- [x] Verificar build sin errores
- [x] Marcar intent cerrado con decisión final
