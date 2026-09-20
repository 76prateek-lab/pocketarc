import { expect, test } from '@playwright/test'
import { disablePublicCatalog } from './catalogTestUtils'

test.beforeEach(async ({ page }) => disablePublicCatalog(page))
import { resolve } from 'node:path'

test('imports, persists, deduplicates, searches, and deletes local ROMs', async ({ page }) => {
  await page.goto('/library')
  await expect(page).toHaveURL(/\/library$/)
  await expect(page.getByRole('heading', { name: 'Library', exact: true })).toBeVisible()
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({ name: 'aurora-circuit.gba', mimeType: 'application/octet-stream', buffer: Buffer.from('aurora-rom') })
  await expect(page.getByText('aurora-circuit.gba')).toBeVisible()
  await expect(page.getByText('Complete')).toBeVisible()

  await fileInput.setInputFiles({ name: 'aurora-copy.gba', mimeType: 'application/octet-stream', buffer: Buffer.from('aurora-rom') })
  await expect(page.getByText('Already in your library')).toBeVisible()

  await fileInput.setInputFiles([
    { name: 'verdant-quest.gba', mimeType: 'application/octet-stream', buffer: Buffer.from('verdant-rom') },
    { name: 'pixel-strikers.gba', mimeType: 'application/octet-stream', buffer: Buffer.from('pixel-rom') },
  ])
  await expect(page.getByText('3 games').first()).toBeVisible()
  await page.reload()
  await expect(page.getByText('3 games').first()).toBeVisible()

  await page.getByRole('textbox', { name: 'Search library' }).fill('Aurora')
  const library = page.getByLabel('My library games')
  await expect(library.getByRole('heading', { name: 'Aurora Circuit' })).toBeVisible()
  await expect(library.getByRole('heading', { name: 'Verdant Quest' })).toBeHidden()
  await library.getByRole('link', { name: /Aurora Circuit/ }).click()
  await expect(page).toHaveURL(/\/game\/[^/]+$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Aurora Circuit' }),
  ).toBeVisible()
  await page.getByRole('button', { name: /Delete game/ }).click()
  await expect(page.getByRole('dialog', { name: 'Delete Aurora Circuit?' })).toBeVisible()
  await page.getByRole('button', { name: 'Delete game and ROM' }).click()
  await expect(page).toHaveURL(/\/library$/)
  await expect(page.getByText('2 games').first()).toBeVisible()
})

test('adapts navigation to the available viewport', async ({ page }) => {
  await page.goto('/library')

  const desktopNavigation = page.getByRole('navigation', { name: 'Primary navigation' })

  if ((page.viewportSize()?.width ?? 1024) <= 760) {
    await expect(desktopNavigation).toBeHidden()
    const mobileNavigation = page.getByRole('navigation', { name: 'Mobile navigation' })
    await expect(mobileNavigation).toBeVisible()
    await expect(mobileNavigation.getByRole('link', { name: 'Library' })).toHaveAttribute('aria-current', 'page')
    await expect(mobileNavigation.getByRole('link', { name: 'Storage' })).toBeVisible()
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Settings' })).toBeVisible()
  } else {
    await expect(desktopNavigation).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden()
  }
})

test('favorites, edits metadata, and stores a local cover', async ({ page }) => {
  await page.goto('/library')
  await page.locator('input[accept=".gba"]').setInputFiles({ name: 'library-tools.gba', mimeType: 'application/octet-stream', buffer: Buffer.from('library-tools-rom') })
  const library = page.getByLabel('My library games')
  await library.getByRole('button', { name: 'Actions for Library Tools' }).click()
  await page.getByRole('menuitem', { name: 'Favorite' }).click()
  await expect(library.getByRole('heading', { name: 'Library Tools' })).toBeVisible()

  await library.getByRole('button', { name: 'Actions for Library Tools' }).click()
  await page.getByRole('menuitem', { name: 'Edit details' }).click()
  await page.getByRole('textbox', { name: 'Title' }).fill('My Local Game')
  await page.getByRole('textbox', { name: 'Description' }).fill('Edited entirely on this device.')
  await page.locator('input[accept^="image/"]').setInputFiles(resolve('public/icons/pwa-192x192.png'))
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(library.getByRole('heading', { name: 'My Local Game' })).toBeVisible()
  await library.getByRole('link', { name: /My Local Game/ }).click()
  await expect(page.getByText('Edited entirely on this device.')).toBeVisible()
  await expect.poll(() => page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolveDb, reject) => { const request = indexedDB.open('PocketGBADB'); request.onsuccess = () => resolveDb(request.result); request.onerror = () => reject(request.error) })
    return new Promise<number>((resolveCount, reject) => { const request = database.transaction('covers').objectStore('covers').count(); request.onsuccess = () => resolveCount(request.result); request.onerror = () => reject(request.error) })
  })).toBe(1)
})
