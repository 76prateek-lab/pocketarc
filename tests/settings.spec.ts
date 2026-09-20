import { expect, test } from '@playwright/test'
import { disablePublicCatalog } from './catalogTestUtils'

test.beforeEach(async ({ page }) => disablePublicCatalog(page))

test('validates, persists, and resets application settings', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await page.getByRole('combobox', { name: 'Color theme' }).selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('switch', { name: 'Launch last game' }).click()
  await page.getByRole('switch', { name: 'Smooth filtering' }).click()
  await page.getByRole('combobox', { name: 'Screen fit' }).selectOption('pixel-perfect')
  await page.getByRole('combobox', { name: 'Display filter' }).selectOption('sharp')
  await page.getByRole('slider', { name: 'Master volume' }).fill('0.7')
  await expect.poll(() => page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('PocketGBADB'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
    return await new Promise<boolean | undefined>((resolve, reject) => { const request = database.transaction('settings').objectStore('settings').get('appSettings'); request.onsuccess = () => resolve(request.result?.value?.display?.smoothFiltering); request.onerror = () => reject(request.error) })
  })).toBe(false)
  await page.reload()
  await expect(page.getByRole('combobox', { name: 'Color theme' })).toHaveValue('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('switch', { name: 'Launch last game' })).toBeChecked()
  await expect(page.getByRole('switch', { name: 'Smooth filtering' })).not.toBeChecked()
  await expect(page.getByRole('combobox', { name: 'Screen fit' })).toHaveValue('pixel-perfect')
  await expect(page.getByRole('combobox', { name: 'Display filter' })).toHaveValue('sharp')
  await expect(page.getByRole('slider', { name: 'Master volume' })).toHaveValue('0.7')
  await page.getByRole('button', { name: 'Reset all' }).click()
  await expect(page.getByRole('combobox', { name: 'Color theme' })).toHaveValue('system')
  await expect(page.getByRole('switch', { name: 'Launch last game' })).not.toBeChecked()
  await expect(page.getByRole('switch', { name: 'Smooth filtering' })).toBeChecked()

  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('PocketGBADB'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
    await new Promise<void>((resolve, reject) => { const request = database.transaction('settings', 'readwrite').objectStore('settings').put({ key: 'appSettings', value: { touch: { opacity: 50 }, display: { screenFit: 'nope' } }, updatedAt: Date.now() }); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error) })
  })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Opacity' })).toHaveValue('1')
  await expect(page.getByRole('combobox', { name: 'Screen fit' })).toHaveValue('contain')
})

test('moves technical app details from mobile settings into the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/settings')
  await expect(page.getByRole('main').getByRole('heading', { name: 'About' })).toBeHidden()
  await page.getByRole('button', { name: 'Open menu' }).click()
  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu.getByRole('heading', { name: 'App details' })).toBeVisible()
  await expect(menu).toContainText('EmulatorJS 4.2.3')
  await expect(menu.getByRole('link', { name: 'mGBA license' })).toBeVisible()
})
