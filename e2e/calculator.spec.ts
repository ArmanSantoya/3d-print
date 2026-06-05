import { test, expect } from '@playwright/test'

// Helpers para claridad semántica
const nextFromStep1 = (page) => page.getByRole('button', { name: /siguiente/i }).first()
const nextFromStep2 = (page) => page.locator('button[type=submit]')

test.describe('Calculadora — flujo de cotización', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/3d-print/calculator')
    await expect(page.getByText('Crear nuevo Proyecto')).toBeVisible({ timeout: 12000 })
  })

  test('Step 1: ingresar nombre y cantidad de bandejas', async ({ page }) => {
    await page.fill('input[placeholder="Ej: Pieza cliente ABC"]', 'Test E2E')
    await page.fill('input[type=number]', '2')
    await nextFromStep1(page).click()
    await expect(page.getByText(/Datos de Bandeja/)).toBeVisible({ timeout: 5000 })
  })

  test('Step 2: completar datos de bandeja y avanzar a resumen', async ({ page }) => {
    await page.fill('input[placeholder="Ej: Pieza cliente ABC"]', 'Test E2E')
    await page.fill('input[type=number]', '1')
    await nextFromStep1(page).click()
    await expect(page.getByText(/Datos de Bandeja/)).toBeVisible({ timeout: 5000 })

    const inputs = page.locator('input[type=number]')
    await inputs.nth(0).fill('100')
    await inputs.nth(1).fill('3')
    await nextFromStep2(page).click()
    await expect(page.getByText('Resumen Final')).toBeVisible({ timeout: 5000 })
  })

  test('Step 3: resumen muestra monto bruto a facturar', async ({ page }) => {
    await page.fill('input[placeholder="Ej: Pieza cliente ABC"]', 'Test E2E')
    await page.fill('input[type=number]', '1')
    await nextFromStep1(page).click()
    await expect(page.getByText(/Datos de Bandeja/)).toBeVisible({ timeout: 5000 })

    const inputs = page.locator('input[type=number]')
    await inputs.nth(0).fill('100')
    await inputs.nth(1).fill('3')
    await nextFromStep2(page).click()
    await expect(page.getByText('Monto Bruto a Facturar')).toBeVisible({ timeout: 5000 })
  })

  test('Step 3: botón Atrás regresa a Step 2', async ({ page }) => {
    await page.fill('input[placeholder="Ej: Pieza cliente ABC"]', 'Test E2E')
    await page.fill('input[type=number]', '1')
    await nextFromStep1(page).click()
    await expect(page.getByText(/Datos de Bandeja/)).toBeVisible({ timeout: 5000 })

    const inputs = page.locator('input[type=number]')
    await inputs.nth(0).fill('50')
    await inputs.nth(1).fill('2')
    await nextFromStep2(page).click()
    await expect(page.getByText('Resumen Final')).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: /atrás/i }).last().click()
    await expect(page.getByText(/Datos de Bandeja/)).toBeVisible({ timeout: 5000 })
  })
})
