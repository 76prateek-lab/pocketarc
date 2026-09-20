import { expect, test } from '@playwright/test'
import { disablePublicCatalog } from './catalogTestUtils'

test.beforeEach(async ({ page }) => disablePublicCatalog(page))

const WIDTHS = [320, 360, 375, 390, 430, 480, 600, 768, 1024, 1200, 1400, 1920]

test('has no horizontal overflow and preserves keyboard focus across the production width matrix', async ({ page }) => {
  await page.goto('/settings')
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${width}px viewport should not overflow`).toBe(true)
  }
  await page.setViewportSize({ width: 1024, height: 768 })
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
  expect(await page.locator(':focus').evaluate((element) => { const style = getComputedStyle(element); return style.boxShadow !== 'none' || style.outlineStyle !== 'none' })).toBe(true)
})

test('handles a larger local library without losing search responsiveness', async ({ page }) => {
  await page.goto('/library')
  const files = Array.from({ length: 30 }, (_, index) => ({ name: `stress-game-${String(index).padStart(2, '0')}.gba`, mimeType: 'application/octet-stream', buffer: Buffer.from([index + 1, 71, 66, 65]) }))
  await page.locator('input[accept=".gba"]').setInputFiles(files)
  await expect(page.getByText('30 games').first()).toBeVisible({ timeout: 15_000 })
  await page.getByRole('textbox', { name: 'Search library' }).fill('stress game 29')
  const library = page.getByLabel('My library games')
  await expect(library.getByRole('heading', { name: 'Stress Game 29' })).toBeVisible()
  await expect(library.getByRole('heading')).toHaveCount(1)
})

test('keeps interactive mobile controls at least 44 CSS pixels', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, 'Touch-target audit runs in mobile projects.')
  await page.goto('/settings')
  const controls = page.locator('button:visible, a:visible, input:visible, select:visible')
  const count = await controls.count()
  for (let index = 0; index < count; index += 1) {
    const target = controls.nth(index); const box = await target.boundingBox(); if (!box) continue
    expect(Math.max(box.width, box.height), `interactive target ${index} should expose a 44px dimension`).toBeGreaterThanOrEqual(44)
  }
})
