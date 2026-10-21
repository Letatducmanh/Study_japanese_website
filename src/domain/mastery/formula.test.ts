import { describe, expect, it } from 'vitest'
import {
  averageMastery,
  isWeak,
  nextMasteryScore,
  recencyFactor,
  weaknessScore,
} from './formula'
import type { Mastery } from '@/domain/types'

describe('nextMasteryScore', () => {
  it('đúng và nhanh: score_mới = 0 × 0.7 + 1 × 0.3', () => {
    expect(nextMasteryScore(0, true, 1000)).toBeCloseTo(0.3)
  })

  it('đúng nhưng chậm hơn 8s chỉ tính 0.7 điểm', () => {
    expect(nextMasteryScore(0, true, 9000)).toBeCloseTo(0.21)
  })

  it('sai: score_mới = score_cũ × 0.7', () => {
    expect(nextMasteryScore(0.5, false, 1000)).toBeCloseTo(0.35)
  })

  it('kẹp trong khoảng [0, 1]', () => {
    expect(nextMasteryScore(1, true, 1000)).toBeLessThanOrEqual(1)
    expect(nextMasteryScore(0, false, 1000)).toBeGreaterThanOrEqual(0)
  })
})

function makeMastery(overrides: Partial<Mastery>): Mastery {
  return {
    itemId: 'x',
    skill: 'meaning',
    score: 0.5,
    attempts: 3,
    streak: 1,
    lastTs: 0,
    ...overrides,
  }
}

describe('isWeak', () => {
  it('yếu khi attempts ≥ 2 và score < 0.6', () => {
    expect(isWeak(makeMastery({ attempts: 2, score: 0.4, streak: 1 }))).toBe(
      true,
    )
  })

  it('không yếu khi score ≥ 0.6 và lần gần nhất đúng', () => {
    expect(isWeak(makeMastery({ attempts: 5, score: 0.9, streak: 3 }))).toBe(
      false,
    )
  })

  it('yếu khi lần gần nhất sai (streak = 0) dù score cao', () => {
    expect(isWeak(makeMastery({ attempts: 1, score: 0.9, streak: 0 }))).toBe(
      true,
    )
  })
})

describe('recencyFactor / weaknessScore', () => {
  it('lỗi vừa xảy ra có hệ số cao hơn lỗi đã lâu', () => {
    const now = 1_000_000
    const recent = recencyFactor(now, now)
    const old = recencyFactor(now - 10 * 24 * 60 * 60 * 1000, now)
    expect(recent).toBeGreaterThan(old)
  })

  it('weaknessScore cao hơn khi score thấp hơn', () => {
    const now = 1_000_000
    const a = weaknessScore(makeMastery({ score: 0.2, lastTs: now }), now)
    const b = weaknessScore(makeMastery({ score: 0.8, lastTs: now }), now)
    expect(a).toBeGreaterThan(b)
  })
})

describe('averageMastery', () => {
  it('mảng rỗng trả về 0', () => {
    expect(averageMastery([])).toBe(0)
  })

  it('tính trung bình', () => {
    expect(averageMastery([0, 0.5, 1])).toBeCloseTo(0.5)
  })
})
