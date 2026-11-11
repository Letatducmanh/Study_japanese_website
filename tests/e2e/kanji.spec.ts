import { expect, test } from '@playwright/test'

// Hiến pháp IV: e2e ở viewport 360×740.
test.use({ viewport: { width: 360, height: 740 } })

test('Kanji 行: hiện hai cụm Hán Việt và hai nghĩa đúng nguyên văn nguồn', async ({
  page,
}) => {
  await page.goto('/kanji/' + encodeURIComponent('行'))

  await expect(page.getByText('HÀNH / HÀNG', { exact: true })).toBeVisible()
  const meaning = page.getByText('đi; tiến hành / hàng, dòng', { exact: true })
  await expect(meaning).toBeVisible()
  // không còn dấu ngoặc đóng lẻ ở dòng nghĩa
  await expect(meaning).not.toContainText(')')
  await expect(meaning).not.toContainText('(')

  // không cuộn ngang ở 360px
  const scrollWidth = await page.evaluate(
    () => document.scrollingElement?.scrollWidth ?? 0,
  )
  expect(scrollWidth).toBeLessThanOrEqual(360)
})

test('Kanji 長: hai cụm Hán Việt TRƯỜNG / TRƯỞNG', async ({ page }) => {
  await page.goto('/kanji/' + encodeURIComponent('長'))

  await expect(
    page.getByText('TRƯỜNG / TRƯỞNG', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('dài / người đứng đầu', { exact: true }),
  ).toBeVisible()
})
