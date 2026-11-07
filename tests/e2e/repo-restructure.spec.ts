import { expect, test } from '@playwright/test'

// Feature 001-repo-restructure: website phải mở được như cũ ở màn hình điện thoại (360×740).
test.use({ viewport: { width: 360, height: 740 } })

test('360×740: trang chủ hiện nội dung chính', async ({ page }) => {
  await page.goto('/')
  // Không kiểm heading cụ thể: tiêu đề hero đổi theo bài đang học.
  await expect(page.locator('main')).toContainText('Hôm nay của bạn')
  await expect(page.getByRole('link', { name: 'Bắt đầu học' })).toBeVisible()
})

test('360×740: mở thẳng /b/mnn1/5 hiện bài học, không 404', async ({ page }) => {
  await page.goto('/b/mnn1/5')
  await expect(page.getByText('Không tìm thấy trang')).toHaveCount(0)
  await expect(page.getByText('Luyện tập bài này')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Từ vựng chính' }),
  ).toBeVisible()
})
