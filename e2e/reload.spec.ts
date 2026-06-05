import { test, expect } from '@playwright/test'

// Regresión de FIX-01: TOKEN_REFRESHED antes de INITIAL_SESSION cancelaba el
// safety-timeout y dejaba la UI en "Cargando..." indefinidamente tras un hard reload.

test.describe('Recarga de página (regresión FIX-01)', () => {
  test('reload normal no deja la UI colgada', async ({ page }) => {
    await page.goto('/3d-print/calculator')
    await expect(page.getByText('Cargando...')).not.toBeVisible({ timeout: 8000 })

    await page.reload()

    // La UI debe resolver en < 8s — no importa si queda en /calculator o /login,
    // lo importante es que no quede colgada mostrando "Cargando..."
    await expect(page.getByText('Cargando...')).not.toBeVisible({ timeout: 8000 })
  })

  test('token expirado + reload no deja la UI colgada', async ({ page }) => {
    await page.goto('/3d-print/calculator')
    await expect(page.getByText('Cargando...')).not.toBeVisible({ timeout: 8000 })

    // Simula hard reload: expira el access token para forzar TOKEN_REFRESHED
    // antes de INITIAL_SESSION (el escenario exacto que causaba FIX-01)
    await page.evaluate(() => {
      const key = Object.keys(localStorage).find((k) => k.startsWith('sb-'))
      if (!key) return
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        if (data.expires_at) {
          data.expires_at = Math.floor(Date.now() / 1000) - 1
          localStorage.setItem(key, JSON.stringify(data))
        }
      } catch (_) { /* formato inesperado, dejamos pasar */ }
    })

    await page.reload()

    // Con el fix la UI se resuelve: o muestra la app o redirige a login, nunca hang
    await expect(page.getByText('Cargando...')).not.toBeVisible({ timeout: 10000 })
  })

  test('múltiples reloads consecutivos no cuelgan la UI', async ({ page }) => {
    await page.goto('/3d-print/calculator')
    await expect(page.getByText('Cargando...')).not.toBeVisible({ timeout: 8000 })

    for (let i = 0; i < 3; i++) {
      await page.reload()
      await expect(page.getByText('Cargando...')).not.toBeVisible({ timeout: 8000 })
    }
  })
})
