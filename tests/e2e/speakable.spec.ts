import { expect, test, type Page } from '@playwright/test'

// Nút loa chỉ hiện khi trình duyệt có giọng tiếng Nhật. Headless (Linux CI) không có,
// nên giả speechSynthesis với đủ năm phương thức mà tts.ts/SpeakButton dùng
// (và giả cả SpeechSynthesisUtterance, xem bên dưới).
test.use({ viewport: { width: 360, height: 740 } })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __spoken: string[] }
    w.__spoken = []
    const fake = {
      speak: (u: { text: string }) => w.__spoken.push(u.text),
      cancel: () => {},
      getVoices: () => [{ lang: 'ja-JP', name: 'Giả' }],
      addEventListener: () => {},
      removeEventListener: () => {},
    }
    // Chrome từ chối gán giọng giả vào utterance thật (TypeError), nên giả cả lớp này.
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
      value: fake,
    })
  })
})

const speakButton = (page: Page) =>
  page.getByRole('button', { name: 'Nghe phát âm' })

async function startMcq(page: Page, directionLabel: string) {
  await page.goto('/b/mnn1/5')
  await page.getByRole('link', { name: 'Luyện tập bài này' }).click()
  await expect(page).toHaveURL(/\/practice\/setup/)
  // Mặc định Flashcard được chọn sẵn: bỏ chọn, chỉ chọn một hướng trắc nghiệm.
  await page.getByRole('button', { name: 'Flashcard' }).click()
  await page.getByRole('button', { name: directionLabel }).click()
  await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click()
  await expect(page).toHaveURL(/\/practice\/run/)
  await expect(page.getByText(/^Câu \d+\/\d+$/)).toBeVisible()
}

test('[đặc trưng] câu ngữ pháp hỏi–đáp: giọng đọc nhận chuỗi đã làm sạch', async ({
  page,
}) => {
  await page.goto('/b/mnn1/1')
  await page.getByRole('button', { name: 'Ngữ pháp' }).click()
  // Ví dụ nằm trong thẻ <details> đang thu gọn: mở thẻ chứa nó trước.
  const point = page
    .locator('details')
    .filter({ hasText: 'ミラーさんは アメリカ人ですか。' })
    .filter({ hasText: 'はい、アメリカ人です。' })
    .first()
  await point.locator('summary').click()
  const card = point
    .locator('div.rounded-md')
    .filter({ hasText: 'ミラーさんは アメリカ人ですか。' })
    .filter({ hasText: 'はい、アメリカ人です。' })
    .first()
  await card.getByRole('button', { name: 'Nghe phát âm' }).click()
  const spoken = await page.evaluate(
    () => (window as unknown as { __spoken: string[] }).__spoken,
  )
  expect(spoken).toContain(
    'ミラーさんは アメリカ人ですか。 はい、アメリカ人です。',
  )
})

test('mcq-vi-jp (Nghĩa → Nhật): đề tiếng Việt không có nút loa', async ({
  page,
}) => {
  await startMcq(page, 'Nghĩa → Nhật')
  await expect(speakButton(page)).toHaveCount(0)
})

test('[đặc trưng] mcq-jp-vi (Nhật → Nghĩa): đề có nút loa (chống xanh giả)', async ({
  page,
}) => {
  await startMcq(page, 'Nhật → Nghĩa')
  await expect(speakButton(page)).toHaveCount(1)
})

test('mcq-vi-kanji (Nghĩa → Kanji): đề tiếng Việt không có nút loa', async ({
  page,
}) => {
  await startMcq(page, 'Nghĩa → Kanji')
  await expect(speakButton(page)).toHaveCount(0)
})

test('mcq-kanji-reading (Kanji → Cách đọc): ẩn nút loa trước khi chọn, hiện sau khi chọn', async ({
  page,
}) => {
  await startMcq(page, 'Kanji → Cách đọc')
  await expect(speakButton(page)).toHaveCount(0)
  await page.locator('div.grid button').first().click()
  await expect(speakButton(page)).toHaveCount(1)
})
