import { expect, test, type Page } from '@playwright/test'

// Nút loa chỉ hiện khi trình duyệt có giọng tiếng Nhật; headless (Linux CI) không có.
// Giả `speechSynthesis` đủ năm phương thức mà tts.ts/SpeakButton dùng, và giả cả
// `SpeechSynthesisUtterance` vì Chrome từ chối gán giọng giả vào utterance thật (TypeError).
test.use({ viewport: { width: 360, height: 740 } })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __spoken: string[] }
    w.__spoken = []
    class FakeUtterance {
      lang = ''
      rate = 1
      voice: unknown = null
      constructor(public text: string) {}
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: FakeUtterance,
    })
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: (u: { text: string }) => w.__spoken.push(u.text),
        cancel: () => {},
        getVoices: () => [{ lang: 'ja-JP', name: 'Giả' }],
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    })
  })
})

const spoken = (page: Page) =>
  page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken)

test('Từ vựng Bài 1: loa ở "～人" đọc "じん", chữ hiển thị vẫn là "～人"', async ({
  page,
}) => {
  await page.goto('/b/mnn1/1')
  const row = page.locator('li').filter({ hasText: '～人' }).first()
  await expect(row).toBeVisible()
  await expect(row).toContainText('～人')
  await row.getByRole('button', { name: 'Nghe phát âm' }).click()
  expect(await spoken(page)).toContain('じん')
  await expect(row).toContainText('～人')
})
