# FEAT-03 — Plan

## Análisis previo (verificación solicitada)

**¿Existe ya un costo de mantenimiento en el cálculo?** No.

- `src/utils/costCalculator.js`: subtotal por bandeja = materialCost + electricityCost + machineCost. Sin mantenimiento.
- `src/utils/pricingEngine.js`: margen por bandeja → retención → redondeo. Sin mantenimiento.
- `src/config.js`: no hay campo de mantenimiento en `defaultConfig`.
- Grep global por "manten/maintenance": solo un comentario sin relación.

El concepto más cercano es **Costo Máquina** (`machineCostPerHour`, ej. $1.200/h): es un cargo por uso de máquina que se le cobra al cliente y forma parte del Costo Base, pero **no** se registra como gasto real en ninguna parte.

**¿Cómo calza el requerimiento?** No hay conflicto ni doble conteo, porque la Ganancia Real propuesta **no** resta el Costo Máquina — resta Mantenimiento (20% del Costo Base) en su lugar:

```
GananciaReal = CostoProyecto − Mantenimiento − ElectricidadTotal − FilamentoTotal
```

Lectura de negocio: lo cobrado por máquina queda como ingreso; el egreso real asociado a la máquina se modela como la reserva de mantenimiento. Con los datos del proyecto de la captura:

| Concepto | Valor |
|---|---|
| Costo Base | $341.252 |
| Costo del Proyecto (ex Costo Líquido) | $443.630 |
| Filamento total | ~$75.784 |
| Electricidad total | $11.129 |
| Mantenimiento (20% base) | ~$68.250 |
| **Ganancia Real** | **~$288.467** |

(Nótese que la Ganancia Real resulta mayor que el "Margen" de $102.378 porque el Costo Máquina cobrado no se descuenta como gasto.)

## Alcance

Solo presentación en `ProjectDetail.jsx` — **no** se toca `pricingEngine.js` ni `costCalculator.js` (el precio al cliente no cambia; esto es análisis interno post-venta). El 20% de mantenimiento queda como constante local en el componente (no en config), salvo indicación contraria.

## Cambios

### `src/components/ProjectDetail.jsx`
1. Calcular `totalFilament`: suma de `weight_g × precio material / 1000` por bandeja (misma fórmula que ya usa la tabla, extraída para reutilizar en fila y total).
2. Calcular `mantenimiento = Math.round(costoBase × 0.20)`.
3. Calcular `gananciaReal = liquidCost − mantenimiento − totalElectricity − totalFilament`.
4. Tarjetas del Resumen de Costos (quedan 9):
   - Peso Total, Tiempo Total, Electricidad *(sin cambios)*
   - **Costo Filamento** *(nueva)*
   - Costo Base *(sin cambios)*
   - **Mantenimiento (20%)** *(nueva)*
   - **Margen (30%)** *(renombrada, antes "Ganancia", conserva estilo verde)*
   - **Costo del Proyecto** *(renombrada, antes "Costo Líquido")*
   - **Ganancia Real** *(nueva, destacada con estilo profit)*

### `src/styles/projectDetail.css` (si aplica)
- Verificar que la grilla de tarjetas fluya bien con 9 tarjetas (hoy son 6); ajustar wrap si es necesario.

## Impacto

- Solo visual/informativo en la vista de detalle. Sin cambios en cotización, PDF, guardado ni base de datos.
- E2E existentes no cubren `/project/:id`, no deberían romperse. `npm run lint` + verificación manual en dev.

## Preguntas abiertas

1. ¿El 20% de mantenimiento debería ser configurable en Settings (`config.maintenanceRate`) en vez de fijo en el componente? Propuesta: fijo por ahora, configurable después si se necesita.
2. ¿"Margen (30%)" mantiene el porcentaje en el label como hoy, y "Mantenimiento (20%)" también lo muestra? Asumo que sí.
3. ¿La Ganancia Real debe considerar también el `designFee` si el proyecto lo incluyó? Hoy la vista no lo desglosa; asumo que no por ahora.
