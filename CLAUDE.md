# CLAUDE.md — 3d-pricing-react

Calculadora de costos de impresión 3D para el mercado chileno (CLP).
Desplegada en GitHub Pages: https://armansantoya.github.io/3d-print

---

## Stack

- **React 19** + **Vite 7**
- **React Router 7** (basename `/3d-print` — obligatorio para GitHub Pages)
- **Supabase** — auth + base de datos
- **jsPDF + html2canvas** — generación de PDF de cotizaciones
- **gh-pages** — deploy (`npm run deploy`)

---

## Comandos

```bash
npm run dev       # servidor local (http://localhost:5173/3d-print/)
npm run build     # build de producción
npm run deploy    # build + push a GitHub Pages
npm run lint      # ESLint
npm run test:e2e  # Playwright E2E (requiere dev server activo o lo arranca solo)
npm run test:e2e:ui  # Playwright con UI interactiva
```

---

## Estructura clave

```
src/
  config.js                  # defaultConfig: precios materiales, impresoras, electricidad, margen, retención
  supabase.js                # cliente Supabase + feature flags (googleAuth, emailAuth)
  App.jsx                    # rutas principales con ProtectedRoute
  context/
    AuthContext.jsx           # auth state, roles (hasAccess, isSuperAdmin), login/logout
  hooks/
    useConfig.js             # hook centralizado: lectura, migración y escritura del config en localStorage
    usePermissionCheck.js    # verificación de permisos de usuario con deduplicación (interno a AuthProvider)
    useQuoteForm.js          # estado completo del formulario de cotización: bandejas, navegación, mutaciones
    useAsync.js              # patrón loading/error/execute para operaciones async (carga de datos y acciones)
  utils/
    costCalculator.js        # primitivas de cálculo: calculateTrayDetails, roundTo50
    pricingEngine.js         # orquestación de cotización: calculateQuote (usa costCalculator)
    database.js              # APIs de Supabase: projectsApi, materialsApi, usersApi, dbUtils
  components/
    MultiStepForm.jsx        # flujo calculadora (Step1 → Step2 → Step3) — usa useQuoteForm para el estado
    Step3Summary.jsx         # resumen + botones guardar/PDF
    PdfGenerator.jsx         # generación de cotización PDF
    Settings.jsx             # configuración de precios (persiste en localStorage)
    AdminUsers.jsx           # gestión de usuarios (solo super admin)
```

---

## Lógica de negocio — reglas críticas

### Fórmula de precio
1. `subtotal` = materialCost + electricityCost + machineCost (por bandeja, en `costCalculator.js`)
2. `subtotalWithMargin` = subtotal × (1 + margin/100)
3. `brutoAmount` = subtotalWithMargin / (1 − retentionRate)  ← retención Boleta de Honorarios
4. `totalRounded` = roundTo50(brutoAmount)  ← redondeo a múltiplo de $50 CLP

### Reglas inamovibles
- **El PDF NO debe mostrar el porcentaje de margen** — es información interna, nunca visible al cliente.
- Las primitivas (`calculateTrayDetails`, `roundTo50`) viven en `costCalculator.js`. La orquestación completa de cotización (`calculateQuote`) vive en `pricingEngine.js`. No duplicar lógica en componentes.
- La **retención** se aplica sobre el `liquidAmount` (suma de precios por bandeja con margen). El margen se aplica por bandeja para que las filas del PDF sumen exactamente al subtotal mostrado.
- Los precios son en **CLP** (pesos chilenos). No agregar separadores de miles con punto — usar `toLocaleString('es-CL')`.

### Config
- Persiste en `localStorage` bajo la clave `'config'`.
- `defaultConfig` en `src/config.js` es el fallback.
- La lectura, migración y escritura del config se hace **exclusivamente** a través de `useConfig()` en `src/hooks/useConfig.js`. No leer ni escribir `localStorage` directamente en componentes.
- Las migraciones de schema viven en `migrateConfig()` (exportada desde `useConfig.js`).
- El margen por defecto es 30%. La retención por defecto es 15.25% (Boleta de Honorarios Chile).

---

## Auth y roles

| Rol | Puede |
|---|---|
| Sin sesión | Solo ver login/signup |
| Autenticado (sin acceso) | Usar calculadora, generar PDF |
| `hasAccess = true` | Todo lo anterior + guardar proyectos, ver dashboard |
| `isSuperAdmin = true` | Todo + gestionar usuarios (`/admin/users`) |

- El acceso se consulta en `user_profiles` (primario) y `authorized_users` (fallback) en Supabase.
- La deduplicación de llamadas de permisos (`lastCheckedUserIdRef`, `inFlightUserIdRef`) vive en `usePermissionCheck.js`, no en `AuthContext`.
- `TOKEN_REFRESHED` y `USER_UPDATED` se ignoran en el listener — no re-verifican permisos.

---

## Patrón async

- Para operaciones async con `loading`/`error`/`try-catch`: usar `useAsync()` de `src/hooks/useAsync.js`.
- `initialLoading: true` para operaciones que se ejecutan en el mount (spinner desde el inicio).
- `handlePermissionChange` en `AdminUsers` usa `saving` como objeto por email — no encaja en `useAsync` y se deja sin cambios.

---

## Tests E2E (Playwright)

- Suites en `e2e/`: `auth.spec.ts`, `reload.spec.ts` (regresión FIX-01), `calculator.spec.ts`
- Setup en `e2e/setup/auth.setup.ts` — inicia sesión y guarda `e2e/.auth/session.json`
- Credenciales del usuario de test en `.env.local` como `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` (nunca commitear)
- `baseURL: 'http://localhost:5173'` — las rutas usan paths completos como `/3d-print/calculator`
- El dev server arranca solo si no hay uno corriendo (`reuseExistingServer: true`)
- Nota de selectores: la animación de 300ms entre steps deja el step anterior en el DOM.
  - Step1 "Siguiente": `page.getByRole('button', { name: /siguiente/i }).first()`
  - Step2 "Siguiente": `page.locator('button[type=submit]')` (el de Step2 es `type=submit`, el de Step1 es `type=button`)
  - "Atrás" en Step3: `page.getByRole('button', { name: /atrás/i }).last()`

---

## Deploy

- Base URL: `/3d-print` (configurado en `vite.config.js` como `base` y en `Router` como `basename`).
- Deploy: `npm run deploy` (gh-pages publica la carpeta `dist`).
- Variables de entorno opcionales en `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`, `VITE_ENABLE_GOOGLE_AUTH`, `VITE_ENABLE_EMAIL_AUTH`.

---

## Qué NO hacer

- No crear una segunda copia de `costCalculator.js` en `src/components/utils/` — ya existe y está desactualizada, debe eliminarse si aún está presente.
- No modificar la fórmula de retención o margen directamente en componentes — toda la lógica va en `pricingEngine.js`.
- No exponer `config.margin` en el PDF ni en ningún componente visible al cliente.
- No cambiar el `basename` del Router sin actualizar también `vite.config.js` y el campo `homepage` en `package.json`.

---

## Flujo de trabajo

Para cada tarea nueva seguir el flujo SSD:

1. Crear la carpeta `.spec/intent/<PREFIJO-##-nombre-corto>/` con un `intent.md` que describa el objetivo y contexto
2. Presentar un `plan.md` con el análisis, el impacto esperado y las preguntas que surjan
3. **Detenerse y esperar aprobación explícita** antes de tocar cualquier archivo de código o configuración
4. Una vez aprobado, desglosar las tareas en `task.md` y ejecutar manteniéndolo actualizado
5. Al cerrar, marcar todo Done en `task.md` y actualizar `intent.md` con la decisión final tomada

**Prefijos de intent:**
- `FEAT` — nueva funcionalidad
- `FIX` — corrección de bug
- `SEC` — seguridad
- `REFACTOR` — restructuración sin cambio de comportamiento

**Para iniciar un intent nuevo**, el usuario dirá algo como:
> "Intent nuevo: [descripción]"

Con eso es suficiente para arrancar el flujo desde el paso 1.
