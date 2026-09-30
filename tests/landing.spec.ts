import { expect, test } from '@playwright/test'

const viewports = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
  { width: 360, height: 800 },
  { width: 430, height: 932 },
]

test('presents the public product page across target viewports', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Your GBA library, reimagined.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'PocketArc home' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Landing navigation' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Launch PocketArc' })).toHaveAttribute('href', '/app')
  await expect(page.getByLabel('PocketArc product preview')).toBeVisible()
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#050506')
  const footer = page.getByRole('contentinfo')
  await expect(footer).toContainText('PocketArc')
  await expect(footer).toContainText(`© ${new Date().getFullYear()}`)
  await expect(footer.getByLabel('Powered by 7SP')).toBeVisible()
  await expect(footer.getByRole('img', { name: '7SP' })).toBeVisible()
  await expect(footer.getByRole('navigation', { name: 'Footer navigation' })).toBeVisible()
  await expect(footer.getByRole('link', { name: 'Privacy' })).toBeVisible()

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      `${viewport.width}x${viewport.height} should not overflow horizontally`,
    ).toBe(true)
    if (viewport.width >= 1280) {
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
        `${viewport.width}x${viewport.height} should fit in one viewport`,
      ).toBe(true)
    }
  }
})

test('explains the local-first flow and launches the application', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'How it works' }).click()
  const dialog = page.getByRole('dialog', { name: 'How PocketArc works' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Import your .gba file')
  await expect(dialog).toContainText('Nothing is uploaded')
  await expect(dialog).toContainText('Play and save offline')
  await dialog.getByRole('link', { name: 'Launch PocketArc' }).click()
  await expect(page).toHaveURL(/\/app$/)
})

test('keeps legacy application links working', async ({ page }) => {
  await page.goto('/library')
  await expect(page).toHaveURL(/\/app\/library$/)
  await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeVisible()
})
