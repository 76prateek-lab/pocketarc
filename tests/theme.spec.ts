import { expect, test } from '@playwright/test'
import { disablePublicCatalog } from './catalogTestUtils'

test.beforeEach(async ({ page }) => disablePublicCatalog(page))

test('toggles and persists the application color theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/app')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await toggleTheme(page, 'Use dark mode')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0A0A0A')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await toggleTheme(page, 'Use light mode')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

async function toggleTheme(page: import('@playwright/test').Page, label: string) {
  const toggle = page.getByRole('button', { name: label })
  const menu = page.getByRole('button', { name: 'Open menu' })
  await expect(toggle.or(menu)).toBeVisible()
  if (!await toggle.isVisible()) await menu.click()
  await page.getByRole('button', { name: label }).click()
}
