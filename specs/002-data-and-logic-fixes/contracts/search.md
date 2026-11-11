# Hợp đồng: hành vi tìm kiếm từ vựng

Nơi cài đặt: `src/data/search-index.ts` (`searchVocab(query, limit = 30)`), gọi từ `src/features/browse/SearchPage.tsx` qua giá trị đã debounce.

## Chữ ký (không đổi)

`searchVocab(query: string, limit?: number): Promise<VocabSearchResult[]>`

## Quy tắc

| # | Quy tắc |
|---|---|
| S1 | Truy vấn rỗng hoặc chỉ khoảng trắng → `[]`, không dựng chỉ mục |
| S2 | Truy vấn đúng một ký tự ASCII → `[]`. Một chữ CJK (kanji/kana) vẫn tìm |
| S3 | Nhiều từ trong truy vấn: **mọi** từ phải khớp (AND) |
| S4 | Bỏ dấu tiếng Việt và viết thường khi so khớp (giữ nguyên: "nuoc ngoai" → 外国) |
| S5 | Khớp tiền tố chỉ cho từ ≥ 2 ký tự (CJK: từ 1 ký tự) |
| S6 | Khớp gần đúng (sai ký tự) chỉ cho từ ≥ 5 ký tự không phải CJK |
| S7 | Trọng số trường: kana 3, kanji 3, romaji 2, nghĩa 1 |
| S8 | Loại kết quả có điểm dưới ngưỡng tương đối (mặc định 30% điểm kết quả đầu; chốt bằng bộ truy vấn mẫu) |
| S9 | Tối đa `limit` kết quả, sắp điểm giảm dần |
| S10 | Không khớp gì → `[]` (trang hiện "Không tìm thấy kết quả") |

## Bộ truy vấn mẫu (SC-005, bắt buộc có test)

Trên tập từ mẫu có cả từ nhiễu cố ý:

| Truy vấn | Kỳ vọng |
|---|---|
| `gakusei`, `がくせい`, `学生` | 学生 hạng 1 |
| `sensei` | 先生 hạng 1 |
| `nihon` | 日本 hạng 1 |
| `sinh vien`, `sinh viên` | 学生 hạng 1, tối đa 3 kết quả, không có 教師, お勘定 |
| `nuoc ngoai` | 外国 trong top 3 |
| `nhat ban` | 日本 hạng 1, tối đa 3 kết quả |
| `zzzz` | `[]` |
| `a` | `[]` |

Đo thật trên 1.295 từ bằng script thăm dò (xem quickstart §C) trước và sau; số kết quả của `sinh vien` phải từ 156 xuống ≤ 3.

## Debounce (SearchPage)

Giá trị tìm kiếm = giá trị ô nhập sau 250 ms không đổi. Ô nhập và `?q=` trên URL vẫn cập nhật tức thời. Khi ô nhập rỗng, hiện gợi ý ngay (không chờ).
