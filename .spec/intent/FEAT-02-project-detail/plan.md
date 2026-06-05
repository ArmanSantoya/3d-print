# Plan — FEAT-02 Vista de detalle de proyecto

## Análisis del estado actual

### Lo que ya existe
- `projectsApi.getWithDetails(id)` — carga el proyecto con sus bandejas (select *)
- `SavedProjects.jsx` — panel inline con: nombre, estado, peso, tiempo, electricidad total,
  costo líquido, costo total, tabla de bandejas (nombre / peso / tiempo / material / costo)
- `Step3Summary.jsx` — resumen de cotización nueva con: tabla de bandejas por subtotal,
  peso total, tiempo total, subtotal base, con margen, retención, monto bruto prominente

### Lo que se guarda en `project_details` por bandeja
| Campo           | Descripción                              |
|----------------|------------------------------------------|
| `tray_name`     | Nombre de la bandeja                     |
| `weight_g`      | Peso en gramos                           |
| `time_hours`    | Tiempo en horas                          |
| `material`      | Tipo de material                         |
| `printer`       | Impresora usada                          |
| `electricity_cost` | Costo de electricidad (campo nuevo)   |
| `cost`          | Subtotal con margen (precio final bandeja) |

### Lo que NO se guarda por separado
- `material_cost`, `machine_cost` — no están en el schema → solo podemos mostrar
  `electricity_cost` y el `cost` final. El subtotal base (sin margen) tampoco está
  guardado por bandeja.

### Lo que sí está en `projects`
- `liquid_cost` — suma de costos con margen (antes de retención)
- `total_cost` — monto bruto redondeado (lo que se factura)
- `weight_total_g`, `time_total_hours`

---

## Propuesta

### Arquitectura: ruta dedicada `/saved-projects/:id`

Reemplazar el panel inline por navegación a una página completa:
- Clic en proyecto en la lista → navega a `/saved-projects/:id`
- El componente `ProjectDetail.jsx` carga los datos y renderiza el detalle
- Botón "Volver" regresa a `/saved-projects`

**Ventaja sobre el panel inline:** más espacio, más fácil de testear E2E,
coherente con el estilo de página dedicada que tiene el resto de la app.

### Layout de ProjectDetail (mismo look que Step3Summary)

**Encabezado**
- Nombre del proyecto (igual al banner naranja de Step3Summary)
- Badge de estado

**Tabla por bandeja**
| Bandeja | Peso | Tiempo | Material | Impresora | Electricidad | Subtotal |
(agrega columnas Impresora y Electricidad que no tenía el panel anterior)

**Resumen de totales**
- Peso Total / Tiempo Total / Electricidad Total / Costo Líquido
(mismos cards que el summary-info de Step3Summary)

**Bloque final prominente** (igual al de Step3Summary)
- Retención % y monto
- Monto Bruto a Facturar (grande, naranja)

**Acciones**
- Marcar como Pagado (si status !== 'paid')
- Eliminar Proyecto
- Volver a Proyectos

### Archivos a crear / modificar
| Archivo | Acción |
|---------|--------|
| `src/components/ProjectDetail.jsx` | CREAR |
| `src/App.jsx` | Agregar ruta `/saved-projects/:id` |
| `src/components/SavedProjects.jsx` | Cambiar `onClick` a navigate en vez de expand inline |
| `e2e/project-detail.spec.ts` | CREAR — test E2E |

### Test E2E

1. Desde `/saved-projects`, hacer click en el primer proyecto de la lista
2. Verificar que navega a `/saved-projects/:id`
3. Verificar que se muestra el nombre del proyecto
4. Verificar que aparece "Monto Bruto a Facturar"
5. Verificar que la tabla de bandejas tiene las columnas esperadas
6. Verificar botón "Volver" regresa a la lista

---

## Preguntas abiertas

1. **¿Panel inline o ruta dedicada?** El plan propone ruta dedicada. Si prefieres
   mantener la expansión inline pero mejorada visualmente, es posible pero quedaría
   menos testeable y más apretado.

2. **¿Qué hacer con la columna "Subtotal" en la tabla?** El campo `cost` guardado
   es el precio por bandeja *con margen* (no el base). ¿Lo llamamos "Subtotal" o
   "Precio Bandeja" para que quede claro que ya incluye margen?

3. **¿Mostrar la retención y el monto bruto en el detalle de un proyecto guardado?**
   Son datos que el cliente no debería ver. En Step3Summary existen porque es una
   cotización interna. En el detalle guardado, ¿los mostramos igual (es vista interna)
   o solo mostramos el total neto?
