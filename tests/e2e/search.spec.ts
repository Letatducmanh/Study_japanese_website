import { expect, test } from '@playwright/test'

// Hiến pháp IV: e2e ở viewport 360×740.
test.use({ viewport: { width: 360, height: 740 } })

const resultLinks = (page: import('@playwright/test').Page) =>
  page.locator('li a[href^="/b/mnn1/"]')

test('tìm "sinh vien": tối đa 3 kết quả và mục đầu là 学生', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('searchbox').pressSequentially('sinh vien', { delay: 40 })

  await expect(resultLinks(page).first()).toContainText('学生')
  const count = await resultLinks(page).count()
  expect(count).toBeGreaterThan(0)
  expect(count).toBeLessThanOrEqual(3)
})

test('tìm "nhat ban": tối đa 3 kết quả và mục đầu là 日本', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('searchbox').pressSequentially('nhat ban', { delay: 40 })

  await expect(resultLinks(page).first()).toContainText('日本')
  expect(await resultLinks(page).count()).toBeLessThanOrEqual(3)
})

test('một ký tự "a" không ra danh sách kết quả', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('searchbox').pressSequentially('a', { delay: 40 })

  await expect(page.getByText('Không tìm thấy kết quả.')).toBeVisible()
  await expect(resultLinks(page)).toHaveCount(0)
})

test('tìm "gakusei": mục đầu là 学生; không cuộn ngang ở 360px', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('searchbox').pressSequentially('gakusei', { delay: 40 })

  await expect(resultLinks(page).first()).toContainText('学生')

  const scrollWidth = await page.evaluate(
    () => document.scrollingElement?.scrollWidth ?? 0,
  )
  expect(scrollWidth).toBeLessThanOrEqual(360)
})

// ---- Spec 005, Story 1: bấm loa ở kết quả chỉ phát âm, không chuyển trang ----

test.describe('bấm loa ở kết quả (spec 005)', () => {
  // Truy vấn nhiều kết quả (đo bằng đúng tùy chọn của searchVocab: `kimasu` ra 16 kết quả)
  // để trang cuộn được ở 360×740. `gakusei` chỉ ra 1 kết quả nên không dùng.
  const QUERY = 'kimasu'
  const HAN = /\p{Script=Han}/u
  const SEARCH_URL = /\/search\?q=kimasu$/

  // Nút loa chỉ hiện khi trình duyệt có giọng tiếng Nhật; headless không có, nên giả
  // (cùng cách tests/e2e/kana-speech.spec.ts).
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

  type Page = import('@playwright/test').Page

  const spoken = (page: Page) =>
    page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken)
  const scrollY = (page: Page) => page.evaluate(() => window.scrollY)
  const speakButtons = (page: Page) =>
    page.getByRole('button', { name: 'Nghe phát âm' })

  /** Gõ truy vấn, chờ kết quả (điều kiện (i): ≥ 5 kết quả). */
  async function search(page: Page) {
    await page.goto('/search')
    await page.getByRole('searchbox').pressSequentially(QUERY, { delay: 40 })
    await expect
      .poll(() => resultLinks(page).count(), { message: 'cần ≥ 5 kết quả' })
      .toBeGreaterThanOrEqual(5)
  }

  /**
   * Điều kiện tiên quyết trước khi bấm loa: (ii) trang cuộn được; (iii) đã cuộn xuống
   * một đoạn (scrollY > 0). Không đạt thì test đỏ ở đây, không được bỏ qua.
   */
  async function scrollDown(page: Page) {
    const scrollable = await page.evaluate(() => {
      const el = document.scrollingElement as Element
      return el.scrollHeight > el.clientHeight
    })
    expect(scrollable, 'trang phải cuộn được ở 360×740').toBe(true)
    await page.evaluate(() => window.scrollTo(0, 300))
    await expect
      .poll(() => scrollY(page), { message: 'phải đã cuộn xuống (scrollY > 0)' })
      .toBeGreaterThan(0)
  }

  /** Các nút loa nằm trọn trong khung nhìn giữa thanh trên và thanh dưới. */
  async function visibleSpeakButtons(page: Page) {
    const header = await page.locator('header').first().boundingBox()
    const nav = await page.locator('nav.sticky').last().boundingBox()
    const top = header ? header.y + header.height : 0
    const bottom = nav ? nav.y : 740
    const visible: { index: number; x: number; y: number }[] = []
    const count = await speakButtons(page).count()
    for (let index = 0; index < count; index++) {
      const box = await speakButtons(page).nth(index).boundingBox()
      if (box && box.y >= top && box.y + box.height <= bottom) {
        visible.push({
          index,
          x: box.x + box.width / 2,
          y: box.y + box.height / 2,
        })
      }
    }
    return visible
  }

  function watchErrors(page: Page) {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console.error: ${m.text()}`)
    })
    return errors
  }

  test('ca 1: bấm loa ở một kết quả, vẫn ở /search, giữ từ khóa, danh sách và vị trí cuộn', async ({
    page,
  }) => {
    await search(page)
    await scrollDown(page)

    const visible = await visibleSpeakButtons(page)
    expect(visible.length).toBeGreaterThan(0)
    const target = visible[0]
    const resultCount = await resultLinks(page).count()
    const baseline = await scrollY(page)
    expect(baseline).toBeGreaterThan(0)

    // Bấm bằng chuột ở tâm nút (không dùng locator.click() để Playwright không tự cuộn).
    await page.mouse.click(target.x, target.y)

    await expect(page).toHaveURL(SEARCH_URL)
    await expect(page.getByRole('searchbox')).toHaveValue(QUERY)
    expect(await resultLinks(page).count()).toBe(resultCount)
    expect(await scrollY(page)).toBe(baseline)
    const said = await spoken(page)
    expect(said).toHaveLength(1)
    expect(said[0]).not.toBe('')
    expect(said[0]).not.toMatch(HAN)
  })

  test('ca 2: bấm loa liên tiếp ở năm kết quả khác nhau, không chuyển trang, không lỗi', async ({
    page,
  }) => {
    await search(page)
    await scrollDown(page)

    const visible = await visibleSpeakButtons(page)
    expect(
      visible.length,
      'cần 5 nút loa nằm trọn trong khung nhìn',
    ).toBeGreaterThanOrEqual(5)
    const baseline = await scrollY(page)
    expect(baseline).toBeGreaterThan(0)

    const errors = watchErrors(page)
    for (let i = 0; i < 5; i++) {
      await page.mouse.click(visible[i].x, visible[i].y)
      await expect(page).toHaveURL(SEARCH_URL)
      expect(await scrollY(page)).toBe(baseline)
      expect(await spoken(page)).toHaveLength(i + 1)
    }
    expect(errors).toEqual([])
  })

  test('ca 3: bàn phím, Tab tới loa; Enter và Space chỉ phát âm', async ({
    page,
  }) => {
    // (1) Tab từ ô tìm kiếm tới nút loa đầu tiên.
    await search(page)
    await page.keyboard.press('Tab')
    await expect(speakButtons(page).first()).toBeFocused()

    // (2) Enter và Space ở nút loa đang nằm trong khung nhìn.
    await scrollDown(page)
    const visible = await visibleSpeakButtons(page)
    expect(visible.length).toBeGreaterThan(0)
    await speakButtons(page)
      .nth(visible[0].index)
      .evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }))
    const baseline = await scrollY(page)
    expect(baseline).toBeGreaterThan(0)

    await page.keyboard.press('Enter')
    await page.keyboard.press('Space')

    await expect(page).toHaveURL(SEARCH_URL)
    expect(await scrollY(page)).toBe(baseline)
    expect(await spoken(page)).toHaveLength(2)
  })
})
