import { describe, expect, it } from 'vitest'
import { toSpeakable } from './speakable'

describe('toSpeakable — từ vựng (word)', () => {
  it.each([
    ['どうぞ よろしく [お願いします]。', 'どうぞ よろしく。'],
    ['[お]土産', '土産'],
    ['綺麗 [な]', '綺麗'],
    ['[～を] 見せて ください。', '見せて ください。'],
    ['きます [シャツを～]', 'きます'],
    ['～さん', 'さん'],
    ['こちらは ～さんです。', 'こちらは さんです。'],
    ['～歳', '歳'],
    ['晩 / 夜', '晩'],
    ['[～は] ちょっと……。', 'ちょっと……。'],
    ['[どうも] ありがとう [ございます]。', 'ありがとう。'],
    ['～かい / ～がい', 'かい'],
  ])('%s → %s', (input, expected) => {
    expect(toSpeakable(input, 'word')).toBe(expected)
  })
})

describe('toSpeakable — câu ngữ pháp (sentence)', () => {
  it.each([
    [
      'ミラーさんは アメリカ人ですか。 …はい、アメリカ人です。',
      'ミラーさんは アメリカ人ですか。 はい、アメリカ人です。',
    ],
    [
      '書きます → 書いて / 飲みます → 飲んで / 待ちます → 待って',
      '書きます、書いて、飲みます、飲んで、待ちます、待って',
    ],
    ['行きます（lịch sự）→ 行く（thông thường）', '行きます、行く'],
    [
      'わたしは てんぷらを（が） 食べたいです。',
      'わたしは てんぷらを 食べたいです。',
    ],
  ])('%s → %s', (input, expected) => {
    expect(toSpeakable(input, 'sentence')).toBe(expected)
  })
})

describe('toSpeakable — các ca bản nháp từng làm sai', () => {
  it('ca 1: "いい [お]てんきですね。" không để dấu cách thừa', () => {
    expect(toSpeakable('いい [お]てんきですね。', 'word')).toBe(
      'いいてんきですね。',
    )
  })

  it('ca 2: "いい [お]天気ですね。" (dạng kanji) không để dấu cách thừa', () => {
    expect(toSpeakable('いい [お]天気ですね。', 'word')).toBe('いい天気ですね。')
  })

  it('ca 3: "どこ[へ]も" bỏ [へ] mà không chèn dấu cách', () => {
    expect(toSpeakable('日曜日 どこ[へ]も 行きませんでした。', 'sentence')).toBe(
      '日曜日 どこも 行きませんでした。',
    )
  })

  it('ca 4: "［の 中］" (ngoặc toàn-rộng) bỏ hết, không để dấu cách', () => {
    expect(
      toSpeakable(
        '日本料理［の 中］で 何が いちばん おいしいですか。 …てんぷらが いちばん おいしいです。',
        'sentence',
      ),
    ).toBe(
      '日本料理で 何が いちばん おいしいですか。 てんぷらが いちばん おいしいです。',
    )
  })

  it('ca 5: → giữa hai câu hoàn chỉnh chỉ dùng khoảng ngắt, không có "。、"', () => {
    expect(
      toSpeakable(
        'ここに 荷物を 置かないで ください。 → 荷物は ここに 置かないで ください。',
        'sentence',
      ),
    ).toBe('ここに 荷物を 置かないで ください。 荷物は ここに 置かないで ください。')
  })

  it('ca 6: → giữa hai câu hoàn chỉnh (ví dụ thứ hai), không có "。、"', () => {
    expect(
      toSpeakable(
        '会社の 食堂で 昼ごはんを 食べます。 → 昼ごはんは 会社の 食堂で 食べます。',
        'sentence',
      ),
    ).toBe('会社の 食堂で 昼ごはんを 食べます。 昼ごはんは 会社の 食堂で 食べます。')
  })
})

describe('toSpeakable — giữ nguyên', () => {
  it.each([
    ['マイク・ミラー', 'word'],
    ['寝る まえに、「お休みなさい」と 言います。', 'sentence'],
    ['CD', 'word'],
    ['Tシャツ', 'word'],
    ['地下1階', 'word'],
    ['もう 帰らないと……。', 'word'],
    ['お名前は？', 'word'],
    ['わたし', 'word'],
    ['食べます', 'word'],
  ] as const)('"%s" (%s) đọc y nguyên', (input, kind) => {
    expect(toSpeakable(input, kind)).toBe(input)
  })

  it('chuỗi có hai dấu cách liền nhau nhưng không có ký hiệu cần bỏ thì trả y nguyên', () => {
    const input = 'わたしは  学生です。'
    expect(toSpeakable(input, 'word')).toBe(input)
    expect(toSpeakable(input, 'sentence')).toBe(input)
  })

  it('〜 và ~ được bỏ như ～', () => {
    expect(toSpeakable('〜さん', 'word')).toBe('さん')
    expect(toSpeakable('~さん', 'word')).toBe('さん')
  })

  it('…… (hai dấu liền) không bị bỏ ở sentence', () => {
    expect(toSpeakable('もう 帰らないと……。', 'sentence')).toBe(
      'もう 帰らないと……。',
    )
  })

  it('chuỗi chỉ gồm ký hiệu bị bỏ cho kết quả rỗng', () => {
    expect(toSpeakable('～', 'word')).toBe('')
    expect(toSpeakable('[お]', 'word')).toBe('')
    expect(toSpeakable('[お] ～', 'sentence')).toBe('')
  })

  it('kind mặc định là word', () => {
    expect(toSpeakable('晩 / 夜')).toBe('晩')
  })
})
