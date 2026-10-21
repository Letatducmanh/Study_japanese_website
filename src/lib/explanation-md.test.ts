import { describe, expect, it } from 'vitest'
import { parseExplanationMd, parseInlineBold } from './explanation-md'

describe('parseExplanationMd', () => {
  it('tách gạch đầu dòng và mục lồng', () => {
    const md =
      '- **か:** Trợ từ nghi vấn.\r\n- **Cách trả lời:**\r\n  + Khẳng định: はい。\r\n  + Phủ định: いいえ。'
    expect(parseExplanationMd(md)).toEqual([
      { text: '**か:** Trợ từ nghi vấn.', children: [] },
      {
        text: '**Cách trả lời:**',
        children: ['Khẳng định: はい。', 'Phủ định: いいえ。'],
      },
    ])
  })
})

describe('parseInlineBold', () => {
  it('tách phần in đậm khỏi văn bản thường', () => {
    expect(parseInlineBold('**は:** trợ từ')).toEqual([
      { bold: 'は:' },
      ' trợ từ',
    ])
  })

  it('không có in đậm trả về nguyên văn bản', () => {
    expect(parseInlineBold('không có gì đặc biệt')).toEqual([
      'không có gì đặc biệt',
    ])
  })
})
