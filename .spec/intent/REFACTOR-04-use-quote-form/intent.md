# REFACTOR-04 — useQuoteForm: extraer estado del formulario multi-paso

## Objetivo

Eliminar el enhebrado manual de estado entre los cuatro componentes del flujo de cotización, extrayendo todo el estado y las mutaciones a un hook `useQuoteForm()`.

## Contexto

`MultiStepForm.jsx` actúa como hub de estado: declara `trayCount`, `trayData`, `projectName`, `step`, `exiting` y pasa setters a cada paso como props. Agregar un campo nuevo (ej. email del cliente) requiere:
1. Agregar el campo al estado en `MultiStepForm`
2. Pasar el setter como prop al paso correspondiente
3. Modificar ese paso para usar el setter
4. Asegurarse de que `Step3Summary` lo reciba si lo necesita para guardar

El formulario tiene además lógica de mutación dispersa:
- `Step1TrayCount` inicializa el array de bandejas al cambiar el conteo (lógica de negocio mezclada con el render)
- `Step2TrayInputs` convierte horas+minutos a decimal en `handleTimePartChange` (lógica de negocio mezclada con el render)

## Estado actual

| Estado | Dónde vive | Llega a |
|---|---|---|
| `step`, `exiting` | MultiStepForm | nadie (solo navegación) |
| `trayCount` | MultiStepForm | Step1 (lectura + escritura) |
| `trayData` | MultiStepForm | Step1 (escritura), Step2 (lectura + escritura), Step3 (lectura) |
| `projectName` | MultiStepForm | Step1 (escritura), Step3 (lectura) |

## Decisión final

Callbacks de dominio aprobados. Creado `useQuoteForm.js` con `setTrayCount` (inicializa array), `updateTray`, `updateTrayTime` (convierte horas+min → decimal), `resetTrays`, `resetAndCreateNew`. MultiStepForm pasa de 72 a 52 líneas. Step1 eliminó `setTrayData` y la inicialización del array. Step2 eliminó toda la lógica de mutación inline. Step3 sin cambios. Build limpio.
