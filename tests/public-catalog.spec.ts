import { expect, test } from '@playwright/test'

test('publishes only the rights-approved catalog set', async ({ request }) => {
  const response = await request.get('/catalog/games.json')
  expect(response.ok()).toBe(true)
  const catalog = await response.json()
  expect(catalog).toHaveLength(6)
  expect(catalog.map((entry: { id: string }) => entry.id)).toContain('pokemon-fire-red')
})
