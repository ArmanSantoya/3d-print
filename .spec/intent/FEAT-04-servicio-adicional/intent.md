# FEAT-04 — Servicio adicional en cotización

## Objetivo

Agregar un concepto "Servicio adicional" a la cotización, análogo al "Incluye diseño" existente: un cargo extra que se suma al monto líquido y aparece como línea propia en el PDF.

## Contexto

- El "Incluye diseño" actual es un checkbox en el panel de opciones de `PdfGenerator.jsx` que suma `config.designFee` (fijo, configurable en Settings) al `liquidAmount` en `pricingEngine.js` (sin margen, antes de retención).
- El usuario pide "un input extra llamado servicio adicional" — a diferencia del diseño, sugiere un monto digitado al momento de cotizar.

## Decisión final

- **Monto libre por cotización** (elegido por el usuario): input numérico en el panel del PDF, sin valor en Settings.
- **Descripción editable** (elegido por el usuario): campo de texto opcional; el PDF muestra la descripción o "Servicio adicional" como fallback. La descripción se escapa antes de inyectarla al HTML del PDF.
- El monto se suma al `liquidAmount` **sin margen** (mismo tratamiento que `designFee`) y antes de la retención — implementado como opción `additionalServiceAmount` de `calculateQuote`.
- Solo afecta al PDF, igual que el diseño: no aparece en el resumen en pantalla ni en proyectos guardados.
- Verificado con lint, build, chequeo node de la función pura y captura Playwright del panel en Step3.
