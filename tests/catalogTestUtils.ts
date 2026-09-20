import type { Page } from '@playwright/test'

export function disablePublicCatalog(page: Page) {
  return page.addInitScript(() => {
    const original = window.fetch.bind(window)
    window.fetch = (input, init) => String(input).includes('/catalog/games.json')
      ? Promise.resolve(new Response('[]', { headers: { 'Content-Type': 'application/json' } }))
      : original(input, init)
  })
}
