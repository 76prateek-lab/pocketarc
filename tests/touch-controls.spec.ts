import { expect, test, type Page } from '@playwright/test'

const VIEWPORTS = [[320, 568], [360, 800], [375, 812], [390, 844], [430, 932], [768, 1024], [1024, 768]] as const
const PORTRAIT_GAMEPLAY_VIEWPORTS = [[360, 800], [375, 812], [390, 844], [430, 932]] as const

test('composes portrait gameplay controls as one compact deck', async ({ page }, testInfo) => {
  test.skip(!['mobile-chromium', 'iphone-webkit'].includes(testInfo.project.name))
  await page.addInitScript(() => {
    const original = window.fetch.bind(window)
    const entry = { id: 'control-layout-demo', title: 'Control Layout Demo', description: 'Touch layout fixture.', developer: 'PocketArc', publisher: 'PocketArc', year: 2026, genre: ['Demo'], cover: '', romPath: '/catalog/roms/control-layout-demo.gba', fileSize: 4, checksum: '9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a', featured: true }
    window.fetch = async (input, init) => {
      const url = String(input)
      if (url.includes('/catalog/games.json')) return new Response(JSON.stringify([entry]), { headers: { 'Content-Type': 'application/json' } })
      if (url.includes('/catalog/roms/control-layout-demo.gba')) return new Response(new Uint8Array([1, 2, 3, 4]))
      return original(input, init)
    }
  })
  await page.goto('/app/game/catalog:control-layout-demo')
  await page.getByRole('button', { name: 'Download & Play' }).click()
  await expect(page.getByLabel('Touch game controls')).toBeVisible()

  for (const [width, height] of PORTRAIT_GAMEPLAY_VIEWPORTS) {
    await page.setViewportSize({ width, height })
    const toolbar = await page.getByRole('navigation', { name: 'Gameplay controls' }).boundingBox()
    const stage = await page.getByLabel('Control Layout Demo play area').boundingBox()
    const deck = await page.getByLabel('Touch game controls').boundingBox()
    expect(toolbar).not.toBeNull(); expect(stage).not.toBeNull(); expect(deck).not.toBeNull()
    if (toolbar && stage && deck) {
      expect(stage.y - (toolbar.y + toolbar.height)).toBeGreaterThanOrEqual(16)
      expect(stage.y - (toolbar.y + toolbar.height)).toBeLessThanOrEqual(20)
      expect(stage.width).toBeCloseTo(width - 32, 0)
      expect(Math.abs(stage.x - ((width - stage.width) / 2))).toBeLessThan(1)
      expect(deck.y - (stage.y + stage.height)).toBeGreaterThanOrEqual(20)
      expect(deck.y - (stage.y + stage.height)).toBeLessThanOrEqual(24)
    }
    const controls = Object.fromEntries(await Promise.all(['dpad', 'a', 'b', 'l', 'r', 'select', 'start'].map(async (id) => [id, await page.locator(`[data-control="${id}"]`).boundingBox()])))
    for (const [id, box] of Object.entries(controls)) expect(box, `${id} should render at ${width}x${height}`).not.toBeNull()
    const { dpad, a, b, l, r, select, start } = controls
    if (!dpad || !a || !b || !l || !r || !select || !start) continue

    expect(Math.abs(l.y - r.y)).toBeLessThan(1)
    expect(l.width).toBeGreaterThanOrEqual(88); expect(l.height).toBeGreaterThanOrEqual(48)
    expect(a.width).toBeCloseTo(b.width, 1); expect(a.height).toBeCloseTo(b.height, 1)
    expect(a.width).toBeGreaterThanOrEqual(72); expect(a.width).toBeLessThanOrEqual(78)
    expect(dpad.width).toBeGreaterThanOrEqual(132); expect(dpad.height).toBeGreaterThanOrEqual(132)
    expect(Math.abs(select.y - start.y)).toBeLessThan(1); expect(select.x).toBeLessThan(start.x)
    expect(Math.min(dpad.y, a.y) - (l.y + l.height)).toBeGreaterThanOrEqual(27)
    expect(select.y - Math.max(dpad.y + dpad.height, b.y + b.height)).toBeGreaterThanOrEqual(14)
    expect(height - Math.max(select.y + select.height, start.y + start.height)).toBeGreaterThanOrEqual(24)
  }
})

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
