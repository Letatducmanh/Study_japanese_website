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

interface LessonJson {
  vocab: { kana: string; kanji: string | null }[]
}

const HAN = /\p{Script=Han}/u

// Tập ký tự kana của cả bài; chuỗi đọc đúng phải chỉ gồm các ký tự này (không có chữ Hán).
async function lessonKanaChars(
  request: import('@playwright/test').APIRequestContext,
): Promise<Set<string>> {
  const data = (await (
    await request.get('/content/mnn1/l05.json')
  ).json()) as LessonJson
  return new Set(data.vocab.flatMap((v) => [...v.kana]))
}

function expectKana(text: string, kanaChars: Set<string>) {
  expect(text.length).toBeGreaterThan(0)
  expect(HAN.test(text), `"${text}" còn chữ Hán`).toBe(false)
  for (const ch of text) {
    expect(
      kanaChars.has(ch),
      `"${ch}" trong "${text}" không thuộc kana của bài`,
    ).toBe(true)
  }
}

async function startPractice(page: Page, directionLabel: string) {
  await page.goto('/b/mnn1/5')
  await page.getByRole('link', { name: 'Luyện tập bài này' }).click()
  await expect(page).toHaveURL(/\/practice\/setup/)
  // Mặc định Flashcard được chọn sẵn: bỏ chọn, chỉ chọn dạng cần thử.
  await page.getByRole('button', { name: 'Flashcard' }).click()
  await page.getByRole('button', { name: directionLabel }).click()
  await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click()
  await expect(page).toHaveURL(/\/practice\/run/)
  await expect(page.getByText(/^Câu \d+\/\d+$/)).toBeVisible()
}

test('Chính tả nghe: chuỗi tự đọc là kana, không chữ Hán', async ({
  page,
  request,
}) => {
  const kanaChars = await lessonKanaChars(request)
  await startPractice(page, 'Chính tả nghe')
  await expect.poll(async () => (await spoken(page)).length).toBeGreaterThan(0)
  expectKana((await spoken(page))[0], kanaChars)
})

test('Nghe → Nghĩa: tự đọc lúc mở là kana, không chữ Hán', async ({
  page,
  request,
}) => {
  const kanaChars = await lessonKanaChars(request)
  await startPractice(page, 'Nghe → Nghĩa')
  await expect.poll(async () => (await spoken(page)).length).toBeGreaterThan(0)
  expectKana((await spoken(page))[0], kanaChars)
})

test('Nhật → Nghĩa: mở câu không tự đọc; nút loa ở đề đọc kana', async ({
  page,
  request,
}) => {
  const kanaChars = await lessonKanaChars(request)
  await startPractice(page, 'Nhật → Nghĩa')
  expect(await spoken(page)).toEqual([])
  await page.getByRole('button', { name: 'Nghe phát âm' }).click()
  const texts = await spoken(page)
  expect(texts).toHaveLength(1)
  expectKana(texts[0], kanaChars)
})

test('Kanji → Cách đọc: ẩn loa trước khi chọn, sau khi chọn đọc kana', async ({
  page,
  request,
}) => {
  const kanaChars = await lessonKanaChars(request)
  await startPractice(page, 'Kanji → Cách đọc')
  const speakButton = page.getByRole('button', { name: 'Nghe phát âm' })
  await expect(speakButton).toHaveCount(0)
  expect(await spoken(page)).toEqual([])
  await page.locator('div.grid button').first().click()
  await speakButton.click()
  const texts = await spoken(page)
  expect(texts).toHaveLength(1)
  expectKana(texts[0], kanaChars)
})

const kanjiUrl = (char: string) => '/kanji/' + encodeURIComponent(char)

test('Trang Kanji 一: loa chữ đơn đọc "イチ、ひとつ"; ví dụ 一人 đọc "ひとり"', async ({
  page,
}) => {
  await page.goto(kanjiUrl('一'))
  const speakButtons = page.getByRole('button', { name: 'Nghe phát âm' })
  await expect(speakButtons.first()).toBeVisible()
  await speakButtons.first().click()
  expect(await spoken(page)).toContain('イチ、ひとつ')

  const example = page.locator('li').filter({ hasText: 'ひとり' }).first()
  await example.getByRole('button', { name: 'Nghe phát âm' }).click()
  expect(await spoken(page)).toContain('ひとり')
})

test('Trang Kanji 十: loa ở ví dụ 十分 đọc "じゅっぷん"', async ({ page }) => {
  await page.goto(kanjiUrl('十'))
  const example = page.locator('li').filter({ hasText: 'じゅっぷん' }).first()
  await expect(example).toBeVisible()
  await example.getByRole('button', { name: 'Nghe phát âm' }).click()
  expect(await spoken(page)).toContain('じゅっぷん')
})

test('Trang Kanji 何: loa ở ví dụ 何 đọc "なに"', async ({ page }) => {
  await page.goto(kanjiUrl('何'))
  const example = page.locator('li').filter({ hasText: 'なに, なん' }).first()
  await expect(example).toBeVisible()
  await example.getByRole('button', { name: 'Nghe phát âm' }).click()
  expect(await spoken(page)).toContain('なに')
})

test('Trang Kanji 上: loa chữ đơn đọc "ジョウ、うえ"', async ({ page }) => {
  await page.goto(kanjiUrl('上'))
  const button = page.getByRole('button', { name: 'Nghe phát âm' }).first()
  await expect(button).toBeVisible()
  await button.click()
  expect(await spoken(page)).toContain('ジョウ、うえ')
})

test('Trang Kanji 行: loa chữ đơn đọc "コウ、いく"', async ({ page }) => {
  await page.goto(kanjiUrl('行'))
  const button = page.getByRole('button', { name: 'Nghe phát âm' }).first()
  await expect(button).toBeVisible()
  await button.click()
  expect(await spoken(page)).toContain('コウ、いく')
})

test('Ngữ pháp Bài 1: câu "あの 方" được đọc là "あの かた", chữ hiển thị không đổi', async ({
  page,
}) => {
  await page.goto('/b/mnn1/1')
  await page.getByRole('button', { name: 'Ngữ pháp' }).click()
  // Ví dụ nằm trong thẻ <details> đang thu gọn: mở thẻ chứa nó trước.
  const point = page
    .locator('details')
    .filter({ hasText: 'あの 方は どなたですか。' })
    .first()
  await point.locator('summary').click()
  const card = point
    .locator('div.rounded-md')
    .filter({ hasText: 'あの 方は どなたですか。' })
    .first()
  await expect(card).toContainText('あの 方は どなたですか。')
  await card.getByRole('button', { name: 'Nghe phát âm' }).click()
  expect(await spoken(page)).toContain(
    'あの かたは どなたですか。 ワット先生です。',
  )
  await expect(card).toContainText('あの 方は どなたですか。')
})
