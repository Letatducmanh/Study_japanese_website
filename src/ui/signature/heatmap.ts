/**
 * Màu bản đồ nhiệt theo độ thành thạo (mục 7.3): đỏ (yếu) → vàng → xanh dương (đã thuộc).
 * Trả về lớp Tailwind cho ô vuông bài học; `null` nghĩa là chưa có dữ liệu (màu trung tính).
 */
export function heatmapClass(score: number | null): string {
  if (score === null) {
    return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
  }
  if (score < 0.4) return 'border-danger bg-danger/10 text-danger'
  if (score < 0.7) return 'border-warning bg-warning/10 text-warning'
  if (score < 0.9) return 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-500'
  return 'border-primary-600 bg-primary-600 text-white'
}
