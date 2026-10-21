import fs from 'node:fs'
import { expect, test } from '@playwright/test'

test('flashcard: học hết Bài 1 và lưu tiến độ mastery > 0', async ({
  page,
}) => {
  await page.goto('/b/mnn1/1')
  await page.getByRole('link', { name: 'Luyện tập bài này' }).click()
  await expect(page).toHaveURL(/\/practice\/setup/)

  // Flashcard được chọn mặc định — không cần bấm chọn lại.
  await expect(page.getByRole('button', { name: 'Flashcard' })).toHaveClass(
    /bg-primary-600/,
  )
  await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click()
  await expect(page).toHaveURL(/\/practice\/run/)

  for (let i = 0; i < 40; i++) {
    if (/\/practice\/result\//.test(page.url())) break
    await page.getByRole('button', { name: /Bấm hoặc nhấn Space/ }).click()
    await page.getByRole('button', { name: 'Nhớ' }).click()
  }

  await expect(page).toHaveURL(/\/practice\/result\//)
  await expect(page.getByText('34/34')).toBeVisible()

  // Tải lại trang để chắc chắn tiến độ đã lưu vào IndexedDB, không chỉ còn trong bộ nhớ.
  await page.reload()
  await page.goto('/settings')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Xuất tiến độ ra file' }).click()
  const download = await downloadPromise
  const filePath = await download.path()
  const data = JSON.parse(fs.readFileSync(filePath!, 'utf-8')) as {
    attempts: unknown[]
    mastery: { score: number }[]
  }

  expect(data.attempts).toHaveLength(34)
  expect(data.mastery.some((m) => m.score > 0)).toBe(true)
})
