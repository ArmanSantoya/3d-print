import { test as setup, expect } from '@playwright/test'

const sessionFile = 'e2e/.auth/session.json'

setup('autenticar usuario de test', async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    throw new Error('E2E_TEST_EMAIL y E2E_TEST_PASSWORD deben estar en .env.local')
  }

  await page.goto('/3d-print/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type=submit]')

  // Esperar a que la navegación a dashboard se complete
  await page.waitForURL(/\/3d-print\/dashboard/, { timeout: 15000 })
  await expect(page.getByText('Cargando...')).not.toBeVisible({ timeout: 10000 })

  // Guardar el estado de autenticación (localStorage con tokens Supabase)
  await page.context().storageState({ path: sessionFile })
})
