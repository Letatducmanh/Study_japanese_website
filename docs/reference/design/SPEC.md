# SPEC thiết kế: Tự học tiếng Nhật cùng Mạnh

## 1. Hướng thiết kế
Tuyến tàu: xanh dương làm chủ đạo, vàng biển báo làm điểm nhấn. Mỗi bài là một ga mã L01 đến L25.
Chú chó Shiba là nhân vật của app. Trẻ trung, năng động nhưng không game hóa nặng, không ép chuỗi ngày.
Nội dung học giữ nguyên; chỉ đổi cách trình bày.

## 2. Màu (token, giao diện sáng)
| Token | Hex | Dùng cho |
| --- | --- | --- |
| bg | #F2F6FC | nền trang |
| surface | #FFFFFF | thẻ, khung |
| ink | #0C1B38 | chữ chính |
| muted | #4A5B78 | chữ phụ |
| line | #1565E8 | màu chính: nút, liên kết, tuyến |
| deep | #0A2A66 | biển ga, thẻ chính, viền điểm hiện tại |
| yellow | #FFD21F | CTA chính, điểm hiện tại; chữ trên vàng dùng ink |
| tint | #E3EDFD | nền nhẹ xanh, thẻ đã chọn/đúng |
| track | #C5D3EA | đường ray, thanh tiến độ chưa đạt |
| border | #D7E1F2 | viền thẻ |
| border-strong | #B7C5DD | viền nút chưa chọn |
| wrong | #C2410C | sai, chưa đúng (cam đậm) |
| wrong-bg | #FFF1E6 | nền khối sai |
| wrong-ink | #7C2D12 | chữ trên nền sai |
| shiba | #E8A456, #F2C498, #FFB0C4 | chú chó (đã có trong code: --color-shiba-*) |

Giao diện tối (đã kiểm tra tương phản): bg #08142B, surface #101F3F, ink #E9F0FF, muted #9CB0D0, line #5B9BFF, yellow giữ nguyên (chữ trên vàng dùng #08142B). Các token còn lại (tint, track, border, wrong...) tự suy ra cho nền tối và kiểm tra tỉ lệ tương phản tối thiểu 4.5:1 cho chữ thường.
Cam #C2410C chỉ đạt khoảng 5.2:1 trên nền trắng: được dùng cho chữ và viền, không dùng màu nhạt hơn.
Tuyệt đối không dùng lại nền #0f172a (slate-900) và xanh #2563eb mặc định của Tailwind.

## 3. Chữ
- Giao diện và tiếng Việt: Be Vietnam Pro 400, 500, 700.
- Chữ Nhật: Zen Kaku Gothic New 500, 700.
- Font stack: 'Be Vietnam Pro', 'Zen Kaku Gothic New', 'Noto Sans JP', system-ui, sans-serif. Be Vietnam Pro đứng trước để đủ dấu tiếng Việt.
- Cỡ: hero 56 (mobile 36), H2 28, tiêu đề thẻ 18, thân 15 đến 16, phụ 13, nhỏ nhất 12 (không nhỏ hơn 11).
- Chữ Nhật là nhân vật chính: kanji trên flashcard và câu hỏi 56px, kana mặt trước flashcard 34px, furigana 14px.
- Không dùng Inter, Roboto hay font hệ thống làm font giao diện.

## 4. Hình dạng, khoảng cách
- Bo góc: nút 12, thẻ 14, khung lớn 16 đến 20, chip/pill 999.
- Thang khoảng cách: 4, 8, 12, 16, 20, 24, 32, 48.
- Vùng chạm tối thiểu 44px. Viền 1px (border); nhấn 2px (line).
- Không đổ bóng, không gradient, không glassmorphism, không emoji làm icon.

## 5. Thành phần dùng chung
- StationBadge: vòng tròn 44px, viền 3 đến 4px màu line, chữ mã L01 đến L25. Bài đang học: nền vàng, viền deep. Bài đã học: đặc màu line.
- PracticeShell: nút ✕ 44px, ProgressLine (đường 6px màu track, phần đã qua màu line, điểm vàng bán kính 7 viền deep 3px), bộ đếm "n/N". Khi luyện tập ẩn thanh tab dưới.
- FeedbackSheet: bottom sheet trên mobile, khối nội tuyến dưới nội dung trên desktop. Gồm biểu tượng ✓ (màu line) hoặc ✗ (màu wrong), tiêu đề, giải thích ngắn, nút "Tiếp theo" vàng kèm gợi ý phím Enter.
- OptionButton: bốn trạng thái: mặc định, chọn sai (nền wrong-bg, viền wrong, nhãn "Bạn chọn"), đáp án đúng (nền tint, viền line, nhãn "Đáp án đúng"), mờ (đã trả lời).
- Chip toggle: chọn = nền line, chữ trắng, có dấu ✓; chưa chọn = nền trắng, viền border-strong. Dùng aria-pressed.
- SegmentedControl, Switch (role switch), EmptyState có xem trước mờ (khung nét đứt hoặc thanh mờ thay cho nội dung chưa có).
- Mascot (SVG Shiba đã có trong code): trên web đứng trên sân ga bên cạnh đoàn tàu; trên app ngồi trên mép thẻ chính; ở màn kết quả vẫy tay. Không đặt lơ lửng ở góc.
- Icon: một bộ nét duy nhất (gợi ý Lucide), 22 đến 24px, nét 2. Không emoji.
- Phản hồi đúng/sai luôn có biểu tượng và chữ, không chỉ dựa vào màu. Đúng = xanh line, sai = cam wrong. Không dùng đỏ/xanh lá.

## 6. Ảnh tham chiếu trong design/
| Ảnh | Màn |
| --- | --- |
| web-home.png | Trang chủ web (1440px) |
| app-home.png | Trang chủ app (390px) |
| app-hoc.png | Tab Học, danh sách bài dạng tuyến ga |
| practice-setup.png | Thiết lập luyện tập |
| practice-flashcard.png | Flashcard (mặt sau, chấm 4 mức) |
| practice-choice.png | Trắc nghiệm, trả lời sai |
| practice-typing.png | Gõ đáp án, gõ sai |
| practice-match.png | Ghép cặp có chú giải trạng thái |
| practice-truefalse.png | Đúng/Sai tốc độ |
| practice-order.png | Sắp xếp câu |
| practice-result.png | Kết quả |

Các dạng bài khác dùng chung khung: Nghe → Nghĩa, Điền từ, Chọn trợ từ, Hiểu nghĩa câu, Chọn mẫu ngữ pháp, Nghĩa → Nhật, Kanji → Cách đọc, Kana → Kanji, Nghĩa → Kanji dùng khung trắc nghiệm. Chính tả nghe dùng khung gõ đáp án kèm nút "Nghe lại".

## 7. Quy tắc desktop (từ 1024px trở lên)
- Container tối đa 1200px, padding ngang 24px, căn giữa. Trang đọc dài (bài học, chi tiết kanji) tối đa 880px.
- Điều hướng: thanh trên có logo, năm liên kết (Trang chủ, Học, Ôn tập, Điểm yếu, Thống kê), nút tìm kiếm, đổi giao diện, cài đặt. Thanh tab dưới chỉ hiện dưới 768px.
- Từ 768 đến 1023px: container 720px, lưới 3 đến 4 cột.
- Trang chủ: theo web-home.png. Lưới bài: grid auto-fill minmax(200px, 1fr), mỗi bài là thẻ ga.
- Danh sách từ vựng 1 cột dưới 1024px, 2 cột từ 1024px. Lưới kanji 4 đến 6 cột.
- Luyện tập: cột giữa tối đa 640px, căn giữa; FeedbackSheet thành khối nội tuyến dưới nội dung; ghép cặp rộng tối đa 560px; Thiết lập tối đa 720px với chip xếp lưới; Kết quả chia hai cột (tóm tắt 360px bên trái, câu sai bên phải).
- Giữ phím tắt: Space lật thẻ, 1 đến 4 chọn đáp án, Enter tiếp tục hoặc kiểm tra, mũi tên trái/phải cho sai/đúng.
- Không để nội dung kéo giãn hết bề ngang hay dồn trái, bỏ trống bên phải.

## 8. Truy cập
Chữ thường tương phản tối thiểu 4.5:1. Vùng chạm tối thiểu 44px. Viền focus rõ (2px màu line, cách 2px). aria-label cho nút chỉ có icon. Tôn trọng prefers-reduced-motion. Chuyển động tối đa 250ms.
