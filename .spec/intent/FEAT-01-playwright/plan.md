# Plan — FEAT-01 Playwright

## Qué instalar

```bash
npm install -D @playwright/test
npx playwright install chromium  # solo chromium es suficiente para empezar
```

---

## Estructura propuesta

```
e2e/
  auth.spec.ts          # login, logout, rutas protegidas
  reload.spec.ts        # hard reload no cuelga (FIX-01 regression test)
  calculator.spec.ts    # flujo de cotización paso a paso
playwright.config.ts
```

---

## Configuración (`playwright.config.ts`)

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:5173/3d-print',
  use: {
    headless: true,
    storageState: 'e2e/.auth/session.json',  // reutiliza sesión entre tests
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/3d-print',
    reuseExistingServer: true,
  },
})
```

El `storageState` permite hacer login una sola vez en un `setup` y reutilizar
la sesión en todos los tests, sin repetir credenciales en cada spec.

---

## Tests propuestos

### `auth.spec.ts`

| Test | Qué verifica |
|---|---|
| Login con email válido | Redirige a /dashboard |
| Login con email inválido | Muestra mensaje de error |
| Ruta protegida sin sesión | Redirige a /login |
| Logout | Limpia sesión y redirige a /login |

### `reload.spec.ts` (regresión directa de FIX-01)

| Test | Qué verifica |
|---|---|
| Hard reload en /dashboard | No queda en "Cargando..." más de 6s |
| Token expirado + reload | La UI se libera (redirige a /login o muestra la app) |

El test de token expirado hace lo siguiente en el fixture:
```ts
// Expira el token en localStorage antes de recargar
await page.evaluate(() => {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-'))
  if (!key) return
  const data = JSON.parse(localStorage.getItem(key))
  data.expires_at = Math.floor(Date.now() / 1000) - 1
  localStorage.setItem(key, JSON.stringify(data))
})
await page.reload()
await expect(page.locator('text=Cargando...')).not.toBeVisible({ timeout: 8000 })
```

### `calculator.spec.ts`

| Test | Qué verifica |
|---|---|
| Step 1 → ingresar cantidad de bandejas | Muestra los inputs correctos |
| Step 2 → llenar datos de bandeja | Valores se persisten al navegar |
| Step 3 → ver resumen | Subtotal y total aparecen con valores > 0 |
| Generar PDF | No lanza errores (sin verificar contenido del PDF) |

---

## Decisión de credenciales de test

Los tests de auth necesitan un usuario real de Supabase. Las opciones son:

**A) Usuario de test fijo en `.env.local`**
```
VITE_TEST_EMAIL=test@example.com
VITE_TEST_PASSWORD=testpassword123
```
Playwright los lee con `process.env`. Simple pero requiere mantener ese usuario.

**B) Mockear Supabase con `page.route()`**
Intercepta las llamadas a la API de Supabase y devuelve respuestas fijas.
Sin dependencia de red, más rápido, pero más frágil si cambia el contrato.

**Mi recomendación: Opción A.** El proyecto ya usa Supabase real en dev y tener
un usuario de test real da más confianza que un mock.

---

## Archivos que se crean

| Archivo | Propósito |
|---|---|
| `playwright.config.ts` | Configuración global |
| `e2e/setup/auth.setup.ts` | Login único → guarda `e2e/.auth/session.json` |
| `e2e/auth.spec.ts` | Tests de autenticación |
| `e2e/reload.spec.ts` | Tests de regresión FIX-01 |
| `e2e/calculator.spec.ts` | Tests del flujo de cotización |
| `.gitignore` (update) | Agregar `e2e/.auth/` |
| `package.json` (update) | Agregar script `npm run test:e2e` |

---

## Pregunta abierta — necesito tu decisión

**¿Usamos usuario de test fijo (Opción A) o mock de Supabase (Opción B)?**

Mi recomendación: **Opción A**. También necesitaría el email y password del
usuario de test para incluirlos como variables de entorno (no los pongas acá,
los agregarías en `.env.local` después).
