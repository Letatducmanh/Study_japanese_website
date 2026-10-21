import { join } from 'node:path'
import { formatIssue } from './errors.ts'
import { runContentPipeline } from './pipeline.ts'

const root = join(import.meta.dirname, '..', '..')
const { issues, summary } = runContentPipeline({
  contentDir: join(root, 'content'),
  outDir: join(root, 'public', 'content'),
  write: false,
})

for (const issue of issues.all) console.log(formatIssue(issue))

for (const book of summary.books) {
  console.log(
    `${book.bookId}: ${book.vocabMain} từ chính, ${book.vocabExtended} từ mở rộng, ${book.grammar} mẫu ngữ pháp, ${book.kanji} Kanji`,
  )
}

if (issues.hasErrors) {
  console.error(`\n[content:validate] ${issues.errors.length} lỗi.`)
  process.exit(1)
}

console.log(`\n[content:validate] OK — ${issues.warnings.length} cảnh báo.`)
