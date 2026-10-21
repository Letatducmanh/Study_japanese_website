import { describe, expect, it } from 'vitest'
import { grammarId, hash8, kanjiId, vocabId } from './ids.ts'

describe('hash8', () => {
  it('ổn định (cùng input -> cùng output) và dài 8 ký tự hex', () => {
    const a = hash8('いきます|行きます')
    const b = hash8('いきます|行きます')
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{8}$/)
  })

  it('khác input -> khác hash', () => {
    expect(hash8('a')).not.toBe(hash8('b'))
  })
})

describe('vocabId', () => {
  it('giữ nguyên khi chỉ đổi nghĩa/ghi chú (không phụ thuộc meaning)', () => {
    const id1 = vocabId('mnn1', 5, 'いきます', '行きます')
    const id2 = vocabId('mnn1', 5, 'いきます', '行きます')
    expect(id1).toBe(id2)
    expect(id1).toMatch(/^mnn1-l05-[0-9a-f]{8}$/)
  })

  it('đổi kana/kanji -> đổi id', () => {
    const id1 = vocabId('mnn1', 5, 'いきます', '行きます')
    const id2 = vocabId('mnn1', 5, 'きます', '来ます')
    expect(id1).not.toBe(id2)
  })
})

describe('grammarId', () => {
  it('bỏ qua hậu tố "(bổ sung)" khi tính hash', () => {
    const id1 = grammarId('mnn1', 1, 'N1 は 何／だれ ですか')
    const id2 = grammarId('mnn1', 1, 'N1 は 何／だれ ですか *(bổ sung)*')
    expect(id1).toBe(id2)
  })
})

describe('kanjiId', () => {
  it('dùng chung giữa các sách (chỉ phụ thuộc chữ)', () => {
    expect(kanjiId('行')).toBe('kanji-行')
  })
})
