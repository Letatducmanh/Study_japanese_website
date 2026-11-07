#!/usr/bin/env node
// Công cụ chụp ảnh, duyệt route (smoke) và đối chiếu tiến độ (progress) cho feature 001-repo-restructure.
// Chạy từ gốc repo, SAU KHI đã `npm run build` (chế độ dev tự chạy `npm run dev`).
//
//   node specs/001-repo-restructure/shoot.mjs shots <nhãn>              (nhãn thường là before | after)
//   node specs/001-repo-restructure/shoot.mjs compare [nhãnA] [nhãnB]   (mặc định before after)
//   node specs/001-repo-restructure/shoot.mjs smoke before|after [--dev]
//   node specs/001-repo-restructure/shoot.mjs progress before|after
//
// Mọi chế độ dùng CÙNG cổng 4174 cho `vite preview`. Kết quả ghi vào .screens/001/ (đã gitignore).

import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const OUT = join(root, '.screens', '001')
const PREVIEW_PORT = 4174
const DEV_PORT = 5173
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`
const DEV_URL = `http://localhost:${DEV_PORT}`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ensureDir = (d) => mkdirSync(d, { recursive: true })

// ---------- máy chủ ----------
async function isUp(url) {
  try {
    const r = await fetch(url)
    return r.status > 0
  } catch {
    return false
  }
}

function killTree(child) {
  if (!child || child.killed) return
  if (process.platform === 'win32') spawnSync(`taskkill /PID ${child.pid} /T /F`, { shell: true, stdio: 'ignore' })
  else child.kill('SIGTERM')
}

async function startServer(command, url) {
  if (await isUp(url)) throw new Error(`Cổng của ${url} đang bận (có máy chủ khác đang chạy). Tắt nó rồi chạy lại.`)
  const child = spawn(command, { cwd: root, shell: true, stdio: 'ignore' })
  for (let i = 0; i < 120; i++) {
    if (await isUp(url)) return child
    await sleep(500)
  }
  killTree(child)
  throw new Error(`Máy chủ không lên sau 60 giây: ${command}`)
}

function startPreview() {
  if (!existsSync(join(root, 'dist', 'index.html'))) throw new Error('Chưa có dist/. Chạy `npm run build` trước.')
  return startServer(`npx vite preview --port ${PREVIEW_PORT} --strictPort`, PREVIEW_URL)
}

// ---------- shots ----------
const ROUTES = [
  ['home', '/'],
  ['n', '/n'],
  ['b-mnn1', '/b/mnn1'],
  ['b-mnn1-5', '/b/mnn1/5'],
  ['weak', '/weak'],
  ['settings', '/settings'],
]
const SIZES = [
  [360, 740],
  [768, 1024],
  [1280, 800],
]
const THEMES = ['light', 'dark']

async function modeShots(label) {
  if (!label) throw new Error('Thiếu nhãn: shots before|after')
  const dir = join(OUT, label)
  rmSync(dir, { recursive: true, force: true })
  ensureDir(dir)
  const server = await startPreview()
  const browser = await chromium.launch()
  let n = 0
  try {
    for (const theme of THEMES) {
      for (const [w, h] of SIZES) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' })
        await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme)
        const page = await ctx.newPage()
        for (const [slug, path] of ROUTES) {
          await page.goto(PREVIEW_URL + path, { waitUntil: 'networkidle' })
          await page.evaluate(() => document.fonts.ready)
          await page.waitForTimeout(500)
          await page.screenshot({ path: join(dir, `${slug}-${w}-${theme}.png`), fullPage: true, animations: 'disabled' })
          n++
        }
        await ctx.close()
      }
    }
  } finally {
    await browser.close()
    killTree(server)
  }
  console.log(`Đã chụp ${n} ảnh vào ${dir}`)
  if (n !== ROUTES.length * SIZES.length * THEMES.length) process.exitCode = 1
}

// ---------- compare ----------
function hash(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex')
}

function modeCompare(a = 'before', b = 'after') {
  const da = join(OUT, a)
  const db = join(OUT, b)
  if (!existsSync(da) || !existsSync(db)) throw new Error(`Thiếu thư mục ảnh: ${da} hoặc ${db}`)
  const names = [...new Set([...readdirSync(da), ...readdirSync(db)])].filter((f) => f.endsWith('.png')).sort()
  const diff = []
  let same = 0
  for (const f of names) {
    if (!existsSync(join(da, f)) || !existsSync(join(db, f))) diff.push(`${f} (thiếu ở một bên)`)
    else if (hash(join(da, f)) !== hash(join(db, f))) diff.push(f)
    else same++
  }
  console.log(`${same}/${names.length} giống hệt (${a} so với ${b})`)
  for (const f of diff) console.log(`  KHÁC: ${f}`)
  if (diff.length || names.length === 0) process.exitCode = 1
}

// ---------- smoke ----------
const PARAMS = { ':level': 'N5', ':bookId': 'mnn1', ':lesson': '5', ':char': '外', ':sessionId': 'khong-ton-tai' }

function readRoutes(mode) {
  const candidates = mode === 'before' ? ['src/App.tsx', 'src/app/App.tsx'] : ['src/app/App.tsx', 'src/App.tsx']
  const file = candidates.map((c) => join(root, c)).find((f) => existsSync(f))
  if (!file) throw new Error('Không tìm thấy App.tsx')
  const paths = [...readFileSync(file, 'utf8').matchAll(/path="([^"]+)"/g)].map((m) => m[1])
  const routes = ['/']
  for (const p of paths) {
    if (p === '*' || p === 'styleguide') continue
    let url = '/' + p
    for (const [k, v] of Object.entries(PARAMS)) url = url.split(k).join(v)
    routes.push(url)
  }
  routes.push('/duong-dan-khong-ton-tai')
  return { file: file.replace(root, '').replace(/\\/g, '/').replace(/^\//, ''), routes: [...new Set(routes)] }
}

async function visit(ctx, base, path, minLen = 20) {
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e.message).split('\n')[0]}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text().split('\n')[0]}`)
  })
  let status = 'ok'
  let textLen = 0
  let text = ''
  try {
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    text = (await page.evaluate(() => document.body.innerText)).trim()
    textLen = text.length
    if (textLen < minLen) status = 'blank'
  } catch (e) {
    status = 'goto-failed'
    errors.push(String(e.message).split('\n')[0])
  }
  await page.close()
  if (status === 'ok' && errors.length) status = 'error'
  return { path, status, textLen, errors, text }
}

async function modeSmoke(mode, dev) {
  if (!['before', 'after'].includes(mode)) throw new Error('smoke before|after [--dev]')
  ensureDir(OUT)
  const file = join(OUT, `smoke-${mode}.json`)
  const prev = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  const result = { ...prev, mode }
  if (!dev) {
    const { file: appFile, routes } = readRoutes(mode)
    const server = await startPreview()
    const browser = await chromium.launch()
    try {
      const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, reducedMotion: 'reduce' })
      const list = []
      for (const r of routes) {
        const v = await visit(ctx, PREVIEW_URL, r)
        list.push({ path: v.path, status: v.status, textLen: v.textLen, errors: v.errors })
      }
      // /styleguide chỉ có khi phát triển: bản dựng phải hiện trang 404.
      const sg = await visit(ctx, PREVIEW_URL, '/styleguide')
      result.appFile = appFile
      result.routeCount = list.length
      result.routes = list
      result.styleguidePreview = { shows404: sg.text.includes('Không tìm thấy trang'), errors: sg.errors }
      await ctx.close()
    } finally {
      await browser.close()
      killTree(server)
    }
  } else {
    const server = await startServer(`npm run dev -- --port ${DEV_PORT} --strictPort`, DEV_URL)
    const browser = await chromium.launch()
    try {
      const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, reducedMotion: 'reduce' })
      const v = await visit(ctx, DEV_URL, '/styleguide', 100)
      result.styleguideDev = { status: v.status, textLen: v.textLen, errors: v.errors }
      await ctx.close()
    } finally {
      await browser.close()
      killTree(server)
    }
  }
  writeFileSync(file, JSON.stringify(result, null, 2))

  // ---- báo cáo ----
  if (result.routes) {
    console.log(`Smoke ${mode}: ${result.routeCount} route (đọc từ ${result.appFile})`)
    for (const r of result.routes) {
      console.log(`  ${r.status.padEnd(6)} ${r.path}  (${r.textLen} ký tự)${r.errors.length ? '\n         ' + r.errors.join('\n         ') : ''}`)
    }
    console.log(`  /styleguide ở bản dựng: ${result.styleguidePreview.shows404 ? 'trang 404 (đúng)' : 'KHÔNG phải 404'}`)
  }
  if (result.styleguideDev) {
    const s = result.styleguideDev
    console.log(`  /styleguide ở dev: ${s.status} (${s.textLen} ký tự)${s.errors.length ? ' lỗi: ' + s.errors.join(' | ') : ''}`)
  }
  const bad = (result.routes ?? []).filter((r) => r.status !== 'ok')
  const known = [...bad.map((r) => `${r.path}: ${r.status}`)]
  if (result.styleguideDev && result.styleguideDev.status !== 'ok') known.push(`/styleguide (dev): ${result.styleguideDev.status}`)
  if (result.styleguidePreview && !result.styleguidePreview.shows404) known.push('/styleguide (build) không phải 404')
  if (mode === 'before') {
    console.log(known.length ? `Route có sẵn vấn đề ở bản trước (ghi làm mốc): ${known.join('; ')}` : 'Mọi route ổn ở bản trước.')
  } else {
    const beforeFile = join(OUT, 'smoke-before.json')
    if (!existsSync(beforeFile)) throw new Error('Chưa có smoke-before.json')
    const before = JSON.parse(readFileSync(beforeFile, 'utf8'))
    const problems = []
    if (result.routes && before.routes) {
      if (result.routeCount !== before.routeCount) problems.push(`số route lệch: ${before.routeCount} → ${result.routeCount}`)
      const bm = new Map(before.routes.map((r) => [r.path, r]))
      for (const r of result.routes) {
        const b = bm.get(r.path)
        if (!b) problems.push(`route mới: ${r.path}`)
        else if (b.status !== r.status || JSON.stringify(b.errors) !== JSON.stringify(r.errors)) problems.push(`khác: ${r.path} (${b.status} → ${r.status})`)
      }
      for (const p of bm.keys()) if (!result.routes.some((r) => r.path === p)) problems.push(`mất route: ${p}`)
      if (before.styleguidePreview?.shows404 !== result.styleguidePreview.shows404) problems.push('/styleguide ở bản dựng khác trước')
    }
    if (result.styleguideDev && before.styleguideDev) {
      if (before.styleguideDev.status !== result.styleguideDev.status) problems.push('/styleguide (dev) khác trước')
    }
    console.log(problems.length ? `LỆCH so với trước:\n  ${problems.join('\n  ')}` : 'Khớp smoke-before.json.')
    if (problems.length) process.exitCode = 1
  }
}

// ---------- progress ----------
async function countAll(page) {
  return page.evaluate(async () => {
    const out = {}
    const dbs = await indexedDB.databases()
    for (const { name } of dbs) {
      const db = await new Promise((res, rej) => {
        const r = indexedDB.open(name)
        r.onsuccess = () => res(r.result)
        r.onerror = () => rej(r.error)
      })
      out[name] = {}
      for (const s of Array.from(db.objectStoreNames)) {
        out[name][s] = await new Promise((res, rej) => {
          const r = db.transaction(s).objectStore(s).count()
          r.onsuccess = () => res(r.result)
          r.onerror = () => rej(r.error)
        })
      }
      db.close()
    }
    const ls = {}
    for (let i = 0; i < localStorage.length; i++) ls[localStorage.key(i)] = localStorage.getItem(localStorage.key(i))
    return { indexedDB: out, localStorage: ls }
  })
}

async function answerOne(page, keyToMeaning, wantCorrect) {
  await page.getByText(/^Câu \d+\/\d+$/).waitFor()
  const key = ((await page.locator('.flex.items-center.gap-2 .text-3xl').first().textContent()) ?? '').trim()
  const correct = keyToMeaning.get(key)
  if (!correct) throw new Error(`không tìm thấy nghĩa cho "${key}"`)
  const buttons = page.locator('div.grid button')
  const count = await buttons.count()
  for (let i = 0; i < count; i++) {
    const text = (await buttons.nth(i).textContent()) ?? ''
    if (wantCorrect === (text.slice(0, -1) === correct)) {
      await buttons.nth(i).click()
      await page.getByRole('button', { name: 'Tiếp theo (Enter)' }).click()
      return
    }
  }
  throw new Error('không tìm được nút đáp án phù hợp')
}

async function seedProgress(ctx) {
  const page = await ctx.newPage()
  // 1) Flashcard Bài 1: "Quên" 3 thẻ đầu, rồi "Nhớ" cho tới khi hết phiên.
  await page.goto(PREVIEW_URL + '/b/mnn1/1', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'Luyện tập bài này' }).click()
  await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click()
  await page.waitForURL(/\/practice\/run/)
  for (let i = 0; i < 150; i++) {
    if (/\/practice\/result\//.test(page.url())) break
    await page.getByRole('button', { name: /Bấm hoặc nhấn Space/ }).click()
    await page.getByRole('button', { name: i < 3 ? 'Quên' : 'Nhớ' }).click()
  }
  await page.waitForURL(/\/practice\/result\//)
  // 2) Trắc nghiệm Nhật → Nghĩa Bài 5, 10 câu, sai 3 câu đầu.
  const lessonData = await (await page.request.get(PREVIEW_URL + '/content/mnn1/l05.json')).json()
  const keyToMeaning = new Map()
  for (const v of lessonData.vocab) keyToMeaning.set((v.kanji ?? v.kana) + (v.kanji ? v.kana : ''), v.meaning)
  await page.goto(PREVIEW_URL + '/b/mnn1/5', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'Luyện tập bài này' }).click()
  await page.getByRole('button', { name: 'Flashcard' }).click()
  await page.getByRole('button', { name: 'Nhật → Nghĩa' }).click()
  await page.getByRole('button', { name: '10', exact: true }).click()
  await page.getByRole('button', { name: 'Bắt đầu luyện tập' }).click()
  await page.waitForURL(/\/practice\/run/)
  for (let i = 0; i < 10; i++) await answerOne(page, keyToMeaning, i >= 3)
  await page.waitForURL(/\/practice\/result\//)
  // 3) Một cài đặt: đặt chế độ tối trong localStorage (cùng khóa với nút đổi giao diện).
  await page.evaluate(() => localStorage.setItem('theme', 'dark'))
  await page.close()
}

async function modeProgress(mode) {
  if (!['before', 'after'].includes(mode)) throw new Error('progress before|after')
  ensureDir(OUT)
  const profile = join(OUT, 'profile')
  if (mode === 'before') rmSync(profile, { recursive: true, force: true })
  else if (!existsSync(profile)) throw new Error('Chưa có profile từ bước progress before')
  const server = await startPreview()
  const ctx = await chromium.launchPersistentContext(profile, { headless: true, viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  let counts
  try {
    if (mode === 'before') await seedProgress(ctx)
    const page = await ctx.newPage()
    await page.goto(PREVIEW_URL + '/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    counts = await countAll(page)
    // Mở thêm hai trang đọc dữ liệu tiến độ để chắc ứng dụng đọc được (không đo thêm gì).
    await page.goto(PREVIEW_URL + '/mistakes', { waitUntil: 'networkidle' })
    const mistakesText = (await page.evaluate(() => document.body.innerText)).slice(0, 300)
    await page.close()
    counts.mistakesPageStart = mistakesText
  } finally {
    await ctx.close()
    killTree(server)
  }
  const file = join(OUT, `progress-${mode}.json`)
  writeFileSync(file, JSON.stringify(counts, null, 2))
  console.log(`Progress ${mode}:`)
  for (const [db, stores] of Object.entries(counts.indexedDB)) {
    console.log(`  IndexedDB "${db}":`)
    for (const [s, c] of Object.entries(stores)) console.log(`    ${s}: ${c}`)
  }
  console.log(`  localStorage: ${Object.keys(counts.localStorage).join(', ') || '(trống)'}`)
  if (mode === 'before') {
    const total = Object.values(counts.indexedDB).flatMap((s) => Object.values(s)).reduce((a, b) => a + b, 0)
    if (total === 0) {
      console.log('CẢNH BÁO: không có bản ghi nào sau khi tạo dữ liệu.')
      process.exitCode = 1
    }
    return
  }
  const before = JSON.parse(readFileSync(join(OUT, 'progress-before.json'), 'utf8'))
  const problems = []
  for (const [db, stores] of Object.entries(before.indexedDB)) {
    if (!counts.indexedDB[db]) problems.push(`mất cơ sở dữ liệu "${db}"`)
    else
      for (const [s, c] of Object.entries(stores)) {
        if (!(s in counts.indexedDB[db])) problems.push(`mất bảng ${db}.${s}`)
        else if (counts.indexedDB[db][s] !== c) problems.push(`lệch ${db}.${s}: ${c} → ${counts.indexedDB[db][s]}`)
      }
  }
  for (const db of Object.keys(counts.indexedDB)) if (!before.indexedDB[db]) problems.push(`có cơ sở dữ liệu mới "${db}"`)
  for (const [k, v] of Object.entries(before.localStorage)) if (counts.localStorage[k] !== v) problems.push(`localStorage "${k}" khác`)
  console.log(problems.length ? `LỆCH so với trước:\n  ${problems.join('\n  ')}` : 'Khớp progress-before.json: mọi bảng giữ nguyên số bản ghi.')
  if (problems.length) process.exitCode = 1
}

// ---------- chính ----------
const [, , cmd, arg1, arg2] = process.argv
try {
  if (cmd === 'shots') await modeShots(arg1)
  else if (cmd === 'compare') modeCompare(arg1, arg2)
  else if (cmd === 'smoke') await modeSmoke(arg1, process.argv.includes('--dev'))
  else if (cmd === 'progress') await modeProgress(arg1)
  else {
    console.error('Cách dùng: shots <nhãn> | compare [a] [b] | smoke before|after [--dev] | progress before|after')
    process.exitCode = 2
  }
} catch (e) {
  console.error('LỖI:', e.message)
  process.exitCode = 1
}
process.exit(process.exitCode ?? 0)
