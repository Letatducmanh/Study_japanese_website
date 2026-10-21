import { expect, test, type Page } from '@playwright/test'

interface VocabJson {
  kana: string
  kanji: string | null
  meaning: string
}

async function answerOneQuestion(
  page: Page,
  keyToMeaning: Map<string, string>,
  wantCorrect: boolean,
) {
  await expect(page.getByText(/^Câu \d+\/\d+$/)).toBeVisible()

  const key =
    (
      await page
        .locator('.flex.items-center.gap-2 .text-3xl')
        .first()
        .textContent()
    )?.trim() ?? ''
  const correctMeaning = keyToMeaning.get(key)
  expect(correctMeaning, `không tìm thấy nghĩa cho "${key}"`).toBeTruthy()

  const choiceButtons = page.locator('div.grid button')
  const count = await choiceButtons.count()
  let targetIndex = -1
  for (let i = 0; i < count; i++) {
    const text = (await choiceButtons.nth(i).textContent()) ?? ''
    const meaning = text.slice(0, -1)
    const isCorrect = meaning === correctMeaning
    if (wantCorrect === isCorrect) {
      targetIndex = i
      break
    }
  }
  expect(
    targetIndex,
    'không tìm được nút đáp án phù hợp',
  ).toBeGreaterThanOrEqual(0)

  await choiceButtons.nth(targetIndex).click()
  await page.getByRole('button', { name: 'Tiếp theo (Enter)' }).click()
}

test('trắc nghiệm Nhật → Nghĩa: sai 2/10, Làm lại câu sai đúng 2 câu', async ({
  page,
  request,
}) => {
  const lessonData = (await (
    await request.get('/content/mnn1/l05.json')
  ).json()) as { vocab: VocabJson[] }

  const keyToMeaning = new Map<string, string>()
  for (const v of lessonData.vocab) {
    const base = v.kanji ?? v.kana
    const reading = v.kanji ? v.kana : ''
    keyToMeaning.set(base + reading, v.meaning)
  }

  await page.goto('/b/mnn1/5')
  await page.getByRole('link', { name: 'Luyện tập bài này' }).click()
  await expect(page).toHaveURL(/\/practice\/setup/)

  // Mặc định Flashcard được chọn sẵn — bỏ chọn, chỉ chọn "Nhật → Nghĩa".
  await page.getByRole('button', { name: 'Flashcard' }).click()
  await page.getByRole('button', { name: 'Nhật → Nghĩa' }).click()
  await page.getByRole('button', { name: '10', exact: true }).click()
  await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click()
  await expect(page).toHaveURL(/\/practice\/run/)

  for (let i = 0; i < 10; i++) {
    const wantCorrect = i !== 2 && i !== 5
    await answerOneQuestion(page, keyToMeaning, wantCorrect)
  }

  await expect(page).toHaveURL(/\/practice\/result\//)
  await expect(page.getByText('8/10')).toBeVisible()
  await expect(page.locator('ul > li')).toHaveCount(2)

  await page.getByRole('button', { name: 'Làm lại câu sai' }).click()
  await expect(page).toHaveURL(/\/practice\/run/)

  for (let i = 0; i < 2; i++) {
    await answerOneQuestion(page, keyToMeaning, true)
  }

  await expect(page).toHaveURL(/\/practice\/result\//)
  await expect(page.getByText('2/2')).toBeVisible()
})
