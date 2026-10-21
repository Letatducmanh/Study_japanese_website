import type { Mastery } from '@/domain/types'

/** Công thức độ thành thạo (mục 6.5). */

const PREV_WEIGHT = 0.7
const NEW_WEIGHT = 0.3
const SLOW_CORRECT_OUTCOME = 0.7
const SLOW_THRESHOLD_MS = 8000

/** score_mới = score_cũ × 0.7 + kết_quả × 0.3; đúng nhưng chậm hơn 8s chỉ tính 0.7 điểm. */
export function nextMasteryScore(
  prevScore: number,
  correct: boolean,
  responseMs: number,
): number {
  const outcome = !correct
    ? 0
    : responseMs > SLOW_THRESHOLD_MS
      ? SLOW_CORRECT_OUTCOME
      : 1
  const score = prevScore * PREV_WEIGHT + outcome * NEW_WEIGHT
  return Math.min(1, Math.max(0, score))
}

const WEAK_SCORE_THRESHOLD = 0.6
const WEAK_MIN_ATTEMPTS = 2

/** Yếu: đã làm ≥2 lần và điểm < 0.6, hoặc lần gần nhất trả lời sai (streak = 0). */
export function isWeak(mastery: Mastery): boolean {
  return (
    (mastery.attempts >= WEAK_MIN_ATTEMPTS &&
      mastery.score < WEAK_SCORE_THRESHOLD) ||
    mastery.streak === 0
  )
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Lỗi càng gần đây càng nặng — hệ số giảm dần từ 2 (vừa sai) về 1 (sai đã lâu). */
export function recencyFactor(lastTs: number, nowTs: number): number {
  const daysSince = Math.max(0, (nowTs - lastTs) / MS_PER_DAY)
  return 1 + 1 / (1 + daysSince)
}

/** Điểm xếp hạng điểm yếu: sai càng nhiều và càng gần đây thì điểm càng cao. */
export function weaknessScore(mastery: Mastery, nowTs: number): number {
  return (1 - mastery.score) * recencyFactor(mastery.lastTs, nowTs)
}

/** Độ thành thạo trung bình (dùng cho 1 từ gộp nhiều kỹ năng, hoặc 1 bài gộp nhiều từ). */
export function averageMastery(scores: number[]): number {
  if (scores.length === 0) return 0
  return scores.reduce((sum, s) => sum + s, 0) / scores.length
}
