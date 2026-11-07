#!/usr/bin/env node
// Cổng kiểm của feature 001-repo-restructure (định nghĩa duy nhất: spec.md FR-011).
// Node thuần, không thư viện. Ngưỡng được ĐỌC từ spec.md, không đặt cứng ở đây.
//
// Cách dùng (chạy từ gốc repo):
//   node specs/001-repo-restructure/verify-baseline.mjs
//   node specs/001-repo-restructure/verify-baseline.mjs --also-default
//   node specs/001-repo-restructure/verify-baseline.mjs --only test|build|validate|lint
// Thoát mã 1 nếu có FAIL.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')

// ---------- đọc ngưỡng từ FR-011 ----------
function readThresholds() {
  const spec = readFileSync(join(here, 'spec.md'), 'utf8').replace(/\r/g, '')
  const start = spec.indexOf('- **FR-011**')
  const end = spec.indexOf('- **FR-012**')
  if (start < 0 || end < 0) throw new Error('Không tìm thấy FR-011 trong spec.md')
  const fr = spec.slice(start, end)
  const must = (re, what) => {
    const m = fr.match(re)
    if (!m) throw new Error(`FR-011 không có ${what} (regex ${re})`)
    return m
  }
  const tests = must(/\*\*(\d+)\/(\d+) test pass, (\d+)\/(\d+) file pass\*\*/, 'số test/file')
  const js = must(/(\d+[.,]\d+) kB/, 'mốc kích thước JS')
  const warn = must(/đúng (\d+) cảnh báo/, 'số cảnh báo validate')
  const chunk = must(/chỉ (\d+) cảnh báo chunk lớn/, 'số cảnh báo chunk')
  return {
    tests: Number(tests[2]),
    files: Number(tests[4]),
    jsKb: Number(js[1].replace(',', '.')),
    warnings: Number(warn[1]),
    chunkWarnings: Number(chunk[1]),
  }
}

// ---------- chạy lệnh ----------
function run(cmd) {
  const started = Date.now()
  const r = spawnSync(cmd, {
    cwd: root,
    shell: true,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', CI: '' },
  })
  const out = `${r.stdout ?? ''}\n${r.stderr ?? ''}`
  return { code: r.status ?? 1, out, secs: ((Date.now() - started) / 1000).toFixed(0) }
}

// ---------- phân tích kết quả ----------
function parseVitest(out) {
  const t = out.match(/Tests\s+(?:(\d+) failed \| )?(\d+) passed(?: \| (\d+) failed)?(?: \| (\d+) skipped)?\s*\((\d+)\)/)
  const f = out.match(/Test Files\s+(?:(\d+) failed \| )?(\d+) passed(?: \| (\d+) failed)?\s*\((\d+)\)/)
  const failedTests = []
  for (const line of out.split('\n')) {
    const m = line.match(/^\s*(?:FAIL|×|✗)\s+(.+)$/)
    if (m && !failedTests.includes(m[1].trim())) failedTests.push(m[1].trim())
  }
  return {
    testsPassed: t ? Number(t[2]) : null,
    testsFailed: t ? Number(t[1] ?? t[3] ?? 0) : null,
    testsTotal: t ? Number(t[5]) : null,
    filesPassed: f ? Number(f[2]) : null,
    filesFailed: f ? Number(f[1] ?? f[3] ?? 0) : null,
    filesTotal: f ? Number(f[4]) : null,
    failedTests,
  }
}

function checkTest(th, withFlag) {
  const cmd = withFlag ? 'npm test -- --testTimeout=30000' : 'npm test'
  const r = run(cmd)
  const p = parseVitest(r.out)
  const ok =
    r.code === 0 &&
    p.testsPassed === th.tests &&
    p.testsTotal === th.tests &&
    p.filesPassed === th.files &&
    p.filesTotal === th.files &&
    p.testsFailed === 0
  const detail = `${p.testsPassed}/${p.testsTotal} test, ${p.filesPassed}/${p.filesTotal} file, mã thoát ${r.code}`
  return { name: cmd, ok, detail, extra: p.failedTests.map((n) => `test fail: ${n}`), secs: r.secs, raw: r }
}

function checkBuild(th) {
  const r = run('npm run build')
  const js = r.out.match(/dist\/assets\/[^\s]*\.js\s+([\d.,]+)\s*kB/)
  const kb = js ? Number(js[1].replace(',', '.')) : null
  const chunkWarnings = (r.out.match(/Some chunks are larger than/g) ?? []).length
  const ok = r.code === 0 && kb !== null && kb <= th.jsKb && chunkWarnings === th.chunkWarnings
  const delta = kb === null ? '' : ` (${kb > th.jsKb ? '+' : ''}${(kb - th.jsKb).toFixed(2)} kB so với mốc ${th.jsKb})`
  const detail = `mã thoát ${r.code}, JS ${kb ?? '?'} kB${delta}, ${chunkWarnings} cảnh báo chunk`
  return { name: 'npm run build', ok, detail, extra: [], secs: r.secs, raw: r }
}

function checkValidate(th) {
  const r = run('npm run content:validate')
  const m = r.out.match(/\[content:validate\] OK — (\d+) cảnh báo/)
  const errors = (r.out.match(/^\[LỖI\]/gm) ?? []).length
  const warnings = m ? Number(m[1]) : null
  const ok = r.code === 0 && errors === 0 && warnings === th.warnings
  return {
    name: 'npm run content:validate',
    ok,
    detail: `mã thoát ${r.code}, ${errors} lỗi, ${warnings ?? '?'} cảnh báo (mốc ${th.warnings})`,
    extra: [],
    secs: r.secs,
    raw: r,
  }
}

function checkLint() {
  const r = run('npm run lint')
  return {
    name: 'npm run lint',
    ok: r.code === 0,
    detail: `mã thoát ${r.code}`,
    extra: r.code === 0 ? [] : r.out.split('\n').slice(-15),
    secs: r.secs,
    raw: r,
  }
}

// ---------- chương trình chính ----------
const args = process.argv.slice(2)
const alsoDefault = args.includes('--also-default')
const onlyIdx = args.indexOf('--only')
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null
if (only && !['test', 'build', 'validate', 'lint'].includes(only)) {
  console.error('--only chỉ nhận: test | build | validate | lint')
  process.exit(2)
}

const th = readThresholds()
console.log(`Ngưỡng đọc từ spec.md FR-011: ${th.tests} test, ${th.files} file, JS ≤ ${th.jsKb} kB, ${th.chunkWarnings} cảnh báo chunk, ${th.warnings} cảnh báo validate\n`)

const results = []
const want = (k) => !only || only === k
if (want('test')) results.push(checkTest(th, true))
if (want('build')) results.push(checkBuild(th))
if (want('validate')) results.push(checkValidate(th))
if (want('lint')) results.push(checkLint())

let defaultInfo = null
if (alsoDefault && want('test')) {
  const r = run('npm test')
  const p = parseVitest(r.out)
  defaultInfo = `npm test (mặc định, chỉ ghi nhận, không dùng làm điều kiện): ${p.testsPassed}/${p.testsTotal} test, ${p.filesPassed}/${p.filesTotal} file, mã thoát ${r.code}; test fail: ${p.failedTests.length ? p.failedTests.join(' | ') : 'không'}`
}

console.log('| Lệnh | Kết quả | Chi tiết | Giây |')
console.log('|---|---|---|---|')
for (const r of results) console.log(`| \`${r.name}\` | ${r.ok ? 'PASS' : 'FAIL'} | ${r.detail} | ${r.secs} |`)
for (const r of results) for (const e of r.extra) console.log(`  [${r.name}] ${e}`)
if (defaultInfo) console.log(`\n${defaultInfo}`)

const failed = results.filter((r) => !r.ok)
console.log(failed.length ? `\nFAIL: ${failed.map((r) => r.name).join(', ')} → DỪNG và báo Mạnh.` : '\nPASS: mọi lệnh khớp mốc.')
process.exit(failed.length ? 1 : 0)
