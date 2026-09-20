import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { disablePublicCatalog } from './catalogTestUtils'

test.beforeEach(async ({ page }) => disablePublicCatalog(page))

const homebrewRom = resolve('private-roms/jsmolka-hello.gba')

test('reopens an imported game and its save fully offline', async ({ browserName, context, page }) => {
  test.skip(browserName === 'webkit', 'Playwright WebKit crashes on offline page reload; verify native Safari manually.')
  test.skip(!existsSync(homebrewRom), 'Ignored MIT-licensed homebrew test ROM is not installed.')
  await page.goto('/library')
  await page.locator('input[type="file"]').setInputFiles(homebrewRom)
  await expect(page.getByLabel('My library games').getByRole('link', { name: /Jsmolka Hello/ })).toBeVisible()
  await expect.poll(() => page.evaluate(async () => Boolean(await navigator.serviceWorker.ready))).toBe(true)
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  await page.getByLabel('My library games').getByRole('link', { name: /Jsmolka Hello/ }).click()
  await page.getByRole('button', { name: 'Play' }).click()
  const onlineFrame = page.frameLocator('iframe[title="Jsmolka Hello emulator"]')
  await onlineFrame.getByText('Start Game').click()
  await expect(onlineFrame.locator('canvas')).toBeVisible({ timeout: 30_000 })
  const runtime = page.frames().find((frame) => frame.url().endsWith('/emulatorjs/frame.html'))
  await runtime?.evaluate(() => {
    const data = new Uint8Array([11, 12, 13, 14]).buffer
    parent.postMessage({ channel: 'pocketgba-emulator', type: 'normal-save', data, hash: 'offline-save' }, location.origin, [data])
  })
  await expect.poll(() => storedSaveSize(page)).toBe(4)
  await page.getByRole('button', { name: 'Open play menu' }).click()
  await page.getByRole('button', { name: 'Exit to Library' }).click()
  await expect(page).toHaveURL('/app/library')

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeVisible()
  await page.getByLabel('My library games').getByRole('link', { name: /Jsmolka Hello/ }).click()
  await page.getByRole('button', { name: /Continue|Play/ }).click()
  const offlineFrame = page.frameLocator('iframe[title="Jsmolka Hello emulator"]')
  await offlineFrame.getByText('Start Game').click()
  await expect(offlineFrame.locator('canvas')).toBeVisible({ timeout: 30_000 })
  await expect.poll(() => storedSaveSize(page)).toBe(4)
  await expect.poll(() => storedRomSize(page)).toBeGreaterThan(0)
})

async function storedRomSize(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('PocketGBADB')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    return new Promise<number>((resolve, reject) => {
      const request = database.transaction('roms').objectStore('roms').getAll()
      request.onsuccess = () => resolve(request.result[0]?.blob?.size ?? request.result[0]?.blob?.byteLength ?? 0)
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
