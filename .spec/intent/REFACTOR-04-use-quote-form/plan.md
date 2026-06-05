# Plan — REFACTOR-04 useQuoteForm

## Análisis del estado actual

### Lógica de mutación dispersa en los pasos

`Step1TrayCount.handleChange` — al cambiar la cantidad de bandejas:
```js
setTrayCount(count);
setTrayData(Array.from({ length: count }, (_, i) => ({
  name: `Bandeja ${i + 1}`, weight: '', time: '', material: 'PLA', printer: 'P1S', hours: 0, minutes: 0
})));
```
Dos setters coordinados que deben moverse al hook.

`Step2TrayInputs.handleTimePartChange` — conversión horas + minutos → decimal:
```js
updated[idx].time = parseFloat((hrs + min / 60).toFixed(2));
```
Regla de negocio del formulario que vive en el render del paso.

### Lo que la propuesta resuelve

Hoy: agregar "email del cliente" → tocar MultiStepForm + Step1 + Step3.  
Con hook: agregar `clientEmail` al estado en `useQuoteForm` → tocar solo el hook y el paso que lo captura.

---

## Propuesta

### Nuevo módulo

```
src/hooks/useQuoteForm.js
```

### Contrato del hook

```js
const {
  // Datos de la cotización
  trayCount, trayData, projectName,

  // Navegación
  step, exiting, goToStep,

  // Mutaciones (callbacks de dominio, no setters crudos)
  setTrayCount,      // inicializa el array de bandejas automáticamente
  setProjectName,
  updateTray,        // (index, field, value) → actualiza un campo de una bandeja
  updateTrayTime,    // (index, hours, minutes) → convierte y guarda el tiempo decimal
  resetTrays,        // reinicia todas las bandejas a valores vacíos
  resetAndCreateNew, // vuelve al paso 1 con el formulario limpio
} = useQuoteForm();
```

**Diferencia clave con exponer `setTrayData` crudo:** los pasos reciben callbacks de dominio. No saben cómo se almacena el array internamente. Si mañana el esquema de bandeja cambia (agregar `clientEmail`), solo cambia el hook.

### Cambios por archivo

**`MultiStepForm.jsx`** — pasa de 72 líneas a ~35:
```jsx
const form = useQuoteForm();
// Solo pasa props específicos a cada paso
<Step1TrayCount trayCount={form.trayCount} setTrayCount={form.setTrayCount} ... />
```

**`Step1TrayCount.jsx`** — simplificado:
- Ya no recibe `setTrayData` (el hook lo maneja internamente en `setTrayCount`)
- `handleChange` → llama solo a `setTrayCount(count)`, la inicialización del array la hace el hook

**`Step2TrayInputs.jsx`** — simplificado:
- Ya no recibe `setTrayData` crudo
- `handleChange` → llama `updateTray(idx, field, value)`
- `handleTimePartChange` → llama `updateTrayTime(idx, hours, minutes)`
- `handleReset` → llama `resetTrays()`

**`Step3Summary.jsx`** — mínimos cambios:
- Solo lee `trayData` y `projectName`, no muta
- `resetAndCreateNew` viene del hook en vez de MultiStepForm

---

## Pregunta abierta — la única decisión que necesito de tu parte

**¿Callbacks de dominio (`updateTray`, `updateTrayTime`) o seguimos exponiendo `setTrayData` crudo?**

- **Dominio (recomendado):** Máximo leverage. Agregar un campo = solo cambiar el hook. Los pasos quedan como formularios tontos que no conocen la estructura interna del array. La conversión horas→decimal sale de Step2.
- **Crudo:** Cambio mínimo. Los pasos siguen mutando el array como hoy. Solo mueve dónde vive el estado, no la lógica.

Mi recomendación es **dominio**, porque es lo que hace que la promesa de "agregar un campo = cambiar el hook, no tocar los pasos" sea real. Con `setTrayData` crudo, Step2 sigue acoplado al esquema del array.
