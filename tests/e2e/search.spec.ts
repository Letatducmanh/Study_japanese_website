import { expect, test } from '@playwright/test'

// Hiến pháp IV: e2e ở viewport 360×740.
test.use({ viewport: { width: 360, height: 740 } })

const resultLinks = (page: import('@playwright/test').Page) =>
  page.locator('li a[href^="/b/mnn1/"]')

test('tìm "sinh vien": tối đa 3 kết quả và mục đầu là 学生', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('searchbox').pressSequentially('sinh vien', { delay: 40 })

  await expect(resultLinks(page).first()).toContainText('学生')
  const count = await resultLinks(page).count()
  expect(count).toBeGreaterThan(0)
  expect(count).toBeLessThanOrEqual(3)
})

test('tìm "nhat ban": tối đa 3 kết quả và mục đầu là 日本', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('searchbox').pressSequentially('nhat ban', { delay: 40 })

  await expect(resultLinks(page).first()).toContainText('日本')
  expect(await resultLinks(page).count()).toBeLessThanOrEqual(3)
})

test('một ký tự "a" không ra danh sách kết quả', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('searchbox').pressSequentially('a', { delay: 40 })

  await expect(page.getByText('Không tìm thấy kết quả.')).toBeVisible()
  await expect(resultLinks(page)).toHaveCount(0)
})

test('tìm "gakusei": mục đầu là 学生; không cuộn ngang ở 360px', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('searchbox').pressSequentially('gakusei', { delay: 40 })

  await expect(resultLinks(page).first()).toContainText('学生')

  const scrollWidth = await page.evaluate(
    () => document.scrollingElement?.scrollWidth ?? 0,
  )
  expect(scrollWidth).toBeLessThanOrEqual(360)
})
