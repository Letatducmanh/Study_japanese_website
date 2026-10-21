import Dexie, { type Table } from 'dexie'
import {
  DEFAULT_APP_SETTINGS,
  type ProgressRepository,
} from '@/data/progress/ProgressRepository'
import {
  isWeak,
  nextMasteryScore,
  weaknessScore,
} from '@/domain/mastery/formula'
import { progressExportSchema } from '@/domain/schemas'
import type {
  AppSettings,
  Attempt,
  Mastery,
  MistakeRecord,
  ProgressExport,
  Skill,
  SrsCardRecord,
} from '@/domain/types'

const SCHEMA_VERSION = 1
const SETTINGS_KEY = 'app'
const MISTAKE_REMOVE_STREAK = 3

interface OutboxEntry {
  id?: number
  table: string
  payload: unknown
  createdAt: number
}

interface SettingsRow {
  key: string
  value: AppSettings
}

class ProgressDexie extends Dexie {
  attempts!: Table<Attempt, string>
  mastery!: Table<Mastery, [string, Skill]>
  srsCards!: Table<SrsCardRecord, string>
  mistakes!: Table<MistakeRecord, string>
  settings!: Table<SettingsRow, string>
  outbox!: Table<OutboxEntry, number>

  constructor(name: string) {
    super(name)
    this.version(SCHEMA_VERSION).stores({
      attempts: 'id, itemId, skill, sessionId, ts',
      mastery: '[itemId+skill], itemId, score, lastTs',
      srsCards: 'itemId, due',
      mistakes: 'itemId, addedTs',
      settings: 'key',
      outbox: '++id, table, createdAt',
    })
  }
}

/** Cài đặt bằng Dexie (IndexedDB) theo bảng mục 6.7. Mọi hàm ghi đồng thời đẩy vào `outbox`. */
export class DexieProgressRepository implements ProgressRepository {
  private db: ProgressDexie

  constructor(dbName = 'progress') {
    this.db = new ProgressDexie(dbName)
  }

  private pushOutbox(table: string, payload: unknown): Promise<unknown> {
    return this.db.outbox.add({ table, payload, createdAt: Date.now() })
  }

  async recordAttempt(attempt: Attempt): Promise<void> {
    await this.db.attempts.put(attempt)
    await this.pushOutbox('attempts', attempt)

    const existing = await this.db.mastery.get([attempt.itemId, attempt.skill])
    const mastery: Mastery = {
      itemId: attempt.itemId,
      skill: attempt.skill,
      score: nextMasteryScore(
        existing?.score ?? 0,
        attempt.correct,
        attempt.responseMs,
      ),
      attempts: (existing?.attempts ?? 0) + 1,
      streak: attempt.correct ? (existing?.streak ?? 0) + 1 : 0,
      lastTs: attempt.ts,
    }
    await this.db.mastery.put(mastery)
    await this.pushOutbox('mastery', mastery)

    await this.updateMistakeBook(attempt.itemId, attempt.correct)
  }

  /** Sai → vào sổ (hoặc reset streak); đúng 3 lần liên tiếp kể từ khi vào sổ → tự gỡ (mục 3.5). */
  private async updateMistakeBook(
    itemId: string,
    correct: boolean,
  ): Promise<void> {
    const existing = await this.db.mistakes.get(itemId)

    if (!correct) {
      const record: MistakeRecord = {
        itemId,
        addedTs: existing?.addedTs ?? Date.now(),
        correctStreak: 0,
      }
      await this.db.mistakes.put(record)
      await this.pushOutbox('mistakes', record)
      return
    }

    if (!existing) return

    const correctStreak = existing.correctStreak + 1
    if (correctStreak >= MISTAKE_REMOVE_STREAK) {
      await this.db.mistakes.delete(itemId)
      await this.pushOutbox('mistakes', { itemId, deleted: true })
      return
    }

    const record: MistakeRecord = { ...existing, correctStreak }
    await this.db.mistakes.put(record)
    await this.pushOutbox('mistakes', record)
  }

  getMastery(itemId: string, skill: Skill): Promise<Mastery | undefined> {
    return this.db.mastery.get([itemId, skill])
  }

  listMasteryForItem(itemId: string): Promise<Mastery[]> {
    return this.db.mastery.where('itemId').equals(itemId).toArray()
  }

  listAllMastery(): Promise<Mastery[]> {
    return this.db.mastery.toArray()
  }

  async listWeak(limit = 20): Promise<Mastery[]> {
    const all = await this.db.mastery.toArray()
    const now = Date.now()
    return all
      .filter(isWeak)
      .sort((a, b) => weaknessScore(b, now) - weaknessScore(a, now))
      .slice(0, limit)
  }

  getSrsCard(itemId: string): Promise<SrsCardRecord | undefined> {
    return this.db.srsCards.get(itemId)
  }

  async saveSrsCard(record: SrsCardRecord): Promise<void> {
    await this.db.srsCards.put(record)
    await this.pushOutbox('srsCards', record)
  }

  listDueSrsCards(beforeTs: number, limit = 50): Promise<SrsCardRecord[]> {
    return this.db.srsCards
      .where('due')
      .belowOrEqual(beforeTs)
      .limit(limit)
      .toArray()
  }

  async addMistake(itemId: string): Promise<void> {
    const existing = await this.db.mistakes.get(itemId)
    const record: MistakeRecord = existing ?? {
      itemId,
      addedTs: Date.now(),
      correctStreak: 0,
    }
    await this.db.mistakes.put(record)
    await this.pushOutbox('mistakes', record)
  }

  async removeMistake(itemId: string): Promise<void> {
    await this.db.mistakes.delete(itemId)
  }

  listMistakes(): Promise<MistakeRecord[]> {
    return this.db.mistakes.orderBy('addedTs').reverse().toArray()
  }

  async getSettings(): Promise<AppSettings> {
    const row = await this.db.settings.get(SETTINGS_KEY)
    return row?.value ?? DEFAULT_APP_SETTINGS
  }

  async saveSettings(patch: Partial<AppSettings>): Promise<void> {
    const current = await this.getSettings()
    await this.db.settings.put({
      key: SETTINGS_KEY,
      value: { ...current, ...patch },
    })
  }

  async exportAll(): Promise<ProgressExport> {
    const [attempts, mastery, srsCards, mistakes, settings] = await Promise.all(
      [
        this.db.attempts.toArray(),
        this.db.mastery.toArray(),
        this.db.srsCards.toArray(),
        this.db.mistakes.toArray(),
        this.getSettings(),
      ],
    )
    return {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: Date.now(),
      attempts,
      mastery,
      srsCards,
      mistakes,
      settings,
    }
  }

  async importAll(data: ProgressExport): Promise<void> {
    const parsed = progressExportSchema.parse(data)
    await this.db.transaction(
      'rw',
      [
        this.db.attempts,
        this.db.mastery,
        this.db.srsCards,
        this.db.mistakes,
        this.db.settings,
      ],
      async () => {
        await Promise.all([
          this.db.attempts.clear(),
          this.db.mastery.clear(),
          this.db.srsCards.clear(),
          this.db.mistakes.clear(),
        ])
        await Promise.all([
          this.db.attempts.bulkPut(parsed.attempts),
          this.db.mastery.bulkPut(parsed.mastery),
          this.db.srsCards.bulkPut(parsed.srsCards),
          this.db.mistakes.bulkPut(parsed.mistakes),
          this.db.settings.put({ key: SETTINGS_KEY, value: parsed.settings }),
        ])
      },
    )
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.db.attempts.clear(),
      this.db.mastery.clear(),
      this.db.srsCards.clear(),
      this.db.mistakes.clear(),
      this.db.settings.clear(),
      this.db.outbox.clear(),
    ])
  }
}

export const progressRepository: ProgressRepository =
  new DexieProgressRepository()
