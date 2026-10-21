import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_APP_SETTINGS } from '@/data/progress/ProgressRepository'
import { DexieProgressRepository } from './dexie-repo'
import type { Attempt, ProgressExport } from '@/domain/types'

let repo: DexieProgressRepository
let dbCounter = 0

function makeAttempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: `attempt-${Math.random()}`,
    itemId: 'mnn1-l01-aaaaaaaa',
    itemType: 'vocab',
    skill: 'meaning',
    mode: 'mcq',
    correct: true,
    responseMs: 1000,
    sessionId: 'session-1',
    ts: Date.now(),
    ...overrides,
  }
}

beforeEach(() => {
  dbCounter += 1
  repo = new DexieProgressRepository(`progress-test-${dbCounter}`)
})

afterEach(async () => {
  await repo.clearAll()
})

describe('recordAttempt / mastery', () => {
  it('tạo mastery mới với score = 0.3 sau 1 lần đúng (nhanh)', async () => {
    await repo.recordAttempt(makeAttempt())
    const mastery = await repo.getMastery('mnn1-l01-aaaaaaaa', 'meaning')
    expect(mastery?.score).toBeCloseTo(0.3)
    expect(mastery?.attempts).toBe(1)
    expect(mastery?.streak).toBe(1)
  })

  it('sai thì streak về 0 và score giảm', async () => {
    await repo.recordAttempt(makeAttempt({ correct: true }))
    await repo.recordAttempt(makeAttempt({ correct: false }))
    const mastery = await repo.getMastery('mnn1-l01-aaaaaaaa', 'meaning')
    expect(mastery?.streak).toBe(0)
    expect(mastery?.attempts).toBe(2)
    expect(mastery?.score).toBeCloseTo(0.3 * 0.7)
  })

  it('listMasteryForItem gộp nhiều kỹ năng của cùng một mục', async () => {
    await repo.recordAttempt(makeAttempt({ skill: 'meaning' }))
    await repo.recordAttempt(makeAttempt({ skill: 'reading' }))
    const list = await repo.listMasteryForItem('mnn1-l01-aaaaaaaa')
    expect(list.map((m) => m.skill).sort()).toEqual(['meaning', 'reading'])
  })
})

describe('sổ lỗi sai', () => {
  it('trả lời sai thì vào sổ lỗi sai', async () => {
    await repo.recordAttempt(makeAttempt({ correct: false }))
    const mistakes = await repo.listMistakes()
    expect(mistakes.map((m) => m.itemId)).toContain('mnn1-l01-aaaaaaaa')
  })

  it('đúng 3 lần liên tiếp thì tự gỡ khỏi sổ lỗi sai', async () => {
    await repo.recordAttempt(makeAttempt({ correct: false }))
    await repo.recordAttempt(makeAttempt({ correct: true }))
    await repo.recordAttempt(makeAttempt({ correct: true }))
    let mistakes = await repo.listMistakes()
    expect(mistakes).toHaveLength(1)

    await repo.recordAttempt(makeAttempt({ correct: true }))
    mistakes = await repo.listMistakes()
    expect(mistakes).toHaveLength(0)
  })
})

describe('listWeak', () => {
  it('chỉ trả về các mục yếu, sắp xếp từ yếu nhất', async () => {
    await repo.recordAttempt(
      makeAttempt({ itemId: 'item-weak', correct: false, ts: Date.now() }),
    )
    await repo.recordAttempt(
      makeAttempt({ itemId: 'item-strong', correct: true, ts: Date.now() }),
    )
    await repo.recordAttempt(
      makeAttempt({ itemId: 'item-strong', correct: true, ts: Date.now() }),
    )
    await repo.recordAttempt(
      makeAttempt({ itemId: 'item-strong', correct: true, ts: Date.now() }),
    )

    const weak = await repo.listWeak()
    expect(weak.map((m) => m.itemId)).toEqual(['item-weak'])
  })
})

describe('srs card', () => {
  it('lưu và lấy lại thẻ SRS', async () => {
    const due = Date.now() - 1000
    await repo.saveSrsCard({
      itemId: 'mnn1-l01-aaaaaaaa',
      due,
      card: {
        due,
        stability: 1,
        difficulty: 5,
        elapsedDays: 0,
        scheduledDays: 1,
        learningSteps: 0,
        reps: 1,
        lapses: 0,
        state: 1,
      },
      updatedTs: Date.now(),
    })
    const card = await repo.getSrsCard('mnn1-l01-aaaaaaaa')
    expect(card?.itemId).toBe('mnn1-l01-aaaaaaaa')

    const dueCards = await repo.listDueSrsCards(Date.now())
    expect(dueCards.map((c) => c.itemId)).toContain('mnn1-l01-aaaaaaaa')
  })
})

describe('settings', () => {
  it('mặc định trả về DEFAULT_APP_SETTINGS', async () => {
    expect(await repo.getSettings()).toEqual(DEFAULT_APP_SETTINGS)
  })

  it('saveSettings chỉ ghi đè phần thay đổi', async () => {
    await repo.saveSettings({ ttsRate: 1.5 })
    const settings = await repo.getSettings()
    expect(settings.ttsRate).toBe(1.5)
    expect(settings.showRomaji).toBe(DEFAULT_APP_SETTINGS.showRomaji)
  })
})

describe('export / import / clear', () => {
  it('xuất → xóa → nhập lại → dữ liệu như cũ', async () => {
    await repo.recordAttempt(makeAttempt())
    await repo.saveSettings({ ttsRate: 1.2 })

    const exported = await repo.exportAll()
    expect(exported.attempts).toHaveLength(1)

    await repo.clearAll()
    expect(await repo.listMasteryForItem('mnn1-l01-aaaaaaaa')).toHaveLength(0)

    await repo.importAll(exported)

    const mastery = await repo.getMastery('mnn1-l01-aaaaaaaa', 'meaning')
    expect(mastery?.score).toBeCloseTo(0.3)
    expect((await repo.getSettings()).ttsRate).toBe(1.2)
  })

  it('importAll từ chối dữ liệu sai schema', async () => {
    await expect(
      repo.importAll({ schemaVersion: 1 } as unknown as ProgressExport),
    ).rejects.toThrow()
  })
})
