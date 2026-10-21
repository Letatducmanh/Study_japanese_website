/** Bỏ dấu tiếng Việt và viết thường, dùng để so khớp tìm kiếm không phân biệt dấu. */
export function stripDiacritics(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFC')
    .toLowerCase()
}
