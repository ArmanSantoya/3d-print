# FEAT-04 — Plan

## Decisiones del usuario (AskUserQuestion)

1. **Monto libre por cotización**: input numérico en el panel del PDF, se escribe el monto CLP cada vez.
2. **Descripción editable**: campo de texto opcional; el PDF muestra la descripción o "Servicio adicional" si está vacía.

## Diseño

Espejo del patrón "Incluye diseño": el servicio adicional se suma al `liquidAmount` **sin margen** (igual que `designFee`), antes de la retención. Solo afecta al PDF (el diseño tampoco aparece en el resumen en pantalla ni en proyectos guardados — misma semántica).

```
liquidAmount = Σ precios bandeja con margen + designFee (si aplica) + servicioAdicional (si > 0)
bruto = liquidAmount / (1 − retención)
```

## Cambios

### `src/utils/pricingEngine.js`
- Nueva opción `additionalServiceAmount` (default 0) en `calculateQuote`.
- `additionalServiceValue = Math.round(Number(additionalServiceAmount) || 0)` se suma al `liquidAmount` y se retorna.

### `src/components/PdfGenerator.jsx`
- Estado: `serviceAmount` (número, vacío por defecto) y `serviceDesc` (texto).
- Panel de opciones: input "Servicio adicional (CLP)" + input de descripción opcional.
- Si el monto > 0, el PDF agrega la línea `{descripción || 'Servicio adicional'}: $X CLP` junto al recargo por diseño (descripción escapada para HTML).

## Verificación
- `npm run lint` + `npm run build`.
- Chequeo de `calculateQuote` con script node (función pura).
- Captura Playwright del panel de PDF en Step3 con los inputs nuevos.
