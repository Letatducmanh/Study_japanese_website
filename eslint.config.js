import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import { readdirSync } from 'node:fs'
import tseslint from 'typescript-eslint'

const RULE = '@typescript-eslint/no-restricted-imports'
const SRC = '**/*.{ts,tsx}'

// Mẫu import tới một lớp: bí danh `@/<lớp>` và đường dẫn tương đối đi qua thư mục tên lớp.
const toLayer = (layer, message) => ({
  group: [`@/${layer}`, `@/${layer}/**`, `**/${layer}/**`],
  message,
})
const bannedLayers = (layers, from) =>
  layers.map((l) => toLayer(l, `${from} không được import ${l}/ (ARCHITECTURE §4.2)`))

// Gói chỉ được import ở một chỗ (luật toàn cục). Khối ngoại lệ tắt đúng gói tương ứng.
const globalPaths = (allow = {}) => [
  ...(allow.dexie
    ? []
    : [{ name: 'dexie', message: 'Chỉ src/data/progress/dexie-repo.ts được import dexie (§4.2)' }]),
  ...(allow.supabase
    ? []
    : [{ name: '@supabase/supabase-js', message: 'Chỉ src/data/supabase-client.ts được import @supabase/supabase-js (§4.2)' }]),
]
const globalPatterns = (allow = {}) =>
  allow.capacitor
    ? []
    : [{ group: ['@capacitor/*'], message: 'Chỉ src/platform/native/** được import @capacitor/* (§4.2)' }]

// Dựng một khối cấu hình: luật của lớp + luật toàn cục (trừ phần được nới).
const block = (files, { paths = [], patterns = [] } = {}, allow = {}) => ({
  files,
  rules: {
    [RULE]: [
      'error',
      {
        paths: [...paths, ...globalPaths(allow)],
        patterns: [...patterns, ...globalPatterns(allow)],
      },
    ],
  },
})

function layeringRules() {
  const reactPaths = ['react', 'react-dom', 'react-router-dom', 'zustand'].map((name) => ({
    name,
    message: 'domain/ là logic thuần, không import thư viện giao diện/trạng thái (§4.2)',
  }))
  const reactOnly = [{ name: 'react', message: 'data/ không import react, trừ data/hooks/ (§4.2)' }]
  const domainRule = { paths: reactPaths, patterns: bannedLayers(['data', 'features', 'ui', 'platform', 'app'], 'domain/') }
  const dataRule = { paths: reactOnly, patterns: bannedLayers(['features', 'ui', 'app'], 'data/') }
  const uiRule = { patterns: bannedLayers(['features', 'data', 'domain', 'app'], 'ui/') }
  const featureAppBan = bannedLayers(['app'], 'features/')

  // Mỗi feature X không được import feature Y khác (sinh từ danh sách thư mục thật).
  const features = readdirSync('src/features', { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
  const otherFeatures = (x) =>
    features
      .filter((y) => y !== x)
      .map((y) => ({
        group: [`@/features/${y}`, `@/features/${y}/**`, `**/features/${y}/**`],
        message: `features/${x} không được import features/${y} (§4.2)`,
      }))

  return [
    // Nền: luật toàn cục cho mọi file trong src.
    block([`src/${SRC}`]),
    block([`src/domain/${SRC}`], domainRule),
    block([`src/data/${SRC}`], dataRule),
    block([`src/data/hooks/${SRC}`], { patterns: dataRule.patterns }),
    block([`src/ui/${SRC}`], uiRule),
    block([`src/features/${SRC}`], { patterns: featureAppBan }),
    ...features.map((x) =>
      block([`src/features/${x}/${SRC}`], { patterns: [...featureAppBan, ...otherFeatures(x)] }),
    ),
    // platform/ chỉ được import lib/ (thư mục chưa có file, khối có sẵn cho feature native-app).
    block(
      [`src/platform/${SRC}`],
      { patterns: bannedLayers(['domain', 'data', 'ui', 'features', 'app'], 'platform/') },
    ),
    block(
      [`src/platform/native/${SRC}`],
      { patterns: bannedLayers(['domain', 'data', 'ui', 'features', 'app'], 'platform/') },
      { capacitor: true },
    ),
    // Chỗ duy nhất được import dexie / @supabase/supabase-js.
    block([`src/data/progress/dexie-repo.ts`], dataRule, { dexie: true }),
    block([`src/data/supabase-client.ts`], dataRule, { supabase: true }),

    // --- Ngoại lệ có tên (nợ kỹ thuật đã ghi ở plan.md → Complexity Tracking) ---
    // TD-1: registry giữ thành phần React của từng dạng bài (chỉ kiểu `ComponentType`).
    //       Sửa ở ui-kit-and-shell / practice-ui-migration: tách kiểu thành phần ra khỏi domain.
    block(['src/domain/quiz/registry.ts'], {
      paths: reactPaths.filter((p) => p.name !== 'react'),
      patterns: domainRule.patterns,
    }),
    // TD-2: trang điểm yếu mở phiên luyện qua session-store của features/practice.
    //       Sửa ở practice-ui-migration: đưa session-store xuống chỗ dùng chung.
    block(
      ['src/features/weakness/WeaknessPage.tsx', 'src/features/weakness/MistakesPage.tsx'],
      {
        patterns: [
          ...featureAppBan,
          ...otherFeatures('weakness').filter((p) => !p.group[0].endsWith('/practice')),
        ],
      },
    ),
    // E-1: trang styleguide (chỉ có khi phát triển) trình bày cả Container ở app/layouts/.
    //      Xem lại khi quyết định số phận StyleguidePage.
    block(['src/features/dev/**/*.{ts,tsx}'], { patterns: otherFeatures('dev') }),
  ]
}

export default tseslint.config(
  { ignores: ['dist', 'public/content', 'playwright-report', 'test-results'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['scripts/**/*.ts', '*.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  // ---------------------------------------------------------------------------
  // Luật phụ thuộc giữa các lớp (docs/ARCHITECTURE.md §4.2).
  // Hợp đồng: specs/001-repo-restructure/contracts/layering-rules.md
  // Lưu ý: với cùng một file, khối đến sau GHI ĐÈ toàn bộ tùy chọn của khối trước
  // (không gộp), nên mỗi khối dưới đây tự liệt kê đủ luật của lớp + luật toàn cục.
  // ---------------------------------------------------------------------------
  ...layeringRules(),
  eslintConfigPrettier,
)
