# Tasks — FEAT-02 Vista de detalle de proyecto

## Decisiones confirmadas
- Ruta dedicada `/project/:id` (ya usada por Home.jsx)
- Columna de precio por bandeja: "Precio Bandeja"
- Vista interna: mostrar todos los datos (retención, monto bruto, etc.)
- Disponible desde: Home (ya navega) + SavedProjects (agregar botón "Ver Detalle")

## Tareas

- [x] Crear `src/components/ProjectDetail.jsx`
- [x] Crear `src/styles/projectDetail.css`
- [x] Agregar ruta `/project/:id` en `App.jsx`
- [x] Agregar botón "Ver Detalle" en panel inline de `SavedProjects.jsx`
- [x] Crear `e2e/project-detail.spec.ts`
- [x] Cerrar intent
