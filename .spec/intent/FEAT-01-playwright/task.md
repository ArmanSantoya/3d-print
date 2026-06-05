# Tasks — FEAT-01 Playwright

## Decisiones aprobadas
- Opción A: usuario de test real en Supabase
- Credenciales en `.env.local` (gitignoreado) como E2E_TEST_EMAIL / E2E_TEST_PASSWORD
- Solo Chromium por ahora
- Suite: auth, reload (regresión FIX-01), calculator

## Tareas

- [x] Instalar @playwright/test y dotenv
- [x] Instalar browser Chromium
- [x] Crear playwright.config.ts
- [x] Crear e2e/setup/auth.setup.ts
- [x] Crear e2e/auth.spec.ts
- [x] Crear e2e/reload.spec.ts
- [x] Crear e2e/calculator.spec.ts
- [x] Actualizar .gitignore (e2e/.auth/)
- [x] Agregar script test:e2e a package.json
- [x] Agregar credenciales a .env.local
- [x] Actualizar CLAUDE.md
- [x] Cerrar intent
