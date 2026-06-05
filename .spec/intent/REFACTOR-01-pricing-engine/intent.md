# REFACTOR-01 — Pricing Engine: centralizar la fórmula de cotización

## Objetivo

Eliminar la duplicación de la lógica de margen + retención + redondeo que hoy existe en dos componentes distintos (`Step3Summary.jsx` y `PdfGenerator.jsx`), extrayéndola a un módulo reutilizable.

## Contexto

La fórmula de cotización (definida en CLAUDE.md) tiene cuatro pasos:
1. `subtotal` por bandeja — ya centralizado en `costCalculator.js`
2. `subtotalWithMargin = subtotal × (1 + margin/100)`
3. `brutoAmount = subtotalWithMargin / (1 − retentionRate)`
4. `totalRounded = roundTo50(brutoAmount)`

Los pasos 2–4 están implementados de forma independiente en:
- `Step3Summary.jsx` (líneas ~30–35 y ~87–94)
- `PdfGenerator.jsx` (líneas ~13–46), con variantes para `designFee` y retención opcional

Esto viola la regla de `costCalculator.js` como única fuente de verdad: un cambio en la lógica de retención o margen requiere tocar dos archivos simultáneamente.

## Restricciones conocidas

- CLAUDE.md dice: "roundTo50 y toda la lógica de cálculo viven ÚNICAMENTE en `src/utils/costCalculator.js`"
- El PDF no debe exponer `config.margin` — el margen se aplica internamente, no se muestra al cliente
- `PdfGenerator` tiene opciones adicionales: `includeDesign` (fee extra) y `applyRetention` (checkbox del usuario)
- Los precios por bandeja en el PDF deben mostrar el precio con margen ya aplicado (no el costo interno)

## Decisión final

Opción B aprobada: nuevo módulo `pricingEngine.js` como capa de orquestación sobre `costCalculator.js`. Bug de redondeo corregido unificando a margen por bandeja. `CLAUDE.md` actualizado para reflejar la nueva estructura de utils. Build limpio.
