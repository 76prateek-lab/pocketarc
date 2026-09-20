import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { disablePublicCatalog } from './catalogTestUtils'

test.beforeEach(async ({ page }) => disablePublicCatalog(page))

const homebrewRom = resolve('private-roms/jsmolka-hello.gba')

test('boots and fully tears down the self-hosted mGBA runtime', async ({ page }) => {
  test.skip(!existsSync(homebrewRom), 'Ignored MIT-licensed homebrew test ROM is not installed.')
  await page.goto('/library')
  await page.locator('input[type="file"]').setInputFiles(homebrewRom)
  const library = page.getByLabel('My library games')
  await library.getByRole('link', { name: /Jsmolka Hello/ }).click()
  await page.getByRole('button', { name: 'Play' }).click()
  await expect(page).toHaveURL(/\/play\/[^/]+$/)
  await expect(page.getByRole('link', { name: 'PocketArc home' })).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Open play menu' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Exit game' })).toBeVisible()

  await page.getByRole('button', { name: 'Open play menu' }).click()
  await page.getByRole('button', { name: 'Show keyboard controls' }).click()
  const keyboardDialog = page.getByRole('dialog', { name: 'Keyboard controls' })
  await expect(keyboardDialog).toBeVisible()
  await expect(keyboardDialog.getByText('Quick Save').locator('..')).toContainText('F5')
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page.getByRole('button', { name: 'Close sheet' }).click()

  const emulatorFrame = page.frameLocator('iframe[title="Jsmolka Hello emulator"]')
  await emulatorFrame.getByText('Start Game').click()
  await expect(emulatorFrame.locator('canvas')).toBeVisible({ timeout: 30_000 })
  await expect(emulatorFrame.locator('.ejs_virtualGamepad_parent')).toBeHidden()
  await expect(emulatorFrame.locator('.ejs_virtualGamepad_open')).toBeHidden()
  await expect(page.getByText('Playing', { exact: true })).toBeVisible()
  const runtimeFrame = page.frames().find((frame) => frame.url().endsWith('/emulatorjs/frame.html'))
  await expect.poll(async () => runtimeFrame?.evaluate(() => {
    type RuntimeWindow = Window & { EJS_emulator?: { Module?: { AL?: { currentCtx?: { audioCtx?: { state?: string }; sources?: Array<{ gain?: { context?: { state?: string } } }> } } } } }
    const context = (window as RuntimeWindow).EJS_emulator?.Module?.AL?.currentCtx
    return context?.audioCtx?.state ?? context?.sources?.[0]?.gain?.context?.state
  })).toBe('running')
  await runtimeFrame?.evaluate(() => {
    type InputRuntime = Window & { __inputEvents?: string[]; EJS_emulator?: { gameManager?: { simulateInput?: (player: number, index: number, value: number) => void } } }
    const runtime = window as InputRuntime
    const manager = runtime.EJS_emulator?.gameManager
    const original = manager?.simulateInput?.bind(manager)
    runtime.__inputEvents = []
    if (manager && original) manager.simulateInput = (player, index, value) => { runtime.__inputEvents?.push(`${index}:${value}`); original(player, index, value) }
  })
  await emulatorFrame.locator('canvas').press('ArrowRight')
  await page.keyboard.down('x')
  await page.keyboard.down('z')
  await expect.poll(() => runtimeFrame?.evaluate(() => (window as Window & { __inputEvents?: string[] }).__inputEvents)).toEqual(expect.arrayContaining(['8:1', '0:1']))
  await page.keyboard.up('x')
  await page.keyboard.up('z')

  await runtimeFrame?.evaluate(() => {
    const data = new Uint8Array([7, 8, 9, 10]).buffer
    parent.postMessage({ channel: 'pocketgba-emulator', type: 'normal-save', data, hash: 'e2e-save' }, location.origin, [data])
  })
  await expect.poll(() => storedSaveSize(page)).toBe(4)
  await page.getByRole('button', { name: 'Open play menu' }).click()
  const quickSave = page.getByRole('button', { name: 'Quick Save', exact: true })
  await expect(quickSave).toBeEnabled()
  await quickSave.click()
  await expect(page.getByText('Quick save created.')).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: 'Open play menu' }).click()
  await page.getByRole('button', { name: 'Save States' }).click()
  const slotOne = page.locator('article').filter({ hasText: 'Slot 1' })
  await expect(slotOne.getByRole('button', { name: 'Save', exact: true })).toBeEnabled()
  await slotOne.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByText('Slot 1 saved.')).toBeVisible({ timeout: 15_000 })
  await expect(slotOne.getByAltText('Save-state preview')).toBeVisible()
  await page.getByRole('button', { name: 'Close sheet' }).click()

  const more = page.getByRole('button', { name: 'Open play menu' })
  await more.click()
  await page.getByRole('button', { name: 'Resume' }).click()
  await more.focus()
  await more.click()
  await expect(page.getByRole('heading', { name: 'Play menu' })).toBeVisible()
  await runtimeFrame?.evaluate(() => {
    type AdvancedRuntime = Window & { __advancedCalls?: string[]; EJS_emulator?: { gameManager?: { setFastForwardRatio?: (ratio: number) => void; setCheat?: (index: number, enabled: boolean, code: string) => void } } }
    const runtime = window as AdvancedRuntime; const manager = runtime.EJS_emulator?.gameManager; runtime.__advancedCalls = []
    if (manager?.setFastForwardRatio) { const original = manager.setFastForwardRatio.bind(manager); manager.setFastForwardRatio = (ratio) => { runtime.__advancedCalls?.push(`speed:${ratio}`); original(ratio) } }
    if (manager?.setCheat) { const original = manager.setCheat.bind(manager); manager.setCheat = (index, enabled, code) => { runtime.__advancedCalls?.push(`cheat:${index}:${enabled}:${code}`); original(index, enabled, code) } }
  })
  await page.getByRole('combobox', { name: 'Fast-forward speed' }).selectOption('2')
  await expect.poll(() => runtimeFrame?.evaluate(() => (window as Window & { __advancedCalls?: string[] }).__advancedCalls)).toContain('speed:2')
  await page.getByRole('button', { name: 'Cheats' }).click()
  await page.getByRole('textbox', { name: 'Cheat name' }).fill('Test cheat')
  await page.getByRole('textbox', { name: 'Cheat code' }).fill('1234ABCD 0001')
  await page.getByRole('button', { name: 'Add cheat' }).click()
  const cheatSwitch = page.getByRole('switch', { name: 'Enable Test cheat' })
  await expect(cheatSwitch).toBeEnabled()
  await cheatSwitch.click({ force: true })
  await expect.poll(() => runtimeFrame?.evaluate(() => (window as Window & { __advancedCalls?: string[] }).__advancedCalls?.some((call) => call.includes('cheat:0:true:1234ABCD 0001')))).toBe(true)
  await page.getByRole('button', { name: 'Close dialog' }).click({ force: true })
  await more.click()
  await page.getByRole('button', { name: 'Restart Game' }).click()
  await expect(page.getByRole('heading', { name: 'Restart game?' })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click({ force: true })
  await expect(page.getByRole('heading', { name: 'Restart game?' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Screenshot' }).click()
  await expect(page.getByText('Screenshot saved on this device.')).toBeVisible()
  await expect.poll(() => storedScreenshotCount(page)).toBe(1)
  await more.click()
  await page.getByRole('button', { name: 'Resume' }).click()
  if (await page.evaluate(() => document.fullscreenEnabled)) {
    await page.getByRole('button', { name: 'Open play menu' }).click()
    await page.getByRole('button', { name: 'Display / Fullscreen' }).click()
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true)
    await page.keyboard.press('f')
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false)
    await expect(page.getByRole('button', { name: 'Open play menu' })).toBeVisible()
  }

  const desktopStage = await page.getByLabel('Jsmolka Hello play area').boundingBox()
  expect(desktopStage && desktopStage.width / desktopStage.height).toBeCloseTo(1.5, 1)
  await page.setViewportSize({ width: 390, height: 844 })
  const phoneStage = await page.getByLabel('Jsmolka Hello play area').boundingBox()
  expect(phoneStage && phoneStage.width / phoneStage.height).toBeCloseTo(1.5, 1)
  await page.setViewportSize({ width: 667, height: 375 })
  await expect(page.getByLabel('Touch game controls')).toBeVisible()
  const landscapeBody = await page.locator('body').evaluate((body) => ({ clientWidth: body.clientWidth, scrollWidth: body.scrollWidth }))
  expect(landscapeBody.scrollWidth).toBeLessThanOrEqual(landscapeBody.clientWidth)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goBack()
  await expect(page).toHaveURL(/\/game\/[^/]+$/)
  await expect(page.locator('iframe[title="Jsmolka Hello emulator"]')).toHaveCount(0)
  await page.getByRole('button', { name: 'View' }).first().click()
  await expect(page.getByAltText('Full-size gameplay screenshot')).toBeVisible()
  await page.getByRole('button', { name: 'Close dialog' }).click({ force: true })
  const screenshotDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download screenshot' }).first().click()
  await screenshotDownload
  await page.getByRole('button', { name: 'Delete screenshot' }).first().click()
  await expect.poll(() => storedScreenshotCount(page)).toBe(0)

  await page.reload()
  await page.getByRole('button', { name: /Continue|Play/ }).click()
  await expect(page.locator('iframe[title="Jsmolka Hello emulator"]')).toHaveCount(1)
  const reopenedFrame = page.frameLocator('iframe[title="Jsmolka Hello emulator"]')
  await reopenedFrame.getByText('Start Game').click()
  await page.getByRole('button', { name: 'Open play menu' }).click()
  await expect(page.getByRole('button', { name: 'Quick Load', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Quick Load', exact: true }).click()
  await expect(page.getByText('Quick save loaded.')).toBeVisible()
  await expect.poll(() => storedSaveSize(page)).toBe(4)
  await page.getByRole('button', { name: 'Open play menu' }).click()
  await page.getByRole('button', { name: 'Exit to Library' }).click()
  await expect(page).toHaveURL('/app/library')
  await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeVisible()
  await expect.poll(() => storedPlaytime(page)).toBeGreaterThan(0)
})

async function storedScreenshotCount(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('PocketGBADB')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    return new Promise<number>((resolve, reject) => {
      const request = database.transaction('screenshots').objectStore('screenshots').getAll()
      request.onsuccess = () => resolve(request.result.filter((screenshot) => screenshot.source === 'manual').length)
      request.onerror = () => reject(request.error)
    })
  })
}

async function storedPlaytime(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('PocketGBADB')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    return new Promise<number>((resolve, reject) => {
      const request = database.transaction('games').objectStore('games').getAll()
      request.onsuccess = () => resolve(request.result[0]?.totalPlayTimeMs ?? 0)
      request.onerror = () => reject(request.error)
    })
  })
}

async function storedSaveSize(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('PocketGBADB')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    return new Promise<number>((resolve, reject) => {
      const request = database.transaction('saves').objectStore('saves').getAll()
      request.onsuccess = () => resolve(request.result[0]?.data?.size ?? request.result[0]?.data?.byteLength ?? 0)
      request.onerror = () => reject(request.error)
    })
  })
}
