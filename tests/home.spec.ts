import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.fetch.bind(window)
    const entry = { id: 'home-demo', title: 'Home Demo', description: 'A local catalog fixture.', developer: 'Demo Dev', publisher: 'Demo Publisher', year: 2026, genre: ['Demo'], cover: '', romPath: '/catalog/roms/home-demo.gba', fileSize: 4, checksum: '9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a', featured: true }
    window.fetch = (input, init) => String(input).includes('/catalog/games.json')
      ? Promise.resolve(new Response(JSON.stringify([entry]), { headers: { 'Content-Type': 'application/json' } }))
      : original(input, init)
  })
})

test('separates the play-focused Home from the full Library and remains responsive', async ({ page }) => {
  await page.goto('/app')
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Home Demo' }).first()).toBeVisible()
  await expect(page.getByText('Your library', { exact: true })).toBeVisible()

  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 360, height: 800 }]) {
    await page.setViewportSize(viewport)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${viewport.width}x${viewport.height} should not overflow`).toBe(true)
  }

  await page.getByRole('button', { name: 'Open menu' }).click()
  const mobileMenu = page.getByRole('dialog', { name: 'Menu' })
  await expect(mobileMenu.getByRole('button', { name: 'Install PocketArc' })).toBeVisible()
  await expect(mobileMenu.getByRole('link', { name: 'Settings' })).toBeVisible()
  await expect(mobileMenu.getByRole('link', { name: 'About' })).toBeVisible()
  await expect(mobileMenu.getByRole('link', { name: 'Copyright' })).toBeVisible()
  await expect(mobileMenu.getByRole('link', { name: 'Terms' })).toBeVisible()
  await expect(mobileMenu.getByRole('link', { name: 'Privacy' })).toBeVisible()
  await expect(mobileMenu.getByRole('heading', { name: 'App details' })).toBeVisible()
  await expect(mobileMenu).toContainText('EmulatorJS 4.2.3')
  await expect(mobileMenu).toContainText('mGBA')
  await expect(mobileMenu.getByLabel('Powered by 7SP')).toBeVisible()
  await expect(mobileMenu.getByRole('img', { name: '7SP' })).toBeVisible()
  await page.getByRole('button', { name: 'Close sheet' }).click()

  const mobileNavigation = page.getByRole('navigation', { name: 'Mobile navigation' })
  await expect(mobileNavigation).toBeVisible()
  await expect(mobileNavigation.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  await expect(mobileNavigation.getByRole('link', { name: 'Library' })).toBeVisible()
  await expect(mobileNavigation.getByRole('link', { name: 'Saves' })).toBeVisible()
  await expect(mobileNavigation.getByRole('link', { name: 'Storage' })).toBeVisible()
  await expect(mobileNavigation.getByRole('link', { name: 'Settings' })).toHaveCount(0)

  const footer = page.getByRole('contentinfo')
  await expect(footer).toBeHidden()

  await page.setViewportSize({ width: 1440, height: 900 })

  const footerNavigation = footer.getByRole('navigation', { name: 'Footer navigation' })
  await expect(footer).toBeVisible()
  await expect(footer).toContainText('PocketArc')
  await expect(footer).toContainText('Personal and educational use only.')
  await expect(footer.getByLabel('Powered by 7SP')).toBeVisible()
  await expect(footer.getByRole('img', { name: '7SP' })).toBeVisible()
  await expect(footerNavigation.getByRole('link', { name: 'About' })).toBeVisible()
  await expect(footerNavigation.getByRole('link', { name: 'Copyright' })).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Library' }).click()
  await expect(page).toHaveURL(/\/library$/)
  await expect(page.getByRole('textbox', { name: 'Search library' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Filter games' })).toHaveCount(0)
})

test('shows mobile add-to-home-screen guidance when a native installer is unavailable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/app')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.getByRole('button', { name: 'Install PocketArc' }).click()

  const guide = page.getByRole('dialog', { name: 'Add PocketArc to your Home Screen' })
  await expect(guide).toBeVisible()
  await expect(guide).toContainText(/Install app|Add to Home Screen/i)
  await expect(guide.getByRole('button', { name: 'Got it' })).toBeVisible()
})
