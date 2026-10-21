import { expect, test } from '@playwright/test'

test('mở trang chủ → vào N5 → Minna no Nihongo 1 → Bài 1', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Tự học tiếng Nhật cùng Mạnh' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Bắt đầu học' }).click()
  await expect(page).toHaveURL(/\/n$/)

  await page.getByRole('link', { name: 'JLPT N5' }).click()
  await expect(page).toHaveURL(/\/n\/N5$/)

  await page.getByRole('link', { name: 'Minna no Nihongo 1' }).click()
  await expect(page).toHaveURL(/\/b\/mnn1$/)

  await page.getByRole('link', { name: '1', exact: true }).click()
  await expect(page).toHaveURL(/\/b\/mnn1\/1$/)
  await expect(
    page.getByRole('heading', { name: 'Từ vựng chính' }),
  ).toBeVisible()
})

test('mở thẳng /b/mnn1/5 không bị 404', async ({ page }) => {
  await page.goto('/b/mnn1/5')
  await expect(page.getByText('Không tìm thấy trang')).toHaveCount(0)
  await expect(page.getByText('Luyện tập bài này')).toBeVisible()
})

test('đường dẫn không tồn tại hiện trang 404', async ({ page }) => {
  await page.goto('/duong-dan-khong-ton-tai')
  await expect(page.getByText('Không tìm thấy trang')).toBeVisible()
})
