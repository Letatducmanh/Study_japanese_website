export const vi = {
  appName: 'Tự học tiếng Nhật cùng Mạnh',
  appNameShort: 'Học tiếng Nhật cùng Mạnh',

  nav: {
    home: 'Trang chủ',
    learn: 'Học',
    review: 'Ôn tập',
    weak: 'Điểm yếu',
    stats: 'Thống kê',
  },

  topbar: {
    searchPlaceholder: 'Tìm từ, Kanji, ngữ pháp...',
    settings: 'Cài đặt',
    toggleThemeToLight: 'Chuyển sang chế độ sáng',
    toggleThemeToDark: 'Chuyển sang chế độ tối',
  },

  comingSoon: {
    title: 'Sắp có',
    description: 'Tính năng này đang được xây dựng ở giai đoạn sau.',
    backHome: 'Về trang chủ',
  },

  notFound: {
    title: 'Không tìm thấy trang',
    description: 'Đường dẫn bạn truy cập không tồn tại.',
    backHome: 'Về trang chủ',
  },

  loading: 'Đang tải...',
  error: {
    loadFailed: 'Không tải được dữ liệu, thử lại sau.',
  },

  common: {
    speak: 'Nghe phát âm',
    showMeaning: 'Hiện nghĩa',
    hideMeaning: 'Ẩn nghĩa',
    showRomaji: 'Hiện romaji',
    hideRomaji: 'Ẩn romaji',
    showTranslation: 'Hiện bản dịch',
    hideTranslation: 'Ẩn bản dịch',
    supplemental: 'Bổ sung',
    all: 'Tất cả',
  },

  home: {
    heroTitle: 'Tự học tiếng Nhật cùng Mạnh',
    heroSubtitle:
      'Học và kiểm tra tiếng Nhật theo từng bài, tự phát hiện phần mình đang yếu.',
    browseCta: 'Bắt đầu học',
    reviewTitle: 'Ôn tập hôm nay',
    weakTitle: 'Điểm yếu nổi bật',
    streakTitle: 'Chuỗi ngày học',
  },

  levels: {
    pageTitle: 'Chọn cấp độ',
  },

  level: {
    booksTitle: 'Giáo trình',
  },

  book: {
    lessonsTitle: 'Danh sách bài',
    lessonLabelFallback: 'Bài',
    appendixShortLabel: 'PL',
  },

  lesson: {
    tabVocab: 'Từ vựng',
    tabGrammar: 'Ngữ pháp',
    tabKanji: 'Kanji liên quan',
    practiceCta: 'Luyện tập bài này',
    vocabMainTitle: 'Từ vựng chính',
    vocabExtendedTitleFallback: 'Từ vựng mở rộng',
    filterSectionAll: 'Tất cả',
    filterSectionMain: 'Từ vựng chính',
    filterSectionExtended: 'Mở rộng',
    filterEditionNew: 'Bản mới',
    filterEditionOld: 'Bản cũ',
    noVocab: 'Bài này chưa có từ vựng.',
    noGrammar: 'Bài này chưa có ngữ pháp.',
    noKanjiRelated: 'Không có Kanji liên quan trong bài này.',
  },

  kanjiChapter: {
    noKanji: 'Chương này chưa có Kanji.',
  },

  kanjiDetail: {
    strokesLabel: 'Số nét',
    kunLabel: 'Âm Kun',
    onLabel: 'Âm On',
    meaningLabel: 'Nghĩa Hán Việt',
    examplesTitle: 'Ví dụ',
    relatedVocabTitle: 'Từ vựng có chứa chữ này',
    noRelatedVocab: 'Chưa có từ vựng nào dùng chữ này.',
    kindKun: 'Âm Kun',
    kindOn: 'Âm On',
    kindSpecial: 'Đọc đặc biệt',
    none: '-',
  },

  settings: {
    pageTitle: 'Cài đặt',
    themeLabel: 'Giao diện sáng / tối',
    dataSectionTitle: 'Dữ liệu học tập',
    exportButton: 'Xuất tiến độ ra file',
    exportSuccess: 'Đã tải file sao lưu tiến độ.',
    importButton: 'Nhập tiến độ từ file',
    importSuccess: 'Đã nhập tiến độ thành công.',
    importError: 'File không hợp lệ, không nhập được.',
    clearButton: 'Xóa toàn bộ tiến độ',
    clearConfirmTitle: 'Xóa toàn bộ tiến độ trên máy này?',
    clearConfirmBody:
      'Thao tác này không thể hoàn tác. Hãy xuất file sao lưu trước nếu muốn giữ lại.',
    clearConfirmYes: 'Xác nhận xóa',
    clearConfirmCancel: 'Hủy',
    clearSuccess: 'Đã xóa toàn bộ tiến độ.',
  },

  flashcard: {
    faceKana: 'Kana',
    faceKanji: 'Kanji',
    faceMeaning: 'Nghĩa',
    flipHint: 'Bấm hoặc nhấn Space để lật thẻ',
    ratingForgot: 'Quên',
    ratingHard: 'Khó',
    ratingGood: 'Nhớ',
    ratingEasy: 'Dễ',
  },

  practice: {
    setupTitle: 'Thiết lập luyện tập',
    noScope: 'Hãy chọn một bài học để luyện tập.',
    backToBrowse: 'Chọn bài học',
    modeLabel: 'Dạng bài',
    countLabel: 'Số câu',
    countAll: 'Tất cả',
    includeExtendedLabel: 'Gồm từ vựng mở rộng',
    startButton: 'Bắt đầu luyện tập',
    noModeAvailable: 'Bài này chưa có dạng luyện tập nào.',
    runNoConfig: 'Chưa chọn phiên luyện tập nào.',
    progress: (current: number, total: number) => `Câu ${current}/${total}`,
    doneTitle: 'Hoàn thành!',
    doneBody: (count: number) => `Bạn đã luyện xong ${count} thẻ.`,
    doneBackToLesson: 'Về bài học',
    doneRetry: 'Luyện lại',
  },

  search: {
    pageTitle: 'Tìm kiếm',
    hint: 'Gõ để tìm theo kana, Kanji, romaji hoặc nghĩa tiếng Việt (gõ không dấu cũng được).',
    empty: 'Không tìm thấy kết quả.',
    resultCountSuffix: 'kết quả',
  },

  about: {
    pageTitle: 'Giới thiệu',
    intro:
      'Website tự học và kiểm tra tiếng Nhật theo từng bài, giúp người học phát hiện phần mình đang yếu.',
    sourcesTitle: 'Nguồn tham khảo giáo trình',
    sourcesBody:
      'Nội dung tham khảo giáo trình Minna no Nihongo (3A Corporation) và Kanji Master N5 (三修社). Website là công cụ tự học, khuyến khích người học mua sách gốc để có đầy đủ bài đọc, bài nghe và giải thích chi tiết.',
    dataPolicyTitle: 'Chính sách dữ liệu',
    dataPolicyBody:
      'Không đăng nhập: tiến độ học lưu trên trình duyệt của bạn. Đăng nhập: tiến độ đồng bộ an toàn lên tài khoản của riêng bạn, không ai khác đọc được.',
  },
} as const
