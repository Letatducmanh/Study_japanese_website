# AUDIT.md — Kiểm kê mã nguồn trước khi áp SPEC thiết kế

> Tài liệu chỉ đọc. Không có file nào khác bị sửa khi tạo báo cáo này.

## 1. Stack

- **Framework**: React 19.3 + Vite 8, TypeScript strict (`~6.0.3`), build qua `tsc -b && vite build`.
- **Router**: `react-router-dom` 7.18, khai báo tập trung ở [src/App.tsx](src/App.tsx) (một `<Routes>` duy nhất bọc trong `Layout`).
- **Style**: Tailwind CSS 4.3 qua `@tailwindcss/vite` (CSS-first, không có `tailwind.config.js`). Token `--color-*`, `--font-*` khai báo trong [src/index.css](src/index.css) bằng khối `@theme`. Token hiện có: `primary-50/100/500/600/700/900`, `success`, `danger`, `warning`, `sakura-200/400`, `sun-300/500`, `shiba-300/500`. **Không có** token nào trong số: `bg, surface, ink, muted, line, deep, yellow, tint, track, border, border-strong, wrong, wrong-bg, wrong-ink` mà SPEC.md mục 2 yêu cầu — toàn bộ phải thêm mới.
- **Icon**: SPEC muốn bộ Lucide. Thực tế **không có `lucide-react`** trong `package.json` và không file nào import nó — toàn bộ icon hiện là emoji hoặc ký tự Unicode (✓ ✗ → 🔊 🏠 📖 🔁 🎯 📊 🗾 🔍 ⚙️).
- **Font**: SPEC muốn Be Vietnam Pro (giao diện/Việt) + Zen Kaku Gothic New (tiếng Nhật). Thực tế [index.html](index.html):19-24 chỉ load Google Fonts `Noto Sans JP` (400/500/700) và `M PLUS Rounded 1c` (600/800); [src/index.css](src/index.css):7-9 đặt `--font-sans: 'Noto Sans JP'…` và `--font-display: 'M PLUS Rounded 1c'…`. Không có font nào cho tiếng Việt riêng — Noto Sans JP phải gánh cả tiếng Việt, khác hẳn SPEC. `font-display` chỉ dùng ở 1 nơi (`HomePage.tsx:22`, hero title).
- **Lưu dữ liệu & tiến độ**: Dexie (IndexedDB) qua [src/data/progress/dexie-repo.ts](src/data/progress/dexie-repo.ts), implement interface [ProgressRepository](src/data/progress/ProgressRepository.ts). Bảng: `attempts`, `mastery` (`[itemId+skill]`), `srsCards`, `mistakes`, `settings`, `outbox` (hàng đợi đồng bộ, chưa thấy nơi tiêu thụ — `src/data/sync/README.md` chỉ là khung, Supabase sync chưa code). Công thức mastery ở [src/domain/mastery/formula.ts](src/domain/mastery/formula.ts): `score_mới = score_cũ×0.7 + kết_quả×0.3`.
- **Build nội dung**: `content/**` (markdown) → `scripts/content/build.ts` (+ `parse-kanji.ts`, `parse-vocab.ts`, `parse-grammar.ts`, `enrich.ts`, `pipeline.ts`) → `public/content/**` (JSON, không sửa tay) + `content-report.md`. Manifest: `content/manifest.yaml`, đọc qua [src/data/content-loader.ts](src/data/content-loader.ts).

## 2. Toàn bộ route

Tất cả khai báo trong [src/App.tsx](src/App.tsx), bọc trong `<Layout>` ([src/app/Layout.tsx](src/app/Layout.tsx) = `TopBar` + `Outlet` + `BottomNav`):

| Route | Component |
| --- | --- |
| `/` | [HomePage.tsx](src/features/home/HomePage.tsx) |
| `/n` | [LevelsPage.tsx](src/features/browse/LevelsPage.tsx) |
| `/n/:level` | [LevelPage.tsx](src/features/browse/LevelPage.tsx) |
| `/b/:bookId` | [BookPage.tsx](src/features/browse/BookPage.tsx) |
| `/b/:bookId/:lesson` | [LessonPage.tsx](src/features/browse/LessonPage.tsx) |
| `/practice/setup` | [PracticeSetupPage.tsx](src/features/practice/PracticeSetupPage.tsx) |
| `/practice/run` | [PracticeRunPage.tsx](src/features/practice/PracticeRunPage.tsx) |
| `/practice/result/:sessionId` | [PracticeResultPage.tsx](src/features/practice/PracticeResultPage.tsx) |
| `/review` | `ComingSoon` (chưa có trang riêng) |
| `/weak` | [WeaknessPage.tsx](src/features/weakness/WeaknessPage.tsx) |
| `/mistakes` | [MistakesPage.tsx](src/features/weakness/MistakesPage.tsx) |
| `/kanji/:char` | [KanjiDetailPage.tsx](src/features/kanji/KanjiDetailPage.tsx) |
| `/search` | [SearchPage.tsx](src/features/search/SearchPage.tsx) |
| `/stats` | `ComingSoon` |
| `/settings` | [SettingsPage.tsx](src/features/settings/SettingsPage.tsx) |
| `/login`, `/register`, `/forgot-password`, `/account` | `ComingSoon` (4 route, chưa có auth thật — khớp `src/features/auth/README.md` mới là khung) |
| `/about` | [AboutPage.tsx](src/features/about/AboutPage.tsx) — route không có trong yêu cầu gốc, đã tồn tại sẵn |
| `*` | [NotFound.tsx](src/components/NotFound.tsx) |

`LessonPage` có 3 tab con dựng bằng state nội bộ (không phải route riêng): [VocabTab.tsx](src/features/browse/VocabTab.tsx), [GrammarTab.tsx](src/features/browse/GrammarTab.tsx), [KanjiRelatedTab.tsx](src/features/browse/KanjiRelatedTab.tsx).

Ảnh trong `design/` dùng tên tiếng Việt + `@1x/@2x` (`App · Tab Học@1x.png`, `Luyện tập · Ghép cặp@2x.png`...) — **không khớp** tên file SPEC.md mục 6 liệt kê (`web-home.png`, `app-hoc.png`, `practice-match.png`...). Cần map lại thủ công khi lấy ảnh tham chiếu theo đúng màn, SPEC đang trỏ sai tên.

## 3. Component dùng lại được — và chỗ trùng lặp

Component chia sẻ hiện có:

- [TextChoiceCard.tsx](src/components/TextChoiceCard.tsx) — "đề bài + N lựa chọn văn bản", dùng cho 7 dạng (mcq con chữ, conjugation-mcq, grammar-pattern, kanji-hanviet, kanji-reading×2, sentence-meaning — xem mục 4).
- [BlankChoiceCard.tsx](src/components/BlankChoiceCard.tsx) — "câu có ô trống + N lựa chọn", dùng cho fill-blank, particle, kanji-in-vocab.
- [KanjiCard.tsx](src/components/KanjiCard.tsx), [Ruby.tsx](src/components/Ruby.tsx), [SpeakButton.tsx](src/components/SpeakButton.tsx), [ThemeToggle.tsx](src/components/ThemeToggle.tsx), [ErrorState.tsx](src/components/ErrorState.tsx), [LoadingState.tsx](src/components/LoadingState.tsx), [NotFound.tsx](src/components/NotFound.tsx), [ComingSoon.tsx](src/components/ComingSoon.tsx).
- [ShibaMascot.tsx](src/components/mascot/ShibaMascot.tsx), [JapanMotifBackground.tsx](src/components/mascot/JapanMotifBackground.tsx).

**Không tồn tại** bất kỳ component nào SPEC mục 5 đặt tên: `StationBadge`, `PracticeShell`, `FeedbackSheet`, `OptionButton`, `Chip toggle`, `SegmentedControl`, `Switch`, `EmptyState`. Tất cả phải tạo mới từ đầu.

Trùng lặp cụ thể:
- **Nút tròn chính** (`min-h-11 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700`) bị copy-paste nguyên văn ở ít nhất 10 nơi: `TextChoiceCard`, `BlankChoiceCard`, `TypingComponent`, `ConjugationTypingComponent`, `DictationComponent`, `SentenceOrderComponent` (2 lần), `ComingSoon`, `PracticeSetupPage`, `WeaknessPage`, `PracticeResultPage`. Không có `<Button>` chung.
- **Khối thẻ to bo góc `rounded-2xl border ... bg-white p-6 shadow-sm`** lặp lại độc lập ở `FlashcardComponent` và `SpeedTrueFalseComponent` — khác class nhau nhỏ nhặt, không dùng chung.
- **Thanh đếm giờ/điểm dạng text nhỏ phía trên** tự viết riêng trong `MatchingComponent` (`{elapsedMs}s`) và `SpeedTrueFalseComponent` (`{remainingMs}s`, điểm, điểm cao) — không có `ProgressLine`/đồng hồ chung nào.
- **Bộ đếm "Câu n/N"** chỉ có một bản, nhưng đặt cứng trong `PracticeRunPage.tsx:253-255`, áp dụng y nguyên cho mọi mode kể cả 2 mode không hợp (mục 7, lỗi #4).
- Toggle/segment tuỳ chọn ở `PracticeSetupPage` (chip chọn dạng bài, chip số câu, chip tỉ lệ) đều tự vẽ lại class `border-primary-600 bg-primary-600 text-white` / `border-slate-200 text-slate-600` — đúng là ứng cử viên cho `Chip`/`SegmentedControl` chung nhưng hiện chưa có.
- Không có `EmptyState` chung: mỗi trang tự viết `<p>{vi.xxx.empty}</p>` riêng (`WeaknessPage`, `MistakesPage`, `SearchPage`...).

## 4. `/practice/run` — 16 dạng bài

`PracticeRunPage.tsx` chỉ hiển thị `vi.practice.progress(currentIndex+1, total)` (chuỗi "Câu n/N") rồi render `current.questionType.Component` — không có `PracticeShell`, không ẩn `BottomNav` khi đang luyện tập (SPEC mục 5 yêu cầu ẩn — hiện vẫn hiện `TopBar`/`BottomNav` nguyên trang). Đăng ký ở [register-all.ts](src/features/practice/modes/register-all.ts) — 15 import, nhưng `kanji-reading/index.tsx` tự `register()` 2 lần (on + kun) nên tổng **16 dạng**:

| # | id | File render | Component dùng chung | Phím tắt | State cục bộ / ghi vào progress |
| --- | --- | --- | --- | --- | --- |
| 1 | `flashcard` | [flashcard/FlashcardComponent.tsx](src/features/practice/modes/flashcard/FlashcardComponent.tsx) | — (tự vẽ thẻ lật) | Space lật thẻ; 1-4 chấm điểm Quên/Khó/Tốt/Dễ | `face`, `flipped`; không ghi Dexie trực tiếp (PracticeRunPage ghi `Attempt` sau `onAnswer`) |
| 2 | `mcq` | [mcq/McqComponent.tsx](src/features/practice/modes/mcq/McqComponent.tsx) | tự vẽ (không dùng TextChoiceCard) | 1-N chọn, Enter xác nhận | `picked`; TTS tự phát nếu có `promptAudio` |
| 3 | `typing` | [typing/TypingComponent.tsx](src/features/practice/modes/typing/TypingComponent.tsx) | — | Enter submit (**không phản hồi**, xem mục 7 lỗi #1) | `value`, `showHint`; `bindKanaInput` (romaji→kana) |
| 4 | `dictation` | [dictation/DictationComponent.tsx](src/features/practice/modes/dictation/DictationComponent.tsx) | — | Enter submit (cùng lỗi #1) | `value`; tự phát TTS khi mount + nút nghe lại 🔊 |
| 5 | `matching` | [matching/MatchingComponent.tsx](src/features/practice/modes/matching/MatchingComponent.tsx) | — (mini-game riêng, tự ghi `Attempt` qua `progressRepository.recordAttempt` cho **mỗi cặp**, rồi mới gọi `onAnswer` 1 lần khi xong) | không | `matchedIds`, `mistakes`, `selectedJp/Vi`, `shakeIds`, đồng hồ `elapsedMs` |
| 6 | `speed-truefalse` | [speed-truefalse/SpeedTrueFalseComponent.tsx](src/features/practice/modes/speed-truefalse/SpeedTrueFalseComponent.tsx) | — (mini-game 60s, tự ghi `Attempt` mỗi lượt) | không (chỉ 2 nút ✓/✗ chạm) | `remainingMs`, `score`, `highScore` (lưu vào `AppSettings.speedTrueFalseHighScore`) |
| 7 | `fill-blank` | [fill-blank/FillBlankComponent.tsx](src/features/practice/modes/fill-blank/FillBlankComponent.tsx) | `BlankChoiceCard` | 1-4 chọn, Enter | không, stateless |
| 8 | `particle` | [particle/ParticleComponent.tsx](src/features/practice/modes/particle/ParticleComponent.tsx) | `BlankChoiceCard` | 1-4 chọn, Enter | không |
| 9 | `sentence-order` | [sentence-order/SentenceOrderComponent.tsx](src/features/practice/modes/sentence-order/SentenceOrderComponent.tsx) | — | không (chỉ chạm) | `placedIds`, `showHint`, `submitted` |
| 10 | `sentence-meaning` | [sentence-meaning/index.tsx](src/features/practice/modes/sentence-meaning/index.tsx) | `TextChoiceCard` | 1-4 chọn, Enter | không |
| 11 | `grammar-pattern` | [grammar-pattern/index.tsx](src/features/practice/modes/grammar-pattern/index.tsx) | `TextChoiceCard` | 1-4 chọn, Enter | không |
| 12 | `conjugation-mcq` | [conjugation-mcq/index.tsx](src/features/practice/modes/conjugation-mcq/index.tsx) | `TextChoiceCard` | 1-4 chọn, Enter | không |
| 13 | `conjugation-typing` | [conjugation-typing/ConjugationTypingComponent.tsx](src/features/practice/modes/conjugation-typing/ConjugationTypingComponent.tsx) | — | Enter submit (**cùng lỗi #1**) | `value`; `bindKanaInput` |
| 14 | `kanji-reading-on` | [kanji-reading/index.tsx](src/features/practice/modes/kanji-reading/index.tsx) | `TextChoiceCard` | 1-4 chọn, Enter | không |
| 15 | `kanji-reading-kun` | cùng file trên (factory `createKanjiReadingType`) | `TextChoiceCard` | 1-4 chọn, Enter | không |
| 16 | `kanji-hanviet` | [kanji-hanviet/index.tsx](src/features/practice/modes/kanji-hanviet/index.tsx) | `TextChoiceCard` | 1-4 chọn, Enter | không |

(`kanji-in-vocab` dùng `BlankChoiceCard` — nằm trong danh sách trên nhưng gộp cùng nhóm BlankChoiceCard, tổng vẫn 16 vì đã đếm `kanji-reading` là 2.)

Phím tắt toàn cục chỉ tồn tại trong từng Component riêng (mỗi component tự `addEventListener('keydown', ...)` hoặc `onKeyDown` trên input) — không có lớp phím tắt chung ở `PracticeShell` như SPEC muốn (Space lật thẻ chỉ có ở Flashcard; mũi tên trái/phải cho sai/đúng mà SPEC mục 7 nhắc tới **không tồn tại ở đâu cả**).

## 5. Hard-code màu / font / emoji

- **Hex màu cứng ngoài `index.css`**: chỉ 1 file — [ShibaMascot.tsx](src/components/mascot/ShibaMascot.tsx) (14 chỗ, toàn bộ là SVG trang trí linh vật: `#fff8f0`, `#dc2626`, `#5b3a21`, `#2b1b12`, `#fff`). Chấp nhận được vì là hình vẽ, không phải màu trạng thái UI.
- **Class Tailwind màu mặc định (`slate-*, blue-*, red-*, green-*...`) thay vì token SPEC**: **37 file** trong `src/` — gần như toàn bộ trang và mode luyện tập dùng `text-slate-900`, `border-slate-200`, `dark:bg-slate-800`... SPEC mục 2 cấm dùng lại `slate-900`/`blue-2563eb` mặc định của Tailwind — vi phạm lan rộng khắp codebase, không phải vài chỗ lẻ tẻ.
- **Emoji dùng làm icon**: 5 file — [BottomNav.tsx](src/app/BottomNav.tsx) (🏠📖🔁🎯📊), [TopBar.tsx](src/app/TopBar.tsx) (🗾🔍⚙️), [SpeakButton.tsx](src/components/SpeakButton.tsx) (🔊), [DictationComponent.tsx](src/features/practice/modes/dictation/DictationComponent.tsx) (🔊), [McqComponent.tsx](src/features/practice/modes/mcq/McqComponent.tsx) (🔊 — dùng trong nút phát audio khi không có `promptText`). `SpeedTrueFalseComponent.tsx` dùng ✓/✗ làm nhãn nút (không phải icon font nhưng cùng vấn đề "không phải bộ icon nét đơn 22-24px" SPEC muốn).
- **Font**: xem mục 1 — toàn bộ app dùng `Noto Sans JP` + `M PLUS Rounded 1c`, không có Be Vietnam Pro / Zen Kaku Gothic New ở đâu.

## 6. "Sắp có" / placeholder

- 5 route dùng `<ComingSoon />` trực tiếp trong `App.tsx`: `/review`, `/stats`, `/login`, `/register`, `/forgot-password`, `/account` (6 route thực ra, không phải 5 — đếm lại: review, stats, login, register, forgot-password, account = 6).
- [ComingSoon.tsx](src/components/ComingSoon.tsx): tiêu đề mặc định `vi.comingSoon.title`, có nút "Về trang chủ" — dùng chung cho mọi route trên, không phân biệt nội dung sắp có là gì.
- **Trang chủ** ([HomePage.tsx](src/features/home/HomePage.tsx):53-83) có 3 thẻ preview dạng lưới: thẻ "Ôn tập" (`reviewTitle/reviewBody`, tĩnh, không phải `<Link>`) và thẻ "Streak/chuỗi ngày" (`streakTitle/streakBody`, tĩnh, không `<Link>`) đều là placeholder thật — chưa có tính năng, chỉ hiện text; chỉ thẻ "Điểm yếu" ở giữa có `<Link to="/weak">` thật.
- `vi.home.weakBodyEmpty` dùng khi `listWeak(1)` trả rỗng — đây là 1 empty-state hợp lý (không phải bug), nhưng không theo mẫu `EmptyState` nào vì chưa có.

## 7. Xác nhận lỗi đã biết

### #1 — Gõ đáp án bấm "Kiểm tra" hoặc Enter không có phản hồi — **XÁC NHẬN**
Nguyên nhân: `TypingComponent.submit()` ([typing/TypingComponent.tsx:23-26](src/features/practice/modes/typing/TypingComponent.tsx#L23)), `ConjugationTypingComponent.submit()` ([conjugation-typing/ConjugationTypingComponent.tsx:25-28](src/features/practice/modes/conjugation-typing/ConjugationTypingComponent.tsx#L25)) và `DictationComponent.submit()` ([dictation/DictationComponent.tsx:25-28](src/features/practice/modes/dictation/DictationComponent.tsx#L25)) đều gọi `onAnswer(value)` **ngay lập tức**, không có bước hiển thị đúng/sai trước khi chuyển câu — khác hẳn `TextChoiceCard`/`BlankChoiceCard` ([src/components/TextChoiceCard.tsx:51-73](src/components/TextChoiceCard.tsx#L51), [BlankChoiceCard.tsx:57-79](src/components/BlankChoiceCard.tsx#L57)) nơi bấm chọn chỉ set `picked` (hiện màu xanh/đỏ ngay trong thẻ), còn `onAnswer` chỉ gọi khi bấm nút "Tiếp theo" riêng. `PracticeRunPage.handleAnswer()` ([PracticeRunPage.tsx:215-249](src/features/practice/PracticeRunPage.tsx#L215)) có phát âm thanh đúng/sai (`playCorrectSound/playWrongSound`) và tăng `currentIndex` ngay — nhưng 3 mode gõ đáp án không tự vẽ khối phản hồi (icon/màu/giải thích) nào trước khi bị component cha thay luôn bằng câu hỏi tiếp theo, nên người dùng chỉ nghe tiếng bíp rồi câu đổi, cảm giác "không phản hồi gì".

### #2 — Tìm kiếm trả quá nhiều kết quả không liên quan — **XÁC NHẬN**
Nguyên nhân: [src/data/search-index.ts:92](src/data/search-index.ts#L92) gọi `mini.search(trimmed, { prefix: true, fuzzy: 0.2 })` trên cả 4 field `kana, kanji, romaji, meaning` không có `boost` field nào, không có ngưỡng điểm tối thiểu, `limit` mặc định 30 ([searchVocab](src/data/search-index.ts#L84), gọi từ `SearchPage.tsx:21` không truyền `limit`). `fuzzy: 0.2` cho phép khoảng cách Levenshtein tới ~20% độ dài từ trên mọi field kể cả `meaning` (câu tiếng Việt dài) — gõ một từ ngắn có thể fuzzy-match vào rất nhiều nghĩa không liên quan. Không throttle/debounce input (`useAsyncData` gọi lại mỗi keystroke).

### #3 — Dữ liệu kanji có ký tự thừa (ví dụ 行 → "đi; tiến hành) / HÀNG (hàng, dòng") — **XÁC NHẬN, tìm được nguyên nhân chính xác**
Dữ liệu gốc `content/n5/kanji-master-n5/kanji.md:147` (và bản giống ở `Docs/Kanji_Master_N5.md:147`) có ô: `HÀNH (đi; tiến hành) / HÀNG (hàng, dòng)` — chuỗi gốc **cân bằng dấu ngoặc**, không lỗi ở nguồn.
Lỗi thật nằm ở parser: [scripts/content/parse-kanji.ts:160](scripts/content/parse-kanji.ts#L160)
```ts
const meaningMatch = /^(.+?)\s*\((.+)\)$/u.exec(meaningCell.trim())
```
Vì `(.+)` ở nhóm 2 là *greedy* và bị `$` ở cuối ép khớp đến dấu `)` **cuối cùng** trong cả chuỗi, trong khi nhóm 1 `(.+?)` không-greedy chỉ lấy tới dấu `(` **đầu tiên** — với 2 cụm Hán Việt trên 1 ô, kết quả bị cắt sai:
- `hanViet` = `"HÀNH"` (đúng mỗi 1 phần đầu)
- `meaning` = `"đi; tiến hành) / HÀNG (hàng, dòng"` (nuốt luôn dấu `)` đóng của cụm 1 và dấu `(` mở của cụm 2, mất 2 dấu ngoặc biên)
→ khớp đúng 100% hiện tượng người dùng thấy. Đây là lỗi parser dùng regex 1-cặp-ngoặc cho ô có 2 cặp ngoặc, không phải lỗi gõ nội dung.

### #4 — Nhãn "Câu n/N" ở Ghép cặp và Đúng/Sai tốc độ không hợp — **XÁC NHẬN**
`PracticeRunPage.tsx:253-255` in cố định `vi.practice.progress(currentIndex+1, total)` = `"Câu n/N"` phía trên **mọi** mode, không có cách nào mode override. Với `matching` ([MatchingComponent.tsx](src/features/practice/modes/matching/MatchingComponent.tsx)) và `speed-truefalse` ([SpeedTrueFalseComponent.tsx](src/features/practice/modes/speed-truefalse/SpeedTrueFalseComponent.tsx)), cả "câu hỏi" (`question`) thực chất là **một vòng chơi gồm nhiều cặp/nhiều lượt** (6 cặp cho matching, chạy tới khi hết 60s cho speed-truefalse) — `onAnswer` chỉ gọi **một lần duy nhất** khi vòng kết thúc. Do đó với `questionCount=1` (thường gặp khi 2 mode này được chọn), "Câu 1/1" hiển thị suốt cả vòng chơi 60 giây hoặc suốt 6 cặp ghép — nhãn "Câu" sai ngữ nghĩa, nên là "Vòng"/không nhãn gì.

### #5 — Trang Điểm yếu liệt kê bài "0% thuộc" khi chưa có dữ liệu — **XÁC NHẬN**
`computeLessonScores()` ([lesson-scores.ts:30-39](src/domain/mastery/lesson-scores.ts#L30)) chạy qua **mọi** `lessonMeta` trong `lessons` (trừ `'appendix'`) và luôn `result.set(lesson, lessonMasteryScore(...))` dù `itemAverages` rỗng. `lessonMasteryScore([], totalMainWords)` ([formula.ts:60-67](src/domain/mastery/formula.ts#L60)) trả về `0 / totalMainWords = 0` khi chưa làm bài nào — **không phân biệt được** "bài chưa học" và "bài học rồi nhưng kém". `WeaknessPage.tsx:74-91` lấy toàn bộ map này, `sort((a,b) => a.score - b.score).slice(0, 5)` — bài chưa đụng tới luôn thắng vị trí "yếu nhất" vì điểm 0 luôn nhỏ nhất. Cần filter theo "có ít nhất 1 attempt trong bài" trước khi coi là ứng viên "yếu".

### Bất thường khác phát hiện thêm (không sửa)
- `PracticeRunPage` không ẩn `TopBar`/`BottomNav` khi đang luyện tập — khác yêu cầu SPEC mục 5 (PracticeShell "khi luyện tập ẩn thanh tab dưới").
- `matching`/`speed-truefalse` tự gọi `progressRepository.recordAttempt` **bên trong Component**, còn 14 mode khác để `PracticeRunPage.handleAnswer` ghi — hai luồng ghi `Attempt` khác nhau cho cùng 1 khái niệm, dễ ghi trùng hoặc thiếu field (`expected`/`given`) nếu sau này đổi logic chung.
- `register-all.ts` liệt kê 15 dòng import nhưng tạo ra 16 `QuestionType` vì `kanji-reading` tự đăng ký 2 lần trong 1 file — dễ nhầm khi đếm "16 dạng" nếu chỉ đếm số dòng import hoặc số thư mục.
- `WeaknessPage.REVIEW_MODE_IDS` và `MistakesPage.REVIEW_MODE_IDS` chứa `'mcq-jp-vi'`, `'mcq-vi-jp'` — nhưng registry thực tế chỉ có id `'mcq'` (xem `mcq/index.ts`), không có `mcq-jp-vi`/`mcq-vi-jp` nào được `register()`. `getQuestionType()` sẽ trả `undefined` cho 2 id này và bị filter bỏ ở `PracticeRunPage.tsx:106-112` (`questionTypes = ... .filter(qt => qt !== undefined)`) — nghĩa là nút "Luyện ngay"/"Ôn lại" từ hai trang này chỉ còn `flashcard` hoạt động thực sự, 2/3 mode dự kiến bị âm thầm rớt.
- `index.html:12` có `<meta name="theme-color" content="#2563eb">` — đúng là màu xanh Tailwind mặc định mà SPEC cấm dùng lại, nằm ngoài phạm vi "trong `src/`" nên không bị đếm ở mục 5 nhưng vẫn cần đổi.
- `SettingsPage.tsx:95,100` dùng `hover:bg-red-50`, `bg-red-50`, `dark:bg-red-950/*` — thêm một lớp màu Tailwind mặc định khác (`red-*`) ngoài `slate-*` đã đếm ở mục 5, cũng cần thay bằng token `wrong-bg`.

## 8. Đề xuất thứ tự Prompt 1/2/3 và rủi ro

**Prompt 1 — Nền tảng design token + component dùng chung + font/icon**
Thêm token `bg/surface/ink/muted/line/deep/yellow/tint/track/border/border-strong/wrong/wrong-bg/wrong-ink` (+ biến thể dark) vào `@theme` trong `index.css`; đổi font-face sang Be Vietnam Pro + Zen Kaku Gothic New; cài `lucide-react`; dựng 7 component mới (`StationBadge`, `PracticeShell`, `FeedbackSheet`, `OptionButton`, `Chip`, `SegmentedControl`, `EmptyState`) **nhưng chưa gắn vào trang nào** — chỉ build + test độc lập (Storybook-less, test bằng `*.test.tsx`). Không đổi logic nghiệp vụ.

**Prompt 2 — Áp component mới vào 16 dạng luyện tập + sửa 5 lỗi đã biết**
Thay `TextChoiceCard`/`BlankChoiceCard` bằng `OptionButton`+`FeedbackSheet`; bọc `PracticeRunPage` bằng `PracticeShell` (ẩn BottomNav, đổi "Câu n/N" thành nhãn theo mode — sửa lỗi #4 luôn ở đây vì cùng chỗ); thêm bước feedback cho 3 mode gõ đáp án (sửa lỗi #1); sửa regex `parse-kanji.ts` (lỗi #3, cần chạy lại `content:build` + so sánh `content-report.md`); giảm fuzzy/giới hạn field search hoặc thêm boost (lỗi #2); filter "đã có attempt" trước khi xếp hạng bài yếu (lỗi #5). Đây là prompt rủi ro cao nhất.

**Prompt 3 — Các trang còn lại + rà soát hard-code + empty state**
Áp token/font cho Home/Browse/Kanji/Search/Settings/About, xoá emoji icon còn lại (BottomNav/TopBar/SpeakButton), thay 2 thẻ placeholder trang chủ ("Ôn tập", "Streak") bằng `EmptyState` nhất quán hoặc ẩn hẳn nếu chưa làm `/review`/`/stats`, dọn `red-*`/`slate-*` còn sót, xử lý `mcq-jp-vi`/`mcq-vi-jp` id sai ở Weakness/Mistakes.

**Rủi ro / file nổ nhiều nơi khi đổi**:
- `PracticeRunPage.tsx` — mọi 16 mode phụ thuộc interface `{ q, onAnswer }`; đổi chữ ký hoặc cách hiển thị progress ảnh hưởng toàn bộ cùng lúc.
- `src/components/TextChoiceCard.tsx` và `BlankChoiceCard.tsx` — dùng chung bởi 10/16 mode; sửa sai một chỗ là hỏng 10 dạng bài cùng lúc.
- `src/domain/quiz/registry.ts`, `session.ts`, `grading.ts` — logic thuần, có unit test riêng, nhưng mọi mode import; CLAUDE.md quy tắc 4 đã cấm sửa session runner để thêm dạng — khi làm Prompt 2 cần tuân thủ, chỉ sửa UI/Component, không sửa `registry`/`session`.
- `scripts/content/parse-kanji.ts` — sửa regex ảnh hưởng **toàn bộ** cột Hán Việt của mọi ký tự có 2+ nghĩa trong 1 ô (không chỉ 行), phải chạy `npm run content:build` + `content:validate` lại toàn bộ và so khớp `content-report.md` trước/sau.
- `src/data/search-index.ts` — là index toàn cục build 1 lần (`indexPromise` singleton); đổi field/boost cần tính lại cảm quan trên nhiều từ khoá thật, không chỉ 1-2 ca thử.
- `src/index.css` token mới nếu đặt tên đè lên token cũ (`primary-*`) sẽ phá mọi class `bg-primary-600` đang dùng ở 37 file cùng lúc — nên thêm token mới song song, không xoá `primary-*` cho tới khi migrate xong toàn bộ.

## Câu hỏi trước khi sửa

1. Prompt 1 có nên dừng ở "token + component rỗng" hay đã migrate luôn 1-2 trang mẫu (ví dụ trang chủ) để nhìn thấy kết quả thật trước khi làm tiếp?
2. 5 lỗi đã biết (mục 7) có sửa ngay trong Prompt 2 cùng lúc với việc thay component luyện tập, hay tách riêng thành Prompt 2a (chỉ sửa bug, giữ UI cũ) rồi Prompt 2b (đổi UI) để dễ review từng phần?
3. Đổi regex `parse-kanji.ts` sẽ làm thay đổi `hanViet`/`meaning` của mọi kanji có nhiều nghĩa trong 1 ô — có cần rà lại toàn bộ `content-report.md` thủ công trước khi merge, hay chỉ cần test case 行 là đủ?
4. Token màu tối (dark mode) ở SPEC mục 2 nói "tự suy ra cho nền tối" — cần tôi tự chọn giá trị hex cụ thể cho `tint/track/border/wrong-*` ở dark mode luôn trong Prompt 1, hay bạn muốn duyệt bảng màu dark trước khi code?
5. `mcq-jp-vi`/`mcq-vi-jp` dùng ở Weakness/Mistakes đang trỏ vào id không tồn tại (mục 7, bất thường khác) — coi đây là lỗi thứ 6 cần sửa cùng đợt, hay để nguyên vì ngoài phạm vi 5 lỗi bạn đã nêu?
