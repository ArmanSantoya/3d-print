# FEAT-01 — Playwright: tests end-to-end

## Objetivo

Agregar una suite de tests E2E con Playwright que cubra los flujos críticos
de la app: auth, recarga, rutas protegidas y la calculadora.

## Contexto

La app no tiene ningún tipo de test automatizado. Los bugs de sesión (como
FIX-01) se detectaron manualmente. Playwright permite reproducir escenarios
de navegador reales, incluyendo hard reload y manipulación de localStorage,
que son exactamente los vectores que causaron FIX-01.

## Decisión final

Suite implementada con 12 tests: 4 de auth, 3 de reload (regresión FIX-01),
4 de calculadora + 1 setup. Todos pasan (12/12).

Aprendizaje clave: la animación de 300ms entre steps deja ambos steps en el
DOM simultáneamente. Los selectores deben distinguir por atributos únicos
(`type=submit` para el botón de avance en Step2, `.last()` para "Atrás" en Step3)
en lugar de buscar por texto solamente.
