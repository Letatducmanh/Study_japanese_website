import { expect, test, type APIRequestContext, type Page } from '@playwright/test'

// Hiến pháp IV: e2e ở viewport 360×740.
test.use({ viewport: { width: 360, height: 740 } })

/** Mở trang chủ để Dexie tạo CSDL `progress`, rồi đợi CSDL có thật. */
async function ensureProgressDb(page: Page) {
  await page.goto('/')
  await expect
    .poll(() =>
      page.evaluate(async () =>
        (await indexedDB.databases()).some((d) => d.name === 'progress'),
      ),
    )
    .toBe(true)
}

async function vocabIds(
  request: APIRequestContext,
  lesson: number,
  count: number,
): Promise<string[]> {
  const res = await request.get(`/content/mnn1/l${String(lesson).padStart(2, '0')}.json`)
  const json = (await res.json()) as { vocab: { id: string }[] }
  return json.vocab.slice(0, count).map((v) => v.id)
}

/** Ghi thẳng vào object store của IndexedDB (cùng lược đồ với `dexie-repo.ts`). */
async function seed(
  page: Page,
  data: { mastery?: object[]; mistakes?: object[] },
) {
  await page.evaluate(
    (payload) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('progress')
        open.onerror = () => reject(open.error)
        open.onsuccess = () => {
          const db = open.result
          const stores = ['mastery', 'mistakes']
          const tx = db.transaction(stores, 'readwrite')
          for (const m of payload.mastery ?? []) tx.objectStore('mastery').put(m)
          for (const m of payload.mistakes ?? []) tx.objectStore('mistakes').put(m)
          tx.oncomplete = () => {
            db.close()
            resolve()
          }
          tx.onerror = () => reject(tx.error)
        }
      }),
    data,
  )
}

const weakRow = (itemId: string) => ({
  itemId,
  skill: 'meaning',
  score: 0.2,
  attempts: 3,
  streak: 0,
  lastTs: Date.now(),
})

test('Điểm yếu → Luyện ngay: 9 từ yếu ở 3 bài thành phiên 9 câu', async ({
  page,
  request,
}) => {
  await ensureProgressDb(page)
  const ids = [
    ...(await vocabIds(request, 3, 3)),
    ...(await vocabIds(request, 5, 3)),
    ...(await vocabIds(request, 8, 3)),
  ]
  expect(ids).toHaveLength(9)
  await seed(page, { mastery: ids.map(weakRow) })

  await page.goto('/weak')
  await page.getByRole('button', { name: 'Luyện ngay 20 câu yếu nhất' }).click()

  await expect(page).toHaveURL(/\/practice\/run$/)
  // trước khi sửa: chỉ lấy từ của một bài → "Câu 1/3"
  await expect(page.getByText('Câu 1/9')).toBeVisible()

  const scrollWidth = await page.evaluate(
    () => document.scrollingElement?.scrollWidth ?? 0,
  )
  expect(scrollWidth).toBeLessThanOrEqual(360)
})

test('Sổ lỗi sai → Ôn lại một từ: phiên 1 câu chạy được', async ({
  page,
  request,
}) => {
  await ensureProgressDb(page)
  const [id] = await vocabIds(request, 3, 1)
  await seed(page, {
    mastery: [weakRow(id!)],
    mistakes: [{ itemId: id, addedTs: Date.now(), correctStreak: 0 }],
  })

  await page.goto('/mistakes')
  await page.getByRole('button', { name: 'Ôn lại' }).click()

  await expect(page).toHaveURL(/\/practice\/run$/)
  await expect(page.getByText('Câu 1/1')).toBeVisible()
})
