import { expect, test, type Page } from '@playwright/test'

const VIEWPORTS = [[320, 568], [360, 800], [375, 812], [390, 844], [430, 932], [768, 1024], [1024, 768]] as const

test('keeps customized controls reachable across required viewports and persists layouts', async ({ page }) => {
  await page.goto('/settings')
  await page.getByRole('button', { name: 'Customize controls' }).click()

  for (const [width, height] of VIEWPORTS) {
    await page.setViewportSize({ width, height })
    const orientation = width > height ? 'landscape' : 'portrait'
    await page.getByRole('button', { name: orientation, exact: true }).click()
    await assertControlsInsidePreview(page, orientation)
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'portrait', exact: true }).click()
  const preview = page.getByLabel('portrait gameplay viewport preview'); const bounds = await preview.boundingBox(); const a = page.getByRole('button', { name: 'Move A control' })
  expect(bounds).not.toBeNull()
  if (bounds) { const box = await a.boundingBox(); if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(bounds.x - 100, bounds.y - 100); await page.mouse.up() } }
  await assertControlsInsidePreview(page, 'portrait')
  await page.getByRole('button', { name: 'Move A control' }).click()
  await page.getByRole('slider', { name: 'Selected control size' }).fill('1.2')
  await page.getByRole('slider', { name: 'Editor control opacity' }).fill('0.65')
  await expect(page.getByRole('slider', { name: 'Editor control opacity' })).toHaveValue('0.65')
  await page.getByRole('button', { name: 'Save layout' }).click()
  await expect(page.getByRole('button', { name: 'Customize controls' })).toBeVisible()
  await page.reload(); await page.getByRole('button', { name: 'Customize controls' }).click()
  await expect(page.getByRole('slider', { name: 'Editor control opacity' })).toHaveValue('0.65')
  await expect(page.getByRole('slider', { name: 'Selected control size' })).toHaveValue('1')
  await page.getByRole('button', { name: 'Move A control' }).click()
  await expect(page.getByRole('slider', { name: 'Selected control size' })).toHaveValue('1.2')
  await page.getByRole('button', { name: 'landscape', exact: true }).click()
  await expect(page.getByRole('slider', { name: 'Selected control size' })).toHaveValue('1')
})

async function assertControlsInsidePreview(page: Page, orientation: 'portrait' | 'landscape') {
  const preview = page.getByLabel(`${orientation} gameplay viewport preview`); const parent = await preview.boundingBox(); expect(parent).not.toBeNull()
  if (!parent) return
  for (const name of ['D-pad', 'A', 'B', 'L', 'R', 'Start', 'Select']) {
    const box = await page.getByRole('button', { name: `Move ${name} control` }).boundingBox(); expect(box, `${name} should be rendered`).not.toBeNull()
    if (box) { expect(box.x).toBeGreaterThanOrEqual(parent.x - .5); expect(box.y).toBeGreaterThanOrEqual(parent.y - .5); expect(box.x + box.width).toBeLessThanOrEqual(parent.x + parent.width + .5); expect(box.y + box.height).toBeLessThanOrEqual(parent.y + parent.height + .5) }
  }
}
