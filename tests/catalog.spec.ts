import { expect, test } from '@playwright/test'

test('shows catalog metadata and downloads a verified ROM only after explicit installation', async ({ browserName, context, page }) => {
  await page.addInitScript(() => {
    try { Object.defineProperty(window.crypto, 'subtle', { configurable: true, value: undefined }) } catch { /* Browser keeps its native implementation. */ }
    try { Object.defineProperty(window.crypto, 'randomUUID', { configurable: true, value: undefined }) } catch { /* Browser keeps its native implementation. */ }
    const original = window.fetch.bind(window); const entry = { id: 'legal-demo', title: 'Legal Catalog Demo', description: 'A redistribution-approved test listing.', developer: 'Demo Dev', publisher: 'Demo Publisher', year: 2026, genre: ['Demo'], cover: '', romPath: '/catalog/roms/legal-demo.gba', fileSize: 4, checksum: '9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a', featured: true }
    Object.assign(window, { __catalogRomRequests: 0 }); window.fetch = async (input, init) => { const url = String(input); if (url.includes('/catalog/games.json')) return new Response(JSON.stringify([entry]), { headers: { 'Content-Type': 'application/json' } }); if (url.includes('/catalog/roms/legal-demo.gba')) { const scope = window as Window & { __catalogRomRequests: number }; scope.__catalogRomRequests += 1; return new Response(new Uint8Array([1, 2, 3, 4])) } return original(input, init) }
  })
  await page.goto('/library')
  await expect(page.getByRole('heading', { name: 'Legal Catalog Demo' }).first()).toBeVisible()
  await expect.poll(() => page.evaluate(async () => Boolean(await navigator.serviceWorker.ready))).toBe(true)
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)
  expect(await page.evaluate(() => (window as Window & { __catalogRomRequests: number }).__catalogRomRequests)).toBe(0)
  await page.getByRole('heading', { name: 'Legal Catalog Demo' }).first().click()
  await expect(page.getByRole('button', { name: 'Download & Play' })).toBeVisible()
  await page.getByRole('button', { name: 'Download & Play' }).click()
  await expect(page).toHaveURL(/\/play\/catalog:legal-demo$/)
  expect(await page.evaluate(() => (window as Window & { __catalogRomRequests: number }).__catalogRomRequests)).toBe(1)
  expect(await page.evaluate(async () => { const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('PocketGBADB'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) }); return await new Promise<number>((resolve, reject) => { const request = database.transaction('roms').objectStore('roms').count(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) }) })).toBe(1)
  if (browserName !== 'webkit') await context.setOffline(true)
  await page.reload()
  await expect(page.getByLabel('Legal Catalog Demo play area')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open play menu' })).toBeVisible()
})
