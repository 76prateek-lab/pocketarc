import { expect, test } from '@playwright/test'

test('serves direct application routes without replacing static runtime assets', async ({ page, request }) => {
  for (const route of ['/game/nonexistent', '/play/nonexistent']) {
    const response = await page.goto(route)
    expect(response?.status()).toBe(200)
    await expect(page.locator('#root')).toBeAttached()
    await expect(page.getByText(/not found|unavailable/i).first()).toBeVisible()
  }

  for (const route of ['/about', '/terms', '/privacy']) {
    const response = await page.goto(route)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }

  const runtime = await request.get('/emulatorjs/frame.html')
  expect(runtime.status()).toBe(200)
  expect(runtime.headers()['content-type']).toContain('text/html')
  expect(await runtime.text()).toContain("window.EJS_core = 'gba'")

  const loader = await request.get('/emulatorjs/data/loader.js')
  expect(loader.status()).toBe(200)
  expect(loader.headers()['content-type']).toContain('javascript')
  expect(await loader.text()).toContain('EJS_gameUrl')

  const metadata = await request.get('/emulatorjs/data/version.json')
  expect(metadata.status()).toBe(200)
  expect(metadata.headers()['content-type']).toContain('application/json')

  const wasm = await request.get('/emulatorjs/data/compression/libunrar.wasm')
  expect(wasm.status()).toBe(200)
  expect(wasm.headers()['content-type']).toContain('application/wasm')
  const bytes = await wasm.body()
  expect([...bytes.subarray(0, 4)]).toEqual([0, 97, 115, 109])
})
