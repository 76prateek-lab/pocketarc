import { expect, test } from '@playwright/test'

test('serves the copyright disclaimer and links to it from the footer', async ({ page }) => {
  await page.goto('/copyright')

  await expect(page.getByRole('heading', { name: 'Copyright & Disclaimer' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Strict non-distribution requirement' })).toBeVisible()
  await expect(page.getByText(/do not automatically make every use lawful/i)).toBeVisible()
  const footerLink = page.getByRole('contentinfo').getByRole('link', { name: 'Copyright' })
  if (await footerLink.count()) await expect(footerLink).toHaveAttribute('href', '/copyright')
  else {
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByRole('link', { name: 'Copyright' })).toHaveAttribute('href', '/copyright')
  }
})
