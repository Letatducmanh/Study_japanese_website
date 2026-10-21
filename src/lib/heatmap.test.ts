import { describe, expect, it } from 'vitest'
import { heatmapClass } from './heatmap'

describe('heatmapClass', () => {
  it('null (chưa có dữ liệu) dùng màu trung tính', () => {
    expect(heatmapClass(null)).toContain('slate')
  })

  it('điểm thấp dùng màu đỏ (danger)', () => {
    expect(heatmapClass(0.1)).toContain('danger')
  })

  it('điểm trung bình dùng màu vàng (warning)', () => {
    expect(heatmapClass(0.5)).toContain('warning')
  })

  it('điểm cao dùng màu xanh dương (primary)', () => {
    expect(heatmapClass(0.95)).toContain('primary-600')
  })
})
