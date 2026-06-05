import { test, expect } from '@playwright/test'

test.describe('Autenticación', () => {
  test('usuario autenticado accede a dashboard sin redirección', async ({ page }) => {
    await page.goto('/3d-print/dashboard')
    await expect(page.getByText('Cargando...')).not.toBeVisible({ timeout: 8000 })
    // puede quedar en /dashboard o redirigir a /calculator si no tiene acceso,
    // pero nunca en /login (está autenticado)
    await expect(page).not.toHaveURL(/\/3d-print\/login/)
  })

  test('ruta protegida sin sesión redirige a /login', async ({ browser }) => {
    // Crear contexto explícitamente vacío (sin cookies ni localStorage)
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/3d-print/dashboard')
    await page.waitForURL(/\/3d-print\/login/, { timeout: 12000 })
    await expect(page).toHaveURL(/\/3d-print\/login/)
    await ctx.close()
  })

  test('login con credenciales inválidas muestra error', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/3d-print/login')
    await page.fill('#email', 'noexiste@test.com')
    await page.fill('#password', 'claveincorrecta')
    await page.click('button[type=submit]')
    await expect(page.locator('.login-error')).toBeVisible({ timeout: 8000 })
    await ctx.close()
  })

  test('logout limpia sesión y redirige a /login', async ({ page }) => {
    await page.goto('/3d-print/calculator')
    await expect(page.getByText('Cargando...')).not.toBeVisible({ timeout: 8000 })
    await page.click('[title="Logout"]')
    await page.waitForURL(/\/3d-print\/login/, { timeout: 8000 })
    await expect(page).toHaveURL(/\/3d-print\/login/)
  })
})
