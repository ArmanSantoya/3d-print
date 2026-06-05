# Plan — REFACTOR-01 Pricing Engine

## Análisis del estado actual

### Duplicación exacta

`Step3Summary.jsx` (render, líneas ~87–94):
```js
const totalGeneral = trayData.reduce((sum, tray) => sum + calculateTrayDetails(tray, config).subtotal, 0);
const marginPercent = Number(config.margin) || 0;
const subtotalWithMargin = totalGeneral * (1 + marginPercent / 100);
const retentionRate = Number(config.retentionRate) || 0.1525;
const brutoAmount = subtotalWithMargin / (1 - retentionRate);
const retentionAmount = brutoAmount - subtotalWithMargin;
const totalRounded = roundTo50(brutoAmount);
```

La misma lógica se repite dentro de `handleSaveProject` (líneas ~30–35), y también en `PdfGenerator.jsx` (líneas ~13–46) con variantes para `designFee` y `applyRetention`.

### Diferencias entre las dos implementaciones

| | Step3Summary | PdfGenerator |
|---|---|---|
| Margen aplicado sobre | total (una multiplicación) | cada bandeja por separado |
| `designFee` | no | sí (opcional) |
| `applyRetention` | siempre | checkbox del usuario |
| Uso | display interno + guardar en DB | cotización cliente + PDF |

La diferencia de "margen total vs margen por bandeja" causa una discrepancia de pocos pesos entre lo que muestra Step3 y lo que muestra el PDF. Esto es un bug silencioso.

## Propuesta

### Opción A — Extender `costCalculator.js` (cumple CLAUDE.md literal)

Agregar `calculateQuote(trayData, config, options)` directamente en `costCalculator.js`.

**Pro:** sin archivo nuevo, respeta la restricción de CLAUDE.md.  
**Contra:** `costCalculator.js` mezcla lógica de bandeja individual con lógica de cotización completa. Crece en responsabilidades.

### Opción B — Nuevo módulo `pricingEngine.js` que importa de `costCalculator.js`

Crear `src/utils/pricingEngine.js` como capa de composición. `costCalculator.js` sigue siendo la fuente de verdad para las primitivas (`calculateTrayDetails`, `roundTo50`). `pricingEngine.js` orquesta el cálculo completo.

**Pro:** cada archivo tiene una responsabilidad clara; fácil de testear de forma aislada.  
**Contra:** requiere actualizar la regla en CLAUDE.md para reflejar la nueva estructura.

## Impacto esperado

- **Archivos modificados:** `costCalculator.js` o nuevo `pricingEngine.js`, `Step3Summary.jsx`, `PdfGenerator.jsx`
- **Sin cambio de comportamiento visible:** los totales mostrados al usuario serán los mismos (salvo corrección del bug de redondeo mencionado arriba)
- **Mejora de testabilidad:** la fórmula queda en una función pura, testeable sin montar React
- **CLAUDE.md:** necesita actualizar la línea que define dónde vive la lógica de cálculo

## Preguntas abiertas (necesito tu aprobación antes de continuar)

1. **¿Opción A o B?** — ¿Extender `costCalculator.js` o crear `pricingEngine.js`?
2. **¿Corrijo el bug de redondeo?** — Unificar la base de margen (por bandeja vs total) cambia los totales en ±1–2 pesos. ¿Lo corrijo como parte del refactor o lo dejo para después?
3. **¿Actualizo CLAUDE.md?** — Si elegimos Opción B, la regla "vive ÚNICAMENTE en `costCalculator.js`" necesita revisión.
