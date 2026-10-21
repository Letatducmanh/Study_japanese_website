import { expect, test } from '@playwright/test'

test('trang Cài đặt: xuất ra file và xóa tiến độ cần xác nhận', async ({
  page,
}) => {
  await page.goto('/settings')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Xuất tiến độ ra file' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(
    /^tien-do-\d{4}-\d{2}-\d{2}\.json$/,
  )
  await expect(page.getByText('Đã tải file sao lưu tiến độ.')).toBeVisible()

  await page.getByRole('button', { name: 'Xóa toàn bộ tiến độ' }).click()
  await expect(
    page.getByText('Xóa toàn bộ tiến độ trên máy này?'),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Hủy' }).click()
  await expect(page.getByText('Xóa toàn bộ tiến độ trên máy này?')).toHaveCount(
    0,
  )

  await page.getByRole('button', { name: 'Xóa toàn bộ tiến độ' }).click()
  await page.getByRole('button', { name: 'Xác nhận xóa' }).click()
  await expect(page.getByText('Đã xóa toàn bộ tiến độ.')).toBeVisible()
})
