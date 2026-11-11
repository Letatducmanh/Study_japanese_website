# Hợp đồng: tách ô "Hán Việt (nghĩa)" của Kanji

Nơi cài đặt: `scripts/content/parse-kanji.ts` (cột thứ 4 của bảng Kanji). Nguồn: `content/n5/kanji-master-n5/kanji.md`.

## Đầu vào

Một ô văn bản, một hoặc nhiều đoạn ngăn bằng dấu `/` ở độ sâu ngoặc 0; mỗi đoạn dạng `HÁN VIỆT (nghĩa)`. Dấu `;` và `,` trong nghĩa là ký tự thường.

## Đầu ra

`{ hanViet: string, meaning: string }` — `hanViet` nối các cụm Hán Việt, `meaning` nối các nghĩa, cả hai bằng `" / "`, cùng thứ tự.

## Bảng ví dụ (bắt buộc có test)

| Ô nguồn | hanViet | meaning |
|---|---|---|
| `NGOẠI (ngoài)` | `NGOẠI` | `ngoài` |
| `HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)` | `HÀNH / HÀNG` | `đi; tiến hành / hàng, dòng` |
| `TRƯỜNG (dài) / TRƯỞNG (người đứng đầu)` | `TRƯỜNG / TRƯỞNG` | `dài / người đứng đầu` |

## Lỗi (báo kèm số dòng, không đoán, không hiển thị cắt sai)

- Không có ngoặc nào trong một đoạn.
- Ngoặc không cân (thiếu `)` hoặc thừa `)`).
- Đoạn rỗng (ví dụ `A (x) / `).
- Chữ sau `)` cuối đoạn (ví dụ `A (x) y`).

Ngoặc lồng nhau ở độ sâu > 1 trong phần nghĩa được **chấp nhận** nếu cân (ví dụ `A (x (y))` → meaning `x (y)`), vì chuỗi vẫn nguyên vẹn.

## Bất biến

1. Ô một đoạn: kết quả giống từng byte kết quả của regex cũ.
2. Khứ hồi: ghép `hanViet.split(" / ")[i] + " (" + meaning.split(" / ")[i] + ")"` nối bằng `" / "` bằng đúng ô nguồn (chuẩn hóa khoảng trắng đầu/cuối).
3. So sánh JSON `kanji-master-n5` trước/sau: giống từng byte, trừ `kanji-行` và `kanji-長`, và trong hai mục đó chỉ `hanViet`, `meaning` đổi.
