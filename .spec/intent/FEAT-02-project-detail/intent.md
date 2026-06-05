# FEAT-02 — Vista de detalle de proyecto guardado

## Objetivo

Crear una página dedicada de detalle para cada proyecto guardado, con el mismo
look & feel que el resumen de cotización nueva (Step3Summary), mostrando toda la
información disponible: costos por bandeja, electricidad, costo líquido, retención
y monto bruto. Incluye test E2E.

## Contexto

Actualmente `SavedProjects` tiene un panel lateral inline que al hacer click en un
proyecto expande un resumen básico. La tabla de bandejas solo muestra nombre, peso,
tiempo, material y costo final. No muestra electricidad por bandeja, subtotal base,
desglose de retención ni el monto bruto destacado.

El usuario quiere que la vista de detalle replique la riqueza visual de Step3Summary,
con toda la información disponible en la base de datos.

## Decisión final

- Ruta `/project/:id` creada (la usaba Home.jsx pero no existía en App.jsx)
- `ProjectDetail.jsx` con layout: banner de nombre + badge estado, tabla de bandejas
  (bandeja / peso / tiempo / material / impresora / electricidad / precio bandeja),
  cards de totales (peso, tiempo, electricidad, costo líquido), bloque final prominente
  con retención % y Monto Bruto a Facturar
- `SavedProjects.jsx`: botón "Ver Detalle" agregado al panel inline existente
- `playwright.config.ts`: workers=1 para evitar contención en el servidor local
- Suite completa: 18/18 tests pasan
