# FEAT-03 — Tareas

- [x] 1. `src/config.js`: agregar `maintenancePercent: 20` a `defaultConfig` — Done
- [x] 2. `src/hooks/useConfig.js`: migración — configs existentes sin `maintenancePercent` reciben 20 — Done
- [x] 3. `src/components/Settings.jsx`: campo "Mantenimiento de impresoras (% del costo base)" en sección Otros — Done
- [x] 4. `src/components/ProjectDetail.jsx` — Done
  - [x] total columna Costo Filamento (`getMaterialCost` reutilizado en fila y total)
  - [x] mantenimiento = costoBase × maintenancePercent/100
  - [x] gananciaReal = costoProyecto − mantenimiento − electricidad − filamento
  - [x] renombrar "Ganancia" → "Margen", "Costo Líquido" → "Costo del Proyecto"
  - [x] tarjetas nuevas: Costo Filamento, Mantenimiento (X%), Ganancia Real (destacada en verde)
- [x] 5. Verificar: `npm run lint` (sin errores nuevos; 9 pre-existentes) + build OK + captura Playwright de `/project/:id` con las 9 tarjetas — Done
- [x] 6. Cerrar intent: task.md Done + decisión final en intent.md — Done
