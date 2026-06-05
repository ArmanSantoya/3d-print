import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    // El setup corre primero y guarda la sesión autenticada
    {
      name: 'setup',
      testMatch: '**/setup/auth.setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/session.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/3d-print/',
    reuseExistingServer: true,
    timeout: 60000,
  },
})
