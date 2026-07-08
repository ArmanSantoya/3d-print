# FEAT-03 — Resumen de costos: ganancia real y mantenimiento en detalle de proyecto

## Objetivo

En la vista de detalle de proyecto (`/project/:id`), sección **Resumen de Costos**:

1. Agregar tarjeta con el **total de la columna "Costo Filamento"**.
2. Renombrar tarjeta **"Ganancia"** → **"Margen"**.
3. Renombrar tarjeta **"Costo Líquido"** → **"Costo del Proyecto"**.
4. Nueva métrica **Mantenimiento** = 20% del Costo Base.
5. Nueva métrica **Ganancia Real** = Costo del Proyecto − Mantenimiento − Electricidad total − Costo Filamento total. Mostrar ambas (Mantenimiento y Ganancia Real) en la sección.

## Contexto

- El requerimiento nace de la vista de detalle del proyecto "Emovia Go Conejos x20" (captura 07-07-2026).
- Antes de implementar se verificó si el motor de cálculo ya incluía un costo de mantenimiento: **no existe** ningún concepto de mantenimiento en `costCalculator.js`, `pricingEngine.js` ni `config.js`. El costo más cercano es `machineCostPerHour` (Costo Máquina), que se cobra al cliente pero no se descuenta como gasto real.
- Interpretación de negocio: el Costo Máquina cobrado queda como ingreso; los egresos reales son filamento, electricidad y una reserva de mantenimiento (20% del costo base). La Ganancia Real refleja el flujo de caja neto del proyecto.

## Decisión final

- **Mantenimiento configurable**: `maintenancePercent` (default 20) en `defaultConfig`, con migración en `migrateConfig()` y campo editable en Settings → Otros. No se guarda por proyecto: se recalcula con el config vigente, igual que el resto de la vista.
- **Modelo de negocio confirmado por el usuario**: el margen (30%) cubre errores de impresión y calibraciones iniciales. La **Ganancia Real** es el flujo de caja al recibir el pago: se paga la electricidad, el material comprado, y el mantenimiento se aparta en un bolsillo para la impresora. Fórmula: `GananciaReal = CostoProyecto − Mantenimiento − Electricidad − Filamento`. El Costo Máquina cobrado queda como ingreso (no se descuenta).
- **Renombres**: "Ganancia" → "Margen", "Costo Líquido" → "Costo del Proyecto". El destacado verde pasa a la tarjeta Ganancia Real.
- **Fuera de alcance**: `designFee` no participa en la Ganancia Real. No se tocó `pricingEngine.js` ni el PDF — el precio al cliente no cambia.
- Verificado con lint, build y captura Playwright de `/project/:id` (9 tarjetas renderizando valores correctos).
