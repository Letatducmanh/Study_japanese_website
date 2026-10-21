import { expect, test } from '@playwright/test'

test('bài học: tab Từ vựng / Ngữ pháp / Kanji liên quan hiện đúng nội dung', async ({
  page,
}) => {
  await page.goto('/b/mnn1/1')
  await expect(
    page.getByRole('heading', { name: 'Từ vựng chính' }),
  ).toBeVisible()
  await expect(page.getByText('わたし').first()).toBeVisible()

  await page.getByRole('button', { name: 'Ngữ pháp' }).click()
  const firstPoint = page.getByText('1. N1 は N2 です')
  await expect(firstPoint).toBeVisible()
  await firstPoint.click()
  await page.getByRole('button', { name: 'Hiện bản dịch' }).first().click()
  await expect(page.getByText('N1 là N2')).toBeVisible()

  await page.getByRole('button', { name: 'Kanji liên quan' }).click()
  await expect(page.getByRole('link', { name: /人/ }).first()).toBeVisible()
})

test('giáo trình Kanji: xem danh sách chương và chi tiết một chữ', async ({
  page,
}) => {
  await page.goto('/b/kanji-master-n5')
  await page.getByRole('link', { name: '1', exact: true }).click()
  await expect(page).toHaveURL(/\/b\/kanji-master-n5\/1$/)

  await page.getByRole('link', { name: /一/ }).first().click()
  await expect(page).toHaveURL(/\/kanji\//)
  await expect(page.getByText('NHẤT', { exact: true })).toBeVisible()
  await expect(page.getByText('Từ vựng có chứa chữ này')).toBeVisible()
})

test('tìm kiếm theo kana và theo nghĩa không dấu đều ra 外国', async ({
  page,
}) => {
  await page.goto('/search')

  await page.getByPlaceholder('Tìm từ, Kanji, ngữ pháp...').fill('がいこく')
  await expect(page.getByRole('link', { name: /外国/ }).first()).toBeVisible()

  await page.getByPlaceholder('Tìm từ, Kanji, ngữ pháp...').fill('nuoc ngoai')
  await expect(page.getByRole('link', { name: /外国/ }).first()).toBeVisible()
})
