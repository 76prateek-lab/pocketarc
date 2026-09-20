import { expect, test } from '@playwright/test'
import { disablePublicCatalog } from './catalogTestUtils'

test.beforeEach(async ({ page }) => disablePublicCatalog(page))

test('exports, clears, and restores a validated local backup', async ({ page }) => {
  await page.goto('/library')
  await page.locator('input[accept=".gba"]').setInputFiles({ name: 'backup-demo.gba', mimeType: 'application/octet-stream', buffer: Buffer.from('backup-rom') })
  await expect(page.getByText('Complete')).toBeVisible()
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('PocketGBADB'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
    const game = await new Promise<{ id: string }>((resolve, reject) => { const request = database.transaction('games').objectStore('games').getAll(); request.onsuccess = () => resolve(request.result[0]); request.onerror = () => reject(request.error) })
    await new Promise<void>((resolve, reject) => { const request = database.transaction('saves', 'readwrite').objectStore('saves').put({ id: 'backup-save', gameId: game.id, data: new TextEncoder().encode('progress').buffer, updatedAt: Date.now() }); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error) })
  })
  await page.goto('/storage')
  await expect(page.getByRole('heading', { name: 'Storage' })).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export All Saves' }).click()
  const download = await downloadPromise; const backupPath = await download.path(); expect(backupPath).toBeTruthy()

  await page.getByRole('button', { name: 'Clear All Local Data' }).click()
  const deleteDialog = page.getByRole('dialog', { name: 'Clear all PocketArc data?' })
  await expect(deleteDialog.getByRole('button', { name: 'Delete everything' })).toBeDisabled()
  await deleteDialog.getByRole('textbox', { name: 'Confirmation' }).fill('DELETE')
  const deleteButton = deleteDialog.getByRole('button', { name: 'Delete everything' })
  await expect(deleteButton).toBeEnabled()
  await deleteButton.click({ force: true })
  await expect(page.getByText('All PocketArc data was removed')).toBeVisible()

  await page.locator('input[accept*="application/zip"]').setInputFiles(backupPath!)
  const restoreDialog = page.getByRole('dialog', { name: 'Restore backup?' })
  await expect(restoreDialog).toContainText('1 / 0')
  const restoreButton = restoreDialog.getByRole('button', { name: 'Restore backup' })
  await expect(restoreButton).toBeEnabled()
  await restoreButton.click({ force: true })
  await expect(page.getByText('Restore complete: 1 saves')).toBeVisible()
  await page.goto('/library')
  await expect(page.getByLabel('My library games').getByRole('heading', { name: 'Backup Demo' })).toBeVisible()
})
