import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test'

// Hiến pháp IV: e2e ở viewport 360×740. Spec 005, Story 2: bấm từ ở kết quả tìm kiếm
// thì mở trang bài ở tab Từ vựng, cuộn tới đúng hàng và tô sáng hàng đó.
test.use({ viewport: { width: 360, height: 740 } })

interface Word {
  id: string
  romaji: string
  section: 'main' | 'extended'
}
interface LessonJson {
  title: string
  vocab: Word[]
}

const loadLesson = async (
  request: APIRequestContext,
  lesson: string,
): Promise<LessonJson> =>
  (await (await request.get(`/content/mnn1/${lesson}.json`)).json()) as LessonJson

/** Truy vấn tìm kiếm cho một từ: romaji bỏ dấu, chữ thường (như chỉ mục tìm kiếm). */
const queryOf = (romaji: string) =>
  romaji
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const lessonOf = (id: string) => Number(/-l(\d+)-/.exec(id)?.[1])

/** Gõ truy vấn ở /search và bấm thân hàng của đúng từ (tìm theo ID trong địa chỉ liên kết). */
async function openFromSearch(page: Page, word: Word, via?: 'topbar') {
  if (via === 'topbar') {
    await page.getByRole('link', { name: 'Tìm từ, Kanji, ngữ pháp...' }).click()
  } else {
    await page.goto('/search')
  }
  const query = queryOf(word.romaji)
  await page.getByRole('searchbox').pressSequentially(query, { delay: 40 })
  const link = page.locator(`a[href*="word=${word.id}"]`)
  await expect(
    link,
    `kết quả của "${query}" phải có liên kết mang word=${word.id}`,
  ).toHaveCount(1)
  await link.click()
  return query
}

/** Đo hình học của hàng so với khung nhìn và hai thanh cố định (không dùng số px cứng). */
async function measure(page: Page, id: string) {
  return page.evaluate((wordId) => {
    const row = document.getElementById(`vocab-${wordId}`)
    if (!row) return { ok: false, reason: 'không có hàng' }
    const r = row.getBoundingClientRect()
    const headerBottom =
      document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
    const nav = document.querySelector('nav.sticky')
    const navTop = nav ? nav.getBoundingClientRect().top : window.innerHeight
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    const checks = {
      inViewport: r.top >= 0 && r.bottom <= window.innerHeight,
      belowHeader: r.top >= headerBottom,
      aboveNav: r.bottom <= navTop,
      notCovered: !!hit && row.contains(hit),
    }
    return {
      ok: Object.values(checks).every(Boolean),
      checks,
      top: r.top,
      bottom: r.bottom,
      headerBottom,
      navTop,
    }
  }, id)
}

/** Từ đã được nhảy tới: đúng địa chỉ, tab Từ vựng, hàng tô sáng bằng viền + nhãn chữ, nằm trong khung nhìn. */
async function expectJumped(page: Page, id: string) {
  await expect(page).toHaveURL(
    new RegExp(`/b/mnn1/${lessonOf(id)}\\?tab=vocab&word=${id}$`),
  )
  const row = page.locator(`#vocab-${id}`)
  await expect(row).toHaveAttribute('aria-current', 'true')
  await expect(row).toContainText('Từ vừa tìm')
  // Viền trái ≥ 4 px (tín hiệu không chỉ dựa vào màu); đọc kích thước, không so mã màu.
  const border = await row.evaluate((el) =>
    parseFloat(getComputedStyle(el).borderLeftWidth),
  )
  expect(border).toBeGreaterThanOrEqual(4)
  // Cuộn tức thì nhưng bố cục (phông chữ) có thể còn đổi nhịp đầu: chờ tới khi đạt.
  await expect
    .poll(() => measure(page, id), { message: `hàng ${id} phải nằm trong khung nhìn, không bị thanh che` })
    .toMatchObject({ ok: true })
}

test('từ đầu Bài 1: nhảy tới, tô sáng, nằm trong khung nhìn', async ({ page, request }) => {
  const word = (await loadLesson(request, 'l01')).vocab.find((v) => v.section === 'main')!
  await openFromSearch(page, word)
  await expectJumped(page, word.id)
})

test('từ giữa Bài 13: nhảy tới, tô sáng, nằm trong khung nhìn', async ({ page, request }) => {
  const main = (await loadLesson(request, 'l13')).vocab.filter((v) => v.section === 'main')
  const word = main[Math.floor(main.length / 2)]
  await openFromSearch(page, word)
  await expectJumped(page, word.id)
})

test('từ cuối Bài 13 (từ mở rộng, sát thanh dưới): nhảy tới, không bị thanh che', async ({
  page,
  request,
}) => {
  const vocab = (await loadLesson(request, 'l13')).vocab
  const word = vocab[vocab.length - 1]
  expect(word.section).toBe('extended')
  await openFromSearch(page, word)
  await expectJumped(page, word.id)
})

test('từ mở rộng đầu tiên của Bài 13: nhảy tới, tô sáng', async ({ page, request }) => {
  const word = (await loadLesson(request, 'l13')).vocab.find((v) => v.section === 'extended')!
  await openFromSearch(page, word)
  await expectJumped(page, word.id)
})

test('từ trùng cách đọc 佐藤 (Bài 2) và 砂糖 (Bài 14): mỗi lần tô sáng đúng hàng được bấm', async ({
  page,
}) => {
  const first: Word = { id: 'mnn1-l02-b23ffe1b', romaji: 'sato', section: 'extended' }
  const second: Word = { id: 'mnn1-l14-97deba9a', romaji: 'sato', section: 'main' }

  const query = await openFromSearch(page, first)
  await expectJumped(page, first.id)
  await expect(page.locator('[aria-current="true"]')).toHaveCount(1)

  await page.goBack()
  await expect(page).toHaveURL(new RegExp(`/search\\?q=${query}$`))
  await page.locator(`a[href*="word=${second.id}"]`).click()
  await expectJumped(page, second.id)
  await expect(page.locator('[aria-current="true"]')).toHaveCount(1)
  await expect(page.locator(`#vocab-${first.id}`)).toHaveCount(0)
})

test('đang ở tab Ngữ pháp rồi tìm và bấm một từ của Bài 13: mở tab Từ vựng', async ({
  page,
  request,
}) => {
  const main = (await loadLesson(request, 'l13')).vocab.filter((v) => v.section === 'main')
  const word = main[Math.floor(main.length / 2)]

  await page.goto('/b/mnn1/13')
  await page.getByRole('button', { name: 'Ngữ pháp' }).click()
  await openFromSearch(page, word, 'topbar')
  await expectJumped(page, word.id)
})

test('F5 ở trang bài sau khi nhảy: cho kết quả giống lần đầu', async ({ page, request }) => {
  const vocab = (await loadLesson(request, 'l13')).vocab
  const word = vocab[vocab.length - 1]
  await openFromSearch(page, word)
  await expectJumped(page, word.id)

  await page.reload()
  await expectJumped(page, word.id)
})

test('Quay lại về trang tìm kiếm với từ khóa cũ và danh sách cũ', async ({ page, request }) => {
  const vocab = (await loadLesson(request, 'l13')).vocab
  const word = vocab[vocab.length - 1]
  const query = await openFromSearch(page, word)
  await expectJumped(page, word.id)

  await page.goBack()
  await expect(page).toHaveURL(new RegExp(`/search\\?q=${query.replace(/ /g, '(?:%20|\\+)')}$`))
  await expect(page.getByRole('searchbox')).toHaveValue(query)
  await expect(page.locator('li a[href^="/b/mnn1/"]').first()).toBeVisible()
})

test('[đặc trưng] ID không còn trong bài: trang bài mở bình thường, không tô sáng, không lỗi', async ({
  page,
  request,
}) => {
  const lesson = await loadLesson(request, 'l13')
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`)
  })

  await page.goto('/b/mnn1/13?tab=vocab&word=khong-co')

  await expect(page.locator('h1')).toContainText(lesson.title)
  // Danh sách từ dựng bình thường (nhận bằng <li>, không phụ thuộc id hàng mới).
  await expect(page.locator('main ul li').first()).toBeVisible()
  await expect(page.locator('[aria-current="true"]')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('giảm chuyển động: vẫn tới ngay đúng hàng và tô sáng', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const vocab = (await loadLesson(request, 'l13')).vocab
  const word = vocab[vocab.length - 1]
  await openFromSearch(page, word)
  await expectJumped(page, word.id)
})
