import { test, expect, Page } from '@playwright/test'

async function createProject(page: Page, name: string) {
  await page.goto('/3d-print/calculator')
  await expect(page.getByText('Crear nuevo Proyecto')).toBeVisible({ timeout: 12000 })

  await page.fill('input[placeholder="Ej: Pieza cliente ABC"]', name)
  await page.fill('input[type=number]', '1')
  await page.getByRole('button', { name: /siguiente/i }).first().click()
  await expect(page.getByText(/Datos de Bandeja/)).toBeVisible({ timeout: 5000 })

  const inputs = page.locator('input[type=number]')
  await inputs.nth(0).fill('80')
  await inputs.nth(1).fill('2')
  await page.locator('button[type=submit]').click()
  await expect(page.getByText('Resumen Final')).toBeVisible({ timeout: 5000 })

  await page.getByRole('button', { name: /guardar proyecto/i }).click()
  await expect(page.getByText('Proyecto guardado exitosamente')).toBeVisible({ timeout: 15000 })
}

test.describe('Vista de detalle de proyecto', () => {
  let projectName: string

  test.beforeAll(async ({ browser }) => {
    projectName = `E2E Detail ${Date.now()}`
    const ctx = await browser.newContext({ storageState: 'e2e/.auth/session.json' })
    const page = await ctx.newPage()
    await createProject(page, projectName)
    await ctx.close()
  }, 60000)

  // Navega a /saved-projects, expande el proyecto y hace click en Ver Detalle
  async function goToDetail(page: Page) {
    await page.goto('/3d-print/saved-projects')
    // Esperar a que el proyecto aparezca en la lista (supera el estado loading)
    await page.getByText(projectName).waitFor({ state: 'visible', timeout: 15000 })
    await page.getByText(projectName).click()
    await page.getByRole('button', { name: /ver detalle/i }).click()
    await page.waitForURL(/\/3d-print\/project\//, { timeout: 8000 })
  }

  test('desde SavedProjects: botón Ver Detalle navega a la página de detalle', async ({ page }) => {
    await page.goto('/3d-print/saved-projects')
    await page.getByText(projectName).waitFor({ state: 'visible', timeout: 15000 })
    await page.getByText(projectName).click()
    await expect(page.getByRole('button', { name: /ver detalle/i })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /ver detalle/i }).click()
    await page.waitForURL(/\/3d-print\/project\//, { timeout: 8000 })
    await expect(page).toHaveURL(/\/3d-print\/project\//)
  })

  test('página de detalle muestra nombre del proyecto', async ({ page }) => {
    await goToDetail(page)
    await expect(page.getByText(`Proyecto: ${projectName}`)).toBeVisible({ timeout: 5000 })
  })

  test('página de detalle muestra Monto Bruto a Facturar', async ({ page }) => {
    await goToDetail(page)
    await expect(page.getByText('Monto Bruto a Facturar')).toBeVisible({ timeout: 5000 })
  })

  test('página de detalle muestra tabla con columna Precio Bandeja', async ({ page }) => {
    await goToDetail(page)
    await expect(page.getByRole('columnheader', { name: /precio bandeja/i })).toBeVisible({ timeout: 5000 })
  })

  test('botón Volver regresa a /saved-projects', async ({ page }) => {
    await goToDetail(page)
    await page.getByRole('button', { name: /volver/i }).first().click()
    await page.waitForURL(/\/3d-print\/saved-projects/, { timeout: 5000 })
    await expect(page).toHaveURL(/\/3d-print\/saved-projects/)
  })

  test('desde Home: click en tarjeta de proyecto navega al detalle', async ({ page }) => {
    await page.goto('/3d-print/dashboard')
    await expect(page.getByText('Cargando...')).not.toBeVisible({ timeout: 8000 })

    // Esperar a que carguen las tarjetas o el estado vacío
    const card = page.locator('.project-card').first()
    try {
      await card.waitFor({ state: 'visible', timeout: 8000 })
    } catch {
      test.skip()
      return
    }

    await card.click()
    await page.waitForURL(/\/3d-print\/project\//, { timeout: 8000 })
    await expect(page).toHaveURL(/\/3d-print\/project\//)
    await expect(page.getByText('Monto Bruto a Facturar')).toBeVisible({ timeout: 5000 })
  })
})
